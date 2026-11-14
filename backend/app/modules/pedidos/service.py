"""Reglas de negocio de pedidos (RN-01 a RN-06).

El Service abre el Unit of Work con `with self.uow as uow:`, aplica las reglas y devuelve el
schema de salida dentro del bloque. No llama a commit: lo hace el __exit__ del Unit of Work.
"""

from datetime import datetime
from typing import Optional

from app.core.timestamps import utcnow
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

from .models import DetallePedido, Pedido
from .schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .unit_of_work import PedidoUnitOfWork

__all__ = [
    "PedidoAjeno",
    "PedidoNoEncontrado",
    "PedidoService",
    "ProductoNoDisponible",
    "ProductoNoEncontrado",
    "ProductoRepetido",
    "ReglaDeNegocio",
    "StockInsuficiente",
    "TransicionInvalida",
]

# RN-02: mapa de transiciones válidas. Un estado terminal no admite cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ------------------------------------------------------------------ excepciones de dominio
class PedidoNoEncontrado(Exception):  # -> 404
    def __init__(self, id: int) -> None:
        super().__init__(f"El pedido {id} no existe")


class PedidoAjeno(Exception):  # -> 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio incumplidas (-> 400)."""


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, disponible: int, pedido: int) -> None:
        super().__init__(
            f"Stock insuficiente de '{nombre}': hay {disponible} y se pidieron {pedido}"
        )


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


# ------------------------------------------------------------------ servicio
class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---- RN-01: crear pedido (una sola transacción) ----
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        for pid in ids:
            if ids.count(pid) > 1:
                raise ProductoRepetido(pid)

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                # Por cada ítem, en la misma iteración: verificar, descontar y crear la línea.
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia: no cambia si el producto cambia
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # ---- consultas ----
    def listar(
        self, usuario: Usuario, skip: int, limit: int, estado: Optional[EstadoPedido]
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo los suyos; el admin ve todos."""
        with self.uow as uow:
            if usuario.role == "admin":
                items, total = uow.pedidos.list_all(skip, limit, estado)
            else:
                items, total = uow.pedidos.list_by_usuario(usuario.id, skip, limit, estado)  # type: ignore[arg-type]
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    # ---- RN-02 / RN-03: avanzar o cancelar (admin) ----
    def cambiar_estado(self, id: int, nuevo: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id)
            self._aplicar_transicion(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    # ---- RN-03 / RN-04: cancelar un pedido propio en PENDIENTE (cliente) ----
    def cancelar(self, id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._pedido(uow, id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(pedido.estado, "CANCELADO")
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ---- auxiliares ----
    @staticmethod
    def _pedido(uow: PedidoUnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado(id)
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        """Valida la transición antes de modificar nada; al cancelar, restituye el stock."""
        if nuevo not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(pedido.estado, nuevo)
        if nuevo == "CANCELADO":
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo
        pedido.updated_at = utcnow()
        uow.session.flush()
        uow.session.refresh(pedido)

from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository

from .repository import DetallePedidoRepository, PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos comparten la misma sesión: el stock y el pedido van en una transacción."""

    pedidos: PedidoRepository
    detalles: DetallePedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self

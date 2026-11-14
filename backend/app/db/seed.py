"""Datos iniciales. Idempotente: se puede ejecutar varias veces sin duplicar nada.

    python -m app.db.seed

Crea el usuario admin (admin / Admin1234!), un cliente de prueba (cliente / Cliente1234!),
4 categorías y 10 productos con stock.
"""

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

USUARIOS = [
    # username, full_name, email, password, role
    ("admin", "Administrador", "admin@foodstore.com", "Admin1234!", "admin"),
    ("cliente", "Cliente de Prueba", "cliente@foodstore.com", "Cliente1234!", "user"),
]

CATEGORIAS = [
    ("Pastas", "Pastas frescas y rellenas"),
    ("Pizzas y empanadas", "Horneadas en el día"),
    ("Postres", "Dulces de la casa"),
    ("Bebidas", "Con y sin alcohol"),
]


def _img(archivo: str) -> str:
    # Fotos incluidas en frontend/public/img (se sirven desde el origen del frontend).
    return f"/img/{archivo}.webp"


PRODUCTOS = [
    # categoría, nombre, descripción, precio, stock, archivo de imagen
    ("Pastas", "Ravioles de ricota", "Ravioles caseros con salsa fileto", 8500, 25, "ravioles"),
    ("Pastas", "Ñoquis de papa", "Ñoquis con salsa bolognesa", 7800, 30, "noquis"),
    ("Pastas", "Tallarines al huevo", "Tallarines frescos con crema", 7200, 20, "tallarines"),
    ("Pizzas y empanadas", "Pizza muzzarella", "Pizza grande a la piedra", 9500, 15, "pizza"),
    ("Pizzas y empanadas", "Empanada de carne", "Cortada a cuchillo, horno de barro", 1800, 60, "empanada-carne"),
    ("Pizzas y empanadas", "Empanada de jamón y queso", "Clásica de la casa", 1700, 60, "empanada-jyq"),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3200, 18, "flan"),
    ("Postres", "Tiramisú", "Receta italiana tradicional", 4200, 12, "tiramisu"),
    ("Bebidas", "Gaseosa cola 1,5 L", "Bien fría", 2600, 40, "gaseosa"),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1200, 50, "agua"),
]


def run() -> None:
    create_all_tables()

    with UsuarioUnitOfWork(session_factory) as uow:
        for username, full_name, email, password, role in USUARIOS:
            if uow.usuarios.get_by_username(username) is None:
                uow.usuarios.add(
                    Usuario(
                        username=username,
                        full_name=full_name,
                        email=email,
                        hashed_password=hash_password(password),
                        role=role,
                    )
                )

    with CategoriaUnitOfWork(session_factory) as uow:
        for nombre, descripcion in CATEGORIAS:
            if uow.categorias.get_by_nombre(nombre) is None:
                uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))

    with ProductoUnitOfWork(session_factory) as uow:
        existentes = {p.nombre for p in uow.productos.get_all()}
        for categoria_nombre, nombre, descripcion, precio, stock, imagen in PRODUCTOS:
            if nombre in existentes:
                continue
            categoria = uow.categorias.get_by_nombre(categoria_nombre)
            if categoria is None:
                continue
            uow.productos.add(
                Producto(
                    categoria_id=categoria.id,  # type: ignore[arg-type]
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=float(precio),
                    imagen_url=_img(imagen),
                    stock=stock,
                )
            )

    print("Seed listo: usuario admin (admin / Admin1234!), categorías y productos cargados.")


if __name__ == "__main__":
    run()

from typing import Self

from app.core.unit_of_work import UnitOfWork

from .repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """Expone el repositorio de usuarios sobre la sesión del bloque `with`."""

    usuarios: UsuarioRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self

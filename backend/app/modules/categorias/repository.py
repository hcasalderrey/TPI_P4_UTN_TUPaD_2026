from typing import Sequence

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas, incluidas las dadas de baja."""
        return self.session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        ).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        ).all()

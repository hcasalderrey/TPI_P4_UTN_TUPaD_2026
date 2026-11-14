from typing import Optional, Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_for_update(self, id: int) -> Producto | None:
        """Lee el producto bloqueando la fila (SELECT ... FOR UPDATE): evita vender stock de más."""
        return self.session.exec(
            select(Producto).where(Producto.id == id).with_for_update()
        ).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[Sequence[Producto], int]:
        """Productos activos, filtrados y paginados. Devuelve (items, total)."""
        stmt = select(Producto).where(col(Producto.activo).is_(True))
        if search:
            stmt = stmt.where(col(Producto.nombre).icontains(search.strip(), autoescape=True))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(col(Producto.disponible).is_(disponible))
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(
            stmt.options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total

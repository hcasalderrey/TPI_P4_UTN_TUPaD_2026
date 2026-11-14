from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository

from .models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listado(
        self, skip: int, limit: int, estado: Optional[str], usuario_id: Optional[int]
    ) -> tuple[Sequence[Pedido], int]:
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(
            stmt.options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: Optional[str] = None
    ) -> tuple[Sequence[Pedido], int]:
        return self._listado(skip, limit, estado, usuario_id)

    def list_all(
        self, skip: int, limit: int, estado: Optional[str] = None
    ) -> tuple[Sequence[Pedido], int]:
        return self._listado(skip, limit, estado, None)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        ).one()
        return float(suma)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)

"""Repositorio base con el CRUD genérico. No confirma la transacción: eso es del Unit of Work."""

from typing import Generic, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self) -> Sequence[T]:
        return self.session.exec(select(self.model)).all()

    def add(self, obj: T) -> T:
        # flush (no commit): asigna el id para usarlo dentro del mismo caso de uso.
        self.session.add(obj)
        self.session.flush()
        return obj

    def delete(self, obj: T) -> None:
        self.session.delete(obj)
        self.session.flush()

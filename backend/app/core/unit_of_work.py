"""Unit of Work base.

Abre la sesión en __enter__ y, en __exit__, confirma (commit) si el bloque terminó bien o
descarta (rollback) si hubo una excepción. Siempre cierra la sesión. Ningún Service ni
Router llama a session.commit(): el control transaccional vive solo acá.
"""

from typing import Callable, Self

from sqlmodel import Session


class UnitOfWork:
    session: Session

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self.session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

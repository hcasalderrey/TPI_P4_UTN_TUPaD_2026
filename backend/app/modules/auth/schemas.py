from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["MessageResponse", "UserCreate", "UserPublic"]


class MessageResponse(SQLModel):
    message: str

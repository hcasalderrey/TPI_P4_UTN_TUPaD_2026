"""Dependencias de sesión y rol.

get_current_user        -> lee la cookie access_token, valida firma y expiración y carga el usuario (401).
get_current_active_user -> rechaza usuarios con disabled = true (400).
require_role([...])     -> verifica el rol (403).
"""

from typing import Callable

from fastapi import Depends, HTTPException, Request, status

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"
CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def get_current_user(request: Request) -> Usuario:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    payload = decode_access_token(token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida o vencida")
    with UsuarioUnitOfWork(session_factory) as uow:
        usuario = uow.usuarios.get_by_username(username)
    if usuario is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida o vencida")
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def verificar(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tiene permisos para esta acción")
        return usuario

    return verificar

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.database import session_factory
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

from .schemas import MessageResponse, UserCreate, UserPublic
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork(session_factory))


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registro público (rol user)",
    responses={409: {"description": "El username o el email ya existen"}},
)
def register(data: UserCreate, service: ServiceDep) -> UserPublic:
    return service.register(data)


@router.post(
    "/token",
    response_model=MessageResponse,
    summary="Login con formulario OAuth2",
    description=(
        "Valida las credenciales y entrega el JWT en la cookie HttpOnly `access_token`. "
        "El cuerpo de la respuesta no incluye el token. 401: credenciales incorrectas. "
        "400: cuenta desactivada."
    ),
    responses={401: {"description": "Credenciales incorrectas"}, 400: {"description": "Cuenta desactivada"}},
)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
) -> MessageResponse:
    token = service.login(form.username, form.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, summary="Cerrar sesión (borra la cookie)")
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=COOKIE_NAME, path="/", httponly=True, samesite="lax", secure=settings.COOKIE_SECURE
    )
    return MessageResponse(message="Sesión cerrada")


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Perfil del usuario autenticado",
    responses={401: {"description": "Sin sesión válida"}},
)
def me(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> UserPublic:
    return UserPublic.model_validate(usuario)

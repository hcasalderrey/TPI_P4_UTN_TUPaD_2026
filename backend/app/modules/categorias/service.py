from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, id: int) -> None:
        super().__init__(f"La categoría {id} no existe")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        """Solo las activas."""
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre = data.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado(nombre)
            categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        cambios = data.model_dump(exclude_unset=True, exclude_none=True)
        with self.uow as uow:
            categoria = self._activa(uow, id)
            if "nombre" in cambios:
                cambios["nombre"] = cambios["nombre"].strip()
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado(cambios["nombre"])
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.session.flush()
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, id: int) -> None:
        """Baja lógica: activo = false. No libera el nombre ni toca a sus productos."""
        with self.uow as uow:
            categoria = self._activa(uow, id)
            categoria.activo = False

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(id)
        return categoria

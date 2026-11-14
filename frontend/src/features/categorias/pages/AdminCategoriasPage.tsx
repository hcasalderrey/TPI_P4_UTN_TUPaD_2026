import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import ConfirmModal from '@/shared/ui/ConfirmModal'
import CategoriaFormModal from '../components/CategoriaFormModal'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

type Modo =
  | { tipo: 'ninguno' }
  | { tipo: 'form'; categoria: Categoria | null }
  | { tipo: 'eliminar'; categoria: Categoria }

function AdminCategoriasPage() {
  const [modo, setModo] = useState<Modo>({ tipo: 'ninguno' })
  const [aperturas, setAperturas] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  function abrir(nuevo: Modo) {
    setError(null)
    setAperturas((n) => n + 1)
    setModo(nuevo)
  }
  const cerrar = () => setModo({ tipo: 'ninguno' })

  async function guardar(datos: CategoriaInput) {
    if (modo.tipo !== 'form') return
    setError(null)
    try {
      if (modo.categoria) await actualizar.mutateAsync({ id: modo.categoria.id, datos })
      else await crear.mutateAsync(datos)
      cerrar()
    } catch (e) {
      // 409 (nombre duplicado) o 422: se muestra dentro del modal sin cerrarlo.
      setError(handleApiError(e, 'No se pudo guardar la categoría'))
    }
  }

  async function confirmarBaja() {
    if (modo.tipo !== 'eliminar') return
    setError(null)
    try {
      await eliminar.mutateAsync(modo.categoria.id)
      cerrar()
    } catch (e) {
      setError(handleApiError(e, 'No se pudo dar de baja la categoría'))
    }
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => row.original.descripcion || <span className="text-stone-400">—</span>,
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variante="ghost" onClick={() => abrir({ tipo: 'form', categoria: row.original })}>
              Editar
            </Button>
            <Button
              variante="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => abrir({ tipo: 'eliminar', categoria: row.original })}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <Button onClick={() => abrir({ tipo: 'form', categoria: null })}>Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <SkeletonFilas />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => categorias.refetch()} />
      ) : categorias.data.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay categorías. Creá la primera con «Nueva categoría»." />
      ) : (
        <DataTable data={categorias.data} columns={columnas} placeholderBusqueda="Buscar categoría…" />
      )}

      {modo.tipo === 'form' && (
        <CategoriaFormModal key={aperturas} categoria={modo.categoria} error={error} onSubmit={guardar} onClose={cerrar} />
      )}
      {modo.tipo === 'eliminar' && (
        <ConfirmModal
          titulo="Dar de baja la categoría"
          mensaje={`«${modo.categoria.nombre}» dejará de mostrarse. Sus productos no se dan de baja y su nombre queda reservado.`}
          confirmar="Dar de baja"
          error={error}
          cargando={eliminar.isPending}
          onConfirm={confirmarBaja}
          onClose={cerrar}
        />
      )}
    </div>
  )
}

export default AdminCategoriasPage

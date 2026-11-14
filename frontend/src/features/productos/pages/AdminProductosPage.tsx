import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import ConfirmModal from '@/shared/ui/ConfirmModal'
import { formatPrecio } from '@/shared/utils/format'
import ProductoFormModal from '../components/ProductoFormModal'
import StockModal from '../components/StockModal'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoInput, StockInput } from '../types/producto'

type Modo =
  | { tipo: 'ninguno' }
  | { tipo: 'form'; producto: Producto | null }
  | { tipo: 'stock'; producto: Producto }
  | { tipo: 'eliminar'; producto: Producto }

function AdminProductosPage() {
  const [modo, setModo] = useState<Modo>({ tipo: 'ninguno' })
  const [aperturas, setAperturas] = useState(0) // key del modal: reinicia el formulario
  const [error, setError] = useState<string | null>(null)

  // El panel pide limit=100 y TanStack Table pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const stock = useActualizarStock()
  const eliminar = useEliminarProducto()

  function abrir(nuevo: Modo) {
    setError(null)
    setAperturas((n) => n + 1)
    setModo(nuevo)
  }
  const cerrar = () => setModo({ tipo: 'ninguno' })

  async function guardar(datos: ProductoInput) {
    if (modo.tipo !== 'form') return
    setError(null)
    try {
      if (modo.producto) await actualizar.mutateAsync({ id: modo.producto.id, datos })
      else await crear.mutateAsync(datos)
      cerrar()
    } catch (e) {
      setError(handleApiError(e, 'No se pudo guardar el producto'))
    }
  }

  async function guardarStock(datos: StockInput) {
    if (modo.tipo !== 'stock') return
    setError(null)
    try {
      await stock.mutateAsync({ id: modo.producto.id, datos })
      cerrar()
    } catch (e) {
      setError(handleApiError(e, 'No se pudo actualizar el stock'))
    }
  }

  async function confirmarBaja() {
    if (modo.tipo !== 'eliminar') return
    setError(null)
    try {
      await eliminar.mutateAsync(modo.producto.id)
      cerrar()
    } catch (e) {
      setError(handleApiError(e, 'No se pudo dar de baja el producto'))
    }
  }

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        id: 'imagen',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.imagen_url ? (
            <img src={row.original.imagen_url} alt="" className="size-10 rounded-lg object-cover" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-lg bg-orange-50">🍽️</span>
          ),
      },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        id: 'categoria',
        header: 'Categoría',
        accessorFn: (p) => p.categoria.nombre,
        cell: ({ row }) => (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
            {row.original.categoria.nombre}
          </span>
        ),
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => <span className="tabular-nums">{formatPrecio(row.original.precio_base)}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={`tabular-nums ${row.original.stock === 0 ? 'font-medium text-red-600' : ''}`}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Venta',
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              row.original.disponible ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {row.original.disponible ? 'Disponible' : 'Pausado'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-1">
            <Button variante="ghost" onClick={() => abrir({ tipo: 'form', producto: row.original })}>
              Editar
            </Button>
            <Button variante="secondary" onClick={() => abrir({ tipo: 'stock', producto: row.original })}>
              Stock
            </Button>
            <Button
              variante="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => abrir({ tipo: 'eliminar', producto: row.original })}
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
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => abrir({ tipo: 'form', producto: null })}>Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <SkeletonFilas />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hay productos. Creá el primero con «Nuevo producto»." />
      ) : (
        <DataTable data={productos.data.items} columns={columnas} placeholderBusqueda="Buscar producto…" />
      )}

      {modo.tipo === 'form' && (
        <ProductoFormModal
          key={aperturas}
          producto={modo.producto}
          categorias={categorias.data ?? []}
          error={error}
          onSubmit={guardar}
          onClose={cerrar}
        />
      )}
      {modo.tipo === 'stock' && (
        <StockModal key={aperturas} producto={modo.producto} error={error} onSubmit={guardarStock} onClose={cerrar} />
      )}
      {modo.tipo === 'eliminar' && (
        <ConfirmModal
          titulo="Dar de baja el producto"
          mensaje={`«${modo.producto.nombre}» dejará de mostrarse en el catálogo. Los pedidos anteriores conservan su copia.`}
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

export default AdminProductosPage

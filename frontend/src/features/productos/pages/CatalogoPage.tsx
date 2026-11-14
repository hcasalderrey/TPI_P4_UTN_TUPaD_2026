import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategorias } from '@/features/categorias/hooks/useCategorias'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import { SkeletonProductoCard } from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import { inputClass } from '@/shared/ui/Input'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState('')

  const categorias = useCategorias()
  const productos = useProductos({
    skip: pagina * POR_PAGINA, // paginación en el servidor: skip = página × limit
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  })

  function buscar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPagina(0)
    setBusqueda(texto.trim())
  }

  function limpiar() {
    setTexto('')
    setBusqueda('')
    setCategoriaId('')
    setPagina(0)
  }

  const hayFiltros = busqueda !== '' || categoriaId !== ''

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <p className="text-stone-500">Elegí tus platos y armá tu pedido.</p>
      </div>

      <form onSubmit={buscar} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre…"
          aria-label="Buscar por nombre"
          className={`${inputClass} sm:max-w-xs`}
        />
        <select
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value)
            setPagina(0)
          }}
          aria-label="Filtrar por categoría"
          className={`${inputClass} sm:max-w-xs`}
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit">Buscar</Button>
          {hayFiltros && (
            <Button variante="secondary" onClick={limpiar}>
              Limpiar
            </Button>
          )}
        </div>
      </form>

      {productos.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Cargando productos">
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <SkeletonProductoCard key={i} />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          mensaje={
            hayFiltros ? 'Ningún producto coincide con la búsqueda.' : 'Todavía no hay productos en el catálogo.'
          }
          accion={hayFiltros ? <Button onClick={limpiar}>Ver todos</Button> : undefined}
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <div className="mt-6">
            <Paginacion
              pagina={pagina}
              tamanio={POR_PAGINA}
              total={productos.data.total}
              onCambiar={setPagina}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default CatalogoPage

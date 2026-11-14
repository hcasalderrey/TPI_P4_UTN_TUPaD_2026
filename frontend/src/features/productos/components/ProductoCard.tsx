import { useState } from 'react'
import { formatPrecio } from '@/shared/utils/format'
import Button from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

/** Tarjeta del catálogo con el botón «Agregar al carrito» (lee y escribe el cartStore). */
function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imagenRota, setImagenRota] = useState(false)
  const [agregado, setAgregado] = useState(false)

  const sinStock = producto.stock <= 0
  const noVendible = !producto.disponible || sinStock
  const alLimite = enCarrito >= producto.stock

  function handleAgregar() {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
    })
    setAgregado(true)
    window.setTimeout(() => setAgregado(false), 1200)
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {producto.imagen_url && !imagenRota ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          onError={() => setImagenRota(true)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-4xl" aria-hidden="true">
          🍽️
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1 w-fit rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-700">
          {producto.categoria.nombre}
        </span>
        <h2 className="text-lg font-semibold text-stone-800">{producto.nombre}</h2>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-stone-500">
          {producto.descripcion || 'Sin descripción'}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <p className="text-lg font-bold text-stone-800">{formatPrecio(producto.precio_base)}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              noVendible ? 'bg-stone-100 text-stone-500' : 'bg-green-100 text-green-700'
            }`}
          >
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button className="mt-4 w-full" disabled={noVendible || alLimite} onClick={handleAgregar}>
          {noVendible
            ? 'No disponible'
            : alLimite
              ? 'Máximo en el carrito'
              : agregado
                ? '✓ Agregado'
                : 'Agregar al carrito'}
        </Button>
      </div>
    </article>
  )
}

export default ProductoCard

import { Link, useNavigate } from 'react-router-dom'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatPrecio } from '@/shared/utils/format'
import { useCartStore } from '@/store/cartStore'

function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>
        <EstadoVacio
          mensaje="Tu carrito está vacío."
          accion={
            <Link to="/" className="font-medium text-orange-600 hover:underline">
              Ir al catálogo
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tu carrito</h1>
        <Button variante="ghost" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatPrecio(item.precio_unitario)} c/u</p>
              </div>

              <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <Button
                  variante="secondary"
                  aria-label="Restar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center font-medium tabular-nums">{item.cantidad}</span>
                <Button
                  variante="secondary"
                  aria-label="Sumar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>

              <p className="w-28 text-right font-semibold tabular-nums">
                {formatPrecio(item.precio_unitario * item.cantidad)}
              </p>
              <Button variante="ghost" className="text-red-600 hover:bg-red-50" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </div>
          ))}
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-lg font-semibold">Resumen</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Productos</dt>
              <dd>{items.reduce((suma, i) => suma + i.cantidad, 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrecio(total)}</dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>
            Confirmar pedido
          </Button>
          <p className="mt-3 text-xs text-stone-500">
            El stock se verifica al confirmar. Para finalizar necesitás iniciar sesión.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default CarritoPage

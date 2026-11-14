import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Card from '@/shared/ui/Card'
import { formatPrecio } from '@/shared/utils/format'
import { useCartStore } from '@/store/cartStore'
import CheckoutForm from '../components/CheckoutForm'
import type { CheckoutValues } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function confirmar(valores: CheckoutValues) {
    setError(null)
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: valores.forma_pago,
        direccion_entrega: valores.direccion_entrega,
        notas: valores.notas || undefined,
      })
      vaciar()
      navigate('/mis-pedidos', { replace: true })
    } catch (e) {
      // 404 (producto inexistente), 400 (stock insuficiente, no disponible...): se muestra el detail.
      setError(handleApiError(e, 'No se pudo confirmar el pedido'))
    }
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay productos para confirmar."
        accion={
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm error={error} onSubmit={confirmar} />
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-lg font-semibold">Tu pedido</h2>
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3 py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="tabular-nums">{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatPrecio(total)}</span>
          </p>
          <Link to="/carrito" className="mt-3 inline-block text-sm text-orange-600 hover:underline">
            Modificar carrito
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default CheckoutPage

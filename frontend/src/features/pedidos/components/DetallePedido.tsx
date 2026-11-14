import BadgeEstado from '@/shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '@/shared/utils/format'
import type { Pedido } from '../types/pedido'

interface DetallePedidoProps {
  pedido: Pedido
}

const PAGO: Record<Pedido['forma_pago'], string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
}

/** Datos del pedido y sus líneas (nombre y precio copiados al momento de la compra). */
function DetallePedido({ pedido }: DetallePedidoProps) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Estado</dt>
          <dd>
            <BadgeEstado estado={pedido.estado} />
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Fecha</dt>
          <dd>{formatFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Dirección de entrega</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Forma de pago</dt>
          <dd>{PAGO[pedido.forma_pago]}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-stone-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full text-left">
        <thead className="text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((i) => (
            <tr key={i.producto_id}>
              <td className="py-2">{i.nombre_producto}</td>
              <td className="py-2 text-right tabular-nums">{i.cantidad}</td>
              <td className="py-2 text-right tabular-nums">{formatPrecio(i.precio_unitario)}</td>
              <td className="py-2 text-right tabular-nums">{formatPrecio(i.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200 font-bold">
            <td colSpan={3} className="py-2 text-right">
              Total
            </td>
            <td className="py-2 text-right tabular-nums">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default DetallePedido

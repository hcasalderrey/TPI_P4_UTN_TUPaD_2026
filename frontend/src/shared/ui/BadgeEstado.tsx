import { ETIQUETA_ESTADO } from '@/features/pedidos/types/pedido'
import type { EstadoPedido } from '@/features/pedidos/types/pedido'

const ESTILOS: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-sky-100 text-sky-800',
  ENTREGADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

interface BadgeEstadoProps {
  estado: EstadoPedido
}

/** Colorea los cuatro estados del pedido. */
function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTILOS[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}

export default BadgeEstado

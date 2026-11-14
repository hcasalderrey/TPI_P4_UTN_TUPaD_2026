import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import Modal from '@/shared/ui/Modal'
import { formatFecha, formatPrecio } from '@/shared/utils/format'
import DetallePedido from '../components/DetallePedido'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 6

function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [errorCancelar, setErrorCancelar] = useState<string | null>(null)

  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  async function confirmarCancelacion() {
    if (!aCancelar) return
    setErrorCancelar(null)
    try {
      await cancelar.mutateAsync(aCancelar.id)
      setACancelar(null)
    } catch (e) {
      setErrorCancelar(handleApiError(e, 'No se pudo cancelar el pedido'))
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {pedidos.isPending ? (
        <SkeletonFilas filas={4} />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          mensaje="Todavía no hiciste ningún pedido."
          accion={
            <Link to="/" className="font-medium text-orange-600 hover:underline">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.data.items.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Pedido #{p.id}</p>
                  <p className="text-sm text-stone-500">{formatFecha(p.created_at)}</p>
                </div>
                <BadgeEstado estado={p.estado} />
                <p className="text-lg font-bold tabular-nums">{formatPrecio(p.total)}</p>
                <div className="flex gap-2">
                  <Button variante="secondary" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                    {abierto === p.id ? 'Ocultar detalle' : 'Ver detalle'}
                  </Button>
                  {p.estado === 'PENDIENTE' && (
                    <Button
                      variante="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setErrorCancelar(null)
                        setACancelar(p)
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
              {abierto === p.id && (
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <DetallePedido pedido={p} />
                </div>
              )}
            </Card>
          ))}
          <Paginacion
            pagina={pagina}
            tamanio={POR_PAGINA}
            total={pedidos.data.total}
            onCambiar={setPagina}
          />
        </div>
      )}

      {aCancelar && (
        <Modal titulo={`Cancelar pedido #${aCancelar.id}`} onClose={() => setACancelar(null)}>
          <p className="mb-4 text-stone-600">
            Se devolverá el stock de los productos y el pedido quedará cancelado. Esta acción no se
            puede deshacer.
          </p>
          {errorCancelar && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorCancelar}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variante="secondary" onClick={() => setACancelar(null)}>
              Volver
            </Button>
            <Button variante="danger" cargando={cancelar.isPending} onClick={confirmarCancelacion}>
              Cancelar pedido
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default MisPedidosPage

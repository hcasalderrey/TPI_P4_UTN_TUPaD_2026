import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import ConfirmModal from '@/shared/ui/ConfirmModal'
import { inputClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import { formatFecha, formatPrecio } from '@/shared/utils/format'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import DetallePedido from '../components/DetallePedido'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ETIQUETA_ESTADO, TRANSICIONES } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

// Texto del botón que lleva el pedido a ese estado.
const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [error, setError] = useState<string | null>(null)

  // El panel pide limit=100 y TanStack Table pagina del lado del cliente.
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()
  const usuarios = useUsuarios()
  // id -> nombre de usuario, para mostrar quién hizo cada pedido.
  const nombres = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, u.username])),
    [usuarios.data],
  )

  async function avanzar(pedido: Pedido, nuevo: EstadoPedido) {
    setError(null)
    try {
      await cambiar.mutateAsync({ id: pedido.id, estado: nuevo })
      setACancelar(null)
    } catch (e) {
      setError(handleApiError(e, 'No se pudo cambiar el estado'))
    }
  }

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: 'N.º', cell: ({ row }) => `#${row.original.id}` },
      {
        accessorKey: 'usuario_id',
        header: 'Cliente',
        cell: ({ row }) => nombres.get(row.original.usuario_id) ?? `Usuario ${row.original.usuario_id}`,
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => formatFecha(row.original.created_at),
      },
      { accessorKey: 'forma_pago', header: 'Pago' },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="tabular-nums">{formatPrecio(row.original.total)}</span>,
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-wrap justify-end gap-1">
              <Button variante="ghost" onClick={() => setDetalle(p)}>
                Ver
              </Button>
              {TRANSICIONES[p.estado].map((destino) =>
                destino === 'CANCELADO' ? (
                  <Button
                    key={destino}
                    variante="ghost"
                    className="text-red-600 hover:bg-red-50"
                    disabled={cambiar.isPending}
                    onClick={() => {
                      setError(null)
                      setACancelar(p)
                    }}
                  >
                    {ACCION[destino]}
                  </Button>
                ) : (
                  <Button
                    key={destino}
                    variante="secondary"
                    disabled={cambiar.isPending}
                    onClick={() => avanzar(p, destino)}
                  >
                    {ACCION[destino]}
                  </Button>
                ),
              )}
            </div>
          )
        },
      },
    ],
    [cambiar.isPending, nombres],
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}
          aria-label="Filtrar por estado"
          className={`${inputClass} sm:w-56`}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>
      </div>

      {error && !aCancelar && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonFilas />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      ) : (
        <DataTable
          data={pedidos.data.items}
          columns={columnas}
          placeholderBusqueda="Buscar pedido…"
        />
      )}

      {detalle && (
        <Modal titulo={`Pedido #${detalle.id}`} onClose={() => setDetalle(null)} ancho="lg">
          <DetallePedido pedido={detalle} />
          <div className="mt-5 flex justify-end">
            <Button variante="secondary" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}

      {aCancelar && (
        <ConfirmModal
          titulo={`Cancelar pedido #${aCancelar.id}`}
          mensaje="Se devolverá el stock de cada línea y el pedido quedará cancelado. No se puede deshacer."
          confirmar="Cancelar pedido"
          error={error}
          cargando={cambiar.isPending}
          onConfirm={() => avanzar(aCancelar, 'CANCELADO')}
          onClose={() => setACancelar(null)}
        />
      )}
    </div>
  )
}

export default AdminPedidosPage

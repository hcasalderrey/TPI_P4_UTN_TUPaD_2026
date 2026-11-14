import { handleApiError } from '@/shared/api/handleApiError'
import EstadoError from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatPrecio } from '@/shared/utils/format'
import ResumenCard from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

function AdminResumenPage() {
  const resumen = useResumenPedidos()

  if (resumen.isPending) {
    return (
      <div role="status" aria-label="Cargando resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }
  if (resumen.isError) {
    return <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => resumen.refetch()} />
  }

  const r = resumen.data
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ResumenCard titulo="Pedidos pendientes" valor={String(r.pendientes)} tono="amber" />
      <ResumenCard titulo="En preparación" valor={String(r.en_preparacion)} tono="sky" />
      <ResumenCard titulo="Entregados" valor={String(r.entregados)} tono="green" />
      <ResumenCard titulo="Cancelados" valor={String(r.cancelados)} tono="red" />
      <ResumenCard titulo="Pedidos de hoy" valor={String(r.pedidos_hoy)} tono="orange" />
      <ResumenCard titulo="Ingresos (entregados)" valor={formatPrecio(r.ingresos_entregados)} tono="green" />
    </div>
  )
}

export default AdminResumenPage

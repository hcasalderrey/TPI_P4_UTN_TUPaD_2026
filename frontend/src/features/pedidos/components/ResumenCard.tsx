import Card from '@/shared/ui/Card'

type Tono = 'amber' | 'sky' | 'green' | 'red' | 'orange' | 'stone'

const TONOS: Record<Tono, string> = {
  amber: 'text-amber-700',
  sky: 'text-sky-700',
  green: 'text-green-700',
  red: 'text-red-700',
  orange: 'text-orange-700',
  stone: 'text-stone-800',
}

interface ResumenCardProps {
  titulo: string
  valor: string
  tono?: Tono
}

/** Tarjeta con un indicador del resumen del panel. */
function ResumenCard({ titulo, valor, tono = 'stone' }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-stone-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${TONOS[tono]}`}>{valor}</p>
    </Card>
  )
}

export default ResumenCard

import Button from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export default EstadoError

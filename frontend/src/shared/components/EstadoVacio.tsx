import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  accion?: ReactNode
}

function EstadoVacio({ mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
      <p>{mensaje}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}

export default EstadoVacio

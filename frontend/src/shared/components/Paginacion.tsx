import Button from '../ui/Button'

interface PaginacionProps {
  /** Página actual, desde 0 (skip = pagina × tamanio). */
  pagina: number
  tamanio: number
  total: number
  onCambiar: (pagina: number) => void
}

/** Paginación del lado del servidor: el padre pide `skip` y `limit` a la API. */
function Paginacion({ pagina, tamanio, total, onCambiar }: PaginacionProps) {
  const paginas = Math.max(Math.ceil(total / tamanio), 1)
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3 text-sm text-stone-600">
      <span>
        Página {pagina + 1} de {paginas} · {total} {total === 1 ? 'resultado' : 'resultados'}
      </span>
      <div className="flex gap-2">
        <Button variante="secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </Button>
        <Button
          variante="secondary"
          disabled={pagina + 1 >= paginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  )
}

export default Paginacion

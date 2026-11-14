interface SkeletonProps {
  className?: string
}

/** Bloque gris animado para marcar contenido que está cargando. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

/** Esqueleto de una tarjeta de producto del catálogo. */
export function SkeletonProductoCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <Skeleton className="h-40 rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

/** Esqueleto de una lista de filas (tablas y listados). */
export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}

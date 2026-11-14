import axios from 'axios'

interface ErrorDeValidacion {
  msg: string
}

/** Convierte el `detail` de la API (texto o lista de errores 422) en un mensaje para la pantalla. */
export function handleApiError(error: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté en marcha.'
    }
    const detail: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return (detail as ErrorDeValidacion[]).map((d) => d.msg).join('. ')
    }
    return porDefecto
  }
  return error instanceof Error ? error.message : porDefecto
}

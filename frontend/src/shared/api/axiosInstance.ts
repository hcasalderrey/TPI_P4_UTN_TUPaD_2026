import axios from 'axios'

/**
 * Cliente HTTP único. `withCredentials` hace que el navegador adjunte la cookie HttpOnly con
 * el JWT en cada petición: el frontend nunca lee ni guarda el token.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'
// En estas rutas un 401 es una respuesta esperada (credenciales incorrectas / sin sesión aún).
const RUTAS_AUTH = ['/auth/token', '/auth/me']

let alPerderSesion: (() => void) | null = null

/** El authStore registra acá cómo limpiar la sesión (evita un import circular). */
export function registrarManejadorDeSesion(manejador: () => void): void {
  alPerderSesion = manejador
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const detail = (data as { detail?: unknown } | undefined)?.detail
      const esRutaAuth = RUTAS_AUTH.some((ruta) => url.endsWith(ruta))
      const sesionPerdida =
        (status === 401 && !esRutaAuth) || (status === 400 && detail === CUENTA_DESACTIVADA)
      // ProtectedRoute redirige a /login al quedar el store sin usuario.
      if (sesionPerdida) alPerderSesion?.()
    }
    return Promise.reject(error)
  },
)

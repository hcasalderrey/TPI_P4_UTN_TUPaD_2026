import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/auth/types/auth'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  /** Si se indica, solo esos roles acceden; los demás van a /unauthorized. */
  roles?: Rol[]
}

/**
 * Sin sesión redirige a /login; sin el rol, a /unauthorized. Mientras checkSession confirma la
 * sesión muestra un indicador. La protección real está en el backend (require_role).
 */
function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <div role="status" className="flex items-center justify-center gap-3 py-20 text-stone-500">
        <span className="size-5 animate-spin rounded-full border-2 border-stone-300 border-t-orange-600" />
        Verificando sesión…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}

export default ProtectedRoute

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-white text-orange-700' : 'text-white hover:bg-orange-500'
  }`

function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  async function cerrarSesion() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-orange-600 shadow-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={linkClass}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-1.5 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-orange-700">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin/resumen" className={linkClass}>
              Panel
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-white">
          {usuario ? (
            <>
              <span className="hidden sm:inline">
                {usuario.full_name}{' '}
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs uppercase">
                  {usuario.role}
                </span>
              </span>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-lg bg-orange-700 px-3 py-1.5 font-medium hover:bg-orange-800"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar

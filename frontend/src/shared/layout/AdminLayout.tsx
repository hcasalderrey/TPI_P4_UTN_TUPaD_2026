import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', etiqueta: 'Resumen' },
  { to: '/admin/pedidos', etiqueta: 'Pedidos' },
  { to: '/admin/productos', etiqueta: 'Productos' },
  { to: '/admin/categorias', etiqueta: 'Categorías' },
  { to: '/admin/usuarios', etiqueta: 'Usuarios' },
]

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-4 py-2 text-sm font-medium ${
    isActive ? 'bg-orange-600 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-orange-50'
  }`

/** Panel de administración: pestañas de sección + la pantalla activa. */
function AdminLayout() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
      <nav aria-label="Secciones del panel" className="mb-6 flex flex-wrap gap-2">
        {SECCIONES.map((s) => (
          <NavLink key={s.to} to={s.to} className={tabClass}>
            {s.etiqueta}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

export default AdminLayout

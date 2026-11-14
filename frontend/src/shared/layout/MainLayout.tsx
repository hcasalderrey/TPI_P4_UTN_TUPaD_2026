import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

/** Navbar + contenido de la ruta activa. */
function MainLayout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout

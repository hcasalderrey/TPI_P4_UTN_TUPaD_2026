import { Link } from 'react-router-dom'
import Card from '@/shared/ui/Card'

function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Sin permiso</h1>
        <p className="mb-5 text-stone-500">No tenés permisos para ver esta pantalla.</p>
        <Link to="/" className="font-medium text-orange-600 hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  )
}

export default UnauthorizedPage

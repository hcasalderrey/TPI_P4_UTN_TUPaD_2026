import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Usuario } from '@/features/auth/types/auth'
import { handleApiError } from '@/shared/api/handleApiError'
import DataTable from '@/shared/components/DataTable'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import Button from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'

function AdminUsuariosPage() {
  const yo = useAuthStore((s) => s.usuario)
  const [error, setError] = useState<string | null>(null)

  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const ocupado = activar.isPending || desactivar.isPending

  async function cambiarEstado(u: Usuario) {
    setError(null)
    try {
      if (u.disabled) await activar.mutateAsync(u.id)
      else await desactivar.mutateAsync(u.id)
    } catch (e) {
      setError(handleApiError(e, 'No se pudo cambiar el estado del usuario'))
    }
  }

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
              row.original.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              row.original.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <div className="flex justify-end">
                <Button variante="secondary" disabled={ocupado} onClick={() => cambiarEstado(u)}>
                  Activar
                </Button>
              </div>
            )
          }
          // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila.
          if (u.id === yo?.id) return null
          return (
            <div className="flex justify-end">
              <Button
                variante="ghost"
                className="text-red-600 hover:bg-red-50"
                disabled={ocupado}
                onClick={() => cambiarEstado(u)}
              >
                Desactivar
              </Button>
            </div>
          )
        },
      },
    ],
    // Se recrean las columnas solo cuando cambian `ocupado` o la sesión.
    [ocupado, yo?.id],
  )

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Usuarios</h2>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {usuarios.isPending ? (
        <SkeletonFilas />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => usuarios.refetch()} />
      ) : usuarios.data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} placeholderBusqueda="Buscar usuario…" />
      )}
    </div>
  )
}

export default AdminUsuariosPage

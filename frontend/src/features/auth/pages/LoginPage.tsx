import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FieldErrors from '@/shared/components/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { inputClass, labelClass } from '@/shared/ui/Input'
import { useAuthStore } from '@/store/authStore'

interface LocationState {
  from?: { pathname: string }
  registrado?: string
}

function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LocationState
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        const usuario = useAuthStore.getState().usuario
        const destino = state.from?.pathname ?? (usuario?.role === 'admin' ? '/admin/resumen' : '/')
        navigate(destino, { replace: true })
      } catch (e) {
        setError(handleApiError(e, 'No se pudo iniciar sesión'))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Ingresar</h1>
        <p className="mb-5 text-sm text-stone-500">Accedé para hacer y seguir tus pedidos.</p>

        {state.registrado && (
          <p role="status" className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Cuenta «{state.registrado}» creada. Ya podés ingresar.
          </p>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu usuario' : undefined) }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="username">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import FieldErrors from '@/shared/components/FieldErrors'
import { handleApiError } from '@/shared/api/handleApiError'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { inputClass, labelClass } from '@/shared/ui/Input'
import { registerRequest } from '../api/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const nuevo = await registerRequest({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true, state: { registrado: nuevo.username } })
      } catch (e) {
        setError(handleApiError(e, 'No se pudo crear la cuenta'))
      }
    },
  })

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="mb-1 text-2xl font-bold">Crear cuenta</h1>
        <p className="mb-5 text-sm text-stone-500">Registrate para confirmar pedidos.</p>

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
            validators={{
              onChange: ({ value }) => {
                const v = value.trim()
                if (!v) return 'El usuario es obligatorio'
                if (v.length < 3) return 'Debe tener al menos 3 caracteres'
                if (v.length > 50) return 'Admite hasta 50 caracteres'
                return undefined
              },
            }}
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
            name="full_name"
            validators={{
              onChange: ({ value }) => {
                const v = value.trim()
                if (!v) return 'El nombre es obligatorio'
                if (v.length < 2) return 'Debe tener al menos 2 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="full_name">
                  Nombre completo
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return 'El email es obligatorio'
                if (!EMAIL_REGEX.test(value.trim())) return 'Ingresá un email válido'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'La contraseña es obligatoria'
                if (value.length < 8) return 'Debe tener al menos 8 caracteres'
                if (value.length > 72) return 'Admite hasta 72 caracteres'
                return undefined
              },
            }}
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
                  autoComplete="new-password"
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
            name="confirmar"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password')
                  ? 'Las contraseñas no coinciden'
                  : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="confirmar">
                  Repetir contraseña
                </label>
                <input
                  id="confirmar"
                  name="confirmar"
                  type="password"
                  autoComplete="new-password"
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
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage

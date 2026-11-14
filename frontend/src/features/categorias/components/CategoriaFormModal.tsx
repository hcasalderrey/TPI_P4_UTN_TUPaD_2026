import { useForm } from '@tanstack/react-form'
import FieldErrors from '@/shared/components/FieldErrors'
import Button from '@/shared/ui/Button'
import { inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Categoria, CategoriaInput } from '../types/categoria'

interface CategoriaFormModalProps {
  categoria: Categoria | null // null = alta, objeto = edición
  error: string | null
  onSubmit: (datos: CategoriaInput) => Promise<unknown>
  onClose: () => void
}

// El formulario se resetea porque la página le pasa un `key` distinto en cada apertura.
function CategoriaFormModal({ categoria, error, onSubmit, onClose }: CategoriaFormModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: ({ value }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || undefined }),
  })

  return (
    <Modal titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const v = value.trim()
              if (!v) return 'El nombre es obligatorio'
              if (v.length < 2) return 'Debe tener al menos 2 caracteres'
              if (v.length > 100) return 'Admite hasta 100 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="nombre">
                Nombre de la categoría
              </label>
              <input
                id="nombre"
                name="nombre"
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
          name="descripcion"
          validators={{
            onChange: ({ value }) => (value.length > 500 ? 'Admite hasta 500 caracteres' : undefined),
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="descripcion">
                Descripción
              </label>
              <input
                id="descripcion"
                name="descripcion"
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

        <div className="flex justify-end gap-2">
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
                Guardar
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

export default CategoriaFormModal

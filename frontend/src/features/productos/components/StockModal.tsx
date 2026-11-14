import { useForm } from '@tanstack/react-form'
import FieldErrors from '@/shared/components/FieldErrors'
import Button from '@/shared/ui/Button'
import { inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, StockInput } from '../types/producto'

interface StockModalProps {
  producto: Producto
  error: string | null
  onSubmit: (datos: StockInput) => Promise<unknown>
  onClose: () => void
}

/** Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock). */
function StockModal({ producto, error, onSubmit, onClose }: StockModalProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
  })

  return (
    <Modal titulo={`Stock de ${producto.nombre}`} onClose={onClose}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              if (value.trim() === '') return 'El stock es obligatorio'
              const n = Number(value)
              if (!Number.isInteger(n)) return 'Debe ser un número entero'
              if (n < 0) return 'No puede ser negativo'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="stock">
                Unidades en stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
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

        <form.Field name="disponible">
          {(field) => (
            <label className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-600">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="size-4 accent-orange-600"
              />
              Disponible para la venta
            </label>
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

export default StockModal

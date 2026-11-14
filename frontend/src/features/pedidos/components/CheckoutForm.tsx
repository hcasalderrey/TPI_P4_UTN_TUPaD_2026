import { useForm } from '@tanstack/react-form'
import FieldErrors from '@/shared/components/FieldErrors'
import Button from '@/shared/ui/Button'
import { inputClass, labelClass } from '@/shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface CheckoutValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  error: string | null
  onSubmit: (valores: CheckoutValues) => Promise<void>
}

function CheckoutForm({ error, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim(),
      }),
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim()
            if (!v) return 'La dirección es obligatoria'
            if (v.length < 5) return 'Debe tener al menos 5 caracteres'
            if (v.length > 200) return 'Admite hasta 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <div className="mb-4">
            <label className={labelClass} htmlFor="direccion_entrega">
              Dirección de entrega
            </label>
            <input
              id="direccion_entrega"
              name="direccion_entrega"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={inputClass}
              placeholder="Calle y número, piso, localidad"
            />
            <FieldErrors errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <div className="mb-4">
            <label className={labelClass} htmlFor="forma_pago">
              Forma de pago
            </label>
            <select
              id="forma_pago"
              name="forma_pago"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
              className={inputClass}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? 'Admite hasta 500 caracteres' : undefined),
        }}
      >
        {(field) => (
          <div className="mb-4">
            <label className={labelClass} htmlFor="notas">
              Notas <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={inputClass}
              placeholder="Ej.: sin cebolla, tocar timbre 2B"
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
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default CheckoutForm

import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias/types/categoria'
import FieldErrors from '@/shared/components/FieldErrors'
import Button from '@/shared/ui/Button'
import { inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoInput } from '../types/producto'

interface ProductoFormModalProps {
  producto: Producto | null // null = alta, objeto = edición
  categorias: Categoria[]
  error: string | null
  onSubmit: (datos: ProductoInput) => Promise<unknown>
  onClose: () => void
}

// El formulario se resetea porque la página le pasa un `key` distinto en cada apertura.
function ProductoFormModal({ producto, categorias, error, onSubmit, onClose }: ProductoFormModalProps) {
  const form = useForm({
    defaultValues: {
      categoria_id: producto ? String(producto.categoria_id) : '',
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: ({ value }) =>
      onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || undefined,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || undefined,
        stock: Number(value.stock),
        disponible: value.disponible,
      }),
  })

  return (
    <Modal titulo={producto ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
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
              if (v.length > 150) return 'Admite hasta 150 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="nombre">
                Nombre
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
          name="categoria_id"
          validators={{ onChange: ({ value }) => (!value ? 'Elegí una categoría' : undefined) }}
        >
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="categoria_id">
                Categoría
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Elegir…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <FieldErrors errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={2}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return 'El precio es obligatorio'
                const n = Number(value)
                if (Number.isNaN(n)) return 'Ingresá un número válido'
                if (n < 0) return 'No puede ser negativo'
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label className={labelClass} htmlFor="precio_base">
                  Precio
                </label>
                <input
                  id="precio_base"
                  name="precio_base"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
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
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <div className="mb-4">
              <label className={labelClass} htmlFor="imagen_url">
                URL de la imagen <span className="font-normal text-stone-400">(opcional)</span>
              </label>
              <input
                id="imagen_url"
                name="imagen_url"
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className={inputClass}
                placeholder="https://…"
              />
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

export default ProductoFormModal

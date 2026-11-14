import type { InputHTMLAttributes } from 'react'

export const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-stone-100'

export const labelClass = 'mb-1 block text-sm font-medium text-stone-600'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

/** Campo con etiqueta y mensaje de error. Para formularios de TanStack Form se usa junto a FieldErrors. */
function Input({ label, error, id, className = '', ...resto }: InputProps) {
  const inputId = id ?? resto.name
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className={labelClass}>
        {label}
      </label>
      <input id={inputId} className={`${inputClass} ${className}`} {...resto} />
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input

interface FieldErrorsProps {
  errors: unknown[]
}

// field.state.meta.errors es un array: puede haber varios mensajes a la vez.
function FieldErrors({ errors }: FieldErrorsProps) {
  const mensajes = errors
    .map((e) => (typeof e === 'string' ? e : (e as { message?: string } | undefined)?.message))
    .filter(Boolean)
  if (mensajes.length === 0) return null

  return (
    <ul role="alert" className="mt-1 text-sm text-red-600">
      {mensajes.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  )
}

export default FieldErrors

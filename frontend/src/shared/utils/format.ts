const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
})

const fechaHora = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

/** "$ 8.500,00" */
export function formatPrecio(valor: number): string {
  return moneda.format(valor)
}

/** "07/11/26, 14:35" */
export function formatFecha(iso: string): string {
  return fechaHora.format(new Date(iso))
}

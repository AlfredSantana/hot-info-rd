/**
 * Formatea una fecha (yyyy-mm-dd o timestamptz) evitando el corrimiento
 * de un día que ocurre al interpretar fechas sin hora como UTC.
 */
export function formatDate(dateStr, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
  const localDate = new Date(year, month - 1, day)
  return localDate.toLocaleDateString('es-DO', options)
}
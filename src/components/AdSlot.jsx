export default function AdSlot({ slot = 'default', className = '' }) {
  // Placeholder hasta aprobación de Google AdSense.
  // Cuando esté activo, reemplazar por <ins className="adsbygoogle" ...>
  // y cargar el script de AdSense una sola vez en index.html.
  return (
    <div className={`ad-slot ${className}`} data-ad-slot={slot}>
      <span>Espacio publicitario</span>
    </div>
  )
}
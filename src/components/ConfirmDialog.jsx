import './ConfirmDialog.css'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" onClick={onCancel} className="confirm-btn-cancel">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="confirm-btn-danger">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
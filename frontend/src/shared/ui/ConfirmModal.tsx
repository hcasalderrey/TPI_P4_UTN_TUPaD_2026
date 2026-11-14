import Button from './Button'
import Modal from './Modal'

interface ConfirmModalProps {
  titulo: string
  mensaje: string
  confirmar: string
  error?: string | null
  cargando?: boolean
  onConfirm: () => void
  onClose: () => void
}

/** Confirmación de una acción destructiva (baja, cancelación). */
function ConfirmModal({ titulo, mensaje, confirmar, error, cargando, onConfirm, onClose }: ConfirmModalProps) {
  return (
    <Modal titulo={titulo} onClose={onClose}>
      <p className="mb-4 text-stone-600">{mensaje}</p>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variante="secondary" onClick={onClose}>
          Volver
        </Button>
        <Button variante="danger" cargando={cargando} onClick={onConfirm}>
          {confirmar}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal

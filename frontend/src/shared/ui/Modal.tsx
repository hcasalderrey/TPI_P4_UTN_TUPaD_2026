import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onClose: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

// Fondo oscuro (cierra al hacer clic) y tarjeta con el contenido.
function Modal({ titulo, onClose, children, ancho = 'md' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-stone-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-full w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl ${
          ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        <h2 className="mb-4 text-xl font-bold text-stone-800">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal

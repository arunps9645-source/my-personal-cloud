import Modal from './Modal'

export default function ConfirmModal({ open, onClose, title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="mb-5 text-sm leading-relaxed text-slate-400">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

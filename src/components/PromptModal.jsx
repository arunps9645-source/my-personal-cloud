import { useEffect, useState } from 'react'
import Modal from './Modal'

/** Single text-field dialog used for rename / new folder / new album. */
export default function PromptModal({ open, onClose, title, label, initial = '', confirmLabel = 'Save', onSubmit }) {
  const [value, setValue] = useState(initial)
  useEffect(() => {
    if (open) setValue(initial)
  }, [open, initial])

  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="prompt-input">{label}</label>
          <input id="prompt-input" autoFocus className="input" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!value.trim()}>{confirmLabel}</button>
        </div>
      </form>
    </Modal>
  )
}

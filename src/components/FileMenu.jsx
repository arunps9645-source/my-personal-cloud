import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'

/** items: [{ label, icon, onClick, danger?, disabled?, hint? }] */
export default function FileMenu({ items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const width = 192
    const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
    setPosition({ top: rect.bottom + 4, left })
  }

  useEffect(() => {
    if (!open) return undefined
    updatePosition()
    const close = (e) => {
      if (!ref.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    const reposition = () => updatePosition()
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${open ? 'z-[70]' : 'z-0'}`} onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        aria-label="File actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <MoreVertical size={17} />
      </button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
            ref={menuRef}
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'fixed', top: position.top, left: position.left }}
            className="z-[9999] w-48 rounded-xl border border-white/10 bg-ink-800 p-1 shadow-2xl backdrop-blur-2xl"
          >
            {items.map((it) => (
              <button
                key={it.label}
                role="menuitem"
                disabled={it.disabled}
                title={it.disabled ? it.hint : undefined}
                onClick={() => {
                  setOpen(false)
                  it.onClick()
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  it.danger ? 'text-rose-300 hover:bg-rose-500/10' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

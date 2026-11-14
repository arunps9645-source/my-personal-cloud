import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'

/** items: [{ label, icon, onClick, danger?, disabled?, hint? }] */
export default function FileMenu({ items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label="File actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <MoreVertical size={17} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`glass-strong absolute z-30 mt-1 w-48 rounded-xl p-1 shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
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
      </AnimatePresence>
    </div>
  )
}

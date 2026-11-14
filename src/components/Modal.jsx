import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`glass-strong glow-border relative flex max-h-[88vh] w-full flex-col rounded-t-3xl sm:rounded-2xl ${SIZES[size]}`}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

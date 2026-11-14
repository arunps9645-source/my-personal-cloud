import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useApp } from '../store/AppStore'

const TONES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-300' },
  error: { icon: AlertTriangle, cls: 'text-rose-300' },
  info: { icon: Info, cls: 'text-sky-300' },
}

export default function Toasts() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, cls } = TONES[t.tone] || TONES.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 shadow-xl"
              role="status"
            >
              <Icon size={18} className={`mt-0.5 shrink-0 ${cls}`} />
              <p className="text-sm text-slate-200">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

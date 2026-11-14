import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useApp } from '../store/AppStore'

export default function UploadTray() {
  const { uploads, clearUploads } = useApp()
  const active = uploads.some((u) => u.status === 'uploading')
  return (
    <AnimatePresence>
      {uploads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="glass-strong fixed bottom-24 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-3 shadow-2xl lg:bottom-6"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-sm font-medium text-white">{active ? 'Processing files…' : 'Finished'}</span>
            {!active && (
              <button onClick={clearUploads} aria-label="Close upload panel" className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>
          <div className="max-h-52 space-y-2 overflow-y-auto">
            {uploads.map((u) => (
              <div key={u.id} className="rounded-lg bg-white/5 p-2.5">
                <div className="flex items-center gap-2 text-xs">
                  {u.status === 'done' && <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />}
                  {u.status === 'error' && <AlertCircle size={14} className="shrink-0 text-rose-400" />}
                  <span className="truncate text-slate-200">{u.name}</span>
                  <span className="ml-auto text-slate-500">{u.status === 'error' ? '' : `${u.progress}%`}</span>
                </div>
                {u.status === 'error' ? (
                  <p className="mt-1 text-[11px] text-rose-300">{u.error}</p>
                ) : (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
                      animate={{ width: `${u.progress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.25 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

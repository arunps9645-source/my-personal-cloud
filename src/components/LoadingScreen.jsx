import { motion } from 'framer-motion'
import Logo from './Logo'

export default function LoadingScreen({ label = 'Loading your cloud…' }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-950">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
        </motion.div>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="text-xs tracking-wide text-slate-500">{label}</p>
      </div>
    </div>
  )
}

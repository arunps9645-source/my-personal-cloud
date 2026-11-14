import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, sub, tone = 'blue' }) {
  const tones = {
    blue: 'from-accent-blue/25 text-sky-300',
    violet: 'from-accent-violet/25 text-violet-300',
    cyan: 'from-accent-cyan/25 text-cyan-300',
  }
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="glass glow-border rounded-2xl p-4"
    >
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br to-transparent ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-slate-500">{sub}</div>}
    </motion.div>
  )
}

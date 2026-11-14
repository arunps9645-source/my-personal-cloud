import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Images, FolderOpen, LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react'
import Logo from './Logo'
import { useApp } from '../store/AppStore'
import { formatBytes } from '../lib/format'
import { STORAGE_QUOTA_BYTES } from '../lib/config'

export const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/files', label: 'Files', icon: FolderOpen },
  { to: '/gallery', label: 'Gallery', icon: Images },
  { to: '/albums', label: 'Albums', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { stats, signOut, user } = useApp()
  const pct = Math.min(100, (stats.usedBytes / STORAGE_QUOTA_BYTES) * 100)
  return (
    <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-y-0 border-l-0 p-4 lg:flex">
      <div className="px-2 pb-6 pt-2">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="relative block">
            {({ isActive }) => (
              <div
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="glow-border absolute inset-0 rounded-xl bg-gradient-to-r from-accent-blue/20 to-accent-violet/15"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative" />
                <span className="relative">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="glass mb-3 rounded-xl p-3">
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Storage</span>
          <span>{formatBytes(stats.usedBytes)} / {formatBytes(STORAGE_QUOTA_BYTES)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(pct, 1)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl p-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-sm font-semibold text-white">
          {(user?.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
        </div>
        <button onClick={signOut} aria-label="Sign out" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  )
}

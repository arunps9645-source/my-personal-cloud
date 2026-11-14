import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV } from './Sidebar'

export default function MobileNav() {
  return (
    <nav
      className="glass-strong fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl p-1.5 lg:hidden"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom))' }}
      aria-label="Primary"
    >
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="relative flex-1">
          {({ isActive }) => (
            <div className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
              {isActive && (
                <motion.div
                  layoutId="mobile-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-accent-blue/25 to-accent-violet/15"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={19} className="relative" />
              <span className="relative">{label}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

import { Navigate, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import UploadTray from './UploadTray'
import { useApp } from '../store/AppStore'
import { authService } from '../lib/auth'

export default function Layout() {
  const { user, authLoading } = useApp()
  const { pathname } = useLocation()
  const outlet = useOutlet()
  if (authLoading) {
  return <div className="min-h-screen grid place-items-center text-white">
    Loading...
  </div>
}

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8 lg:pb-10">
          {authService.isDemo && (
            <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-center text-[11px] text-amber-200/80">
              Demo mode: sample data, and files you add live in this browser tab only (not yet saved to Cloudflare R2).
            </div>
          )}
          <TopBar />
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {outlet}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
      <MobileNav />
      <UploadTray />
    </div>
  )
}

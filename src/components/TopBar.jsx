import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import Logo from './Logo'
import UploadButton from './UploadButton'
import { useApp } from '../store/AppStore'

export default function TopBar() {
  const { user } = useApp()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')

  useEffect(() => setQ(params.get('q') || ''), [params])

  const submit = (e) => {
    e.preventDefault()
    const target = pathname.startsWith('/gallery') ? '/gallery' : '/files'
    nav(`${target}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
  }

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-6 flex items-center gap-3 border-b border-white/5 bg-ink-950/70 px-4 py-3 backdrop-blur-xl max-[480px]:flex-wrap sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="shrink-0 lg:hidden"><Logo compact /></div>
      <form onSubmit={submit} className="relative min-w-0 max-w-xl flex-1 max-[480px]:order-3 max-[480px]:basis-full" role="search">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-10"
          placeholder={pathname.startsWith('/gallery') ? 'Search photos, places, people…' : 'Search files…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search"
        />
      </form>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <UploadButton className="btn-primary !px-3 sm:!px-4"><span className="hidden sm:inline">Upload</span></UploadButton>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent-blue to-accent-violet text-sm font-semibold text-white lg:hidden">
          {(user?.name || '?').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

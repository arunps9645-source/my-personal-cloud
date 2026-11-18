import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Toasts from './components/Toasts'
import Login from './pages/Login'

// Lazy import fail aayal (network blip) oru thavana retry cheyyum
function lazyRetry(factory) {
  const load = () =>
    factory().catch(
      () => new Promise((resolve) => setTimeout(resolve, 600)).then(factory),
    )
  const Component = lazy(load)
  Component.preload = load
  return Component
}

const Dashboard = lazyRetry(() => import('./pages/Dashboard'))
const Files = lazyRetry(() => import('./pages/Files'))
const Gallery = lazyRetry(() => import('./pages/Gallery'))
const Albums = lazyRetry(() => import('./pages/Albums'))
const AlbumDetail = lazyRetry(() => import('./pages/AlbumDetail'))
const Settings = lazyRetry(() => import('./pages/Settings'))
const NotFound = lazyRetry(() => import('./pages/NotFound'))

const pages = [Dashboard, Files, Gallery, Albums, AlbumDetail, Settings]

// Page-inu mathram fallback; sidebar/layout maraathe nilkkum
function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  )
}

function Page({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

export default function App() {
  // App idle aayirikkumbol baaki pages background-il load cheyyum
  useEffect(() => {
    const run = () => pages.forEach((p) => p.preload?.().catch(() => {}))
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(run, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(run, 2000)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Page><Dashboard /></Page>} />
          <Route path="files" element={<Page><Files /></Page>} />
          <Route path="gallery" element={<Page><Gallery /></Page>} />
          <Route path="albums" element={<Page><Albums /></Page>} />
          <Route path="albums/:id" element={<Page><AlbumDetail /></Page>} />
          <Route path="settings" element={<Page><Settings /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Route>
      </Routes>
      <Toasts />
    </>
  )
}
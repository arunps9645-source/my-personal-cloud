import { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'
import Toasts from './components/Toasts'
import Login from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Files = lazy(() => import('./pages/Files'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Albums = lazy(() => import('./pages/Albums'))
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (booting) return <LoadingScreen />

  return (
    <>
      <Suspense fallback={<LoadingScreen label="Loading…" />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="files" element={<Files />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="albums" element={<Albums />} />
            <Route path="albums/:id" element={<AlbumDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <Toasts />
    </>
  )
}

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './store/AppStore'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Puthiya deploy-kku shesham pazhaya chunk chodhichal oru thavana mathram reload.
// 10 second-inullil veendum failure vannal reload loop undaakkilla.
const RELOAD_KEY = 'chunk-reload-at'

function reloadOnce() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 10000) return
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage kittiyillenkil direct reload cheyyathe vittu
    return
  }
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadOnce()
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
import { Component } from 'react'

// Prevents a white screen: any render error shows a recoverable message instead.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950 p-6 text-center">
        <div className="glass max-w-md rounded-2xl p-8">
          <h1 className="font-display text-xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">{String(this.state.error.message || this.state.error)}</p>
          <button className="btn-primary mt-5" onClick={() => window.location.assign('/')}>
            Reload app
          </button>
        </div>
      </div>
    )
  }
}

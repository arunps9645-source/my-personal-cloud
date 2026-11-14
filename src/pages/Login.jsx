import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import Particles from '../components/Particles'
import Logo from '../components/Logo'
import { useApp } from '../store/AppStore'
import { authService } from '../lib/auth'

export default function Login() {
  const { user, signIn, signUp, authLoading } = useApp()
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

if (authLoading) {
  return (
    <div className="grid min-h-screen place-items-center text-white">
      <Loader2 className="animate-spin" size={28} />
    </div>
  )
}
  if (user) return <Navigate to="/" replace />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const switchMode = (m) => {
  setMode(m)
  setError('')
  setSuccess('')
}

  
const submit = async (e) => {
  e.preventDefault()

  setBusy(true)
  setError('')
  setSuccess('')

  try {
    let res

    if (mode === 'login') {
      res = await signIn(form)
    } else if (mode === 'register') {
      res = await signUp(form)
    } else {
      res = await authService.resetPassword(form)
    }

    if (res.error) {
      setError(res.error)
      return
    }

    if (mode === 'forgot') {
      setSuccess(res.message || 'Check your email for the reset link.')
      return
    }

    if (mode === 'register' && !res.user) {
      setSuccess(
        res.message || 'Please verify your email before signing in.'
      )
      setMode('login')
      return
    }

    if (res.user) {
      nav('/', { replace: true })
    }
  } catch (err) {
    setError(err.message || 'Something went wrong.')
  } finally {
    setBusy(false)
  }
}


  const titles = {
    login: ['Welcome back', 'Sign in to your cloud'],
    register: ['Create your cloud', 'Your private space for files and photos'],
    forgot: ['Reset password', "We'll email you a reset link"],
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 20%, rgba(79,140,255,.28), transparent 60%), radial-gradient(55% 55% at 85% 25%, rgba(139,92,246,.26), transparent 60%), radial-gradient(60% 60% at 50% 100%, rgba(34,211,238,.2), transparent 60%)',
          backgroundSize: '140% 140%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 60%', '0% 0%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong glow-border relative w-full max-w-md rounded-3xl p-7 shadow-2xl sm:p-9"
      >
        <div className="mb-7"><Logo /></div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
            <h1 className="font-display text-2xl font-semibold text-white">{titles[mode][0]}</h1>
            <p className="mb-6 mt-1 text-sm text-slate-400">{titles[mode][1]}</p>

            <form onSubmit={submit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <Field icon={User} label="Name" type="text" value={form.name} onChange={set('name')} autoComplete="name" />
              )}
              <Field icon={Mail} label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
              {mode !== 'forgot' && (
                <div>
                  <label className="label" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="password"
                      className="input px-10"
                      type={show ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
    {success}
  </div>
)}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              {mode === 'login' && (
                <>
                  <button className="text-slate-400 hover:text-white" onClick={() => switchMode('forgot')}>Forgot password?</button>
                  <button className="gradient-text font-medium" onClick={() => switchMode('register')}>Create account</button>
                </>
              )}
              {mode === 'register' && (
                <button className="inline-flex items-center gap-1 text-slate-400 hover:text-white" onClick={() => switchMode('login')}>
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              )}
              {mode === 'forgot' && (
                <button className="inline-flex items-center gap-1 text-slate-400 hover:text-white" onClick={() => switchMode('login')}>
                  <ArrowLeft size={14} /> Back to sign in
                </button>
              )}
            </div>

          
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Field({ icon: Icon, label, ...props }) {
  const id = `f-${label.toLowerCase()}`
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input id={id} className="input pl-10" {...props} />
      </div>
    </div>
  )
}

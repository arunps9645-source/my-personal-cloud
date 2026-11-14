import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Laptop, LogOut, ScanFace, ShieldAlert, Trash2 } from 'lucide-react'
import { useApp } from '../store/AppStore'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { authService } from '../lib/auth'
import { formatBytes } from '../lib/format'
import { STORAGE_QUOTA_BYTES } from '../lib/config'

function Section({ title, desc, children }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass glow-border rounded-2xl p-5 sm:p-6">
      <h2 className="font-display text-base font-semibold text-white">{title}</h2>
      {desc && <p className="mb-4 mt-1 text-sm text-slate-400">{desc}</p>}
      {children}
    </motion.section>
  )
}

export default function Settings() {
  const app = useApp()
  const { user, stats, faceEnabled } = app
  const nav = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [pw, setPw] = useState({ next: '', confirm: '' })
  const [pwBusy, setPwBusy] = useState(false)
  const [confirmFace, setConfirmFace] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [typed, setTyped] = useState('')

  const saveProfile = (e) => {
    e.preventDefault()
    if (!name.trim()) return app.toast('Name cannot be empty', 'error')
    app.updateProfile({ name: name.trim() })
    app.toast('Profile updated', 'success')
  }

  const changePw = async (e) => {
    e.preventDefault()
    setPwBusy(true)
    const res = await authService.changePassword(pw)
    setPwBusy(false)
    if (res.error) app.toast(res.error, 'error')
    else {
      app.toast('Password changed', 'success')
      setPw({ next: '', confirm: '' })
    }
  }

  const pct = Math.min(100, (stats.usedBytes / STORAGE_QUOTA_BYTES) * 100)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Account, privacy and security" />
      <div className="space-y-5">
        <Section title="Profile" desc="How you appear in the app.">
          <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="pname">Name</label>
              <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="pemail">Account email</label>
              <input id="pemail" className="input opacity-70" value={user?.email || ''} readOnly />
            </div>
            <div className="sm:col-span-2"><button className="btn-primary" type="submit">Save profile</button></div>
          </form>
        </Section>

        <Section title="Storage" desc="Usage across everything in this build.">
          <div className="mb-2 flex justify-between text-sm text-slate-300">
            <span>{formatBytes(stats.usedBytes)} used</span>
            <span className="text-slate-500">of {formatBytes(STORAGE_QUOTA_BYTES)} free-tier allowance</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan" initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 1)}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Storage is not unlimited. Free allowances can change, and usage beyond them may be billed by the provider. You'll be warned before any limit is reached and nothing is upgraded automatically.
          </p>
        </Section>

        <Section title="Change password" desc="Use at least 8 characters.">
          <form onSubmit={changePw} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="npw">New password</label>
              <input id="npw" type="password" autoComplete="new-password" className="input" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />
            </div>
            <div>
              <label className="label" htmlFor="cpw">Confirm password</label>
              <input id="cpw" type="password" autoComplete="new-password" className="input" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <button className="btn-primary" type="submit" disabled={pwBusy}>Update password</button>
              {authService.isDemo && <span className="ml-3 text-xs text-amber-200/70">Needs Supabase (Stage 2)</span>}
            </div>
          </form>
        </Section>

        <Section title="Sessions" desc="Where you're signed in.">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <Laptop size={18} className="text-slate-400" />
            <div className="flex-1 text-sm">
              <p className="text-white">This browser</p>
              <p className="text-xs text-slate-500">{authService.isDemo ? 'Local demo session' : 'Active now'}</p>
            </div>
            <button className="btn-ghost !py-2" onClick={() => { app.signOut(); nav('/login') }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
          {authService.isDemo && <p className="mt-3 text-xs text-slate-500">Listing and revoking other devices requires Supabase (Stage 2).</p>}
        </Section>

        <Section title="Privacy" desc="Face recognition is off unless you turn it on.">
          <div className="flex items-start gap-3">
            <ScanFace size={20} className="mt-0.5 text-accent-cyan" />
            <div className="flex-1">
              <p className="text-sm text-white">Face recognition</p>
              <p className="text-xs leading-relaxed text-slate-500">
                When real detection ships (Stage 5) it will run in your browser, and photos won't go to any paid AI service. Turning it off deletes all face data.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={faceEnabled}
              aria-label="Face recognition"
              onClick={() => (faceEnabled ? setConfirmFace(true) : app.setFaceRecognition(true))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${faceEnabled ? 'bg-gradient-to-r from-accent-blue to-accent-violet' : 'bg-white/15'}`}
            >
              <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: faceEnabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </button>
          </div>
        </Section>

        <section className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-rose-200"><ShieldAlert size={17} /> Danger zone</h2>
          <p className="mb-4 mt-1 text-sm text-slate-400">Deletes all files, albums and face data held by this app, then signs you out.</p>
          <button className="btn-danger" onClick={() => setDeleteOpen(true)}><Trash2 size={15} /> Delete account &amp; data</button>
        </section>
      </div>

      <ConfirmModal
        open={confirmFace}
        onClose={() => setConfirmFace(false)}
        title="Turn off face recognition?"
        danger
        confirmLabel="Turn off & delete"
        message="All face groups and names will be deleted. You can turn it on again later."
        onConfirm={() => app.setFaceRecognition(false)}
      />

      <Modal open={deleteOpen} onClose={() => { setDeleteOpen(false); setTyped('') }} title="Delete account & data" size="sm">
        <p className="mb-3 text-sm text-slate-400">
          This removes everything in this build and can't be undone.
          {authService.isDemo && ' In demo mode only local data is affected; no server account exists.'} Type <b className="text-white">DELETE</b> to confirm.
        </p>
        <input className="input mb-4" value={typed} onChange={(e) => setTyped(e.target.value)} aria-label="Type DELETE to confirm" />
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => { setDeleteOpen(false); setTyped('') }}>Cancel</button>
          <button className="btn-danger" disabled={typed !== 'DELETE'} onClick={() => { app.deleteAccountData(); nav('/login') }}>Delete everything</button>
        </div>
      </Modal>
    </div>
  )
}

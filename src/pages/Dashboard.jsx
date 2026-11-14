import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Album, Clock, FileText, Folder, FolderOpen, HardDrive, Image as ImageIcon, Star, Trash2, Undo2, Upload, Video, Pencil, Move } from 'lucide-react'
import { useApp } from '../store/AppStore'
import StatCard from '../components/StatCard'
import StorageRing from '../components/StorageRing'
import DropZone from '../components/DropZone'
import FileIcon from '../components/FileIcon'
import PhotoTile from '../components/PhotoTile'
import Lightbox from '../components/Lightbox'
import { formatBytes, greeting, timeAgo } from '../lib/format'
import { STORAGE_QUOTA_BYTES } from '../lib/config'

const ACT_ICONS = { upload: Upload, folder: Folder, star: Star, album: Album, trash: Trash2, restore: Undo2, edit: Pencil, move: Move, privacy: HardDrive }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }

export default function Dashboard() {
  const { user, stats, activity, openFile } = useApp()
  const [viewer, setViewer] = useState(null)

  const recentUploads = useMemo(() => [...stats.live].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6), [stats.live])
  const recentOpened = useMemo(
    () => stats.live.filter((f) => f.openedAt).sort((a, b) => b.openedAt - a.openedAt).slice(0, 5),
    [stats.live],
  )
  const imgBytes = stats.images.reduce((s, f) => s + f.size, 0)
  const vidBytes = stats.videos.reduce((s, f) => s + f.size, 0)
  const otherBytes = Math.max(0, stats.usedBytes - imgBytes - vidBytes)
  const total = Math.max(1, imgBytes + vidBytes + otherBytes)
  const recentImages = recentUploads.filter((f) => f.type === 'image')

  const viewerList = recentImages
  const openItem = (f) => {
    openFile(f.id)
    if (f.type === 'image') setViewer(viewerList.findIndex((x) => x.id === f.id))
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {greeting()}, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">Here's what's happening in your cloud.</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total files" value={stats.totalFiles} tone="blue" />
        <StatCard icon={FolderOpen} label="Folders" value={stats.totalFolders} tone="violet" />
        <StatCard icon={ImageIcon} label="Images" value={stats.images.length} sub={formatBytes(imgBytes)} tone="cyan" />
        <StatCard icon={Video} label="Videos" value={stats.videos.length} sub={formatBytes(vidBytes)} tone="violet" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="glass glow-border rounded-2xl p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-white">Storage</h2>
          <div className="flex flex-col items-center gap-5">
            <StorageRing used={stats.usedBytes} total={STORAGE_QUOTA_BYTES} />
            <div className="w-full space-y-3">
              {[
                ['Images', imgBytes, 'from-accent-blue to-accent-cyan'],
                ['Videos', vidBytes, 'from-accent-violet to-accent-blue'],
                ['Other', otherBytes, 'from-slate-500 to-slate-400'],
              ].map(([label, bytes, grad]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>{label}</span>
                    <span>{formatBytes(bytes)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(bytes / total) * 100}%` }}
                      transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Plan limit shown: {formatBytes(STORAGE_QUOTA_BYTES)} (free tier allowance; may change).
            </p>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6 lg:col-span-2">
          <DropZone />
          <div className="glass glow-border rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-white">Recent uploads</h2>
              <Link to="/files" className="text-xs text-accent-blue hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
              {recentUploads.map((f) => (
                <motion.button
                  key={f.id}
                  whileHover={{ y: -3 }}
                  onClick={() => openItem(f)}
                  className="group text-left"
                  title={f.name}
                >
                  <div className="aspect-square overflow-hidden rounded-xl">
                    {f.type === 'image' || f.type === 'video' ? (
                      <PhotoTile file={f} />
                    ) : (
                      <div className="grid h-full place-items-center bg-white/5"><FileIcon type={f.type} /></div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-[11px] text-slate-400 group-hover:text-white">{f.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="glass glow-border rounded-2xl p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
            <Clock size={16} className="text-slate-400" /> Recently opened
          </h2>
          {recentOpened.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Files you open will show up here.</p>
          ) : (
            <ul className="space-y-1">
              {recentOpened.map((f) => (
                <li key={f.id}>
                  <button onClick={() => openItem(f)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5">
                    <FileIcon type={f.type} size={18} box="h-9 w-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-200">{f.name}</span>
                      <span className="text-[11px] text-slate-500">{timeAgo(f.openedAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={item} className="glass glow-border rounded-2xl p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-white">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => {
                const Icon = ACT_ICONS[a.icon] || Clock
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-400"><Icon size={15} /></div>
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-300">{a.text}</p>
                    <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(a.at)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </motion.div>
      </div>

      <Lightbox photos={viewerList} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
    </motion.div>
  )
}

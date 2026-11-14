import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderPlus, ImageIcon, Plus } from 'lucide-react'
import { useApp } from '../store/AppStore'
import PageHeader, { EmptyState } from '../components/PageHeader'
import PhotoTile from '../components/PhotoTile'
import PromptModal from '../components/PromptModal'

const SUGGESTED = ['Family Memories', 'Friends', 'College Days', 'Travel', 'Birthday', 'Personal']

export default function Albums() {
  const { albums, files, createAlbum } = useApp()
  const [creating, setCreating] = useState(false)
  const existing = new Set(albums.map((a) => a.name.toLowerCase()))
  const suggestions = SUGGESTED.filter((s) => !existing.has(s.toLowerCase()))

  return (
    <div>
      <PageHeader title="Albums" subtitle={`${albums.length} album${albums.length === 1 ? '' : 's'}`}>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> New album
        </button>
      </PageHeader>

      {suggestions.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Suggested:</span>
          {suggestions.map((s) => (
            <button key={s} onClick={() => createAlbum(s)} className="glass rounded-full px-3 py-1 text-xs text-slate-300 hover:text-white">
              + {s}
            </button>
          ))}
        </div>
      )}

      {albums.length === 0 ? (
        <EmptyState icon={FolderPlus} title="No albums yet" text="Create an album, then add photos from your gallery.">
          <button className="btn-primary" onClick={() => setCreating(true)}>Create album</button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {albums.map((a, i) => {
            const cover = files.find((f) => f.id === a.coverId && !f.trashed)
            const thumbs = a.photoIds.map((id) => files.find((f) => f.id === id && !f.trashed)).filter(Boolean).slice(1, 4)
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/albums/${a.id}`} className="glass glow-border group block overflow-hidden rounded-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <motion.div className="h-full w-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.5 }}>
                      {cover ? <PhotoTile file={cover} showIcon={false} /> : <div className="grid h-full place-items-center bg-white/5 text-slate-600"><ImageIcon size={32} /></div>}
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">{a.name}</h3>
                        <p className="text-xs text-slate-300">{a.photoIds.length} photo{a.photoIds.length === 1 ? '' : 's'}</p>
                      </div>
                      <div className="flex -space-x-2">
                        {thumbs.map((t) => (
                          <div key={t.id} className="h-8 w-8 overflow-hidden rounded-full border-2 border-ink-900">
                            <PhotoTile file={t} showIcon={false} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      <PromptModal open={creating} onClose={() => setCreating(false)} title="New album" label="Album name" confirmLabel="Create" onSubmit={(n) => createAlbum(n)} />
    </div>
  )
}

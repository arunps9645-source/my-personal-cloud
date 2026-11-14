import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, FolderInput, ImageIcon, Image as CoverIcon, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useApp } from '../store/AppStore'
import PageHeader, { EmptyState } from '../components/PageHeader'
import PhotoTile from '../components/PhotoTile'
import Lightbox from '../components/Lightbox'
import Modal from '../components/Modal'
import PromptModal from '../components/PromptModal'
import ConfirmModal from '../components/ConfirmModal'

export default function AlbumDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const app = useApp()
  const { albums, files, stats } = app
  const album = albums.find((a) => a.id === id)
  const [modal, setModal] = useState(null)
  const [picked, setPicked] = useState([])
  const [viewer, setViewer] = useState(null)
  const [moving, setMoving] = useState(null) // photo id being moved

  if (!album) {
    return (
      <EmptyState icon={ImageIcon} title="Album not found" text="It may have been deleted.">
        <Link to="/albums" className="btn-primary">Back to albums</Link>
      </EmptyState>
    )
  }

  const photos = album.photoIds.map((pid) => files.find((f) => f.id === pid && !f.trashed)).filter(Boolean)
  const available = stats.images.filter((p) => !album.photoIds.includes(p.id))
  const toggle = (pid) => setPicked((p) => (p.includes(pid) ? p.filter((x) => x !== pid) : [...p, pid]))
  const closeModal = () => {
    setModal(null)
    setPicked([])
  }

  return (
    <div>
      <Link to="/albums" className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Albums
      </Link>
      <PageHeader title={album.name} subtitle={`${photos.length} photo${photos.length === 1 ? '' : 's'}`}>
        <button className="btn-primary" onClick={() => setModal('add')}><Plus size={16} /> Add photos</button>
        <button className="btn-ghost" onClick={() => setModal('rename')}><Pencil size={15} /> Rename</button>
        <button className="btn-danger" onClick={() => setModal('delete')}><Trash2 size={15} /> Delete</button>
      </PageHeader>

      {photos.length === 0 ? (
        <EmptyState icon={ImageIcon} title="This album is empty" text="Add photos from your gallery.">
          <button className="btn-primary" onClick={() => setModal('add')}>Add photos</button>
        </EmptyState>
      ) : (
        <motion.div layout className="columns-2 gap-2.5 sm:columns-3 lg:columns-4">
          <AnimatePresence>
            {photos.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 14) * 0.03 } }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative mb-2.5 break-inside-avoid overflow-hidden rounded-xl"
              >
                <button
                  onClick={() => setViewer(i)}
                  className={`block w-full ${i % 5 === 0 ? 'aspect-[3/4]' : i % 3 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}
                  aria-label={`Open ${p.name}`}
                >
                  <PhotoTile file={p} showIcon={false} />
                </button>
                {album.coverId === p.id && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">Cover</span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                  <IconBtn label="Set as cover" onClick={() => app.setAlbumCover(album.id, p.id)}><CoverIcon size={14} /></IconBtn>
                  <IconBtn label="Move to another album" onClick={() => setMoving(p.id)}><FolderInput size={14} /></IconBtn>
                  <IconBtn label="Remove from album" onClick={() => app.removeFromAlbum(album.id, p.id)}><X size={14} /></IconBtn>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={modal === 'add'} onClose={closeModal} title="Add photos" size="lg">
        {available.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Every photo is already in this album.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {available.map((p) => {
                const on = picked.includes(p.id)
                return (
                  <button key={p.id} onClick={() => toggle(p.id)} aria-pressed={on} className="relative aspect-square overflow-hidden rounded-xl" title={p.name}>
                    <PhotoTile file={p} showIcon={false} />
                    {on && (
                      <span className="absolute inset-0 grid place-items-center bg-accent-blue/40 ring-2 ring-inset ring-accent-cyan">
                        <Check size={22} className="text-white" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-primary" disabled={!picked.length} onClick={() => { app.addToAlbum(album.id, picked); closeModal() }}>
                Add {picked.length || ''} photo{picked.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={moving !== null} onClose={() => setMoving(null)} title="Move to album" size="sm">
        <p className="mb-3 text-sm text-slate-400">Moves the photo out of “{album.name}”. To keep it in both, add it to the other album from there.</p>
        <div className="space-y-1">
          {albums.filter((a) => a.id !== album.id).map((a) => (
            <button key={a.id} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10" onClick={() => { app.moveBetweenAlbums(moving, album.id, a.id); setMoving(null) }}>
              {a.name}<span className="text-xs text-slate-500">{a.photoIds.length}</span>
            </button>
          ))}
          {albums.length < 2 && <p className="text-sm text-slate-500">Create another album first.</p>}
        </div>
      </Modal>

      <PromptModal open={modal === 'rename'} onClose={closeModal} title="Rename album" label="Album name" initial={album.name} onSubmit={(n) => app.renameAlbum(album.id, n)} />
      <ConfirmModal open={modal === 'delete'} onClose={closeModal} title="Delete album?" danger confirmLabel="Delete album" message="The album is removed but its photos stay in your gallery." onConfirm={() => { app.deleteAlbum(album.id); nav('/albums') }} />

      <Lightbox photos={photos} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
    </div>
  )
}

function IconBtn({ label, onClick, children }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} className="rounded-full bg-black/60 p-1.5 text-white hover:bg-white/30">
      {children}
    </button>
  )
}

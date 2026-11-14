import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Heart, Images, MapPin, Merge, Pencil, Play, Plus, ScanFace, Trash2, UserX, X } from 'lucide-react'
import { useApp } from '../store/AppStore'
import PageHeader, { EmptyState } from '../components/PageHeader'
import PhotoTile from '../components/PhotoTile'
import Lightbox from '../components/Lightbox'
import Modal from '../components/Modal'
import PromptModal from '../components/PromptModal'
import { formatBytes, formatDate, monthLabel } from '../lib/format'

const TABS = [
  ['timeline', 'Timeline'],
  ['recent', 'Recent'],
  ['favorites', 'Favorites'],
  ['people', 'People'],
  ['places', 'Places'],
  ['memories', 'Memories'],
  ['duplicates', 'Duplicates'],
]

function PhotoGrid({ photos, onOpen, children }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-5 lg:grid-cols-6">
      {photos.map((p, i) => (
        <motion.button
          key={p.id}
          layout
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 18) * 0.02 } }}
          whileHover={{ scale: 1.03, zIndex: 5 }}
          onClick={() => onOpen(p, photos)}
          className="group relative aspect-square overflow-hidden rounded-xl"
          title={p.name}
          aria-label={`Open ${p.name}`}
        >
          <PhotoTile file={p} showIcon={false} />
          {p.favorite && <Heart size={13} className="absolute right-1.5 top-1.5 fill-rose-500 text-rose-500" />}
          {children?.(p)}
        </motion.button>
      ))}
    </div>
  )
}

export default function Gallery() {
  const app = useApp()
  const { stats, faceEnabled, people } = app
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'timeline'
  const q = (params.get('q') || '').trim().toLowerCase()
  const [viewer, setViewer] = useState({ list: [], index: null, slideshow: false })
  const [personId, setPersonId] = useState(null)
  const [modal, setModal] = useState(null)

  const photos = useMemo(() => stats.images, [stats.images])
  const personName = (id) => people.find((p) => p.id === id)?.name || ''

  const matches = (p) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    (p.location || '').toLowerCase().includes(q) ||
    (faceEnabled && p.personIds.some((id) => personName(id).toLowerCase().includes(q)))

  const filtered = useMemo(() => photos.filter(matches), [photos, q, faceEnabled, people]) // eslint-disable-line react-hooks/exhaustive-deps
  const byDate = useMemo(() => [...filtered].sort((a, b) => (b.takenAt || 0) - (a.takenAt || 0)), [filtered])

  const open = (p, list) => setViewer({ list, index: list.findIndex((x) => x.id === p.id), slideshow: false })
  const setIndex = (fn) => setViewer((v) => ({ ...v, index: typeof fn === 'function' ? fn(v.index) : fn }))
  const startSlideshow = () => byDate.length && setViewer({ list: byDate, index: 0, slideshow: true })
  const changeTab = (t) => {
    const next = new URLSearchParams(params)
    next.set('tab', t)
    setParams(next)
    setPersonId(null)
  }

  /* ---- derived views ---- */
  const timeline = useMemo(() => {
    const groups = []
    byDate.forEach((p) => {
      const label = monthLabel(p.takenAt || p.createdAt)
      const last = groups[groups.length - 1]
      if (last?.label === label) last.items.push(p)
      else groups.push({ label, items: [p] })
    })
    return groups
  }, [byDate])

  const recent = useMemo(() => [...filtered].sort((a, b) => b.createdAt - a.createdAt).slice(0, 30), [filtered])
  const favorites = filtered.filter((p) => p.favorite)

  const places = useMemo(() => {
    const map = new Map()
    filtered.forEach((p) => p.location && map.set(p.location, [...(map.get(p.location) || []), p]))
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  const memories = useMemo(() => {
    const now = new Date()
    return photos
      .filter((p) => {
        const d = new Date(p.takenAt || 0)
        return d.getMonth() === now.getMonth() && d.getDate() === now.getDate() && d.getFullYear() < now.getFullYear()
      })
      .sort((a, b) => b.takenAt - a.takenAt)
  }, [photos])

  const duplicates = useMemo(() => {
    const map = new Map()
    photos.forEach((p) => map.set(`${p.name}|${p.size}`, [...(map.get(`${p.name}|${p.size}`) || []), p]))
    return [...map.values()].filter((g) => g.length > 1)
  }, [photos])

  const person = people.find((p) => p.id === personId)
  const personPhotos = person ? photos.filter((p) => p.personIds.includes(person.id)) : []
  const countFor = (id) => photos.filter((p) => p.personIds.includes(id)).length

  const noPhotos = photos.length === 0

  return (
    <div>
      <PageHeader title="Gallery" subtitle={`${photos.length} photos`}>
        <button className="btn-ghost" onClick={startSlideshow} disabled={!byDate.length}>
          <Play size={16} /> Slideshow
        </button>
      </PageHeader>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl pb-1" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => changeTab(id)}
            className={`relative shrink-0 rounded-xl px-4 py-2 text-sm transition ${tab === id ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {tab === id && <motion.span layoutId="gtab" className="glass glow-border absolute inset-0 rounded-xl" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      {q && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          Showing results for “{params.get('q')}”
          <button className="rounded-full bg-white/10 p-1 hover:bg-white/20" aria-label="Clear search" onClick={() => { const n = new URLSearchParams(params); n.delete('q'); setParams(n) }}>
            <X size={12} />
          </button>
        </div>
      )}

      {noPhotos ? (
        <EmptyState icon={Images} title="No photos yet" text="Upload images from the Files page or the Upload button and they'll appear here." />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={tab + (personId || '')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'timeline' &&
              (timeline.length ? (
                <div className="space-y-7">
                  {timeline.map((g) => (
                    <section key={g.label}>
                      <h2 className="mb-2.5 font-display text-sm font-medium text-slate-300">{g.label}</h2>
                      <PhotoGrid photos={g.items} onOpen={(p) => open(p, byDate)} />
                    </section>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Images} title="No matching photos" />
              ))}

            {tab === 'recent' && (recent.length ? <PhotoGrid photos={recent} onOpen={open} /> : <EmptyState icon={Images} title="No matching photos" />)}

            {tab === 'favorites' &&
              (favorites.length ? <PhotoGrid photos={favorites} onOpen={open} /> : <EmptyState icon={Heart} title="No favorites yet" text="Open a photo and tap the heart to favorite it." />)}

            {tab === 'places' &&
              (places.length ? (
                <div className="space-y-7">
                  {places.map(([name, list]) => (
                    <section key={name}>
                      <h2 className="mb-2.5 flex items-center gap-1.5 font-display text-sm font-medium text-slate-300">
                        <MapPin size={14} className="text-accent-cyan" /> {name}
                        <span className="text-xs text-slate-500">{list.length}</span>
                      </h2>
                      <PhotoGrid photos={list} onOpen={open} />
                    </section>
                  ))}
                </div>
              ) : (
                <EmptyState icon={MapPin} title="No location data" text="Photos with location metadata will be grouped here." />
              ))}

            {tab === 'memories' &&
              (memories.length ? (
                <div>
                  <p className="mb-3 text-sm text-slate-400">Photos taken on this day in previous years.</p>
                  <PhotoGrid photos={memories} onOpen={open}>
                    {(p) => (
                      <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        {new Date().getFullYear() - new Date(p.takenAt).getFullYear()}y ago
                      </span>
                    )}
                  </PhotoGrid>
                </div>
              ) : (
                <EmptyState icon={Images} title="No memories for today" text="When you have photos from this date in earlier years, they'll show up here." />
              ))}

            {tab === 'duplicates' &&
              (duplicates.length ? (
                <div className="space-y-5">
                  <p className="text-sm text-slate-400">Matched by identical file name and size. Review before deleting.</p>
                  {duplicates.map((group) => (
                    <div key={group[0].id} className="glass rounded-2xl p-4">
                      <p className="mb-3 flex items-center gap-2 text-sm text-white">
                        <Copy size={15} className="text-amber-300" /> {group[0].name} · {formatBytes(group[0].size)}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {group.map((p) => (
                          <div key={p.id} className="w-32">
                            <button onClick={() => open(p, group)} className="block aspect-square w-full overflow-hidden rounded-xl">
                              <PhotoTile file={p} showIcon={false} />
                            </button>
                            <p className="mt-1 text-[11px] text-slate-500">{formatDate(p.createdAt)}</p>
                            <button className="mt-1 inline-flex items-center gap-1 text-xs text-rose-300 hover:underline" onClick={() => app.trashFile(p.id)}>
                              <Trash2 size={12} /> Move to trash
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Copy} title="No duplicates found" text="Nothing shares the same name and size." />
              ))}

            {tab === 'people' &&
              (!faceEnabled ? (
                <EmptyState icon={ScanFace} title="Face recognition is off" text="Turn it on to group photos by the people in them. Real detection runs in your browser and arrives in Stage 5; for now this shows clearly-labelled sample groups.">
                  <button className="btn-primary" onClick={() => app.setFaceRecognition(true)}>Turn on (sample groups)</button>
                </EmptyState>
              ) : !person ? (
                people.length ? (
                  <div>
                    <p className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/80">
                      Sample groups: no faces were actually detected. Real in-browser detection is coming in Stage 5.
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {people.map((pe) => {
                        const cover = photos.find((p) => p.personIds.includes(pe.id))
                        return (
                          <motion.button key={pe.id} whileHover={{ y: -4 }} onClick={() => setPersonId(pe.id)} className="text-center">
                            <div className="glow-border mx-auto aspect-square w-full max-w-[9rem] overflow-hidden rounded-full">
                              {cover ? <PhotoTile file={cover} showIcon={false} /> : <div className="h-full w-full bg-white/5" />}
                            </div>
                            <p className="mt-2 text-sm font-medium text-white">{pe.name || 'Add name'}</p>
                            <p className="text-[11px] text-slate-500">{countFor(pe.id)} photos</p>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={ScanFace} title="No face groups" text="Face data was deleted. Detection will rebuild groups in Stage 5." />
                )
              ) : (
                <div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <button className="btn-ghost" onClick={() => setPersonId(null)}>← People</button>
                    <h2 className="mr-auto font-display text-xl text-white">{person.name || 'Unnamed person'}</h2>
                    <button className="btn-ghost" onClick={() => setModal('rename')}><Pencil size={15} /> {person.name ? 'Rename' : 'Add name'}</button>
                    <button className="btn-ghost" onClick={() => setModal('merge')} disabled={people.length < 2}><Merge size={15} /> Merge</button>
                    <button className="btn-ghost" onClick={() => setModal('assign')}><Plus size={15} /> Add photos</button>
                  </div>
                  {personPhotos.length ? (
                    <PhotoGrid photos={personPhotos} onOpen={open}>
                      {(p) => (
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Not ${person.name || 'this person'}`}
                          title="Not this person"
                          onClick={(e) => { e.stopPropagation(); app.removeFromPerson(person.id, p.id) }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), app.removeFromPerson(person.id, p.id))}
                          className="absolute bottom-1.5 right-1.5 hidden rounded-full bg-black/70 p-1.5 text-white hover:bg-rose-500 group-hover:block"
                        >
                          <UserX size={13} />
                        </span>
                      )}
                    </PhotoGrid>
                  ) : (
                    <EmptyState icon={ScanFace} title="No photos in this group" text="Use “Add photos” to assign some manually." />
                  )}
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      )}

      <PromptModal open={modal === 'rename' && !!person} onClose={() => setModal(null)} title="Name this person" label="Name" initial={person?.name || ''} onSubmit={(n) => app.renamePerson(person.id, n)} />

      <Modal open={modal === 'merge' && !!person} onClose={() => setModal(null)} title={`Merge into ${person?.name || 'this person'}`} size="sm">
        <p className="mb-3 text-sm text-slate-400">Choose a group to merge into this one. This can't be undone.</p>
        <div className="space-y-1">
          {people.filter((p) => p.id !== personId).map((p) => (
            <button key={p.id} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/10" onClick={() => { app.mergePeople(personId, p.id); setModal(null) }}>
              {p.name || 'Unnamed person'}<span className="text-xs text-slate-500">{countFor(p.id)} photos</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={modal === 'assign' && !!person} onClose={() => setModal(null)} title={`Add photos to ${person?.name || 'this person'}`} size="lg">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {photos.filter((p) => !p.personIds.includes(personId)).map((p) => (
            <button key={p.id} onClick={() => app.assignToPerson(personId, p.id)} className="relative aspect-square overflow-hidden rounded-xl" title={`Add ${p.name}`}>
              <PhotoTile file={p} showIcon={false} />
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition hover:bg-black/50 hover:opacity-100"><Plus size={20} /></span>
            </button>
          ))}
        </div>
      </Modal>

      <Lightbox photos={viewer.list} index={viewer.index} onIndex={setIndex} onClose={() => setViewer((v) => ({ ...v, index: null, slideshow: false }))} startSlideshow={viewer.slideshow} />
    </div>
  )
}

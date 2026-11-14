import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, MapPin, Pause, Play, X } from 'lucide-react'
import PhotoTile from './PhotoTile'
import { formatDate } from '../lib/format'
import { useApp } from '../store/AppStore'

const SLIDE_MS = 3000

export default function Lightbox({ photos, index, onIndex, onClose, startSlideshow = false }) {
  const { toggleFavorite, files } = useApp()
  const [dir, setDir] = useState(1)
  const [playing, setPlaying] = useState(startSlideshow)
  const open = index !== null && index !== undefined && photos[index]

  const go = useCallback(
    (d) => {
      setDir(d)
      onIndex((i) => (i + d + photos.length) % photos.length)
    },
    [onIndex, photos.length],
  )

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, go, onClose])

  useEffect(() => {
    if (!open || !playing || photos.length < 2) return undefined
    const t = setInterval(() => go(1), SLIDE_MS)
    return () => clearInterval(t)
  }, [open, playing, go, photos.length])

  // Always read the live favorite state from the store
  const current = open ? files.find((f) => f.id === photos[index].id) || photos[index] : null

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-[55] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{current.name}</p>
              <p className="flex items-center gap-2 text-xs text-slate-400">
                {current.takenAt && formatDate(current.takenAt)}
                {current.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} />
                    {current.location}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFavorite(current.id)}
                aria-label={current.favorite ? 'Remove from favorites' : 'Add to favorites'}
                className="rounded-full p-2.5 text-white hover:bg-white/10"
              >
                <Heart size={19} className={current.favorite ? 'fill-rose-500 text-rose-500' : ''} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause slideshow' : 'Start slideshow'}
                className="rounded-full p-2.5 text-white hover:bg-white/10"
              >
                {playing ? <Pause size={19} /> : <Play size={19} />}
              </button>
              <button onClick={onClose} aria-label="Close viewer" className="rounded-full p-2.5 text-white hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={current.id}
                custom={dir}
                variants={{
                  enter: (d) => ({ x: d * 80, opacity: 0, scale: 0.97 }),
                  center: { x: 0, opacity: 1, scale: 1 },
                  exit: (d) => ({ x: d * -80, opacity: 0, scale: 0.97 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1)
                  else if (info.offset.x > 80) go(-1)
                }}
                className="absolute inset-0 mx-auto flex max-w-5xl items-center justify-center p-4"
              >
                <div className="aspect-[4/3] max-h-full w-full overflow-hidden rounded-2xl shadow-2xl">
                  <PhotoTile file={current} contain showIcon={false} />
                </div>
              </motion.div>
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 sm:block"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 sm:block"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
          <p className="p-3 text-center text-xs text-slate-500">
            {index + 1} / {photos.length}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

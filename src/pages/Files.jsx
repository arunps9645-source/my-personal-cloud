import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckSquare, ChevronRight, Download, FolderInput, FolderPlus, Folder, Grid3X3, Heart, List, Pencil, RotateCcw, Square, Star, Trash2, UploadCloud,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import PageHeader, { EmptyState } from '../components/PageHeader'
import UploadButton from '../components/UploadButton'
import FileIcon from '../components/FileIcon'
import FileMenu from '../components/FileMenu'
import PhotoTile from '../components/PhotoTile'
import Modal from '../components/Modal'
import PromptModal from '../components/PromptModal'
import ConfirmModal from '../components/ConfirmModal'
import { extOf } from '../lib/fileTypes'
import { formatBytes, formatDate, timeAgo } from '../lib/format'

const TABS = [
  ['all', 'All files'],
  ['favorites', 'Favorites'],
  ['trash', 'Trash'],
]
const SYNC_HINT = 'Sample file: no data stored. Upload a real file to download it.'

export default function Files() {
  const app = useApp()
  const { files, folders, upload } = app
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState(() => localStorage.getItem('mpc.view') || 'grid')
  const [dragging, setDragging] = useState(false)
  const [modal, setModal] = useState(null) // {kind, target}
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const tab = params.get('tab') || 'all'
  const q = (params.get('q') || '').toLowerCase()
  const folderId = params.get('folder') || null

  const setParam = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    setParams(next)
  }
  const changeView = (v) => {
    setView(v)
    localStorage.setItem('mpc.view', v)
  }

  const crumbs = useMemo(() => {
    const out = []
    let cur = folders.find((f) => f.id === folderId)
    while (cur) {
      out.unshift(cur)
      cur = folders.find((f) => f.id === cur.parentId)
    }
    return out
  }, [folders, folderId])

  const searching = Boolean(q)
  const showFolders = tab === 'all' && !searching
  const visibleFolders = showFolders ? folders.filter((f) => (f.parentId || null) === folderId) : []
  const visibleFiles = files.filter((f) => {
    if (tab === 'trash') return f.trashed
    if (f.trashed) return false
    if (tab === 'favorites') return f.favorite && (!searching || f.name.toLowerCase().includes(q))
    if (searching) return f.name.toLowerCase().includes(q)
    return (f.folderId || null) === folderId
  })

  const trashCount = files.filter((f) => f.trashed).length
  const isEmpty = visibleFiles.length === 0 && visibleFolders.length === 0

  const toggleSelected = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    selectedIds.forEach((id) => app.trashFile(id))
    setSelectedIds(new Set())
    setSelecting(false)
    setModal(null)
  }

  const preview = (f) => {
    app.openFile(f.id)
    setModal({ kind: 'preview', target: f.id })
  }

  const download = (f) => {
    if (!f.url) return
    const a = document.createElement('a')
    a.href = f.url
    a.download = f.name
    a.click()
  }

  const menuFor = (f) =>
    f.trashed
      ? [
          { label: 'Restore', icon: <RotateCcw size={15} />, onClick: () => app.restoreFile(f.id) },
          { label: 'Delete forever', icon: <Trash2 size={15} />, danger: true, onClick: () => setModal({ kind: 'purge', target: f.id }) },
        ]
      : [
          { label: 'Preview', icon: <Star size={15} />, onClick: () => preview(f) },
          { label: 'Download', icon: <Download size={15} />, onClick: () => download(f), disabled: !f.url, hint: SYNC_HINT },
          { label: f.favorite ? 'Unfavorite' : 'Favorite', icon: <Heart size={15} />, onClick: () => app.toggleFavorite(f.id) },
          { label: 'Rename', icon: <Pencil size={15} />, onClick: () => setModal({ kind: 'rename', target: f.id }) },
          { label: 'Move', icon: <FolderInput size={15} />, onClick: () => setModal({ kind: 'move', target: f.id }) },
          { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onClick: () => app.trashFile(f.id) },
        ]

  const folderMenu = (fo) => [
    { label: 'Rename', icon: <Pencil size={15} />, onClick: () => setModal({ kind: 'renameFolder', target: fo.id }) },
    { label: 'Delete', icon: <Trash2 size={15} />, danger: true, onClick: () => setModal({ kind: 'deleteFolder', target: fo.id }) },
  ]

  const target = modal && (files.find((f) => f.id === modal.target) || folders.find((f) => f.id === modal.target))
  const close = () => setModal(null)

  return (
    <div
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDragging(true)
        }
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        if (e.dataTransfer.files.length) upload(e.dataTransfer.files, folderId)
      }}
      className="relative"
    >
      <PageHeader title="Files" subtitle={searching ? `Results for “${params.get('q')}”` : 'Everything you have stored'}>
        <button className="btn-ghost" onClick={() => setModal({ kind: 'newFolder' })}>
          <FolderPlus size={16} /> New folder
        </button>
        <UploadButton folderId={folderId} />
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="glass flex rounded-xl p-1" role="tablist">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setParam({ tab: id === 'all' ? '' : id, folder: '' })}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition ${tab === id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {label}
              {id === 'trash' && trashCount > 0 && <span className="ml-1.5 text-xs text-slate-500">{trashCount}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {tab !== 'trash' && visibleFiles.length > 0 && (
            selecting ? (
              <>
                <button className="btn-ghost !py-2" onClick={() => { setSelecting(false); setSelectedIds(new Set()) }}>Cancel</button>
                <button className="btn-danger !py-2" disabled={!selectedIds.size} onClick={() => setModal({ kind: 'bulkDelete' })}>
                  <Trash2 size={15} /> Delete{selectedIds.size ? ` (${selectedIds.size})` : ''}
                </button>
              </>
            ) : (
              <button className="btn-ghost !py-2" onClick={() => setSelecting(true)}>
                <CheckSquare size={15} /> Select
              </button>
            )
          )}
          {tab === 'trash' && trashCount > 0 && (
            <button className="btn-danger !py-2" onClick={() => setModal({ kind: 'emptyTrash' })}>Empty trash</button>
          )}
          <div className="glass flex rounded-xl p-1">
            {[['grid', Grid3X3, 'Grid view'], ['list', List, 'List view']].map(([v, Icon, label]) => (
              <button
                key={v}
                aria-label={label}
                aria-pressed={view === v}
                onClick={() => changeView(v)}
                className={`rounded-lg p-2 ${view === v ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFolders && (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm" aria-label="Breadcrumb">
          <button onClick={() => setParam({ folder: '' })} className={crumbs.length ? 'text-slate-400 hover:text-white' : 'font-medium text-white'}>
            My files
          </button>
          {crumbs.map((c, i) => (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-slate-600" />
              <button onClick={() => setParam({ folder: c.id })} className={i === crumbs.length - 1 ? 'font-medium text-white' : 'text-slate-400 hover:text-white'}>
                {c.name}
              </button>
            </span>
          ))}
        </nav>
      )}

      {isEmpty ? (
        <EmptyState
          icon={tab === 'trash' ? Trash2 : tab === 'favorites' ? Heart : Folder}
          title={tab === 'trash' ? 'Trash is empty' : tab === 'favorites' ? 'No favorites yet' : searching ? 'No matching files' : 'This folder is empty'}
          text={tab === 'all' && !searching ? 'Drop files anywhere on this page, or use the Upload button.' : undefined}
        />
      ) : view === 'grid' ? (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence>
            {visibleFolders.map((fo, i) => (
              <motion.div
                key={fo.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3 }}
                onClick={() => setParam({ folder: fo.id })}
                className="glass glow-border flex cursor-pointer items-center gap-3 rounded-2xl p-3.5"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-violet/30 to-accent-blue/10 text-violet-300">
                  <Folder size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{fo.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {files.filter((f) => f.folderId === fo.id && !f.trashed).length} files
                  </p>
                </div>
                <FileMenu items={folderMenu(fo)} />
              </motion.div>
            ))}
            {visibleFiles.map((f, i) => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.025 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3 }}
                onClick={() => selecting ? toggleSelected(f.id) : (!f.trashed && preview(f))}
                className={`glass glow-border group relative cursor-pointer rounded-2xl p-2.5 ${selectedIds.has(f.id) ? 'ring-2 ring-accent-blue' : ''}`}
              >
                {selecting && (
                  <span className="absolute left-4 top-4 z-10 rounded-md bg-ink-950/80 p-1 text-white">
                    {selectedIds.has(f.id) ? <CheckSquare size={18} className="text-accent-cyan" /> : <Square size={18} />}
                  </span>
                )}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  {f.type === 'image' || f.type === 'video' ? (
                    <PhotoTile file={f} />
                  ) : (
                    <div className="grid h-full place-items-center bg-white/[0.04]">
                      <FileIcon type={f.type} size={28} box="h-14 w-14" />
                    </div>
                  )}
                  {f.favorite && <Heart size={15} className="absolute right-2 top-2 fill-rose-500 text-rose-500" />}
                  {!f.synced && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-amber-200">Local only</span>
                  )}
                </div>
                <div className="flex items-start gap-1 px-1 pb-0.5 pt-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{f.name}</p>
                    <p className="text-[11px] text-slate-500">{formatBytes(f.size)} · {timeAgo(f.createdAt)}</p>
                  </div>
                  <FileMenu items={menuFor(f)} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass overflow-visible rounded-2xl">
          <AnimatePresence>
            {visibleFolders.map((fo) => (
              <motion.div
                key={fo.id}
                layout
                exit={{ opacity: 0 }}
                onClick={() => setParam({ folder: fo.id })}
                className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 hover:bg-white/[0.04]"
              >
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Folder size={18} /></div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">{fo.name}</p>
                <span className="hidden text-xs text-slate-500 sm:block">{formatDate(fo.createdAt)}</span>
                <FileMenu items={folderMenu(fo)} />
              </motion.div>
            ))}
            {visibleFiles.map((f) => (
              <motion.div
                key={f.id}
                layout
                exit={{ opacity: 0 }}
                onClick={() => selecting ? toggleSelected(f.id) : (!f.trashed && preview(f))}
                className={`flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/[0.04] ${selectedIds.has(f.id) ? 'bg-accent-blue/10' : ''}`}
              >
                {selecting && (selectedIds.has(f.id) ? <CheckSquare size={19} className="shrink-0 text-accent-cyan" /> : <Square size={19} className="shrink-0 text-slate-500" />)}
                <FileIcon type={f.type} size={18} box="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-100">{f.name}</p>
                  <p className="text-[11px] text-slate-500 sm:hidden">{formatBytes(f.size)}</p>
                </div>
                {f.favorite && <Heart size={14} className="fill-rose-500 text-rose-500" />}
                <span className="hidden w-20 text-right text-xs text-slate-500 sm:block">{formatBytes(f.size)}</span>
                <span className="hidden w-28 text-right text-xs text-slate-500 md:block">{formatDate(f.createdAt)}</span>
                <FileMenu items={menuFor(f)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-ink-950/70 backdrop-blur-sm"
          >
            <div className="rounded-3xl border-2 border-dashed border-accent-cyan bg-accent-cyan/10 px-12 py-10 text-center">
              <UploadCloud className="mx-auto mb-2 text-accent-cyan" size={38} />
              <p className="font-display text-lg text-white">Drop to add to {crumbs.length ? crumbs[crumbs.length - 1].name : 'My files'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- dialogs ---- */}
      <PromptModal open={modal?.kind === 'newFolder'} onClose={close} title="New folder" label="Folder name" confirmLabel="Create" onSubmit={(n) => app.createFolder(n, folderId)} />
      <PromptModal open={modal?.kind === 'rename' && !!target} onClose={close} title="Rename file" label="File name" initial={target?.name || ''} onSubmit={(n) => app.renameFile(modal.target, n)} />
      <PromptModal open={modal?.kind === 'renameFolder' && !!target} onClose={close} title="Rename folder" label="Folder name" initial={target?.name || ''} onSubmit={(n) => app.renameFolder(modal.target, n)} />
      <ConfirmModal open={modal?.kind === 'deleteFolder'} onClose={close} title="Delete folder?" danger confirmLabel="Delete" message="The folder and any subfolders will be removed. Files inside move to trash, where you can restore them." onConfirm={() => app.deleteFolder(modal.target)} />
      <ConfirmModal open={modal?.kind === 'purge'} onClose={close} title="Delete forever?" danger confirmLabel="Delete forever" message="This permanently removes the file and can't be undone." onConfirm={() => app.deleteForever(modal.target)} />
      <ConfirmModal open={modal?.kind === 'emptyTrash'} onClose={close} title="Empty trash?" danger confirmLabel="Empty trash" message={`This permanently removes ${trashCount} item${trashCount === 1 ? '' : 's'}.`} onConfirm={() => app.emptyTrash()} />
      <ConfirmModal open={modal?.kind === 'bulkDelete'} onClose={close} title="Delete selected files?" danger confirmLabel="Delete selected" message={`Move ${selectedIds.size} selected file${selectedIds.size === 1 ? '' : 's'} to trash?`} onConfirm={deleteSelected} />

      <Modal open={modal?.kind === 'move'} onClose={close} title="Move to folder" size="sm">
        <div className="space-y-1">
          <MoveRow label="My files (top level)" onClick={() => { app.moveFile(modal.target, null); close() }} active={target?.folderId == null} />
          {folders.map((fo) => (
            <MoveRow key={fo.id} label={fo.name} onClick={() => { app.moveFile(modal.target, fo.id); close() }} active={target?.folderId === fo.id} />
          ))}
        </div>
      </Modal>

      <Modal open={modal?.kind === 'preview' && !!target} onClose={close} title={target?.name || ''} size="lg">
        {target && (
          <div>
            <div className="mb-4 grid max-h-[55vh] place-items-center overflow-hidden rounded-xl bg-black/30">
              {target.type === 'image' ? (
                <div className="aspect-[4/3] w-full"><PhotoTile file={target} contain showIcon={false} /></div>
              ) : target.type === 'video' && target.url ? (
                <video src={target.url} controls className="max-h-[55vh] w-full" />
              ) : target.type === 'pdf' && target.url ? (
                <iframe title={target.name} src={target.url} className="h-[55vh] w-full" />
              ) : (
                <div className="py-16 text-center">
                  <FileIcon type={target.type} size={34} box="mx-auto h-20 w-20" />
                  <p className="mt-3 text-sm text-slate-400">
                    {target.url ? 'No inline preview for this type.' : 'Sample file: there is no real content to preview.'}
                  </p>
                </div>
              )}
            </div>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ['Type', extOf(target.name).toUpperCase() || target.type],
                ['Size', formatBytes(target.size)],
                ['Added', formatDate(target.createdAt)],
                ['Storage', target.synced ? 'Cloud (sample)' : 'This tab only'],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-[11px] uppercase tracking-wider text-slate-500">{k}</dt><dd className="text-slate-200">{v}</dd></div>
              ))}
            </dl>
            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-ghost" onClick={() => app.toggleFavorite(target.id)}>
                <Heart size={16} className={target.favorite ? 'fill-rose-500 text-rose-500' : ''} />
                {target.favorite ? 'Unfavorite' : 'Favorite'}
              </button>
              <button className="btn-primary" disabled={!target.url} title={!target.url ? SYNC_HINT : undefined} onClick={() => download(target)}>
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function MoveRow({ label, onClick, active }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10 ${active ? 'bg-white/5 text-white' : 'text-slate-300'}`}>
      <Folder size={16} className="text-violet-300" />
      {label}
      {active && <span className="ml-auto text-xs text-slate-500">current</span>}
    </button>
  )
}

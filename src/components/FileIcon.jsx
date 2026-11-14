import { File, FileArchive, FileText, FileVideo, Image as ImageIcon } from 'lucide-react'

const MAP = {
  image: { icon: ImageIcon, cls: 'from-sky-500/30 to-blue-500/10 text-sky-300' },
  video: { icon: FileVideo, cls: 'from-violet-500/30 to-fuchsia-500/10 text-violet-300' },
  pdf: { icon: FileText, cls: 'from-rose-500/30 to-orange-500/10 text-rose-300' },
  doc: { icon: FileText, cls: 'from-cyan-500/30 to-teal-500/10 text-cyan-300' },
  zip: { icon: FileArchive, cls: 'from-amber-500/30 to-yellow-500/10 text-amber-300' },
  other: { icon: File, cls: 'from-slate-500/30 to-slate-500/10 text-slate-300' },
}

export default function FileIcon({ type, size = 22, box = 'h-11 w-11' }) {
  const { icon: Icon, cls } = MAP[type] || MAP.other
  return (
    <div className={`grid shrink-0 place-items-center rounded-xl bg-gradient-to-br ${cls} ${box}`}>
      <Icon size={size} />
    </div>
  )
}

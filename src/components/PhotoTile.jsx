import { FileVideo, Image as ImageIcon } from 'lucide-react'

/** Shows the real image when a local URL exists; otherwise a generated gradient placeholder for sample data. */
export default function PhotoTile({ file, className = '', showIcon = true, contain = false }) {
  if (file.url && file.type === 'image') {
    return (
      <img
        src={file.url}
        alt={file.name}
        loading="lazy"
        draggable={false}
        className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'} ${className}`}
      />
    )
  }
  const h = file.hue ?? 220
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 70% 46%), hsl(${(h + 55) % 360} 70% 26%))`,
      }}
      role="img"
      aria-label={file.name}
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-xl"
        style={{ background: `hsl(${(h + 120) % 360} 90% 70%)` }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
      {showIcon && (
        <div className="absolute inset-0 grid place-items-center text-white/50">
          {file.type === 'video' ? <FileVideo size={26} /> : <ImageIcon size={26} />}
        </div>
      )}
    </div>
  )
}

import { CloudUpload } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-blue via-accent-violet to-accent-cyan shadow-glow">
        <CloudUpload size={18} className="text-white" />
      </div>
      {!compact && (
        <span className="font-display text-[17px] font-semibold tracking-tight text-white">
          My Personal <span className="gradient-text">Cloud</span>
        </span>
      )}
    </div>
  )
}

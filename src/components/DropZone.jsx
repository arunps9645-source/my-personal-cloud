import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CloudUpload } from 'lucide-react'
import { useApp } from '../store/AppStore'
import { formatBytes } from '../lib/format'
import { MAX_FILE_BYTES } from '../lib/config'

export default function DropZone({ folderId = null }) {
  const { upload } = useApp()
  const [over, setOver] = useState(false)
  const ref = useRef(null)
  return (
    <motion.div
      animate={{ scale: over ? 1.02 : 1 }}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (e.dataTransfer.files.length) upload(e.dataTransfer.files, folderId)
      }}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && ref.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition ${
        over ? 'border-accent-cyan bg-accent-cyan/10' : 'border-white/15 bg-white/[0.03] hover:border-accent-blue/60'
      }`}
    >
      <input
        ref={ref}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) upload(e.target.files, folderId)
          e.target.value = ''
        }}
      />
      <CloudUpload className="mx-auto mb-2 text-accent-blue" size={28} />
      <p className="text-sm font-medium text-white">Drop files here or click to browse</p>
      <p className="mt-1 text-xs text-slate-500">Up to {formatBytes(MAX_FILE_BYTES)} per file in this build</p>
    </motion.div>
  )
}

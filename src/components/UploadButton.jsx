import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { useApp } from '../store/AppStore'

export default function UploadButton({ folderId = null, className = 'btn-primary', children = 'Upload' }) {
  const { upload } = useApp()
  const ref = useRef(null)
  return (
    <>
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
      <button className={className} onClick={() => ref.current?.click()}>
        <Upload size={16} />
        {children}
      </button>
    </>
  )
}

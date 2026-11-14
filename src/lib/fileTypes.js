import { BLOCKED_EXTENSIONS, MAX_FILE_BYTES } from './config'
import { formatBytes } from './format'

const EXT = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'bmp', 'svg'],
  video: ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'],
  pdf: ['pdf'],
  doc: ['doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'],
  zip: ['zip', 'rar', '7z', 'tar', 'gz'],
}

export function extOf(name = '') {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i + 1).toLowerCase()
}

export function detectType(name, mime = '') {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  const ext = extOf(name)
  for (const [type, list] of Object.entries(EXT)) if (list.includes(ext)) return type
  return 'other'
}

/** Returns an error string, or null when the file is acceptable. */
export function validateFile(file) {
  if (BLOCKED_EXTENSIONS.includes(extOf(file.name))) {
    return `.${extOf(file.name)} files are not allowed for security reasons`
  }
  if (file.size > MAX_FILE_BYTES) {
    return `Larger than the ${formatBytes(MAX_FILE_BYTES)} limit`
  }
  return null
}

export function readWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    r.onload = () => {
      onProgress(100)
      resolve()
    }
    r.onerror = () => reject(r.error || new Error('Could not read file'))
    r.readAsArrayBuffer(file)
  })
}

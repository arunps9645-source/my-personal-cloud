import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { sampleActivity, sampleAlbums, sampleFiles, sampleFolders, samplePeople } from '../data/sampleData'
import { detectType, readWithProgress, validateFile } from '../lib/fileTypes'
import { supabase } from '../lib/supabase'
import { authService } from '../lib/auth'
const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))


export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
const [authLoading, setAuthLoading] = useState(true)
  const [files, setFiles] = useState(sampleFiles)
  const [folders, setFolders] = useState(sampleFolders)
  const [albums, setAlbums] = useState(sampleAlbums)
  const [faceEnabled, setFaceEnabled] = useState(false)
  const [people, setPeople] = useState(samplePeople)
  const [activity, setActivity] = useState(sampleActivity)
  const [uploads, setUploads] = useState([])
  const [toasts, setToasts] = useState([])

  // Supabase session monitoring
  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      const authUser = session?.user

      setUser(
        authUser
          ? {
              id: authUser.id,
              email: authUser.email,
              name:
                authUser.user_metadata?.full_name ||
                authUser.email?.split('@')[0],
            }
          : null
      )

      setAuthLoading(false)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) console.error(error.message)

      const authUser = data.session?.user

      setUser(
        authUser
          ? {
              id: authUser.id,
              email: authUser.email,
              name:
                authUser.user_metadata?.full_name ||
                authUser.email?.split('@')[0],
            }
          : null
      )

      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])


  /* ---------- helpers ---------- */
  const toast = useCallback((message, tone = 'info') => {
    const id = uid()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const log = useCallback((icon, text) => {
    setActivity((a) => [{ id: uid(), icon, text, at: Date.now() }, ...a].slice(0, 30))
  }, [])

  const patchFile = useCallback((id, patch) => {
    setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }, [])

  /* ---------- auth ---------- */
  
  /* ---------- auth ---------- */

  const signIn = useCallback(async (creds) => {
    const res = await authService.signIn(creds)

    if (res.user) {
      setUser(res.user)
    }

    return res
  }, [])

  const signUp = useCallback(async (data) => {
    const res = await authService.signUp(data)

    if (res.user) {
      setUser(res.user)
    }

    return res
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast(error.message, 'error')
      return { error: error.message }
    }

    setUser(null)
    return { success: true }
  }, [toast])

  const updateProfile = useCallback(async (patch) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: patch.name,
      },
    })

    if (error) {
      return { error: error.message }
    }

    const updatedUser = data.user

    setUser({
      id: updatedUser.id,
      email: updatedUser.email,
      name:
        updatedUser.user_metadata?.full_name ||
        updatedUser.email?.split('@')[0],
    })

    return { success: true }
  }, [])


  
  
  

  /* ---------- upload (real local read, no simulated progress) ---------- */
  const upload = useCallback(
    async (fileList, folderId = null) => {
      for (const f of Array.from(fileList)) {
        const id = uid()
        const problem = validateFile(f)
        if (problem) {
          setUploads((u) => [...u, { id, name: f.name, progress: 0, status: 'error', error: problem }])
          continue
        }
        setUploads((u) => [...u, { id, name: f.name, progress: 0, status: 'uploading' }])
        try {
          await readWithProgress(f, (p) =>
            setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: p } : x))),
          )
          const type = detectType(f.name, f.type)
          const now = Date.now()
          setFiles((fs) => [
            {
              id: uid(),
              name: f.name,
              type,
              size: f.size,
              folderId,
              createdAt: now,
              takenAt: f.lastModified || now,
              openedAt: null,
              favorite: false,
              trashed: false,
              hue: Math.floor(Math.random() * 360),
              location: null,
              personIds: [],
              synced: false, // held in this browser tab only until Stage 3 (R2)
              url: URL.createObjectURL(f),
            },
            ...fs,
          ])
          setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: 100, status: 'done' } : x)))
          log('upload', `Added “${f.name}” (local only)`)
        } catch (e) {
          setUploads((u) =>
            u.map((x) => (x.id === id ? { ...x, status: 'error', error: e.message || 'Failed' } : x)),
          )
        }
      }
    },
    [log],
  )

  const clearUploads = useCallback(() => setUploads((u) => u.filter((x) => x.status === 'uploading')), [])

  /* ---------- files ---------- */
  const renameFile = useCallback(
    (id, name) => {
      const clean = name.trim()
      if (!clean) return
      patchFile(id, { name: clean })
      log('edit', `Renamed a file to “${clean}”`)
    },
    [patchFile, log],
  )

  const toggleFavorite = useCallback((id) => {
    setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f)))
  }, [])

  const trashFile = useCallback(
    (id) => {
      const f = files.find((x) => x.id === id)
      if (f) log('trash', `Moved “${f.name}” to trash`)
      patchFile(id, { trashed: true })
    },
    [files, patchFile, log],
  )

  const restoreFile = useCallback(
    (id) => {
      const f = files.find((x) => x.id === id)
      if (f) log('restore', `Restored “${f.name}”`)
      patchFile(id, { trashed: false })
    },
    [files, patchFile, log],
  )

  const deleteForever = useCallback(
    (id) => {
      const f = files.find((x) => x.id === id)
      if (f?.url) URL.revokeObjectURL(f.url)
      setFiles((fs) => fs.filter((x) => x.id !== id))
    setAlbums((al) =>
      al.map((a) => {
        const photoIds = a.photoIds.filter((p) => p !== id)
        return { ...a, photoIds, coverId: photoIds.includes(a.coverId) ? a.coverId : photoIds[0] ?? null }
      }),
    )
    },
    [files],
  )

  const emptyTrash = useCallback(() => {
    files.forEach((f) => f.trashed && f.url && URL.revokeObjectURL(f.url))
    setFiles((fs) => fs.filter((f) => !f.trashed))
  }, [files])

  const moveFile = useCallback(
    (id, folderId) => {
      patchFile(id, { folderId })
      log('move', 'Moved a file')
    },
    [patchFile, log],
  )

  const openFile = useCallback((id) => patchFile(id, { openedAt: Date.now() }), [patchFile])

  /* ---------- folders ---------- */
  const createFolder = useCallback(
    (name, parentId = null) => {
      const clean = name.trim()
      if (!clean) return
      setFolders((fo) => [...fo, { id: uid(), name: clean, parentId, createdAt: Date.now() }])
      log('folder', `Created folder “${clean}”`)
    },
    [log],
  )

  const renameFolder = useCallback((id, name) => {
    const clean = name.trim()
    if (!clean) return
    setFolders((fo) => fo.map((f) => (f.id === id ? { ...f, name: clean } : f)))
  }, [])

  const deleteFolder = useCallback(
    (id) => {
      const doomed = new Set([id])
      let grew = true
      while (grew) {
        grew = false
        folders.forEach((f) => {
          if (f.parentId && doomed.has(f.parentId) && !doomed.has(f.id)) {
            doomed.add(f.id)
            grew = true
          }
        })
      }
      setFiles((fs) => fs.map((f) => (doomed.has(f.folderId) ? { ...f, trashed: true, folderId: null } : f)))
      setFolders((fo) => fo.filter((f) => !doomed.has(f.id)))
      log('trash', 'Deleted a folder (its files are in trash)')
    },
    [folders, log],
  )

  /* ---------- albums ---------- */
  const createAlbum = useCallback(
    (name, photoIds = []) => {
      const clean = name.trim()
      if (!clean) return null
      const album = { id: uid(), name: clean, photoIds, coverId: photoIds[0] ?? null, createdAt: Date.now() }
      setAlbums((a) => [album, ...a])
      log('album', `Created album “${clean}”`)
      return album.id
    },
    [log],
  )

  const renameAlbum = useCallback((id, name) => {
    const clean = name.trim()
    if (clean) setAlbums((a) => a.map((x) => (x.id === id ? { ...x, name: clean } : x)))
  }, [])

  const deleteAlbum = useCallback(
    (id) => {
      setAlbums((a) => a.filter((x) => x.id !== id))
      log('trash', 'Deleted an album (photos are kept)')
    },
    [log],
  )

  const addToAlbum = useCallback(
    (id, photoIds) => {
      setAlbums((a) =>
        a.map((x) => {
          if (x.id !== id) return x
          const merged = [...new Set([...x.photoIds, ...photoIds])]
          return { ...x, photoIds: merged, coverId: x.coverId ?? merged[0] ?? null }
        }),
      )
      log('album', `Added ${photoIds.length} photo${photoIds.length === 1 ? '' : 's'} to an album`)
    },
    [log],
  )

  const removeFromAlbum = useCallback((id, photoId) => {
    setAlbums((a) =>
      a.map((x) => {
        if (x.id !== id) return x
        const photoIds = x.photoIds.filter((p) => p !== photoId)
        return { ...x, photoIds, coverId: x.coverId === photoId ? photoIds[0] ?? null : x.coverId }
      }),
    )
  }, [])

  const setAlbumCover = useCallback((id, photoId) => {
    setAlbums((a) => a.map((x) => (x.id === id ? { ...x, coverId: photoId } : x)))
  }, [])

  const moveBetweenAlbums = useCallback(
    (photoId, fromId, toId) => {
      removeFromAlbum(fromId, photoId)
      addToAlbum(toId, [photoId])
    },
    [removeFromAlbum, addToAlbum],
  )

  /* ---------- people (SAMPLE face groups until Stage 5) ---------- */
  const setFaceRecognition = useCallback(
    (on) => {
      setFaceEnabled(on)
      if (!on) {
        setFiles((fs) => fs.map((f) => ({ ...f, personIds: [] })))
        setPeople([])
        log('privacy', 'Face recognition turned off and face data deleted')
      } else {
        log('privacy', 'Face recognition turned on')
      }
    },
    [log],
  )

  const renamePerson = useCallback((id, name) => {
    setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, name: name.trim() || null } : p)))
  }, [])

  const mergePeople = useCallback((keepId, mergeId) => {
    if (keepId === mergeId) return
    setFiles((fs) =>
      fs.map((f) =>
        f.personIds.includes(mergeId)
          ? { ...f, personIds: [...new Set(f.personIds.map((p) => (p === mergeId ? keepId : p)))] }
          : f,
      ),
    )
    setPeople((ps) => ps.filter((p) => p.id !== mergeId))
  }, [])

  const removeFromPerson = useCallback((personId, photoId) => {
    setFiles((fs) =>
      fs.map((f) => (f.id === photoId ? { ...f, personIds: f.personIds.filter((p) => p !== personId) } : f)),
    )
  }, [])

  const assignToPerson = useCallback((personId, photoId) => {
    setFiles((fs) =>
      fs.map((f) =>
        f.id === photoId && !f.personIds.includes(personId) ? { ...f, personIds: [...f.personIds, personId] } : f,
      ),
    )
  }, [])

  /* ---------- account ---------- */
  const deleteAccountData = useCallback(() => {
    files.forEach((f) => f.url && URL.revokeObjectURL(f.url))
    setFiles([])
    setFolders([])
    setAlbums([])
    setPeople([])
    setActivity([])
    signOut()
  }, [files, signOut])

  /* ---------- derived ---------- */
  const stats = useMemo(() => {
    const live = files.filter((f) => !f.trashed)
    return {
      live,
      totalFiles: live.length,
      totalFolders: folders.length,
      usedBytes: files.reduce((s, f) => s + f.size, 0),
      images: live.filter((f) => f.type === 'image'),
      videos: live.filter((f) => f.type === 'video'),
    }
  }, [files, folders])

  const value = {
    user, signIn, signUp, signOut, updateProfile, authLoading,
    files, folders, albums, people, activity, stats,
    faceEnabled, setFaceRecognition,
    uploads, upload, clearUploads,
    renameFile, toggleFavorite, trashFile, restoreFile, deleteForever, emptyTrash, moveFile, openFile,
    createFolder, renameFolder, deleteFolder,
    createAlbum, renameAlbum, deleteAlbum, addToAlbum, removeFromAlbum, setAlbumCover, moveBetweenAlbums,
    renamePerson, mergePeople, removeFromPerson, assignToPerson,
    deleteAccountData,
    toasts, toast, dismissToast,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

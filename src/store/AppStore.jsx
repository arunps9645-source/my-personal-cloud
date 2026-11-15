import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { sampleActivity } from '../data/sampleData'
import { detectType, validateFile } from '../lib/fileTypes'
import { supabase } from '../lib/supabase'
import { authService } from '../lib/auth'
import {
  uploadToCloud,
  listCloudFiles,
  downloadFromCloud,
  deleteFromCloud,
} from '../lib/cloudStorage'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const TRASH_KEY = 'mpc.trashed-files'
const readTrash = () => {
  try { return new Set(JSON.parse(localStorage.getItem(TRASH_KEY) || '[]')) } catch { return new Set() }
}
const writeTrash = (ids) => localStorage.setItem(TRASH_KEY, JSON.stringify([...ids]))

function mapCloudFile(object, url) {
  const date = object.uploaded
    ? new Date(object.uploaded).getTime()
    : Date.now()

  return {
    id: object.key,
    name: object.name,
    type: detectType(object.name),
    size: Number(object.size || 0),
    folderId: null,
    createdAt: date,
    takenAt: date,
    openedAt: null,
    favorite: false,
    trashed: false,
    hue: Math.floor(Math.random() * 360),
    location: null,
    personIds: [],
    synced: true,
    cloudKey: object.key,
    url,
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cloudLoading, setCloudLoading] = useState(false)

  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [albums, setAlbums] = useState([])
  const [faceEnabled, setFaceEnabled] = useState(false)
  const [people, setPeople] = useState([])
  const [activity, setActivity] = useState(sampleActivity || [])
  const [uploads, setUploads] = useState([])
  const [toasts, setToasts] = useState([])

  // Supabase authentication and session restore
  useEffect(() => {
    let mounted = true

    const applySession = (session) => {
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
          : null,
      )

      setAuthLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) {
        console.error('Session error:', error.message)
      }

      applySession(data.session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Toast notifications
  const toast = useCallback((message, tone = 'info') => {
    const id = uid()

    setToasts((items) => [
      ...items,
      { id, message, tone },
    ])

    window.setTimeout(
      () =>
        setToasts((items) =>
          items.filter((item) => item.id !== id),
        ),
      4200,
    )
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((items) =>
      items.filter((item) => item.id !== id),
    )
  }, [])

  // Activity log
  const log = useCallback((icon, text) => {
    setActivity((items) =>
      [
        { id: uid(), icon, text, at: Date.now() },
        ...items,
      ].slice(0, 30),
    )
  }, [])

  const patchFile = useCallback((id, patch) => {
    setFiles((items) =>
      items.map((file) =>
        file.id === id
          ? { ...file, ...patch }
          : file,
      ),
    )
  }, [])

  // Restore cloud files from R2 after login or page refresh
  useEffect(() => {
    let cancelled = false
    const createdUrls = []

    async function restoreCloudFiles() {
      if (!user?.id) {
        setFiles([])
        setCloudLoading(false)
        return
      }

      setCloudLoading(true)

      try {
        const objects = await listCloudFiles()

        const restored = await Promise.all(
          objects.map(async (object) => {
            try {
              const blob = await downloadFromCloud(object.key)

              if (cancelled) return null

              const previewUrl = URL.createObjectURL(blob)
              createdUrls.push(previewUrl)

              return mapCloudFile(object, previewUrl)
            } catch (error) {
              console.error(
                `Could not download ${object.name}:`,
                error,
              )

              return mapCloudFile(object, null)
            }
          }),
        )

        if (!cancelled) {
          const trashed = readTrash()
          setFiles(restored.filter(Boolean).map((file) => ({
            ...file,
            trashed: trashed.has(file.id) || trashed.has(file.cloudKey),
          })))
        }
      } catch (error) {
        if (!cancelled) {
          console.error('R2 file listing failed:', error)

          toast(
            error.message || 'Could not load cloud files',
            'error',
          )

          setFiles([])
        }
      } finally {
        if (!cancelled) {
          setCloudLoading(false)
        }
      }
    }

    restoreCloudFiles()

    return () => {
      cancelled = true

      createdUrls.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [user?.id, toast])

  // Authentication functions
  const signIn = useCallback(async (credentials) => {
    const result = await authService.signIn(credentials)

    if (result.user) {
      setUser(result.user)
    }

    return result
  }, [])

  const signUp = useCallback(async (data) => {
    const result = await authService.signUp(data)

    if (result.user) {
      setUser(result.user)
    }

    return result
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast(error.message, 'error')
      return { error: error.message }
    }

    setUser(null)
    setFiles([])
    setFolders([])
    setAlbums([])
    setPeople([])
    setActivity([])

    return { success: true }
  }, [toast])

  const updateProfile = useCallback(async (patch) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: patch.name },
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

  // Upload files to Cloudflare R2
  const upload = useCallback(
    async (fileList, folderId = null) => {
      await Promise.all(Array.from(fileList || []).map(async (file) => {
        const uploadId = uid()
        const problem = validateFile(file)

        if (problem) {
          setUploads((items) => [
            ...items,
            {
              id: uploadId,
              name: file.name,
              progress: 0,
              status: 'error',
              error: problem,
            },
          ])

          return
        }

        setUploads((items) => [
          ...items,
          {
            id: uploadId,
            name: file.name,
            progress: 0,
            status: 'uploading',
          },
        ])

        try {
          setUploads((items) =>
            items.map((item) =>
              item.id === uploadId
                ? { ...item, progress: 10 }
                : item,
            ),
          )

          const result = await uploadToCloud(file)

          if (!result?.success || !result?.key) {
            throw new Error('Cloud upload failed')
          }

          const now = Date.now()
          const previewUrl = URL.createObjectURL(file)

          setFiles((items) => [
            {
              id: result.key,
              name: file.name,
              type: detectType(file.name, file.type),
              size: file.size,
              folderId,
              createdAt: now,
              takenAt: file.lastModified || now,
              openedAt: null,
              favorite: false,
              trashed: false,
              hue: Math.floor(Math.random() * 360),
              location: null,
              personIds: [],
              synced: true,
              cloudKey: result.key,
              url: previewUrl,
            },
            ...items.filter(
              (item) => item.cloudKey !== result.key,
            ),
          ])

          setUploads((items) =>
            items.map((item) =>
              item.id === uploadId
                ? {
                    ...item,
                    progress: 100,
                    status: 'done',
                  }
                : item,
            ),
          )

          log(
            'upload',
            `Uploaded "${file.name}" to cloud storage`,
          )
        } catch (error) {
          setUploads((items) =>
            items.map((item) =>
              item.id === uploadId
                ? {
                    ...item,
                    status: 'error',
                    error: error.message || 'Upload failed',
                  }
                : item,
            ),
          )

          toast(
            error.message || `Could not upload ${file.name}`,
            'error',
          )
        }
      }))
    },
    [log, toast],
  )

  const clearUploads = useCallback(() => {
    setUploads((items) =>
      items.filter((item) => item.status === 'uploading'),
    )
  }, [])

  // File operations
  const renameFile = useCallback(
    (id, name) => {
      const clean = name.trim()

      if (!clean) return

      patchFile(id, { name: clean })
      log('edit', `Renamed a file to "${clean}"`)
    },
    [patchFile, log],
  )

  const toggleFavorite = useCallback((id) => {
    setFiles((items) =>
      items.map((file) =>
        file.id === id
          ? { ...file, favorite: !file.favorite }
          : file,
      ),
    )
  }, [])

  const trashFile = useCallback(
    (id) => {
      const file = files.find((item) => item.id === id)

      if (file) {
        log('trash', `Moved "${file.name}" to trash`)
      }

      const trashed = readTrash()
      trashed.add(file?.id || id)
      if (file?.cloudKey) trashed.add(file.cloudKey)
      writeTrash(trashed)
      patchFile(id, { trashed: true })
    },
    [files, patchFile, log],
  )

  const restoreFile = useCallback(
    (id) => {
      const file = files.find((item) => item.id === id)

      if (file) {
        log('restore', `Restored "${file.name}"`)
      }

      const trashed = readTrash()
      trashed.delete(id)
      if (file?.cloudKey) trashed.delete(file.cloudKey)
      writeTrash(trashed)
      patchFile(id, { trashed: false })
    },
    [files, patchFile, log],
  )

  // Permanently delete from R2
  const deleteForever = useCallback(
    async (id) => {
      const file = files.find((item) => item.id === id)

      if (!file) return

      try {
        if (file.cloudKey) {
          await deleteFromCloud(file.cloudKey)
        }

        if (file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }

        setFiles((items) =>
          items.filter((item) => item.id !== id),
        )

        const trashed = readTrash()
        trashed.delete(id)
        if (file.cloudKey) trashed.delete(file.cloudKey)
        writeTrash(trashed)

        setAlbums((items) =>
          items.map((album) => {
            const photoIds = album.photoIds.filter(
              (photoId) => photoId !== id,
            )

            return {
              ...album,
              photoIds,
              coverId: photoIds.includes(album.coverId)
                ? album.coverId
                : photoIds[0] ?? null,
            }
          }),
        )

        log(
          'trash',
          `Permanently deleted "${file.name}"`,
        )
      } catch (error) {
        toast(
          error.message || 'Could not delete cloud file',
          'error',
        )
      }
    },
    [files, log, toast],
  )

  const emptyTrash = useCallback(async () => {
    const trashed = files.filter((file) => file.trashed)

    for (const file of trashed) {
      try {
        if (file.cloudKey) {
          await deleteFromCloud(file.cloudKey)
        }

        if (file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }

        setFiles((items) =>
          items.filter((item) => item.id !== file.id),
        )
      } catch (error) {
        toast(
          `Could not delete ${file.name}: ${error.message}`,
          'error',
        )
      }
    }
  }, [files, toast])

  const moveFile = useCallback(
    (id, folderId) => {
      patchFile(id, { folderId })
      log('move', 'Moved a file')
    },
    [patchFile, log],
  )

  const openFile = useCallback(
    (id) => {
      patchFile(id, { openedAt: Date.now() })
    },
    [patchFile],
  )

  // Folder operations
  const createFolder = useCallback(
    (name, parentId = null) => {
      const clean = name.trim()

      if (!clean) return

      setFolders((items) => [
        ...items,
        {
          id: uid(),
          name: clean,
          parentId,
          createdAt: Date.now(),
        },
      ])

      log('folder', `Created folder "${clean}"`)
    },
    [log],
  )

  const renameFolder = useCallback((id, name) => {
    const clean = name.trim()

    if (!clean) return

    setFolders((items) =>
      items.map((folder) =>
        folder.id === id
          ? { ...folder, name: clean }
          : folder,
      ),
    )
  }, [])

  const deleteFolder = useCallback(
    (id) => {
      const doomed = new Set([id])
      let changed = true

      while (changed) {
        changed = false

        folders.forEach((folder) => {
          if (
            folder.parentId &&
            doomed.has(folder.parentId) &&
            !doomed.has(folder.id)
          ) {
            doomed.add(folder.id)
            changed = true
          }
        })
      }

      setFiles((items) =>
        items.map((file) =>
          doomed.has(file.folderId)
            ? {
                ...file,
                trashed: true,
                folderId: null,
              }
            : file,
        ),
      )

      setFolders((items) =>
        items.filter((folder) => !doomed.has(folder.id)),
      )

      log(
        'trash',
        'Deleted a folder (its files are in trash)',
      )
    },
    [folders, log],
  )

  // Album operations
  const createAlbum = useCallback(
    (name, photoIds = []) => {
      const clean = name.trim()

      if (!clean) return null

      const album = {
        id: uid(),
        name: clean,
        photoIds,
        coverId: photoIds[0] ?? null,
        createdAt: Date.now(),
      }

      setAlbums((items) => [album, ...items])

      log('album', `Created album "${clean}"`)

      return album.id
    },
    [log],
  )

  const renameAlbum = useCallback((id, name) => {
    const clean = name.trim()

    if (clean) {
      setAlbums((items) =>
        items.map((album) =>
          album.id === id
            ? { ...album, name: clean }
            : album,
        ),
      )
    }
  }, [])

  const deleteAlbum = useCallback(
    (id) => {
      setAlbums((items) =>
        items.filter((album) => album.id !== id),
      )

      log(
        'trash',
        'Deleted an album (photos are kept)',
      )
    },
    [log],
  )

  const addToAlbum = useCallback(
    (id, photoIds) => {
      setAlbums((items) =>
        items.map((album) => {
          if (album.id !== id) return album

          const merged = [
            ...new Set([...album.photoIds, ...photoIds]),
          ]

          return {
            ...album,
            photoIds: merged,
            coverId: album.coverId ?? merged[0] ?? null,
          }
        }),
      )

      log(
        'album',
        `Added ${photoIds.length} photo${photoIds.length === 1 ? '' : 's'} to an album`,
      )
    },
    [log],
  )

  const removeFromAlbum = useCallback(
    (id, photoId) => {
      setAlbums((items) =>
        items.map((album) => {
          if (album.id !== id) return album

          const photoIds = album.photoIds.filter(
            (photo) => photo !== photoId,
          )

          return {
            ...album,
            photoIds,
            coverId:
              album.coverId === photoId
                ? photoIds[0] ?? null
                : album.coverId,
          }
        }),
      )
    },
    [],
  )

  const setAlbumCover = useCallback((id, photoId) => {
    setAlbums((items) =>
      items.map((album) =>
        album.id === id
          ? { ...album, coverId: photoId }
          : album,
      ),
    )
  }, [])

  const moveBetweenAlbums = useCallback(
    (photoId, fromId, toId) => {
      setAlbums((items) =>
        items.map((album) => {
          if (album.id === fromId) {
            const photoIds = album.photoIds.filter(
              (id) => id !== photoId,
            )

            return {
              ...album,
              photoIds,
              coverId:
                album.coverId === photoId
                  ? photoIds[0] ?? null
                  : album.coverId,
            }
          }

          if (
            album.id === toId &&
            !album.photoIds.includes(photoId)
          ) {
            return {
              ...album,
              photoIds: [...album.photoIds, photoId],
              coverId: album.coverId ?? photoId,
            }
          }

          return album
        }),
      )
    },
    [],
  )

  // People / face groups
  const setFaceRecognition = useCallback(
    (on) => {
      setFaceEnabled(on)

      if (!on) {
        setFiles((items) =>
          items.map((file) => ({
            ...file,
            personIds: [],
          })),
        )

        setPeople([])

        log(
          'privacy',
          'Face recognition turned off and face data deleted',
        )
      } else {
        log('privacy', 'Face recognition turned on')
      }
    },
    [log],
  )

  const renamePerson = useCallback((id, name) => {
    setPeople((items) =>
      items.map((person) =>
        person.id === id
          ? { ...person, name: name.trim() || null }
          : person,
      ),
    )
  }, [])

  const mergePeople = useCallback((keepId, mergeId) => {
    if (keepId === mergeId) return

    setFiles((items) =>
      items.map((file) =>
        file.personIds.includes(mergeId)
          ? {
              ...file,
              personIds: [
                ...new Set(
                  file.personIds.map((id) =>
                    id === mergeId ? keepId : id,
                  ),
                ),
              ],
            }
          : file,
      ),
    )

    setPeople((items) =>
      items.filter((person) => person.id !== mergeId),
    )
  }, [])

  const removeFromPerson = useCallback(
    (personId, photoId) => {
      setFiles((items) =>
        items.map((file) =>
          file.id === photoId
            ? {
                ...file,
                personIds: file.personIds.filter(
                  (id) => id !== personId,
                ),
              }
            : file,
        ),
      )
    },
    [],
  )

  const assignToPerson = useCallback(
    (personId, photoId) => {
      setFiles((items) =>
        items.map((file) =>
          file.id === photoId &&
          !file.personIds.includes(personId)
            ? {
                ...file,
                personIds: [...file.personIds, personId],
              }
            : file,
        ),
      )
    },
    [],
  )

  // Account data
  const deleteAccountData = useCallback(async () => {
    const confirmed = window.confirm(
      'This signs you out and clears the app view. It does not bulk-delete your R2 files. Continue?',
    )

    if (!confirmed) return

    files.forEach((file) => {
      if (file.url?.startsWith('blob:')) {
        URL.revokeObjectURL(file.url)
      }
    })

    setFiles([])
    setFolders([])
    setAlbums([])
    setPeople([])
    setActivity([])

    await signOut()
  }, [files, signOut])

  // Dashboard statistics
  const stats = useMemo(() => {
    const live = files.filter((file) => !file.trashed)

    return {
      live,
      totalFiles: live.length,
      totalFolders: folders.length,
      usedBytes: files.reduce(
        (sum, file) => sum + file.size,
        0,
      ),
      images: live.filter(
        (file) => file.type === 'image',
      ),
      videos: live.filter(
        (file) => file.type === 'video',
      ),
    }
  }, [files, folders])

  // Context values
  const value = {
    user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    authLoading,
    cloudLoading,

    files,
    folders,
    albums,
    people,
    activity,
    stats,

    faceEnabled,
    setFaceRecognition,

    uploads,
    upload,
    clearUploads,

    renameFile,
    toggleFavorite,
    trashFile,
    restoreFile,
    deleteForever,
    emptyTrash,
    moveFile,
    openFile,

    createFolder,
    renameFolder,
    deleteFolder,

    createAlbum,
    renameAlbum,
    deleteAlbum,
    addToAlbum,
    removeFromAlbum,
    setAlbumCover,
    moveBetweenAlbums,

    renamePerson,
    mergePeople,
    removeFromPerson,
    assignToPerson,

    deleteAccountData,

    toasts,
    toast,
    dismissToast,
  }

  return (
    <AppCtx.Provider value={value}>
      {children}
    </AppCtx.Provider>
  )
}

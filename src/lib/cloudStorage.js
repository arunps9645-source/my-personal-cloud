
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_CLOUD_STORAGE_API

async function getAuthHeaders() {
  const { data, error } = await supabase.auth.getSession()

  if (error) throw error

  const token = data.session?.access_token

  if (!token) {
    throw new Error('Please sign in again.')
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('Cloud storage API URL is missing.')
  }

  const authHeaders = await getAuthHeaders()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || `Storage error: ${response.status}`)
  }

  return response
}

export async function uploadToCloud(file) {
  const query = new URLSearchParams({ filename: file.name })

  const response = await request(`/upload?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  })

  return response.json()
}

export async function listCloudFiles() {
  const response = await request('/list')
  const result = await response.json()
  return Array.isArray(result.files) ? result.files : []
}

export async function downloadFromCloud(key) {
  const query = new URLSearchParams({ key })
  const response = await request(`/download?${query}`)
  return response.blob()
}

export async function deleteFromCloud(key) {
  const query = new URLSearchParams({ key })

  const response = await request(`/file?${query}`, {
    method: 'DELETE',
  })

  return response.json()
}

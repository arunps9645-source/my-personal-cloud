// Central limits. Review against current provider pricing pages before relying on them.
// Cloudflare R2 free tier is ~10 GB-month storage; Supabase free DB is ~500 MB. Verify both.
export const STORAGE_QUOTA_BYTES = 10 * 1024 ** 3

// Stage 1 holds files in browser memory only, so keep the local cap modest.
export const MAX_FILE_BYTES = 50 * 1024 ** 2

export const BLOCKED_EXTENSIONS = ['exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'vbs', 'jar', 'ps1', 'sh']

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

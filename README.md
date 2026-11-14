# My Personal Cloud

Premium personal cloud storage + photo gallery. React + Vite, Tailwind, Framer Motion, Lucide.
Free-first: no paid services or AI APIs are used or required.

## Status: Stage 1 (frontend with sample data)

| Stage | Scope | State |
|---|---|---|
| 1 | Animated frontend, all pages, sample data | **Written, not yet run** |
| 2 | Supabase auth + database + RLS | Not started |
| 3 | Cloudflare R2 + Worker (signed URLs) | Not started |
| 4 | Real file/folder management | Not started |
| 5 | In-browser face detection + grouping | Not started |
| 6 | Albums persisted in DB | Not started |
| 7 | Security testing + Vercel deploy | Not started |

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. Any valid email + any password opens a **demo session**.

## What is real vs. sample in Stage 1

Real: file picking and drag-and-drop, validation (blocked extensions, 50 MB cap), upload progress
(real local read progress, not a timer), image/video/PDF preview and download of files you add,
rename, move, favorite, trash/restore/delete forever, folders, albums (create, rename, delete,
covers, same photo in many albums, move between albums), duplicate detection (same name + size),
memories (same calendar day in past years), timeline, places, slideshow, full-screen viewer.

Sample / demo only:
- Seed files, photos (generated gradients), folders, albums, activity.
- Files you add live in browser memory and vanish on refresh. They are labelled "Local only".
- Auth is a demo session. Forgot password, change password and delete-account-on-server say so
  instead of pretending to succeed.
- "People" shows clearly labelled sample face groups. No faces are detected until Stage 5.

## Cost notes (verify current pricing before relying on these)

- Cloudflare R2: free allowance of roughly 10 GB storage plus monthly operation limits.
- Supabase free: roughly 500 MB database, with auth and API limits.
- Vercel hobby tier for hosting.
- Nothing here auto-upgrades. The app shows the limits it assumes in `src/lib/config.js`.

## Structure

```
src/
  components/   reusable UI (Modal, Lightbox, FileMenu, UploadTray, ...)
  pages/        Login, Dashboard, Files, Gallery, Albums, AlbumDetail, Settings
  store/        AppStore.jsx   all state + actions (swap internals for Supabase in Stage 2)
  lib/          config, format, fileTypes (validation), auth service boundary
  data/         sampleData.js
```

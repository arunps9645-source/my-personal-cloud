// Realistic SAMPLE data for Stage 1. Photos are generated gradients (no real images are bundled).
const DAY = 86_400_000
const now = Date.now()
const ago = (days) => now - days * DAY
const yearsAgo = (n, plusHours = 0) => {
  const d = new Date(now)
  d.setFullYear(d.getFullYear() - n)
  return d.getTime() + plusHours * 3_600_000
}

export const sampleFolders = [
  { id: 'fo-docs', name: 'Documents', parentId: null, createdAt: ago(120) },
  { id: 'fo-photos', name: 'Photos', parentId: null, createdAt: ago(200) },
  { id: 'fo-videos', name: 'Videos', parentId: null, createdAt: ago(90) },
  { id: 'fo-work', name: 'Work', parentId: null, createdAt: ago(60) },
  { id: 'fo-invoices', name: 'Invoices', parentId: 'fo-work', createdAt: ago(40) },
  { id: 'fo-archive', name: 'Archive', parentId: null, createdAt: ago(300) },
]

const places = ['Munnar, Kerala', 'Kochi, Kerala', 'Alleppey, Kerala', 'Goa', 'Bengaluru', null]
const titles = [
  'Sunrise over the hills', 'Family dinner', 'College fest', 'Beach walk', 'Birthday cake', 'Road trip stop',
  'Backwater sunset', 'Friends reunion', 'Tea estate', 'Festival lights', 'Campus corridor', 'Lighthouse',
  'Street food', 'Cousins together', 'Rainy window', 'Hill top', 'Graduation day', 'Houseboat', 'Old fort',
  'Night market', 'Sibling selfie', 'Temple morning', 'Cafe corner', 'Sports day', 'Train window',
  'Grandma smiles', 'Surprise party', 'Misty valley', 'Boat jetty', 'Library steps', 'Pongal feast',
  'Cliff walk', 'Kite flying', 'Farewell', 'Lake picnic', 'Market flowers',
]

// person assignment pattern: which sample people appear in which photo
const personFor = (i) => {
  const set = []
  if (i % 3 === 0) set.push('pe-amma')
  if (i % 4 === 1) set.push('pe-arjun')
  if (i % 5 === 2) set.push('pe-meera')
  if (i % 7 === 3) set.push('pe-unk1')
  if (i % 9 === 4) set.push('pe-unk2')
  return set
}

const photos = titles.map((t, i) => ({
  id: `ph-${i}`,
  name: `${t}.jpg`,
  type: 'image',
  size: 1_400_000 + ((i * 377_113) % 4_800_000),
  folderId: 'fo-photos',
  createdAt: ago(i * 6 + 1),
  takenAt: ago(i * 9 + 2),
  openedAt: i < 6 ? ago(i * 0.7) : null,
  favorite: i % 8 === 0,
  trashed: false,
  hue: (i * 37 + 200) % 360,
  location: places[i % places.length],
  personIds: personFor(i),
  synced: true,
  url: null,
}))

// Memories: same calendar day in previous years
const memories = [1, 2, 3].map((n, i) => ({
  id: `ph-mem-${n}`,
  name: `${['Diwali at home', 'Beach day', 'Trip to the hills'][i]}.jpg`,
  type: 'image',
  size: 2_900_000 + i * 410_000,
  folderId: 'fo-photos',
  createdAt: yearsAgo(n),
  takenAt: yearsAgo(n, 2),
  openedAt: null,
  favorite: i === 1,
  trashed: false,
  hue: (140 + i * 70) % 360,
  location: places[i],
  personIds: i === 0 ? ['pe-amma', 'pe-arjun'] : ['pe-meera'],
  synced: true,
  url: null,
}))

// An intentional duplicate pair (same name + byte size) for duplicate detection.
const dupes = [0, 1].map((i) => ({
  id: `ph-dup-${i}`,
  name: 'IMG_2041.jpg',
  type: 'image',
  size: 3_218_440,
  folderId: 'fo-photos',
  createdAt: ago(14 + i),
  takenAt: ago(15),
  openedAt: null,
  favorite: false,
  trashed: false,
  hue: 18,
  location: 'Goa',
  personIds: [],
  synced: true,
  url: null,
}))

const videos = ['Onam celebration', 'Kerala road trip', 'Birthday highlights', 'Convocation clip', 'Monsoon timelapse'].map(
  (t, i) => ({
    id: `vi-${i}`,
    name: `${t}.mp4`,
    type: 'video',
    size: 38_000_000 + i * 21_000_000,
    folderId: 'fo-videos',
    createdAt: ago(i * 11 + 3),
    takenAt: ago(i * 11 + 4),
    openedAt: i < 2 ? ago(i + 0.4) : null,
    favorite: i === 1,
    trashed: false,
    hue: (i * 61 + 260) % 360,
    location: null,
    personIds: [],
    synced: true,
    url: null,
  }),
)

const docs = [
  ['Resume 2026.pdf', 'pdf', 412_000, 'fo-docs'],
  ['Rental agreement.pdf', 'pdf', 1_820_000, 'fo-docs'],
  ['Insurance policy.pdf', 'pdf', 960_000, 'fo-docs'],
  ['Project proposal.docx', 'doc', 238_000, 'fo-work'],
  ['Budget tracker.xlsx', 'doc', 91_000, 'fo-work'],
  ['Invoice 0142.pdf', 'pdf', 120_000, 'fo-invoices'],
  ['Invoice 0143.pdf', 'pdf', 118_000, 'fo-invoices'],
  ['Backup 2025.zip', 'zip', 214_000_000, 'fo-archive'],
  ['Design assets.zip', 'zip', 48_000_000, 'fo-work'],
  ['notes.txt', 'doc', 4_200, null],
].map(([name, type, size, folderId], i) => ({
  id: `do-${i}`,
  name,
  type,
  size,
  folderId,
  createdAt: ago(i * 5 + 1),
  takenAt: null,
  openedAt: i < 4 ? ago(i * 0.9 + 0.2) : null,
  favorite: i === 0,
  trashed: i === 9,
  hue: 220,
  location: null,
  personIds: [],
  synced: true,
  url: null,
}))

export const sampleFiles = [...photos, ...memories, ...dupes, ...videos, ...docs]

export const sampleAlbums = [
  ['al-family', 'Family Memories', [0, 3, 6, 9, 12, 15, 18, 21, 25]],
  ['al-friends', 'Friends', [1, 7, 10, 13, 20, 29]],
  ['al-college', 'College Days', [2, 10, 16, 24, 30]],
  ['al-travel', 'Travel', [0, 3, 6, 8, 11, 17, 18, 24]],
  ['al-birthday', 'Birthday', [4, 26, 31]],
  ['al-personal', 'Personal', [14, 19, 22]],
].map(([id, name, idx], n) => {
  const photoIds = idx.map((i) => `ph-${i}`)
  return { id, name, photoIds, coverId: photoIds[0], createdAt: ago(100 - n * 7) }
})

// Face groups shown only after the user opts in. SAMPLE ONLY: real detection arrives in Stage 5.
export const samplePeople = [
  { id: 'pe-amma', name: 'Amma', hue: 330 },
  { id: 'pe-arjun', name: 'Arjun', hue: 205 },
  { id: 'pe-meera', name: 'Meera', hue: 270 },
  { id: 'pe-unk1', name: null, hue: 40 },
  { id: 'pe-unk2', name: null, hue: 160 },
]

export const sampleActivity = [
  { id: 'ac-1', icon: 'upload', text: 'Uploaded “Lake picnic.jpg”', at: ago(0.1) },
  { id: 'ac-2', icon: 'folder', text: 'Created folder “Invoices”', at: ago(1.2) },
  { id: 'ac-3', icon: 'star', text: 'Favorited “Resume 2026.pdf”', at: ago(2.4) },
  { id: 'ac-4', icon: 'album', text: 'Added 6 photos to “Travel”', at: ago(4) },
  { id: 'ac-5', icon: 'trash', text: 'Moved “notes.txt” to trash', at: ago(6) },
]

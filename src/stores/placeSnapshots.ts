import type { ListedHoursPeriod, ListedPlace, ListedReview } from '@/types'

const STORAGE_KEY = 'insidee:places:v1'
const MAX_AGE_MS = 1000 * 60 * 60 * 2

type CachedPlace = {
  id: string
  displayName: string | null
  formattedAddress: string | null
  rating: number | null
  userRatingCount: number | null
  hoursLabel?: string
  lat: number | null
  lng: number | null
  photoUris: string[]
  reviews: ListedReview[]
  periods: ListedHoursPeriod[]
}

type CacheFile = {
  savedAt: number
  entries: Record<string, CachedPlace[]>
}

const emptyFile = (): CacheFile => ({ savedAt: Date.now(), entries: {} })

const readFile = (): CacheFile => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyFile()
    const parsed = JSON.parse(raw) as CacheFile
    if (!parsed?.entries || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return emptyFile()
    }
    return parsed
  } catch {
    return emptyFile()
  }
}

const writeFile = (file: CacheFile) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...file, savedAt: Date.now() }))
  } catch {
    // A full session store should not block the search.
  }
}

export const snapshotPlace = (place: google.maps.places.Place): CachedPlace => {
  const point = place.location
  const periods = place.regularOpeningHours?.periods ?? []

  return {
    id: place.id ?? '',
    displayName: place.displayName ?? null,
    formattedAddress: place.formattedAddress ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    lat: point ? point.lat() : null,
    lng: point ? point.lng() : null,
    photoUris: (place.photos ?? [])
      .map((photo) => {
        try {
          return photo.getURI({ maxWidth: 1200 })
        } catch {
          return ''
        }
      })
      .filter(Boolean),
    reviews: (place.reviews ?? []).map((review) => ({
      authorAttribution: { displayName: review.authorAttribution?.displayName ?? null },
      rating: review.rating ?? null,
      text: review.text ?? null,
    })),
    periods: periods.map((period) => ({
      open: {
        day: period.open.day,
        hour: period.open.hour,
        minute: period.open.minute,
      },
      close: period.close
        ? {
            day: period.close.day,
            hour: period.close.hour,
            minute: period.close.minute,
          }
        : undefined,
    })),
  }
}

export const hydratePlace = (cached: CachedPlace): ListedPlace => ({
  id: cached.id,
  displayName: cached.displayName,
  formattedAddress: cached.formattedAddress,
  rating: cached.rating,
  userRatingCount: cached.userRatingCount,
  hoursLabel: cached.hoursLabel,
  location:
    cached.lat != null && cached.lng != null
      ? { lat: () => cached.lat as number, lng: () => cached.lng as number }
      : null,
  photos: cached.photoUris.map((uri) => ({ getURI: () => uri })),
  reviews: cached.reviews,
  regularOpeningHours: cached.periods.length ? { periods: cached.periods } : null,
})

export const readPlaceCache = (key: string): ListedPlace[] | null => {
  const list = readFile().entries[key]
  if (!list?.length) return null
  return list.map(hydratePlace)
}

export const writePlaceCache = (key: string, places: google.maps.places.Place[]) => {
  const file = readFile()
  file.entries[key] = places.map(snapshotPlace)
  writeFile(file)
}

export const patchPlaceCache = (
  id: string,
  details: { name: string; hours: string },
) => {
  const file = readFile()
  let changed = false
  for (const list of Object.values(file.entries)) {
    for (const place of list) {
      if (place.id !== id) continue
      place.displayName = details.name
      place.hoursLabel = details.hours
      changed = true
    }
  }
  if (changed) writeFile(file)
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGoogleMaps } from '@/composables/useGoogleMaps'
import { useLocationStore } from '@/stores/location'
import {
  hydratePlace,
  patchPlaceCache,
  readPlaceCache,
  snapshotPlace,
  writePlaceCache,
} from '@/stores/placeSnapshots'
import type { ListedPlace, Spot } from '@/types'


const MAX_RESULTS = 12
const NEAR_RADIUS_M = 1500
const WIDE_RADIUS_M = 3000
const MIN_RATING = 4
const PRIOR_REVIEWS = 40
const PRIOR_RATING = 4
const DISTANCE_PENALTY = 0.35

const FIELDS = [
  'displayName',
  'location',
  'reviews',
  'rating',
  'userRatingCount',
  'regularOpeningHours',
  'formattedAddress',
  'photos',
]

const distanceKm = (from: { lat: number; lng: number }, place: google.maps.places.Place) => {
  const to = place.location
  if (!to) return Number.POSITIVE_INFINITY
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(to.lat() - from.lat)
  const dLng = toRad(to.lng() - from.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat())) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const usePlacesStore = defineStore('places', () => {
  const results = ref<ListedPlace[]>([])
  const isFetching = ref(false)
  const error = ref<string | null>(null)
  const activeIndex = ref(0)
  const activePhotoIndex = ref(0)

  const cache = new Map<string, ListedPlace[]>()
  const inflight = new Map<string, Promise<ListedPlace[]>>()
  const { load } = useGoogleMaps()
  const location = useLocationStore()

  const keyFor = (spot: Spot) => {
    const c = location.coords
    if (!c) return ''
    // bucket to ~110m so tiny GPS jitter doesn't bust the cache
    const b = (n: number) => n.toFixed(3)
    return `${spot.name}:${b(c.lat)},${b(c.lng)}:near`
  }

  const apply = (list: ListedPlace[]) => {
    results.value = list
    activeIndex.value = 0
    activePhotoIndex.value = 0
    error.value = null
  }

  const qualityScore = (place: google.maps.places.Place) => {
    const rating = place.rating ?? 0
    const count = place.userRatingCount ?? 0
    return (rating * count + PRIOR_RATING * PRIOR_REVIEWS) / (count + PRIOR_REVIEWS)
  }

  const rankPlaces = (
    places: google.maps.places.Place[],
    center: { lat: number; lng: number },
    maxKm: number,
  ) => {
    const unique = new Map<string, google.maps.places.Place>()
    for (const place of places) {
      if (place.id && !unique.has(place.id)) unique.set(place.id, place)
    }

    const nearby = [...unique.values()].filter((place) => distanceKm(center, place) <= maxKm)
    const rated = nearby.filter((place) => (place.rating ?? 0) >= MIN_RATING)
    const pool = rated.length >= 5 ? rated : nearby
    const score = (place: google.maps.places.Place) =>
      qualityScore(place) - distanceKm(center, place) * DISTANCE_PENALTY

    return pool.sort((a, b) => score(b) - score(a)).slice(0, MAX_RESULTS)
  }

  const fetchPlaces = async (spot: Spot, key: string) => {
    await load()
    const { Place, SearchNearbyRankPreference } = (await google.maps.importLibrary(
      'places',
    )) as google.maps.PlacesLibrary

    const center = location.coords!
    const types = [...new Set(spot.interests.filter((type) => type !== 'laundry'))]

    const searchWithin = async (radius: number) => {
      const { places } = await Place.searchNearby({
        fields: FIELDS,
        locationRestriction: { center, radius },
        includedPrimaryTypes: types,
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
        language: 'en-US',
      })
      return rankPlaces(places ?? [], center, radius / 1000)
    }

    const close = await searchWithin(NEAR_RADIUS_M)
    const ranked = close.length >= 5 ? close : await searchWithin(WIDE_RADIUS_M)
    writePlaceCache(key, ranked)
    return ranked.map((place) => hydratePlace(snapshotPlace(place)))
  }

  const search = async (spot: Spot) => {
    if (!location.coords) return
    const key = keyFor(spot)

    const cached = cache.get(key) ?? readPlaceCache(key)
    if (cached) {
      cache.set(key, cached)
      apply(cached)
      return
    }

    let job = inflight.get(key)
    if (!job) {
      job = fetchPlaces(spot, key)
        .then((list) => {
          cache.set(key, list)
          return list
        })
        .finally(() => {
          inflight.delete(key)
        })
      inflight.set(key, job)
    }

    try {
      isFetching.value = true
      error.value = null
      const list = await job
      if (keyFor(spot) === key) apply(list)
    } catch (e) {
      if (keyFor(spot) === key) {
        error.value = e instanceof Error ? e.message : 'Failed to fetch places'
        results.value = []
        console.error('[places.search]', e)
      }
    } finally {
      if (keyFor(spot) === key) isFetching.value = false
    }
  }

  const rememberDetails = (id: string, details: { name: string; hours: string }) => {
    const patch = (list: ListedPlace[]) =>
      list.map((place) =>
        place.id === id
          ? { ...place, displayName: details.name, hoursLabel: details.hours }
          : place,
      )

    results.value = patch(results.value)
    for (const [entryKey, list] of cache) cache.set(entryKey, patch(list))
    patchPlaceCache(id, details)
  }

  const selectPlace = (index: number) => {
    if (index < 0 || index >= results.value.length) return
    activeIndex.value = index
    activePhotoIndex.value = 0
  }

  const next = () => {
    if (activeIndex.value < results.value.length - 1) {
      activeIndex.value++
      activePhotoIndex.value = 0
    }
  }

  const prev = () => {
    if (activeIndex.value > 0) {
      activeIndex.value--
      activePhotoIndex.value = 0
    }
  }

  const reset = () => {
    results.value = []
    activeIndex.value = 0
    activePhotoIndex.value = 0
    error.value = null
  }

  return {
    results,
    isFetching,
    error,
    activeIndex,
    activePhotoIndex,
    search,
    rememberDetails,
    selectPlace,
    next,
    prev,
    reset,
  }
})

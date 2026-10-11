import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useGoogleMaps } from '@/composables/useGoogleMaps'
import type { GeocoderResult, LatLng } from '@/types'

const STORAGE_KEY = 'insidee:location'

type SavedLocation = {
  lat: number
  lng: number
  formattedAddress: string
  addressComponents: google.maps.GeocoderAddressComponent[]
}

const areaFrom = (
  components: google.maps.GeocoderAddressComponent[] | undefined,
  fallback = '',
) => {
  const pick = (...types: string[]) => {
    const component = components?.find((item) => types.some((type) => item.types.includes(type)))
    if (!component) return
    return component.short_name.length <= 2 ? component.long_name : component.short_name
  }
  const neighborhood = pick('neighborhood', 'sublocality_level_1', 'sublocality')
  const locality = pick('locality')
  const region = pick('administrative_area_level_2', 'administrative_area_level_1')
  const primary = neighborhood || locality
  const secondary = neighborhood ? locality || region : region
  if (primary && secondary && primary !== secondary) return `${primary}, ${secondary}`
  return primary || fallback
}

const readSaved = (): SavedLocation | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedLocation
    if (typeof parsed?.lat !== 'number' || typeof parsed?.lng !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export const useLocationStore = defineStore('location', () => {
  const saved = readSaved()
  const coords = ref<LatLng | null>(saved ? { lat: saved.lat, lng: saved.lng } : null)
  const place = ref<GeocoderResult | null>(
    saved
      ? ({
          formatted_address: saved.formattedAddress,
          address_components: saved.addressComponents,
        } as GeocoderResult)
      : null,
  )
  const isResolving = ref(!saved)
  const error = ref<string | null>(null)

  const { load } = useGoogleMaps()

  const areaLabel = computed(() =>
    areaFrom(place.value?.address_components, place.value?.formatted_address ?? ''),
  )

  const persist = () => {
    if (!coords.value) return
    const payload: SavedLocation = {
      lat: coords.value.lat,
      lng: coords.value.lng,
      formattedAddress: place.value?.formatted_address ?? '',
      addressComponents: place.value?.address_components ?? [],
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Keeping the in-memory location is enough if storage is blocked.
    }
  }

  const applyResult = (result: GeocoderResult) => {
    const point = result.geometry?.location
    if (!point) throw new Error('That place has no map location.')
    coords.value = { lat: point.lat(), lng: point.lng() }
    place.value = result
    error.value = null
    persist()
  }

  const requestCoords = () =>
    new Promise<LatLng>((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by this browser.'))
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true },
      )
    })

  const resolveAddress = async (latLng: LatLng) => {
    await load()
    const { Geocoder } = (await google.maps.importLibrary(
      'geocoding',
    )) as google.maps.GeocodingLibrary
    const geocoder = new Geocoder()
    const { results } = await geocoder.geocode({ location: latLng })
    return results?.[0] ?? null
  }

  const detect = async () => {
    try {
      isResolving.value = true
      error.value = null
      const latLng = await requestCoords()
      const found = await resolveAddress(latLng)
      coords.value = latLng
      place.value = found
      if (!found) throw new Error('No address matched this location.')
      persist()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown geolocation error'
      console.error('[location.detect]', e)
    } finally {
      isResolving.value = false
    }
  }

  const searchAddress = async (query: string) => {
    const text = query.trim()
    if (!text) return []
    await load()
    const { Geocoder } = (await google.maps.importLibrary(
      'geocoding',
    )) as google.maps.GeocodingLibrary
    const geocoder = new Geocoder()
    const { results } = await geocoder.geocode({ address: text })
    return (results ?? []).slice(0, 5)
  }

  const choose = (result: GeocoderResult) => {
    applyResult(result)
  }

  return {
    coords,
    place,
    isResolving,
    error,
    areaLabel,
    detect,
    searchAddress,
    choose,
  }
})

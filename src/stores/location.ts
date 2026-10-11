import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGoogleMaps } from '@/composables/useGoogleMaps'
import type { GeocoderResult, LatLng } from '@/types'

export const useLocationStore = defineStore('location', () => {
  const coords = ref<LatLng | null>(null)
  const place = ref<GeocoderResult | null>(null)
  const isResolving = ref(true)
  const error = ref<string | null>(null)

  const { load } = useGoogleMaps()

  const requestCoords = () =>
    new Promise<LatLng>((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by this browser.'))
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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
      coords.value = latLng
      place.value = await resolveAddress(latLng)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown geolocation error'
      console.error('[location.detect]', e)
    } finally {
      isResolving.value = false
    }
  }

  return { coords, place, isResolving, error, detect }
})

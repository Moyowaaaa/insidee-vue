import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
let bootstrapped = false
let bootstrapPromise: Promise<unknown> | null = null

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.warn('[useGoogleMaps] VITE_GOOGLE_MAPS_API_KEY is not set.')
  }

  const load = () => {
    if (!bootstrapped) {
      setOptions({ key: apiKey, v: 'weekly' })
      bootstrapped = true
    }
    if (!bootstrapPromise) {
      bootstrapPromise = importLibrary('core')
    }
    return bootstrapPromise
  }

  return { load, importLibrary }
}

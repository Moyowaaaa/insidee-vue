// Shared domain types ---------------------------------------------------------

export type LatLng = {
  lat: number
  lng: number
}

export type Spot = {
  name: string
  image: string
  icon?: string
  interests: string[]
}

export type Review = {
  author: string
  starRating?: number
  review: string
}

// Google Maps re-exports (shortcuts)
export type Place = google.maps.places.Place
export type GeocoderResult = google.maps.GeocoderResult

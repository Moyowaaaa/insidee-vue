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

export type ListedReview = {
  authorAttribution?: { displayName?: string | null } | null
  rating?: number | null
  text?: string | null
}

export type ListedHoursPeriod = {
  open: { day: number; hour: number; minute: number }
  close?: { day: number; hour: number; minute: number }
}

/** Plain place the modal can render after a refresh, without a live Maps object. */
export type ListedPlace = {
  id?: string
  displayName?: string | null
  formattedAddress?: string | null
  rating?: number | null
  userRatingCount?: number | null
  hoursLabel?: string
  location?: { lat: () => number; lng: () => number } | null
  photos?: { getURI: (opts?: { maxWidth?: number }) => string }[] | null
  reviews?: ListedReview[] | null
  regularOpeningHours?: { periods?: ListedHoursPeriod[] } | null
}

export type GeocoderResult = google.maps.GeocoderResult

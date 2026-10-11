import type { Spot } from '@/types'

// Place-type interests per category.
// NOTE: keep this list reasonable — the old project passed ~10 types and the
// Places API only honours the first few, which hurt result quality.
export const spotTypes: Spot[] = [
  {
    name: 'Outdoorzyy',
    image: '',
    icon: '',
    interests: [
      'park',
      'art_gallery',
      'museum',
      'amusement_park',
      'movie_theater',
      'beach',
    ],
  },
  {
    name: 'Food & Drinks',
    image: '',
    icon: '',
    interests: ['restaurant', 'cafe', 'bar', 'bakery'],
  },
  {
    name: 'Others',
    image: '',
    interests: [
      'gym',
      'spa',
      'shopping_mall',
      'supermarket',
      'beauty_salon',
      'lodging',
    ],
  },
]

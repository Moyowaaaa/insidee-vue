export type PlaceTypeOption = {
  label: string
  type: string
  aliases?: string[]
}

const options: PlaceTypeOption[] = [
  { label: 'Pharmacy', type: 'pharmacy', aliases: ['chemist', 'drugstore'] },
  { label: 'Hospital', type: 'hospital', aliases: ['clinic'] },
  { label: 'Doctor', type: 'doctor' },
  { label: 'Dentist', type: 'dentist' },
  { label: 'Bookstore', type: 'book_store', aliases: ['books', 'book shop'] },
  { label: 'Library', type: 'library' },
  { label: 'Park', type: 'park' },
  { label: 'Bakery', type: 'bakery' },
  { label: 'Bank', type: 'bank' },
  { label: 'ATM', type: 'atm', aliases: ['cash'] },
  { label: 'Night club', type: 'night_club', aliases: ['club', 'nightlife'] },
  { label: 'Gas station', type: 'gas_station', aliases: ['petrol', 'fuel'] },
  { label: 'Pet store', type: 'pet_store', aliases: ['pets'] },
  { label: 'Hair salon', type: 'hair_salon', aliases: ['barber', 'salon'] },
  { label: 'University', type: 'university', aliases: ['campus'] },
  { label: 'School', type: 'primary_school', aliases: ['school'] },
  { label: 'Church', type: 'church' },
  { label: 'Mosque', type: 'mosque' },
  { label: 'Clothing store', type: 'clothing_store', aliases: ['clothes', 'fashion'] },
  { label: 'Electronics', type: 'electronics_store', aliases: ['phones', 'gadgets'] },
  { label: 'Hardware store', type: 'hardware_store', aliases: ['tools'] },
  { label: 'Florist', type: 'florist', aliases: ['flowers'] },
  { label: 'Car repair', type: 'car_repair', aliases: ['mechanic', 'garage'] },
  { label: 'Veterinary', type: 'veterinary_care', aliases: ['vet'] },
  { label: 'Bus station', type: 'bus_station', aliases: ['bus'] },
  { label: 'Train station', type: 'train_station', aliases: ['train'] },
  { label: 'Post office', type: 'post_office', aliases: ['mail'] },
  { label: 'Sushi', type: 'sushi_restaurant' },
  { label: 'Indian food', type: 'indian_restaurant', aliases: ['indian'] },
  { label: 'Seafood', type: 'seafood_restaurant' },
  { label: 'Coffee', type: 'coffee_shop', aliases: ['coffee shop'] },
  { label: 'Bowling', type: 'bowling_alley' },
  { label: 'Zoo', type: 'zoo' },
  { label: 'Aquarium', type: 'aquarium' },
]

const featured = [
  'Pharmacy',
  'Bookstore',
  'Hospital',
  'Park',
  'Bakery',
  'Bank',
  'Library',
  'Night club',
  'Coffee',
  'Hair salon',
  'Pet store',
  'Gas station',
]

export const matchPlaceTypes = (query: string) => {
  const text = query.trim().toLowerCase()
  if (!text) {
    return featured
      .map((label) => options.find((option) => option.label === label))
      .filter((option): option is PlaceTypeOption => !!option)
  }

  return options
    .filter((option) => {
      const words = [option.label, option.type.replaceAll('_', ' '), ...(option.aliases ?? [])]
      return words.some((word) => word.toLowerCase().includes(text))
    })
    .slice(0, 12)
}

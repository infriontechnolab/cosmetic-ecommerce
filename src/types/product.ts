export interface Shade { color: string }

export type BadgeType = 'new' | 'sale' | 'hot' | 'low'

export interface Product {
  id: string
  brand: string
  name: string
  rating: number
  reviews: string
  price: string
  priceWas?: string
  priceOff?: string
  image: string
  bgColor: string
  badge?: { text: string; type: BadgeType }
  gwp?: string
  shades?: Shade[]
  category?: string
  description?: string
  ingredients?: string
  howToUse?: string
  sizes?: string[]
}

export interface Deal {
  id: string
  brand: string
  name: string
  price: string
  was: string
  pct: string
  image: string
  bgColor: string
}

export interface CartItem {
  id: string
  brand: string
  name: string
  price: string
  image: string
  bgColor: string
  quantity: number
  shade?: string
  size?: string
}

export interface Announcement { text: string; highlight?: string }

export interface NavCategory { label: string }

export interface Category { icon: string; name: string }

export interface Brand { name: string; offer: string; type: 'acid' | 'dim' | 'muted'; tabs?: number[] }
export interface BrandTab { label: string }

export interface SkinConcern { icon: string; label: string; count: string }

export interface Review {
  initial: string; name: string; meta: string
  rating: string; text: string; product: string
}

export interface RitualStep { n: string; title: string; desc: string }

export interface TrustItem { iconKey: string; title: string; sub: string }

export interface HeroStat { value: string; label: string }
export interface HeroData {
  tagline: string
  headline: string
  headlineAccent: string
  description: string
  ctaPrimary: string
  ctaSecondary: string
  stats: HeroStat[]
  spotlightBadge: string
  spotlightProduct: string
  spotlightRating: string
  spotlightReviews: string
  spotlightPrice: string
}

export interface FooterColumn { title: string; links: string[] }
export interface FooterData {
  tagline: string
  columns: FooterColumn[]
  bottomLinks: string[]
}

export interface LoyaltyData {
  points: number
  tierCurrent: string
  tierCurrentPoints: number
  tierNext: string
  tierNextPoints: number
}

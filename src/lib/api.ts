import type { Product, Deal } from '@/types/product'
import type { Announcement, NavCategory, Category, Brand, SkinConcern, Review, RitualStep, TrustItem, HeroData, FooterData, LoyaltyData } from '@/types/site'
import { getHomeCategories, getHomeBrands, getHomeSkinConcerns, getHomeDeals, getHomeFeaturedReviews } from '@/db/queries/homepage'
import announcementsData from '@/data/announcements.json'
import navCategoriesData from '@/data/nav-categories.json'
import ritualStepsData from '@/data/ritual-steps.json'
import trustItemsData from '@/data/trust-items.json'
import heroData from '@/data/hero.json'
import footerData from '@/data/footer.json'
import loyaltyData from '@/data/loyalty.json'

// ─── Products (live DB via API routes) ───────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function fetchProductsAPI(params: Record<string, string> = {}): Promise<Product[]> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE_URL}/api/products${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data as Product[]
}

export async function getProducts(): Promise<Product[]> {
  return fetchProductsAPI()
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return fetchProductsAPI({ category: category.toLowerCase() })
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  return fetchProductsAPI({ brand: brand.toLowerCase() })
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return []
  return fetchProductsAPI({ q: query.trim() })
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const res = await fetch(`${BASE_URL}/api/products/${slug}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as Product
}

export async function getDeals(): Promise<Deal[]> {
  return getHomeDeals()
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await Promise.resolve()
  return announcementsData as Announcement[]
}

export async function getNavCategories(): Promise<NavCategory[]> {
  await Promise.resolve()
  return navCategoriesData as NavCategory[]
}

export async function getCategories(): Promise<Category[]> {
  return getHomeCategories()
}

export async function getBrandsData(): Promise<{ tabs: string[]; items: Brand[] }> {
  return getHomeBrands()
}

export async function getSkinConcerns(): Promise<SkinConcern[]> {
  return getHomeSkinConcerns()
}

export async function getReviews(): Promise<Review[]> {
  return getHomeFeaturedReviews()
}

export async function getRitualSteps(): Promise<RitualStep[]> {
  await Promise.resolve()
  return ritualStepsData as RitualStep[]
}

export async function getTrustItems(): Promise<TrustItem[]> {
  await Promise.resolve()
  return trustItemsData as TrustItem[]
}

export async function getHeroData(): Promise<HeroData> {
  await Promise.resolve()
  return heroData as HeroData
}

export async function getFooterData(): Promise<FooterData> {
  await Promise.resolve()
  return footerData as FooterData
}

export async function getLoyaltyData(): Promise<LoyaltyData> {
  await Promise.resolve()
  return loyaltyData as LoyaltyData
}

import { db } from '@/db'
import { products, productImages, brands, categories, skinConcerns, productReviews, users } from '@/db/schema'
import { and, desc, eq, isNull, isNotNull } from 'drizzle-orm'
import type { Category, Brand, SkinConcern, Review } from '@/types/site'
import type { Deal } from '@/types/product'

function formatPrice(value: string | number | null): string {
  if (!value) return '₹0'
  return '₹' + Math.round(Number(value)).toLocaleString('en-IN')
}

function tabToIndices(tab: string | null): number[] {
  switch (tab) {
    case 'popular':  return [0, 1, 2, 3]
    case 'luxe':     return [1]
    case 'new':      return [2]
    case 'trending': return [3]
    default:         return [0]
  }
}

export async function getHomeCategories(): Promise<Category[]> {
  const rows = await db
    .select({ name: categories.name, icon: categories.icon })
    .from(categories)
    .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
    .orderBy(categories.displayOrder)
  return rows.map(r => ({ icon: r.icon ?? '', name: r.name }))
}

export async function getHomeBrands(): Promise<{ tabs: string[]; items: Brand[] }> {
  const rows = await db
    .select({ name: brands.name, offerText: brands.offerText, tab: brands.tab })
    .from(brands)
    .where(and(eq(brands.isActive, true), isNull(brands.deletedAt)))
    .orderBy(brands.displayOrder)
  return {
    tabs: ['Popular', 'Luxe', 'New Launches', 'Only at Maison'],
    items: rows.map(r => ({
      name: r.name,
      offer: r.offerText ?? '',
      type: r.tab === 'luxe' ? 'acid' : r.tab === 'new' ? 'dim' : 'muted',
      tabs: tabToIndices(r.tab ?? null),
    })),
  }
}

export async function getHomeSkinConcerns(): Promise<SkinConcern[]> {
  const rows = await db
    .select({ icon: skinConcerns.icon, label: skinConcerns.label, productCount: skinConcerns.productCount })
    .from(skinConcerns)
    .where(and(eq(skinConcerns.isActive, true), isNull(skinConcerns.deletedAt)))
    .orderBy(skinConcerns.displayOrder)
  return rows.map(r => ({
    icon: r.icon,
    label: r.label,
    count: (r.productCount ?? 0) > 0 ? `${r.productCount}+ products` : 'Products',
  }))
}

export async function getHomeDeals(limit = 8): Promise<Deal[]> {
  const primaryImageSq = db
    .select({ productId: productImages.productId, url: productImages.imageUrl })
    .from(productImages)
    .where(and(eq(productImages.isPrimary, true), isNull(productImages.deletedAt)))
    .as('primary_img')

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      brandName: brands.name,
      price: products.salePrice,
      was: products.price,
      pct: products.priceOffPercent,
      bgColor: products.bgColor,
      image: primaryImageSq.url,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(primaryImageSq, eq(products.id, primaryImageSq.productId))
    .where(and(isNotNull(products.salePrice), eq(products.isActive, true), isNull(products.deletedAt)))
    .orderBy(desc(products.priceOffPercent))
    .limit(limit)

  return rows.map(r => ({
    id:      String(r.id),
    brand:   r.brandName ?? '',
    name:    r.name,
    price:   formatPrice(r.price),
    was:     formatPrice(r.was),
    pct:     r.pct ? `${r.pct}% Off` : 'Sale',
    image:   r.image ?? '',
    bgColor: r.bgColor ?? '#F2EBE3',
  }))
}

export async function getHomeFeaturedReviews(limit = 3): Promise<Review[]> {
  const rows = await db
    .select({
      rating:             productReviews.rating,
      reviewText:         productReviews.reviewText,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      userName:           users.name,
      productName:        products.name,
    })
    .from(productReviews)
    .innerJoin(products, eq(productReviews.productId, products.id))
    .innerJoin(users, eq(productReviews.userId, users.id))
    .where(and(eq(productReviews.status, 'approved'), isNull(productReviews.deletedAt)))
    .orderBy(desc(productReviews.helpfulCount))
    .limit(limit)

  return rows.map(r => ({
    initial: r.userName.charAt(0).toUpperCase(),
    name:    r.userName.split(' ')[0],
    meta:    r.isVerifiedPurchase ? 'Verified Purchase' : 'Customer Review',
    rating:  String(r.rating) + '.0',
    text:    r.reviewText ?? '',
    product: r.productName,
  }))
}

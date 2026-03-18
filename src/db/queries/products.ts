import { db } from "@/db";
import { products, productImages, productShades, productReviews, brands, categories } from "@/db/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { Product } from "@/types/product";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Format a raw decimal price into the "₹1,234" string the frontend expects */
function formatPrice(value: string | null): string {
  if (!value) return "₹0";
  const num = Math.round(Number(value));
  return "₹" + num.toLocaleString("en-IN");
}

/** Format integer review count: 1234 → "1,234",  12345 → "12.3k" */
function formatReviewCount(count: number): string {
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return count.toLocaleString("en-IN");
}

// Row type coming back from the joined query
type ProductRow = {
  id: number;
  slug: string;
  name: string;
  price: string;
  salePrice: string | null;
  priceOffPercent: number | null;
  bgColor: string | null;
  badgeType: "new" | "sale" | "hot" | "low" | null;
  badgeText: string | null;
  gwpText: string | null;
  shortDescription: string | null;
  description: string | null;
  ingredients: string | null;
  howToUse: string | null;
  brandName: string | null;
  categorySlug: string | null;
  primaryImage: string | null;
  avgRating: number;
  reviewCount: number;
  shades: { color: string }[];
};

/** Map a DB product row to the Product shape the frontend components consume */
function toProduct(row: ProductRow): Product {
  const currentPrice = row.salePrice ?? row.price;
  const originalPrice = row.salePrice ? row.price : null;

  // Compute discount % if not stored explicitly
  let priceOff: string | undefined;
  if (originalPrice && row.salePrice) {
    const pct =
      row.priceOffPercent ??
      Math.round(((Number(originalPrice) - Number(row.salePrice)) / Number(originalPrice)) * 100);
    priceOff = `−${pct}%`;
  }

  return {
    id: row.slug,
    brand: row.brandName ?? "",
    name: row.name,
    rating: row.avgRating ? Math.round(row.avgRating * 10) / 10 : 0,
    reviews: formatReviewCount(row.reviewCount),
    price: formatPrice(currentPrice),
    ...(originalPrice ? { priceWas: formatPrice(originalPrice) } : {}),
    ...(priceOff ? { priceOff } : {}),
    image: row.primaryImage ?? "",
    bgColor: row.bgColor ?? "#f5f0eb",
    ...(row.badgeType ? { badge: { text: row.badgeText ?? row.badgeType, type: row.badgeType } } : {}),
    ...(row.gwpText ? { gwp: row.gwpText } : {}),
    ...(row.shades.length ? { shades: row.shades } : {}),
    category: row.categorySlug ?? undefined,
    description: row.description ?? row.shortDescription ?? undefined,
    ...(row.ingredients ? { ingredients: row.ingredients } : {}),
    ...(row.howToUse ? { howToUse: row.howToUse } : {}),
  };
}

// ─── base select ─────────────────────────────────────────────────────────────

/**
 * Fetch products with all required joins in a single query, then
 * attach shades in a second query to keep things simple.
 */
async function fetchProducts(where?: Parameters<typeof and>[0]) {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      salePrice: products.salePrice,
      priceOffPercent: products.priceOffPercent,
      bgColor: products.bgColor,
      badgeType: products.badgeType,
      badgeText: products.badgeText,
      gwpText: products.gwpText,
      shortDescription: products.shortDescription,
      description: products.description,
      ingredients: products.ingredients,
      howToUse: products.howToUse,
      brandName: brands.name,
      categorySlug: categories.slug,
      primaryImage: sql<string>`(
        SELECT image_url FROM product_images
        WHERE product_id = ${products.id} AND is_primary = 1
        LIMIT 1
      )`.as("primary_image"),
      avgRating: sql<number>`COALESCE(
        (SELECT AVG(rating) FROM product_reviews
         WHERE product_id = ${products.id} AND status = 'approved'),
        0
      )`.as("avg_rating"),
      reviewCount: sql<number>`COALESCE(
        (SELECT COUNT(*) FROM product_reviews
         WHERE product_id = ${products.id} AND status = 'approved'),
        0
      )`.as("review_count"),
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), sql`${products.deletedAt} IS NULL`, where));

  if (!rows.length) return [];

  // Fetch shades for all returned products in one query
  const ids = rows.map((r) => r.id);
  const shadesRows = await db
    .select({ productId: productShades.productId, colorHex: productShades.colorHex })
    .from(productShades)
    .where(and(eq(productShades.isActive, true), sql`${productShades.productId} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`));

  const shadesMap = new Map<number, { color: string }[]>();
  for (const s of shadesRows) {
    if (!shadesMap.has(s.productId)) shadesMap.set(s.productId, []);
    shadesMap.get(s.productId)!.push({ color: s.colorHex });
  }

  return rows.map((row) =>
    toProduct({ ...row, shades: shadesMap.get(row.id) ?? [] })
  );
}

// ─── public query functions ───────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  return fetchProducts();
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return fetchProducts(eq(categories.slug, categorySlug));
}

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  return fetchProducts(eq(brands.slug, brandSlug));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return fetchProducts(eq(products.isFeatured, true));
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const q = `%${query.trim()}%`;
  return fetchProducts(
    or(ilike(products.name, q), ilike(brands.name, q), ilike(products.shortDescription, q))
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const results = await fetchProducts(eq(products.slug, slug));
  return results[0] ?? null;
}

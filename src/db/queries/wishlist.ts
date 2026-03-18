import { db } from "@/db";
import { wishlistItems, products, brands, productImages } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { Product } from "@/types/product";

function formatPrice(value: string | null): string {
  if (!value) return "₹0";
  return "₹" + Math.round(Number(value)).toLocaleString("en-IN");
}

export async function getWishlistItems(userId: number): Promise<Product[]> {
  const rows = await db
    .select({
      slug: products.slug,
      name: products.name,
      price: products.price,
      salePrice: products.salePrice,
      bgColor: products.bgColor,
      badgeType: products.badgeType,
      badgeText: products.badgeText,
      brandName: brands.name,
      primaryImage: sql<string>`(
        SELECT image_url FROM product_images
        WHERE product_id = ${products.id} AND is_primary = 1
        LIMIT 1
      )`.as("primary_image"),
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(wishlistItems.userId, userId), sql`${products.deletedAt} IS NULL`));

  return rows.map((r) => ({
    id: r.slug,
    brand: r.brandName ?? "",
    name: r.name,
    rating: 0,
    reviews: "0",
    price: formatPrice(r.salePrice ?? r.price),
    ...(r.salePrice ? { priceWas: formatPrice(r.price) } : {}),
    image: r.primaryImage ?? "",
    bgColor: r.bgColor ?? "#f5f0eb",
    ...(r.badgeType ? { badge: { text: r.badgeText ?? r.badgeType, type: r.badgeType } } : {}),
  }));
}

export async function addToWishlist(
  userId: number,
  productSlug: string
): Promise<{ success: boolean; error?: string }> {
  const product = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, productSlug), sql`${products.deletedAt} IS NULL`))
    .limit(1);

  if (!product.length) return { success: false, error: "Product not found" };

  // Insert; ignore duplicate (already wishlisted)
  await db
    .insert(wishlistItems)
    .values({ userId, productId: product[0].id })
    .onDuplicateKeyUpdate({ set: { userId } }); // no-op on duplicate

  return { success: true };
}

export async function removeFromWishlist(
  userId: number,
  productSlug: string
): Promise<{ success: boolean; error?: string }> {
  const product = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, productSlug))
    .limit(1);

  if (!product.length) return { success: false, error: "Product not found" };

  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, product[0].id)));

  return { success: true };
}

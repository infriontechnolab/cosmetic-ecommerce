import { db } from "@/db";
import { carts, cartItems, products, productImages, brands } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { CartItem } from "@/types/product";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPrice(value: string | null): string {
  if (!value) return "₹0";
  return "₹" + Math.round(Number(value)).toLocaleString("en-IN");
}

// ─── get or create a cart for a session ─────────────────────────────────────

export async function getOrCreateCart(sessionId: string): Promise<number> {
  const existing = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  if (existing.length) return existing[0].id;

  const result = await db.insert(carts).values({
    sessionId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  return Number(result[0].insertId);
}

// ─── get all cart items ───────────────────────────────────────────────────────

export async function getCartItems(sessionId: string): Promise<CartItem[]> {
  const rows = await db
    .select({
      itemId: cartItems.id,
      productSlug: products.slug,
      productName: products.name,
      brandName: brands.name,
      price: cartItems.price,
      bgColor: products.bgColor,
      quantity: cartItems.quantity,
      selectedShade: cartItems.selectedShade,
      selectedSize: cartItems.selectedSize,
      primaryImage: sql<string>`(
        SELECT image_url FROM product_images
        WHERE product_id = ${products.id} AND is_primary = 1
        LIMIT 1
      )`.as("primary_image"),
    })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(carts.sessionId, sessionId));

  return rows.map((r) => ({
    id: r.productSlug,
    brand: r.brandName ?? "",
    name: r.productName,
    price: formatPrice(r.price),
    image: r.primaryImage ?? "",
    bgColor: r.bgColor ?? "#f5f0eb",
    quantity: r.quantity,
    ...(r.selectedShade ? { shade: r.selectedShade } : {}),
    ...(r.selectedSize ? { size: r.selectedSize } : {}),
    _itemId: r.itemId, // internal DB row id for updates/deletes
  })) as CartItem[];
}

// ─── add item to cart ────────────────────────────────────────────────────────

export async function addCartItem(
  sessionId: string,
  productSlug: string,
  shade?: string,
  size?: string
): Promise<{ success: boolean; error?: string }> {
  // Resolve product
  const product = await db
    .select({ id: products.id, price: products.price, salePrice: products.salePrice, isActive: products.isActive })
    .from(products)
    .where(and(eq(products.slug, productSlug), sql`${products.deletedAt} IS NULL`))
    .limit(1);

  if (!product.length) return { success: false, error: "Product not found" };
  if (!product[0].isActive) return { success: false, error: "Product is unavailable" };

  const cartId = await getOrCreateCart(sessionId);
  const effectivePrice = product[0].salePrice ?? product[0].price;

  // Check if this exact variant already exists in the cart
  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, product[0].id),
        shade ? eq(cartItems.selectedShade, shade) : sql`${cartItems.selectedShade} IS NULL`,
        size ? eq(cartItems.selectedSize, size) : sql`${cartItems.selectedSize} IS NULL`
      )
    )
    .limit(1);

  if (existing.length) {
    // Increment quantity
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + 1 })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productId: product[0].id,
      quantity: 1,
      price: effectivePrice,
      ...(shade ? { selectedShade: shade } : {}),
      ...(size ? { selectedSize: size } : {}),
    });
  }

  return { success: true };
}

// ─── update quantity ─────────────────────────────────────────────────────────

export async function updateCartItemQty(
  sessionId: string,
  itemId: number,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  if (quantity < 1) return { success: false, error: "Quantity must be at least 1" };

  // Verify the item belongs to this session's cart
  const item = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(and(eq(cartItems.id, itemId), eq(carts.sessionId, sessionId)))
    .limit(1);

  if (!item.length) return { success: false, error: "Item not found" };

  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  return { success: true };
}

// ─── remove item ─────────────────────────────────────────────────────────────

export async function removeCartItem(
  sessionId: string,
  itemId: number
): Promise<{ success: boolean; error?: string }> {
  const item = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .where(and(eq(cartItems.id, itemId), eq(carts.sessionId, sessionId)))
    .limit(1);

  if (!item.length) return { success: false, error: "Item not found" };

  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  return { success: true };
}

// ─── clear entire cart ────────────────────────────────────────────────────────

export async function clearCart(sessionId: string): Promise<void> {
  const cart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  if (cart.length) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
  }
}

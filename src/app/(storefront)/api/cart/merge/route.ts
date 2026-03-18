import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { carts, cartItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/cart/merge
 * Merges a guest cart (cookie session) into the logged-in user's cart.
 * Call this immediately after sign-in on the client.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { guestSessionId } = (await req.json()) as { guestSessionId?: string };
  if (!guestSessionId) {
    return NextResponse.json({ merged: 0 });
  }

  const userId = session.user.id;
  const userSessionId = `user_${userId}`;

  // Find guest cart
  const [guestCart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, guestSessionId))
    .limit(1);

  if (!guestCart) {
    return NextResponse.json({ merged: 0 });
  }

  // Get or create user cart
  let [userCart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, userSessionId))
    .limit(1);

  if (!userCart) {
    const result = await db.insert(carts).values({
      sessionId: userSessionId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    userCart = { id: Number(result[0].insertId) };
  }

  // Fetch guest items
  const guestRows = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, guestCart.id));

  let merged = 0;
  for (const item of guestRows) {
    // Check if user cart already has this variant
    const [existing] = await db
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, userCart.id),
          eq(cartItems.productId, item.productId),
          item.selectedShade
            ? eq(cartItems.selectedShade, item.selectedShade)
            : eq(cartItems.selectedShade, item.selectedShade!),
          item.selectedSize
            ? eq(cartItems.selectedSize, item.selectedSize)
            : eq(cartItems.selectedSize, item.selectedSize!)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        selectedShade: item.selectedShade,
        selectedSize: item.selectedSize,
      });
    }
    merged++;
  }

  // Delete guest cart
  await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));
  await db.delete(carts).where(eq(carts.id, guestCart.id));

  return NextResponse.json({ merged });
}

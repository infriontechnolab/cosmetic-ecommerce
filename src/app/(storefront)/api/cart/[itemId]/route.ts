import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateCartItemQty, removeCartItem } from "@/db/queries/cart";

const SESSION_COOKIE = "cart_session_id";

/**
 * PATCH /api/cart/:itemId
 * Body: { quantity: number }
 * Updates the quantity of a specific cart item.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "No active cart" }, { status: 400 });
    }

    const { itemId } = await params;
    const body = await req.json();
    const { quantity } = body as { quantity: number };

    if (typeof quantity !== "number") {
      return NextResponse.json({ error: "quantity must be a number" }, { status: 400 });
    }

    const result = await updateCartItemQty(sessionId, Number(itemId), quantity);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/cart/:itemId]", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart/:itemId
 * Removes a specific item from the cart.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "No active cart" }, { status: 400 });
    }

    const { itemId } = await params;
    const result = await removeCartItem(sessionId, Number(itemId));

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/cart/:itemId]", err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}

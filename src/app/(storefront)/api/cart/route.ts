import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCartItems, addCartItem } from "@/db/queries/cart";

const SESSION_COOKIE = "cart_session_id";
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function getSessionId(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

function newSessionId(): string {
  return crypto.randomUUID();
}

/**
 * GET /api/cart
 * Returns all items in the current session's cart.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionId = getSessionId(cookieStore);

  if (!sessionId) {
    return NextResponse.json({ data: [], total: 0 });
  }

  const items = await getCartItems(sessionId);
  return NextResponse.json({ data: items, total: items.length });
}

/**
 * POST /api/cart
 * Body: { productSlug: string, shade?: string, size?: string }
 * Adds a product to the cart. Creates a session cookie if not present.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, shade, size } = body as {
      productSlug: string;
      shade?: string;
      size?: string;
    };

    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let sessionId = getSessionId(cookieStore);
    let isNew = false;

    if (!sessionId) {
      sessionId = newSessionId();
      isNew = true;
    }

    const result = await addCartItem(sessionId, productSlug, shade, size);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    if (isNew) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_TTL,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("[POST /api/cart]", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Clears all items in the cart.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  const sessionId = getSessionId(cookieStore);

  if (!sessionId) {
    return NextResponse.json({ success: true });
  }

  const { clearCart } = await import("@/db/queries/cart");
  await clearCart(sessionId);
  return NextResponse.json({ success: true });
}

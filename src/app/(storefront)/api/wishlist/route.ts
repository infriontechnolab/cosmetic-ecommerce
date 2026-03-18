import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWishlistItems, addToWishlist } from "@/db/queries/wishlist";

/**
 * GET /api/wishlist
 * Returns all wishlisted products for the authenticated user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const items = await getWishlistItems(Number(session.user.id));
    return NextResponse.json({ data: items, total: items.length });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

/**
 * POST /api/wishlist
 * Body: { productSlug: string }
 * Adds a product to the wishlist.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { productSlug } = (await req.json()) as { productSlug: string };
    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required" }, { status: 400 });
    }

    const result = await addToWishlist(Number(session.user.id), productSlug);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

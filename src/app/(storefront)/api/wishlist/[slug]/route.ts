import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeFromWishlist } from "@/db/queries/wishlist";

/**
 * DELETE /api/wishlist/:slug
 * Removes a product from the wishlist.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await params;
    const result = await removeFromWishlist(Number(session.user.id), slug);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/wishlist/:slug]", err);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}

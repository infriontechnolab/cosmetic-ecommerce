import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/db/queries/products";

/**
 * GET /api/products/:slug
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    console.error("[GET /api/products/:slug]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

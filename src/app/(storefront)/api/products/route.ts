import { NextRequest, NextResponse } from "next/server";
import {
  getAllProducts,
  getProductsByCategory,
  getProductsByBrand,
  getFeaturedProducts,
  searchProducts,
} from "@/db/queries/products";

/**
 * GET /api/products
 *
 * Query params:
 *   ?category=makeup          → filter by category slug
 *   ?brand=fenty-beauty       → filter by brand slug
 *   ?featured=true            → featured products only
 *   ?q=foundation             → full-text search
 *   (no params)               → all active products
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const q = searchParams.get("q");

    let data;

    if (q) {
      data = await searchProducts(q);
    } else if (category) {
      data = await getProductsByCategory(category);
    } else if (brand) {
      data = await getProductsByBrand(brand);
    } else if (featured === "true") {
      data = await getFeaturedProducts();
    } else {
      data = await getAllProducts();
    }

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

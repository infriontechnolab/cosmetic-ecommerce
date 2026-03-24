import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getProductReviews, canUserReview, submitReview } from "@/db/queries/reviews";

async function resolveProductId(slug: string): Promise<number | null> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, slug), sql`${products.deletedAt} IS NULL`))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Eligibility check: GET ?check=1
    if (req.nextUrl.searchParams.has("check")) {
      const session = await auth();
      if (!session?.user?.id) return NextResponse.json({ canReview: false });
      const productId = await resolveProductId(slug);
      if (!productId) return NextResponse.json({ canReview: false });
      const result = await canUserReview(Number(session.user.id), productId);
      return NextResponse.json(result);
    }

    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const productId = await resolveProductId(slug);
    if (!productId) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const result = await getProductReviews(productId, { page, perPage: 10 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/reviews/:slug]", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { slug } = await params;
    const productId = await resolveProductId(slug);
    if (!productId) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const userId = Number(session.user.id);
    const eligibility = await canUserReview(userId, productId);
    if (!eligibility.canReview) {
      return NextResponse.json({ error: "Not eligible to review this product" }, { status: 403 });
    }

    const { rating, title, reviewText } = (await req.json()) as {
      rating: number;
      title?: string;
      reviewText?: string;
    };

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }

    const result = await submitReview({
      productId,
      userId,
      orderId: eligibility.orderId!,
      rating,
      title,
      reviewText,
    });

    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/reviews/:slug]", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

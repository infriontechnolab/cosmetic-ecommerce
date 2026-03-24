import { db } from "@/db";
import { productReviews, products, users, orders, orderItems } from "@/db/schema";
import { and, eq, sql, desc, inArray } from "drizzle-orm";

export type ReviewRow = {
  id: number;
  rating: number;
  title: string | null;
  reviewText: string | null;
  isVerifiedPurchase: boolean | null;
  helpfulCount: number | null;
  createdAt: Date | null;
  userName: string;
};

export async function getProductReviews(
  productId: number,
  opts: { page?: number; perPage?: number } = {}
): Promise<{ reviews: ReviewRow[]; total: number }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 10;
  const offset = (page - 1) * perPage;

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.status, "approved"),
          sql`${productReviews.deletedAt} IS NULL`
        )
      ),
    db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        reviewText: productReviews.reviewText,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        helpfulCount: productReviews.helpfulCount,
        createdAt: productReviews.createdAt,
        userName: sql<string>`SUBSTRING_INDEX(${users.name}, ' ', 1)`.as("user_name"),
      })
      .from(productReviews)
      .innerJoin(users, eq(productReviews.userId, users.id))
      .where(
        and(
          eq(productReviews.productId, productId),
          eq(productReviews.status, "approved"),
          sql`${productReviews.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(productReviews.createdAt))
      .limit(perPage)
      .offset(offset),
  ]);

  return { reviews: rows as ReviewRow[], total: Number(totalResult[0]?.count ?? 0) };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export type AdminReviewRow = {
  id: number;
  rating: number;
  title: string | null;
  reviewText: string | null;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean | null;
  createdAt: Date | null;
  userName: string | null;
  userEmail: string | null;
  productName: string | null;
  productSlug: string | null;
};

export async function listAdminReviews(opts: {
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  perPage?: number;
}): Promise<{ reviews: AdminReviewRow[]; total: number }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  const offset = (page - 1) * perPage;

  const statusFilter = opts.status
    ? eq(productReviews.status, opts.status)
    : inArray(productReviews.status, ['pending', 'approved', 'rejected']);

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(productReviews)
      .where(and(statusFilter, sql`${productReviews.deletedAt} IS NULL`)),
    db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        reviewText: productReviews.reviewText,
        status: productReviews.status,
        isVerifiedPurchase: productReviews.isVerifiedPurchase,
        createdAt: productReviews.createdAt,
        userName: users.name,
        userEmail: users.email,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(productReviews)
      .innerJoin(users, eq(productReviews.userId, users.id))
      .innerJoin(products, eq(productReviews.productId, products.id))
      .where(and(statusFilter, sql`${productReviews.deletedAt} IS NULL`))
      .orderBy(desc(productReviews.createdAt))
      .limit(perPage)
      .offset(offset),
  ]);

  return { reviews: rows as AdminReviewRow[], total: Number(totalResult[0]?.count ?? 0) };
}

export async function updateReviewStatus(
  reviewId: number,
  status: 'approved' | 'rejected'
): Promise<void> {
  await db
    .update(productReviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(productReviews.id, reviewId));
}

// ─── End Admin ────────────────────────────────────────────────────────────────

export async function canUserReview(
  userId: number,
  productId: number
): Promise<{ canReview: boolean; orderId?: number }> {
  // Check existing review
  const existing = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(
      and(
        eq(productReviews.userId, userId),
        eq(productReviews.productId, productId),
        sql`${productReviews.deletedAt} IS NULL`
      )
    )
    .limit(1);
  if (existing.length) return { canReview: false };

  // Check delivered order containing this product
  const order = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(orderItems.productId, productId),
        sql`${orders.deletedAt} IS NULL`
      )
    )
    .limit(1);

  if (!order.length) return { canReview: false };
  return { canReview: true, orderId: order[0].id };
}

export async function submitReview(data: {
  productId: number;
  userId: number;
  orderId: number;
  rating: number;
  title?: string;
  reviewText?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(productReviews).values({
      productId: data.productId,
      userId: data.userId,
      orderId: data.orderId,
      rating: data.rating,
      title: data.title ?? null,
      reviewText: data.reviewText ?? null,
      status: "pending",
      isVerifiedPurchase: true,
    });
    return { success: true };
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return { success: false, error: "You have already reviewed this product" };
    }
    throw err;
  }
}

export type ReviewSummary = {
  id: number;
  rating: number;
  title: string | null;
  reviewText: string | null;
  userName: string;
  productName: string;
  productSlug: string;
  isVerifiedPurchase: boolean | null;
  createdAt: Date | null;
};

export async function listRecentReviews(opts?: { limit?: number }): Promise<ReviewSummary[]> {
  const limit = opts?.limit ?? 20;
  const rows = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      title: productReviews.title,
      reviewText: productReviews.reviewText,
      userName: sql<string>`SUBSTRING_INDEX(${users.name}, ' ', 1)`.as('user_name'),
      productName: products.name,
      productSlug: products.slug,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      createdAt: productReviews.createdAt,
    })
    .from(productReviews)
    .innerJoin(users, eq(productReviews.userId, users.id))
    .innerJoin(products, eq(productReviews.productId, products.id))
    .where(and(eq(productReviews.status, 'approved'), sql`${productReviews.deletedAt} IS NULL`))
    .orderBy(desc(productReviews.createdAt))
    .limit(limit);

  return rows as ReviewSummary[];
}

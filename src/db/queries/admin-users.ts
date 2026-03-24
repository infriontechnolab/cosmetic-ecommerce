import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, like, desc, count, sum, and, isNull, or, sql } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  loyaltyPoints: number;
  createdAt: Date | null;
  orderCount: number;
  totalSpent: number;
}

export interface AdminUserDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  loyaltyPoints: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  orders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: string;
    createdAt: Date | null;
  }>;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listAdminUsers({
  search,
  page = 1,
  perPage = 20,
}: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<{ users: AdminUserListItem[]; total: number }> {
  const where = and(
    isNull(users.deletedAt),
    search
      ? or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      : undefined
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
        loyaltyPoints: users.loyaltyPoints,
        createdAt: users.createdAt,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'completed' THEN ${orders.totalAmount} ELSE 0 END), 0)`,
      })
      .from(users)
      .leftJoin(orders, and(eq(orders.userId, users.id), isNull(orders.deletedAt)))
      .where(where)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: count() })
      .from(users)
      .where(where),
  ]);

  return {
    users: rows.map((r) => ({
      ...r,
      id: Number(r.id),
      loyaltyPoints: Number(r.loyaltyPoints),
      orderCount: Number(r.orderCount),
      totalSpent: Number(r.totalSpent),
    })),
    total: Number(total),
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getAdminUserDetail(
  userId: number
): Promise<AdminUserDetail | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      status: users.status,
      loyaltyPoints: users.loyaltyPoints,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) return null;

  const userOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.userId, userId), isNull(orders.deletedAt)))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    loyaltyPoints: Number(user.loyaltyPoints),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    orders: userOrders.map((o) => ({
      id: Number(o.id),
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    })),
  };
}

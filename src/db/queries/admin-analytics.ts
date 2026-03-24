import { db } from "@/db";
import { orders, orderItems, products, categories, users, returnRequests } from "@/db/schema";
import { eq, and, gte, lte, isNull, sql, desc, count } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RevenueByDay {
  date: string;     // "YYYY-MM-DD"
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  sku: string;
  totalQty: number;
  totalRevenue: number;
}

export interface TopCategory {
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
}

export interface SummaryStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalItems: number;
  totalReturns: number;
  newCustomers: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

export function presetDates(preset: string): { from: Date; to: Date } {
  const now = new Date();
  const to = endOfDay(now);

  switch (preset) {
    case "7d": {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 6);
      return { from, to };
    }
    case "30d": {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
    case "90d": {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 89);
      return { from, to };
    }
    case "this_month": {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { from, to };
    }
    case "last_month": {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const lastTo = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { from, to: lastTo };
    }
    default: {
      const from = startOfDay(new Date(now));
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
  }
}

// ─── Summary stats ────────────────────────────────────────────────────────────

export async function getSummaryStats(from: Date, to: Date): Promise<SummaryStats> {
  const [row] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL(12,2))), 0)`,
      totalOrders: count(),
      avgOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.totalAmount} AS DECIMAL(12,2))), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    );

  const [itemRow] = await db
    .select({ totalItems: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)` })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    );

  const [returnsRow] = await db
    .select({ total: count() })
    .from(returnRequests)
    .where(and(isNull(returnRequests.deletedAt), gte(returnRequests.createdAt, from), lte(returnRequests.createdAt, to)));

  const [customersRow] = await db
    .select({ total: count() })
    .from(users)
    .where(and(isNull(users.deletedAt), gte(users.createdAt, from), lte(users.createdAt, to)));

  return {
    totalRevenue: Number(row?.totalRevenue ?? 0),
    totalOrders: Number(row?.totalOrders ?? 0),
    avgOrderValue: Number(row?.avgOrderValue ?? 0),
    totalItems: Number(itemRow?.totalItems ?? 0),
    totalReturns: Number(returnsRow?.total ?? 0),
    newCustomers: Number(customersRow?.total ?? 0),
  };
}

// ─── Revenue by day ───────────────────────────────────────────────────────────

export async function getRevenueByDay(from: Date, to: Date): Promise<RevenueByDay[]> {
  const rows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL(12,2))), 0)`,
      orderCount: count(),
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    )
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  // Fill gaps with zero days
  const map = new Map<string, { revenue: number; orders: number }>();
  rows.forEach((r) => {
    map.set(r.date, { revenue: Number(r.revenue), orders: Number(r.orderCount) });
  });

  const result: RevenueByDay[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    result.push({ date: key, ...(map.get(key) ?? { revenue: 0, orders: 0 }) });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

// ─── Top products ─────────────────────────────────────────────────────────────

export async function getTopProducts(
  from: Date,
  to: Date,
  limit = 10
): Promise<TopProduct[]> {
  const rows = await db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      sku: orderItems.productSku,
      totalQty: sql<number>`SUM(${orderItems.quantity})`,
      totalRevenue: sql<number>`SUM(CAST(${orderItems.total} AS DECIMAL(12,2)))`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    )
    .groupBy(orderItems.productId, orderItems.productName, orderItems.productSku)
    .orderBy(desc(sql`SUM(CAST(${orderItems.total} AS DECIMAL(12,2)))`))
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    sku: r.sku,
    totalQty: Number(r.totalQty),
    totalRevenue: Number(r.totalRevenue),
  }));
}

// ─── Revenue by category ──────────────────────────────────────────────────────

export async function getRevenueByCategory(
  from: Date,
  to: Date
): Promise<TopCategory[]> {
  const rows = await db
    .select({
      categoryName: categories.name,
      totalRevenue: sql<number>`SUM(CAST(${orderItems.total} AS DECIMAL(12,2)))`,
      totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    )
    .groupBy(categories.name)
    .orderBy(desc(sql`SUM(CAST(${orderItems.total} AS DECIMAL(12,2)))`))
    .limit(8);

  return rows.map((r) => ({
    categoryName: r.categoryName,
    totalRevenue: Number(r.totalRevenue),
    totalOrders: Number(r.totalOrders),
  }));
}

// ─── Orders by status breakdown ──────────────────────────────────────────────

export async function getOrderStatusBreakdown(from: Date, to: Date) {
  const rows = await db
    .select({
      status: orders.status,
      cnt: count(),
    })
    .from(orders)
    .where(
      and(isNull(orders.deletedAt), gte(orders.createdAt, from), lte(orders.createdAt, to))
    )
    .groupBy(orders.status);

  return Object.fromEntries(rows.map((r) => [r.status, Number(r.cnt)]));
}

// ─── Payment method breakdown ─────────────────────────────────────────────────

export async function getPaymentMethodBreakdown(from: Date, to: Date): Promise<PaymentMethodBreakdown[]> {
  const rows = await db
    .select({
      method: orders.paymentMethod,
      orderCount: count(),
      revenue: sql<number>`COALESCE(SUM(CAST(${orders.totalAmount} AS DECIMAL(12,2))), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "completed"),
        isNull(orders.deletedAt),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to)
      )
    )
    .groupBy(orders.paymentMethod);

  return rows.map((r) => ({
    method: r.method,
    count: Number(r.orderCount),
    revenue: Number(r.revenue),
  }));
}

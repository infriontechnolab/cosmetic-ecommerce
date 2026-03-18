import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq, and, like, desc, count, isNull, or, sql, inArray } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface AdminOrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingCity: string;
  shippingState: string;
  createdAt: Date | null;
  itemCount: number;
}

export interface AdminOrderDetail {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: string;
  discountAmount: string | null;
  taxAmount: string;
  shippingAmount: string | null;
  totalAmount: string;
  trackingNumber: string | null;
  courierPartner: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  adminNotes: string | null;
  customerNotes: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  customerName: string | null;
  customerEmail: string | null;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
  taxAmount: string;
  subtotal: string;
  total: string;
}

// ─── List orders ──────────────────────────────────────────────────────────────

export async function listAdminOrders(opts: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<{ orders: AdminOrderListItem[]; total: number }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  const offset = (page - 1) * perPage;

  const conditions = [isNull(orders.deletedAt)];

  if (opts.status && opts.status !== "all") {
    conditions.push(eq(orders.status, opts.status as OrderStatus));
  }

  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        like(orders.orderNumber, term),
        like(orders.shippingFullName, term),
        like(users.email, term)
      )!
    );
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        totalAmount: orders.totalAmount,
        shippingCity: orders.shippingCity,
        shippingState: orders.shippingState,
        customerName: users.name,
        customerEmail: users.email,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(perPage)
      .offset(offset),

    db
      .select({ total: count() })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(where),
  ]);

  // Batch fetch item counts
  let itemCounts: Record<number, number> = {};
  if (rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const countRows = await db
      .select({
        orderId: orderItems.orderId,
        cnt: count(),
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, ids))
      .groupBy(orderItems.orderId);

    countRows.forEach((r) => {
      itemCounts[r.orderId] = Number(r.cnt);
    });
  }

  return {
    orders: rows.map((r) => ({
      ...r,
      itemCount: itemCounts[r.id] ?? 0,
      customerName: r.customerName ?? r.shippingCity,
    })) as AdminOrderListItem[],
    total: Number(total),
  };
}

// ─── Get order detail ─────────────────────────────────────────────────────────

export async function getAdminOrderById(
  orderId: number
): Promise<AdminOrderDetail | null> {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      subtotal: orders.subtotal,
      discountAmount: orders.discountAmount,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      totalAmount: orders.totalAmount,
      trackingNumber: orders.trackingNumber,
      courierPartner: orders.courierPartner,
      shippedAt: orders.shippedAt,
      deliveredAt: orders.deliveredAt,
      cancelledAt: orders.cancelledAt,
      cancellationReason: orders.cancellationReason,
      adminNotes: orders.adminNotes,
      customerNotes: orders.customerNotes,
      shippingFullName: orders.shippingFullName,
      shippingPhone: orders.shippingPhone,
      shippingAddressLine1: orders.shippingAddressLine1,
      shippingAddressLine2: orders.shippingAddressLine2,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingPincode: orders.shippingPincode,
      shippingCountry: orders.shippingCountry,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(eq(orders.id, orderId), isNull(orders.deletedAt)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      productSku: orderItems.productSku,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      taxAmount: orderItems.taxAmount,
      subtotal: orderItems.subtotal,
      total: orderItems.total,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items } as AdminOrderDetail;
}

// ─── Update order ─────────────────────────────────────────────────────────────

export async function updateAdminOrder(
  orderId: number,
  updates: {
    status?: OrderStatus;
    trackingNumber?: string;
    courierPartner?: string;
    adminNotes?: string;
  }
) {
  const now = new Date();
  const setValues: Record<string, unknown> = { ...updates, updatedAt: now };

  // Auto-set timestamps
  if (updates.status === "shipped" && updates.trackingNumber) {
    setValues.shippedAt = now;
  }
  if (updates.status === "delivered") {
    setValues.deliveredAt = now;
  }
  if (updates.status === "cancelled") {
    setValues.cancelledAt = now;
  }

  await db.update(orders).set(setValues).where(eq(orders.id, orderId));
}

// ─── Order stats for dashboard ────────────────────────────────────────────────

export async function getAdminOrderStats() {
  const [row] = await db
    .select({
      total: count(),
      pending: sql<number>`SUM(CASE WHEN ${orders.status} = 'pending' THEN 1 ELSE 0 END)`,
      confirmed: sql<number>`SUM(CASE WHEN ${orders.status} = 'confirmed' THEN 1 ELSE 0 END)`,
      shipped: sql<number>`SUM(CASE WHEN ${orders.status} = 'shipped' THEN 1 ELSE 0 END)`,
      delivered: sql<number>`SUM(CASE WHEN ${orders.status} = 'delivered' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN ${orders.status} = 'cancelled' THEN 1 ELSE 0 END)`,
      revenue: sql<number>`SUM(CASE WHEN ${orders.paymentStatus} = 'completed' THEN CAST(${orders.totalAmount} AS DECIMAL(12,2)) ELSE 0 END)`,
    })
    .from(orders)
    .where(isNull(orders.deletedAt));

  return {
    total: Number(row?.total ?? 0),
    pending: Number(row?.pending ?? 0),
    confirmed: Number(row?.confirmed ?? 0),
    shipped: Number(row?.shipped ?? 0),
    delivered: Number(row?.delivered ?? 0),
    cancelled: Number(row?.cancelled ?? 0),
    revenue: Number(row?.revenue ?? 0),
  };
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export async function getOrdersForCsv(status?: string) {
  const conditions = [isNull(orders.deletedAt)];
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as OrderStatus));
  }

  return db
    .select({
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      customerName: users.name,
      customerEmail: users.email,
      shippingFullName: orders.shippingFullName,
      shippingPhone: orders.shippingPhone,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingPincode: orders.shippingPincode,
      subtotal: orders.subtotal,
      discountAmount: orders.discountAmount,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      totalAmount: orders.totalAmount,
      trackingNumber: orders.trackingNumber,
      courierPartner: orders.courierPartner,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(orders.createdAt))
    .limit(5000);
}

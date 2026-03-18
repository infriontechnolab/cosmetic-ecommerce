import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, and, desc, count, isNull } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: string;
  itemCount: number;
  createdAt: Date | null;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
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
  items: OrderItemRow[];
}

export interface OrderItemRow {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
  taxAmount: string;
  total: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getUserOrders(
  userId: number,
  opts: { page?: number; perPage?: number } = {}
): Promise<{ orders: OrderListItem[]; total: number }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 10;
  const offset = (page - 1) * perPage;

  const baseWhere = and(
    eq(orders.userId, userId),
    isNull(orders.deletedAt)
  );

  const [rows, [{ total }]] = await Promise.all([
    db
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
      .where(baseWhere)
      .orderBy(desc(orders.createdAt))
      .limit(perPage)
      .offset(offset),

    db
      .select({ total: count() })
      .from(orders)
      .where(baseWhere),
  ]);

  // Fetch item counts for each order in one query
  const orderIds = rows.map((r) => r.id);
  let itemCounts: Record<number, number> = {};

  if (orderIds.length > 0) {
    const countRows = await Promise.all(
      orderIds.map((id) =>
        db
          .select({ orderId: orderItems.orderId, cnt: count() })
          .from(orderItems)
          .where(eq(orderItems.orderId, id))
      )
    );
    countRows.forEach(([row]) => {
      if (row) itemCounts[row.orderId] = Number(row.cnt);
    });
  }

  return {
    orders: rows.map((r) => ({
      ...r,
      itemCount: itemCounts[r.id] ?? 0,
    })) as OrderListItem[],
    total: Number(total),
  };
}

export async function getUserOrderById(
  userId: number,
  orderId: number
): Promise<OrderDetail | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.userId, userId),
        isNull(orders.deletedAt)
      )
    )
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
      total: orderItems.total,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items } as OrderDetail;
}

export async function cancelUserOrder(
  userId: number,
  orderId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const [order] = await db
    .select({ id: orders.id, status: orders.status })
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.userId, userId),
        isNull(orders.deletedAt)
      )
    )
    .limit(1);

  if (!order) return { success: false, error: "Order not found" };

  if (order.status !== "pending" && order.status !== "confirmed") {
    return {
      success: false,
      error: `Order cannot be cancelled (status: ${order.status})`,
    };
  }

  await db
    .update(orders)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: reason ?? "Cancelled by customer",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return { success: true };
}

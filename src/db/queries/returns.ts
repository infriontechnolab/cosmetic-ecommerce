import { db } from "@/db";
import { returnRequests, orders, users, paymentTransactions } from "@/db/schema";
import { eq, and, desc, count, isNull, sql } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReturnStatus = "pending" | "approved" | "rejected" | "received" | "refunded";
export type ReturnReason =
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "damaged"
  | "changed_mind"
  | "other";
export type RefundMethod = "original_payment" | "store_credit" | "replacement";

export interface ReturnListItem {
  id: number;
  returnNumber: string;
  status: ReturnStatus;
  reason: ReturnReason;
  refundMethod: RefundMethod | null;
  refundAmount: string | null;
  orderNumber: string;
  paymentMethod: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: Date | null;
}

export interface ReturnDetail extends ReturnListItem {
  reasonDetails: string | null;
  adminNotes: string | null;
  rejectionReason: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  receivedAt: Date | null;
  refundedAt: Date | null;
  updatedAt: Date | null;
  orderId: number;
  userId: number;
  orderTotalAmount: string;
}

// ─── User: create return request ──────────────────────────────────────────────

export async function createReturnRequest(input: {
  orderId: number;
  userId: number;
  reason: ReturnReason;
  reasonDetails?: string;
  refundMethod: RefundMethod;
}): Promise<{ returnNumber: string; returnId: number }> {
  // Verify order belongs to user and is delivered
  const [order] = await db
    .select({ id: orders.id, status: orders.status, totalAmount: orders.totalAmount })
    .from(orders)
    .where(and(eq(orders.id, input.orderId), eq(orders.userId, input.userId), isNull(orders.deletedAt)))
    .limit(1);

  if (!order) throw new Error("Order not found");
  if (order.status !== "delivered")
    throw new Error("Returns can only be requested for delivered orders");

  // Check no existing pending/approved return
  const [existing] = await db
    .select({ id: returnRequests.id })
    .from(returnRequests)
    .where(
      and(
        eq(returnRequests.orderId, input.orderId),
        sql`${returnRequests.status} NOT IN ('rejected')`
      )
    )
    .limit(1);

  if (existing) throw new Error("A return request already exists for this order");

  const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const result = await db.insert(returnRequests).values({
    orderId: input.orderId,
    userId: input.userId,
    returnNumber,
    status: "pending",
    reason: input.reason,
    reasonDetails: input.reasonDetails ?? null,
    refundMethod: input.refundMethod,
    refundAmount: order.totalAmount, // default to order total; admin can adjust
  });

  return { returnNumber, returnId: Number(result[0].insertId) };
}

// ─── Admin: list return requests ──────────────────────────────────────────────

export async function listReturnRequests(opts: {
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<{ returns: ReturnListItem[]; total: number; summary: Record<string, number> }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;
  const offset = (page - 1) * perPage;

  const conditions = [isNull(returnRequests.deletedAt)];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(returnRequests.status, opts.status as ReturnStatus));
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [rows, [{ total }], summaryRows] = await Promise.all([
    db
      .select({
        id: returnRequests.id,
        returnNumber: returnRequests.returnNumber,
        status: returnRequests.status,
        reason: returnRequests.reason,
        refundMethod: returnRequests.refundMethod,
        refundAmount: returnRequests.refundAmount,
        orderNumber: orders.orderNumber,
        paymentMethod: orders.paymentMethod,
        customerName: users.name,
        customerEmail: users.email,
        createdAt: returnRequests.createdAt,
      })
      .from(returnRequests)
      .innerJoin(orders, eq(returnRequests.orderId, orders.id))
      .innerJoin(users, eq(returnRequests.userId, users.id))
      .where(where)
      .orderBy(desc(returnRequests.createdAt))
      .limit(perPage)
      .offset(offset),

    db
      .select({ total: count() })
      .from(returnRequests)
      .where(where),

    db
      .select({
        status: returnRequests.status,
        cnt: count(),
      })
      .from(returnRequests)
      .where(isNull(returnRequests.deletedAt))
      .groupBy(returnRequests.status),
  ]);

  const summary: Record<string, number> = { all: 0 };
  summaryRows.forEach((r) => {
    summary[r.status] = Number(r.cnt);
    summary.all = (summary.all ?? 0) + Number(r.cnt);
  });

  return {
    returns: rows as ReturnListItem[],
    total: Number(total),
    summary,
  };
}

// ─── Admin: get single return ─────────────────────────────────────────────────

export async function getReturnById(returnId: number): Promise<ReturnDetail | null> {
  const [row] = await db
    .select({
      id: returnRequests.id,
      returnNumber: returnRequests.returnNumber,
      status: returnRequests.status,
      reason: returnRequests.reason,
      reasonDetails: returnRequests.reasonDetails,
      refundMethod: returnRequests.refundMethod,
      refundAmount: returnRequests.refundAmount,
      adminNotes: returnRequests.adminNotes,
      rejectionReason: returnRequests.rejectionReason,
      approvedAt: returnRequests.approvedAt,
      rejectedAt: returnRequests.rejectedAt,
      receivedAt: returnRequests.receivedAt,
      refundedAt: returnRequests.refundedAt,
      createdAt: returnRequests.createdAt,
      updatedAt: returnRequests.updatedAt,
      orderId: returnRequests.orderId,
      userId: returnRequests.userId,
      orderNumber: orders.orderNumber,
      paymentMethod: orders.paymentMethod,
      orderTotalAmount: orders.totalAmount,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(returnRequests)
    .innerJoin(orders, eq(returnRequests.orderId, orders.id))
    .innerJoin(users, eq(returnRequests.userId, users.id))
    .where(and(eq(returnRequests.id, returnId), isNull(returnRequests.deletedAt)))
    .limit(1);

  return row as ReturnDetail | null;
}

// ─── Admin: update return status ──────────────────────────────────────────────

export async function updateReturnStatus(
  returnId: number,
  action: "approve" | "reject" | "mark_received" | "mark_refunded",
  opts?: {
    refundAmount?: number;
    refundMethod?: RefundMethod;
    adminNotes?: string;
    rejectionReason?: string;
  }
) {
  const now = new Date();
  const setValues: Record<string, unknown> = { updatedAt: now };

  if (opts?.adminNotes !== undefined) setValues.adminNotes = opts.adminNotes;

  switch (action) {
    case "approve":
      setValues.status = "approved";
      setValues.approvedAt = now;
      if (opts?.refundAmount !== undefined)
        setValues.refundAmount = String(opts.refundAmount);
      if (opts?.refundMethod) setValues.refundMethod = opts.refundMethod;
      break;
    case "reject":
      setValues.status = "rejected";
      setValues.rejectedAt = now;
      setValues.rejectionReason = opts?.rejectionReason ?? null;
      break;
    case "mark_received":
      setValues.status = "received";
      setValues.receivedAt = now;
      break;
    case "mark_refunded":
      setValues.status = "refunded";
      setValues.refundedAt = now;
      break;
  }

  await db
    .update(returnRequests)
    .set(setValues)
    .where(eq(returnRequests.id, returnId));
}

// ─── Get Razorpay payment ID for an order ────────────────────────────────────

export async function getRazorpayPaymentId(orderId: number): Promise<string | null> {
  const [txn] = await db
    .select({ gatewayResponse: paymentTransactions.gatewayResponse })
    .from(paymentTransactions)
    .where(
      and(
        eq(paymentTransactions.orderId, orderId),
        eq(paymentTransactions.paymentGateway, "razorpay"),
        eq(paymentTransactions.status, "success")
      )
    )
    .limit(1);

  if (!txn?.gatewayResponse) return null;

  try {
    const parsed = JSON.parse(txn.gatewayResponse) as { razorpayPaymentId?: string; id?: string };
    return parsed.razorpayPaymentId ?? parsed.id ?? null;
  } catch {
    return null;
  }
}

// ─── Mark payment transaction as refunded ────────────────────────────────────

export async function markTransactionRefunded(orderId: number, refundAmount: number) {
  await db
    .update(paymentTransactions)
    .set({
      status: "refunded",
      refundAmount: String(refundAmount),
      refundedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(paymentTransactions.orderId, orderId),
        eq(paymentTransactions.paymentGateway, "razorpay")
      )
    );

  await db
    .update(orders)
    .set({ paymentStatus: "refunded", status: "refunded", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

// ─── User: get returns for an order ──────────────────────────────────────────

export async function getReturnForOrder(
  orderId: number,
  userId: number
): Promise<{ id: number; returnNumber: string; status: ReturnStatus } | null> {
  const [row] = await db
    .select({
      id: returnRequests.id,
      returnNumber: returnRequests.returnNumber,
      status: returnRequests.status,
    })
    .from(returnRequests)
    .where(
      and(
        eq(returnRequests.orderId, orderId),
        eq(returnRequests.userId, userId),
        isNull(returnRequests.deletedAt)
      )
    )
    .orderBy(desc(returnRequests.createdAt))
    .limit(1);

  return row as { id: number; returnNumber: string; status: ReturnStatus } | null;
}

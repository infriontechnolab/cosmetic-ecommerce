import { db } from "@/db";
import { paymentTransactions, orders, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// ─── Create a payment transaction record ──────────────────────────────────────

export async function createPaymentTransaction(data: {
  orderId: number;
  paymentGateway: string;
  transactionId?: string;
  paymentMethod?: string;
  amount: number;
  status?: "pending" | "processing" | "success" | "failed";
  gatewayResponse?: string;
}): Promise<number> {
  const result = await db.insert(paymentTransactions).values({
    orderId: data.orderId,
    paymentGateway: data.paymentGateway,
    transactionId: data.transactionId ?? null,
    paymentMethod: data.paymentMethod ?? null,
    amount: String(data.amount),
    currency: "INR",
    status: data.status ?? "pending",
    gatewayResponse: data.gatewayResponse ?? null,
  });
  return Number(result[0].insertId);
}

// ─── Update transaction after Razorpay response ───────────────────────────────

export async function updatePaymentTransaction(
  id: number,
  updates: {
    transactionId?: string;
    status?: "pending" | "processing" | "success" | "failed";
    gatewayResponse?: string;
    errorCode?: string;
    errorMessage?: string;
  }
) {
  await db
    .update(paymentTransactions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(paymentTransactions.id, id));
}

// ─── Order status helpers ─────────────────────────────────────────────────────

export async function markOrderPaid(orderId: number) {
  // Fetch order to get userId and totalAmount for loyalty points
  const [order] = await db
    .select({ userId: orders.userId, totalAmount: orders.totalAmount })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  await db
    .update(orders)
    .set({ status: "confirmed", paymentStatus: "completed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Award 1 point per ₹100 spent (atomic increment)
  if (order) {
    const pointsToAdd = Math.floor(Number(order.totalAmount) / 100);
    if (pointsToAdd > 0) {
      await db
        .update(users)
        .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${pointsToAdd}`, updatedAt: new Date() })
        .where(eq(users.id, order.userId));
    }
  }
}

export async function markOrderPaymentFailed(orderId: number) {
  await db
    .update(orders)
    .set({ paymentStatus: "failed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

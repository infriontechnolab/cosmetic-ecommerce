import { db } from "@/db";
import { paymentTransactions, orders } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  await db
    .update(orders)
    .set({ status: "confirmed", paymentStatus: "completed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

export async function markOrderPaymentFailed(orderId: number) {
  await db
    .update(orders)
    .set({ paymentStatus: "failed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}

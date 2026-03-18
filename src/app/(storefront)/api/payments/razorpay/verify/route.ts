import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { paymentTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markOrderPaid, updatePaymentTransaction } from "@/db/queries/payments";

/**
 * POST /api/payments/razorpay/verify
 * Called by the client after successful Razorpay payment.
 * Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      (await req.json()) as {
        orderId: number;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      };

    // Verify signature: HMAC-SHA256 of "razorpayOrderId|razorpayPaymentId"
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update payment transaction record
    const [txn] = await db
      .select({ id: paymentTransactions.id })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, razorpayOrderId))
      .limit(1);

    if (txn) {
      await updatePaymentTransaction(txn.id, {
        status: "success",
        gatewayResponse: JSON.stringify({ razorpayPaymentId, razorpaySignature }),
      });
    }

    // Mark order as paid
    await markOrderPaid(orderId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/payments/razorpay/verify]", err);
    return NextResponse.json(
      { error: "Payment verification error" },
      { status: 500 }
    );
  }
}

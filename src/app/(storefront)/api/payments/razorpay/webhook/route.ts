import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { paymentTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { markOrderPaid, markOrderPaymentFailed, updatePaymentTransaction } from "@/db/queries/payments";

/**
 * POST /api/payments/razorpay/webhook
 * Razorpay sends payment events here.
 * Set this URL in your Razorpay dashboard → Webhooks.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

    // Verify webhook signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: {
          entity: {
            id: string;
            order_id: string;
            status: string;
            error_code?: string;
            error_description?: string;
          };
        };
      };
    };

    const payment = event.payload.payment?.entity;
    if (!payment) return NextResponse.json({ received: true });

    // Find matching transaction
    const [txn] = await db
      .select({ id: paymentTransactions.id, orderId: paymentTransactions.orderId })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.transactionId, payment.order_id))
      .limit(1);

    if (!txn) return NextResponse.json({ received: true });

    if (event.event === "payment.captured") {
      await updatePaymentTransaction(txn.id, {
        status: "success",
        gatewayResponse: JSON.stringify(payment),
      });
      await markOrderPaid(Number(txn.orderId));
    } else if (event.event === "payment.failed") {
      await updatePaymentTransaction(txn.id, {
        status: "failed",
        errorCode: payment.error_code,
        errorMessage: payment.error_description,
        gatewayResponse: JSON.stringify(payment),
      });
      await markOrderPaymentFailed(Number(txn.orderId));
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[POST /api/payments/razorpay/webhook]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

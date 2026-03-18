import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/auth";
import { createPaymentTransaction } from "@/db/queries/payments";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * POST /api/payments/razorpay/create-order
 * Body: { orderId: number; amount: number }   (amount in ₹)
 * Returns: { razorpayOrderId, amount, currency, keyId }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { orderId, amount } = (await req.json()) as {
      orderId: number;
      amount: number;
    };

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "orderId and amount are required" },
        { status: 400 }
      );
    }

    // Create Razorpay order (amount in paise)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${orderId}`,
    });

    // Record pending payment transaction
    await createPaymentTransaction({
      orderId,
      paymentGateway: "razorpay",
      transactionId: rzpOrder.id,
      amount,
      status: "pending",
      gatewayResponse: JSON.stringify(rzpOrder),
    });

    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
      },
    });
  } catch (err) {
    console.error("[POST /api/payments/razorpay/create-order]", err);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}

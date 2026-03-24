import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrder, type CreateOrderInput } from "@/db/queries/orders";
import { getUserProfile, deductLoyaltyPoints } from "@/db/queries/user-profile";
import { markOrderPaid } from "@/db/queries/payments";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * POST /api/orders
 * Creates an order from the current cart contents.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : undefined;

    const body = (await req.json()) as {
      items: CreateOrderInput["items"];
      shipping: CreateOrderInput["shipping"];
      paymentMethod: "razorpay" | "cod";
      discountAmount?: number;
      discountCodeId?: number;
      pointsRedeemed?: number;
    };

    if (!body.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!body.shipping?.fullName || !body.shipping?.addressLine1) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Validate points redemption
    const pointsRedeemed = Math.max(0, Math.floor(body.pointsRedeemed ?? 0));
    if (pointsRedeemed > 0) {
      if (!userId) {
        return NextResponse.json({ error: "Sign in to redeem points" }, { status: 401 });
      }
      const profile = await getUserProfile(userId);
      if (!profile || profile.loyaltyPoints < pointsRedeemed) {
        return NextResponse.json({ error: "Insufficient loyalty points" }, { status: 400 });
      }
    }

    const subtotal = body.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const couponDiscount = Math.min(body.discountAmount ?? 0, subtotal);
    const pointsDiscount = Math.floor(pointsRedeemed / 100); // 100 pts = ₹1
    // Cap combined discount so taxable amount never goes below 0
    const discountAmount = Math.min(couponDiscount + pointsDiscount, subtotal);
    const shippingAmount = subtotal - discountAmount >= 999 ? 0 : 99;

    const { orderId, orderNumber } = await createOrder({
      userId,
      paymentMethod: body.paymentMethod,
      items: body.items,
      shipping: body.shipping,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountCodeId: body.discountCodeId,
      shippingAmount,
    });

    // Deduct redeemed points after order is created
    if (pointsRedeemed > 0 && userId) {
      await deductLoyaltyPoints(userId, pointsRedeemed);
    }

    // COD orders are confirmed immediately — award loyalty points + send email
    // (Razorpay orders handle both via the webhook/verify flow)
    if (body.paymentMethod === "cod") {
      await markOrderPaid(orderId);
      sendOrderConfirmation(orderId); // fire-and-forget, never blocks response
    }

    return NextResponse.json({ orderId, orderNumber, shippingAmount });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

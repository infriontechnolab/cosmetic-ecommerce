import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrder, type CreateOrderInput } from "@/db/queries/orders";

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

    const subtotal = body.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const discountAmount = body.discountAmount ?? 0;
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

    return NextResponse.json({ orderId, orderNumber, shippingAmount });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

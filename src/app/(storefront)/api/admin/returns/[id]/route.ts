import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getReturnById,
  updateReturnStatus,
  getRazorpayPaymentId,
  markTransactionRefunded,
  type RefundMethod,
} from "@/db/queries/returns";
import Razorpay from "razorpay";

function isAdmin(email: string | null | undefined) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session?.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const returnId = Number(id);
    if (isNaN(returnId)) {
      return NextResponse.json({ error: "Invalid return id" }, { status: 400 });
    }

    const body = (await req.json()) as {
      action: "approve" | "reject" | "mark_received" | "mark_refunded";
      refundAmount?: number;
      refundMethod?: RefundMethod;
      adminNotes?: string;
      rejectionReason?: string;
    };

    if (!body.action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    // If issuing Razorpay refund, process it first
    if (body.action === "mark_refunded") {
      const returnReq = await getReturnById(returnId);
      if (!returnReq) {
        return NextResponse.json({ error: "Return not found" }, { status: 404 });
      }

      if (returnReq.paymentMethod === "razorpay") {
        const paymentId = await getRazorpayPaymentId(returnReq.orderId);
        const refundAmountPaise = Math.round(
          Number(returnReq.refundAmount ?? returnReq.orderTotalAmount) * 100
        );

        if (paymentId) {
          try {
            await razorpay.payments.refund(paymentId, {
              amount: refundAmountPaise,
              speed: "normal",
              notes: { returnNumber: returnReq.returnNumber },
            });
          } catch (rzpErr) {
            console.error("[Razorpay refund error]", rzpErr);
            return NextResponse.json(
              { error: "Razorpay refund failed. Check Razorpay dashboard." },
              { status: 502 }
            );
          }
        }

        await markTransactionRefunded(
          returnReq.orderId,
          Number(returnReq.refundAmount ?? returnReq.orderTotalAmount)
        );
      } else {
        // COD — just mark the order refunded (no gateway call)
        await markTransactionRefunded(
          returnReq.orderId,
          Number(returnReq.refundAmount ?? returnReq.orderTotalAmount)
        );
      }
    }

    await updateReturnStatus(returnId, body.action, {
      refundAmount: body.refundAmount,
      refundMethod: body.refundMethod,
      adminNotes: body.adminNotes,
      rejectionReason: body.rejectionReason,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/returns/[id]]", err);
    return NextResponse.json({ error: "Failed to update return" }, { status: 500 });
  }
}

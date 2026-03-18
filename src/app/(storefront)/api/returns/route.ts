import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createReturnRequest, type ReturnReason, type RefundMethod } from "@/db/queries/returns";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderId: number;
      reason: ReturnReason;
      reasonDetails?: string;
      refundMethod: RefundMethod;
    };

    if (!body.orderId || !body.reason || !body.refundMethod) {
      return NextResponse.json(
        { error: "orderId, reason, and refundMethod are required" },
        { status: 400 }
      );
    }

    const result = await createReturnRequest({
      orderId: body.orderId,
      userId: Number(session.user.id),
      reason: body.reason,
      reasonDetails: body.reasonDetails,
      refundMethod: body.refundMethod,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create return";
    console.error("[POST /api/returns]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

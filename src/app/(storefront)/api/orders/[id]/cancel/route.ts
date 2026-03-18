import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelUserOrder } from "@/db/queries/user-orders";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : undefined;

    const result = await cancelUserOrder(Number(session.user.id), orderId, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/orders/[id]/cancel]", err);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}

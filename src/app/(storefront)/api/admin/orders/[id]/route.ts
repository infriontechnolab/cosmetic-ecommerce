import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateAdminOrder, type OrderStatus } from "@/db/queries/admin-orders";

function isAdmin(email: string | null | undefined) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  return !!email && admins.includes(email.toLowerCase());
}

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
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const body = (await req.json()) as {
      status?: OrderStatus;
      trackingNumber?: string;
      courierPartner?: string;
      adminNotes?: string;
    };

    await updateAdminOrder(orderId, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

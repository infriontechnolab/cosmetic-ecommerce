import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { adjustStock, type ChangeType } from "@/db/queries/admin-inventory";

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
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = (await req.json()) as {
      change: number;
      changeType: ChangeType;
      referenceNumber?: string;
      notes?: string;
    };

    if (typeof body.change !== "number" || !body.changeType) {
      return NextResponse.json(
        { error: "change (number) and changeType are required" },
        { status: 400 }
      );
    }

    const result = await adjustStock(productId, body.change, body.changeType, {
      referenceNumber: body.referenceNumber,
      notes: body.notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, newStock: result.newStock });
  } catch (err) {
    console.error("[PATCH /api/admin/inventory/[id]]", err);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}

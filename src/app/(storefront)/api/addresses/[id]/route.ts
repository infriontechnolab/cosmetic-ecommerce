import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserAddress, deleteUserAddress, setDefaultAddress } from "@/db/queries/user-profile";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await params;
    const addressId = Number(id);
    if (!addressId) return NextResponse.json({ error: "Invalid address id" }, { status: 400 });
    const data = await req.json();
    if (data.setDefault) {
      await setDefaultAddress(addressId, Number(session.user.id));
    } else {
      await updateUserAddress(addressId, Number(session.user.id), data);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/addresses/:id]", err);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await params;
    const addressId = Number(id);
    if (!addressId) return NextResponse.json({ error: "Invalid address id" }, { status: 400 });
    await deleteUserAddress(addressId, Number(session.user.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/addresses/:id]", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}

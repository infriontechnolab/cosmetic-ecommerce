import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAddresses, createUserAddress } from "@/db/queries/user-profile";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const addresses = await getUserAddresses(Number(session.user.id));
    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("[GET /api/addresses]", err);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const data = await req.json();
    if (!data.fullName || !data.phone || !data.addressLine1 || !data.city || !data.state || !data.pincode) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }
    if (String(data.pincode).length > 10) {
      return NextResponse.json({ error: "Pincode must be 10 characters or fewer" }, { status: 400 });
    }
    const result = await createUserAddress(Number(session.user.id), data);
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    console.error("[POST /api/addresses]", err);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}

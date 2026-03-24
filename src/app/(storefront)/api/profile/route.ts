import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserProfile, updateUserProfile } from "@/db/queries/user-profile";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const profile = await getUserProfile(Number(session.user.id));
    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { name, phone } = (await req.json()) as { name?: string; phone?: string };
    await updateUserProfile(Number(session.user.id), { name, phone });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

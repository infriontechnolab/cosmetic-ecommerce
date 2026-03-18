import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateDiscountCode } from "@/db/queries/discounts";

/**
 * POST /api/discounts/validate
 * Body: { code: string; subtotal: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = (await req.json()) as {
      code: string;
      subtotal: number;
    };

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "code and subtotal are required" },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : undefined;

    const result = await validateDiscountCode(code, subtotal, userId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/discounts/validate]", err);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getQuizResult, upsertQuizResult, type QuizResultData } from "@/db/queries/quiz";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getQuizResult(Number(session.user.id));
  if (!result) {
    return NextResponse.json({ error: "No quiz result found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as QuizResultData;

  await upsertQuizResult(Number(session.user.id), body);

  return NextResponse.json({ ok: true });
}

import { db } from "@/db";
import { quizResults } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface QuizResultData {
  skinType?: string;
  primaryConcern?: string;
  undertone?: string;
  recommendedShades?: string[];
  recommendedProducts?: string[];
}

export async function upsertQuizResult(userId: number, data: QuizResultData) {
  const now = new Date();
  await db
    .insert(quizResults)
    .values({
      userId,
      skinType: data.skinType ?? null,
      primaryConcern: data.primaryConcern ?? null,
      undertone: data.undertone ?? null,
      recommendedShades: data.recommendedShades ? JSON.stringify(data.recommendedShades) : null,
      recommendedProducts: data.recommendedProducts ? JSON.stringify(data.recommendedProducts) : null,
      completedAt: now,
      updatedAt: now,
    })
    .onDuplicateKeyUpdate({
      set: {
        skinType: data.skinType ?? null,
        primaryConcern: data.primaryConcern ?? null,
        undertone: data.undertone ?? null,
        recommendedShades: data.recommendedShades ? JSON.stringify(data.recommendedShades) : null,
        recommendedProducts: data.recommendedProducts ? JSON.stringify(data.recommendedProducts) : null,
        updatedAt: now,
      },
    });
}

export async function getQuizResult(userId: number) {
  const [row] = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    skinType: row.skinType,
    primaryConcern: row.primaryConcern,
    undertone: row.undertone,
    recommendedShades: row.recommendedShades ? (JSON.parse(row.recommendedShades) as string[]) : [],
    recommendedProducts: row.recommendedProducts ? (JSON.parse(row.recommendedProducts) as string[]) : [],
    completedAt: row.completedAt,
    updatedAt: row.updatedAt,
  };
}

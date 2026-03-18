import { db } from "@/db";
import { discountCodes, discountUsage } from "@/db/schema";
import { and, eq, isNull, lte, gte, sql } from "drizzle-orm";

export type DiscountResult =
  | { valid: true; discountId: number; type: "percentage" | "fixed_amount"; value: number; amount: number; message: string }
  | { valid: false; error: string };

export async function validateDiscountCode(
  code: string,
  subtotal: number,
  userId?: number
): Promise<DiscountResult> {
  const now = new Date();

  const [dc] = await db
    .select()
    .from(discountCodes)
    .where(
      and(
        eq(discountCodes.code, code.toUpperCase()),
        eq(discountCodes.isActive, true),
        isNull(discountCodes.deletedAt),
        lte(discountCodes.validFrom, now),
        gte(discountCodes.validUntil, now)
      )
    )
    .limit(1);

  if (!dc) return { valid: false, error: "Invalid or expired promo code." };

  // Min order value check
  if (dc.minOrderValue && subtotal < Number(dc.minOrderValue)) {
    return {
      valid: false,
      error: `Minimum order of ₹${Number(dc.minOrderValue).toLocaleString("en-IN")} required.`,
    };
  }

  // Global usage limit
  if (dc.usageLimit && (dc.timesUsed ?? 0) >= dc.usageLimit) {
    return { valid: false, error: "This promo code has reached its usage limit." };
  }

  // Per-user limit (only for logged-in users)
  if (userId && dc.usageLimitPerUser) {
    const [usage] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(discountUsage)
      .where(
        and(
          eq(discountUsage.discountCodeId, dc.id),
          eq(discountUsage.userId, userId)
        )
      );
    if (Number(usage.count) >= dc.usageLimitPerUser) {
      return { valid: false, error: "You've already used this promo code." };
    }
  }

  // Calculate discount amount
  let amount =
    dc.discountType === "percentage"
      ? (subtotal * Number(dc.discountValue)) / 100
      : Number(dc.discountValue);

  if (dc.maxDiscountAmount) {
    amount = Math.min(amount, Number(dc.maxDiscountAmount));
  }
  amount = Math.min(amount, subtotal); // can't discount more than subtotal

  return {
    valid: true,
    discountId: Number(dc.id),
    type: dc.discountType,
    value: Number(dc.discountValue),
    amount: Math.round(amount * 100) / 100,
    message: dc.description ?? `${dc.discountType === "percentage" ? dc.discountValue + "%" : "₹" + dc.discountValue} off applied!`,
  };
}

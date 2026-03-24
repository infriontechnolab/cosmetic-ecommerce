import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { eq, like, desc, count, sql, and, isNull, or } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscountListItem {
  id: number;
  code: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount";
  discountValue: string;
  minOrderValue: string | null;
  maxDiscountAmount: string | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  timesUsed: number | null;
  isActive: boolean | null;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt: Date | null;
}

export interface DiscountInput {
  code: string;
  description?: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number;
  isActive?: boolean;
  validFrom: Date;
  validUntil: Date;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listDiscounts({
  search,
  status = "all",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<{ discounts: DiscountListItem[]; total: number }> {
  const conditions = [isNull(discountCodes.deletedAt)]

  if (search) {
    conditions.push(like(discountCodes.code, `%${search}%`))
  }
  if (status === "active") {
    conditions.push(eq(discountCodes.isActive, true))
  } else if (status === "inactive") {
    conditions.push(eq(discountCodes.isActive, false))
  }

  const where = and(...conditions)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: discountCodes.id,
        code: discountCodes.code,
        description: discountCodes.description,
        discountType: discountCodes.discountType,
        discountValue: discountCodes.discountValue,
        minOrderValue: discountCodes.minOrderValue,
        maxDiscountAmount: discountCodes.maxDiscountAmount,
        usageLimit: discountCodes.usageLimit,
        usageLimitPerUser: discountCodes.usageLimitPerUser,
        timesUsed: discountCodes.timesUsed,
        isActive: discountCodes.isActive,
        validFrom: discountCodes.validFrom,
        validUntil: discountCodes.validUntil,
        createdAt: discountCodes.createdAt,
      })
      .from(discountCodes)
      .where(where)
      .orderBy(desc(discountCodes.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: count() })
      .from(discountCodes)
      .where(where),
  ])

  return { discounts: rows as DiscountListItem[], total: Number(total) }
}

// ─── Single ───────────────────────────────────────────────────────────────────

export async function getDiscount(id: number): Promise<DiscountListItem | null> {
  const [row] = await db
    .select({
      id: discountCodes.id,
      code: discountCodes.code,
      description: discountCodes.description,
      discountType: discountCodes.discountType,
      discountValue: discountCodes.discountValue,
      minOrderValue: discountCodes.minOrderValue,
      maxDiscountAmount: discountCodes.maxDiscountAmount,
      usageLimit: discountCodes.usageLimit,
      usageLimitPerUser: discountCodes.usageLimitPerUser,
      timesUsed: discountCodes.timesUsed,
      isActive: discountCodes.isActive,
      validFrom: discountCodes.validFrom,
      validUntil: discountCodes.validUntil,
      createdAt: discountCodes.createdAt,
    })
    .from(discountCodes)
    .where(and(eq(discountCodes.id, id), isNull(discountCodes.deletedAt)))
    .limit(1)

  return (row as DiscountListItem) ?? null
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createDiscount(data: DiscountInput): Promise<number> {
  const [result] = await db.insert(discountCodes).values({
    code: data.code.toUpperCase(),
    description: data.description ?? null,
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    minOrderValue: data.minOrderValue != null ? String(data.minOrderValue) : null,
    maxDiscountAmount: data.maxDiscountAmount != null ? String(data.maxDiscountAmount) : null,
    usageLimit: data.usageLimit ?? null,
    usageLimitPerUser: data.usageLimitPerUser ?? 1,
    isActive: data.isActive ?? true,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
  })
  return Number(result.insertId)
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateDiscount(id: number, data: Partial<DiscountInput>): Promise<void> {
  await db
    .update(discountCodes)
    .set({
      ...(data.code !== undefined ? { code: data.code.toUpperCase() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
      ...(data.discountValue !== undefined ? { discountValue: String(data.discountValue) } : {}),
      ...(data.minOrderValue !== undefined ? { minOrderValue: data.minOrderValue != null ? String(data.minOrderValue) : null } : {}),
      ...(data.maxDiscountAmount !== undefined ? { maxDiscountAmount: data.maxDiscountAmount != null ? String(data.maxDiscountAmount) : null } : {}),
      ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
      ...(data.usageLimitPerUser !== undefined ? { usageLimitPerUser: data.usageLimitPerUser } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.validFrom !== undefined ? { validFrom: data.validFrom } : {}),
      ...(data.validUntil !== undefined ? { validUntil: data.validUntil } : {}),
      updatedAt: new Date(),
    })
    .where(eq(discountCodes.id, id))
}

// ─── Soft delete ──────────────────────────────────────────────────────────────

export async function deleteDiscount(id: number): Promise<void> {
  await db
    .update(discountCodes)
    .set({ deletedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(discountCodes.id, id))
}

import { db } from "@/db";
import { products, inventoryLogs, categories } from "@/db/schema";
import { eq, and, lte, like, desc, count, isNull, or, sql } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryRow {
  id: number;
  sku: string;
  name: string;
  slug: string;
  categoryName: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean | null;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryLogRow {
  id: number;
  changeType: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: Date | null;
}

export type ChangeType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "damage"
  | "expired";

// ─── List inventory ───────────────────────────────────────────────────────────

export async function listInventory(opts: {
  search?: string;
  filter?: "all" | "low_stock" | "out_of_stock";
  page?: number;
  perPage?: number;
}): Promise<{ rows: InventoryRow[]; total: number; summary: { total: number; lowStock: number; outOfStock: number } }> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const offset = (page - 1) * perPage;

  const conditions = [isNull(products.deletedAt)];

  if (opts.filter === "out_of_stock") {
    conditions.push(eq(products.stockQuantity, 0));
  } else if (opts.filter === "low_stock") {
    conditions.push(
      and(
        sql`${products.stockQuantity} > 0`,
        sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
      )!
    );
  }

  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(or(like(products.name, term), like(products.sku, term))!);
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [rows, [{ total }], summaryRows] = await Promise.all([
    db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        slug: products.slug,
        categoryName: categories.name,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        isActive: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(products.stockQuantity)
      .limit(perPage)
      .offset(offset),

    db
      .select({ total: count() })
      .from(products)
      .where(where),

    // Summary counts (always against all non-deleted)
    db
      .select({
        total: count(),
        lowStock: sql<number>`SUM(CASE WHEN ${products.stockQuantity} > 0 AND ${products.stockQuantity} <= ${products.lowStockThreshold} THEN 1 ELSE 0 END)`,
        outOfStock: sql<number>`SUM(CASE WHEN ${products.stockQuantity} = 0 THEN 1 ELSE 0 END)`,
      })
      .from(products)
      .where(isNull(products.deletedAt)),
  ]);

  const summary = {
    total: Number(summaryRows[0]?.total ?? 0),
    lowStock: Number(summaryRows[0]?.lowStock ?? 0),
    outOfStock: Number(summaryRows[0]?.outOfStock ?? 0),
  };

  return {
    rows: rows.map((r) => ({
      ...r,
      isActive: r.isActive ?? false,
      status:
        r.stockQuantity === 0
          ? "out_of_stock"
          : r.stockQuantity <= r.lowStockThreshold
          ? "low_stock"
          : "in_stock",
    })),
    total: Number(total),
    summary,
  };
}

// ─── Adjust stock ─────────────────────────────────────────────────────────────

export async function adjustStock(
  productId: number,
  change: number,
  changeType: ChangeType,
  opts?: { referenceNumber?: string; notes?: string }
): Promise<{ success: boolean; newStock: number; error?: string }> {
  const [product] = await db
    .select({ stockQuantity: products.stockQuantity })
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);

  if (!product) return { success: false, newStock: 0, error: "Product not found" };

  const before = product.stockQuantity;
  const after = Math.max(0, before + change);

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({ stockQuantity: after, updatedAt: new Date() })
      .where(eq(products.id, productId));

    await tx.insert(inventoryLogs).values({
      productId,
      changeType,
      quantityBefore: before,
      quantityChange: change,
      quantityAfter: after,
      referenceNumber: opts?.referenceNumber ?? null,
      notes: opts?.notes ?? null,
    });
  });

  return { success: true, newStock: after };
}

// ─── Get product stock + recent logs ─────────────────────────────────────────

export async function getInventoryDetail(productId: number): Promise<{
  product: { id: number; sku: string; name: string; stockQuantity: number; lowStockThreshold: number } | null;
  logs: InventoryLogRow[];
}> {
  const [product] = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      stockQuantity: products.stockQuantity,
      lowStockThreshold: products.lowStockThreshold,
    })
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);

  if (!product) return { product: null, logs: [] };

  const logs = await db
    .select({
      id: inventoryLogs.id,
      changeType: inventoryLogs.changeType,
      quantityBefore: inventoryLogs.quantityBefore,
      quantityChange: inventoryLogs.quantityChange,
      quantityAfter: inventoryLogs.quantityAfter,
      referenceNumber: inventoryLogs.referenceNumber,
      notes: inventoryLogs.notes,
      createdAt: inventoryLogs.createdAt,
    })
    .from(inventoryLogs)
    .where(eq(inventoryLogs.productId, productId))
    .orderBy(desc(inventoryLogs.createdAt))
    .limit(50);

  return { product, logs };
}

import { db } from "@/db";
import { products, categories, brands, productImages } from "@/db/schema";
import { eq, like, or, isNull, sql, desc, asc, and } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminProductRow = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  salePrice: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryName: string;
  brandName: string | null;
  primaryImage: string | null;
  createdAt: Date | string | null;
};

export type AdminProductDetail = {
  id: number;
  categoryId: number;
  brandId: number | null;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  ingredients: string | null;
  howToUse: string | null;
  price: string;
  salePrice: string | null;
  priceOffPercent: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  bgColor: string | null;
  badgeType: string | null;
  badgeText: string | null;
  gwpText: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type CreateProductInput = {
  categoryId: number;
  brandId?: number | null;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  ingredients?: string;
  howToUse?: string;
  price: number;
  salePrice?: number | null;
  priceOffPercent?: number | null;
  stockQuantity?: number;
  lowStockThreshold?: number;
  bgColor?: string;
  badgeType?: "new" | "sale" | "hot" | "low" | null;
  badgeText?: string;
  gwpText?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
};

// ─── List (with search + pagination) ─────────────────────────────────────────

export async function listAdminProducts({
  search = "",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<{ rows: AdminProductRow[]; total: number }> {
  const offset = (page - 1) * perPage;

  const baseWhere = isNull(products.deletedAt);
  const searchWhere = search
    ? or(
        like(products.name, `%${search}%`),
        like(products.sku, `%${search}%`)
      )
    : undefined;

  const where = searchWhere ? and(baseWhere, searchWhere) : baseWhere;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      salePrice: products.salePrice,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
      brandName: brands.name,
      primaryImage: sql<string>`(
        SELECT image_url FROM product_images
        WHERE product_id = ${products.id} AND is_primary = 1
        LIMIT 1
      )`.as("primary_image"),
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(perPage)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(products)
    .where(where);

  return {
    rows: rows.map((r) => ({
      ...r,
      id: Number(r.id),
      price: String(r.price),
      salePrice: r.salePrice ? String(r.salePrice) : null,
      isActive: Boolean(r.isActive),
      isFeatured: Boolean(r.isFeatured),
    })),
    total: Number(count),
  };
}

// ─── Single product for edit form ────────────────────────────────────────────

export async function getAdminProductById(
  id: number
): Promise<AdminProductDetail | null> {
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), isNull(products.deletedAt)))
    .limit(1);

  if (!row) return null;

  return {
    id: Number(row.id),
    categoryId: Number(row.categoryId),
    brandId: row.brandId ? Number(row.brandId) : null,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.shortDescription,
    ingredients: row.ingredients,
    howToUse: row.howToUse,
    price: String(row.price),
    salePrice: row.salePrice ? String(row.salePrice) : null,
    priceOffPercent: row.priceOffPercent ?? null,
    stockQuantity: row.stockQuantity,
    lowStockThreshold: row.lowStockThreshold,
    bgColor: row.bgColor,
    badgeType: row.badgeType,
    badgeText: row.badgeText,
    gwpText: row.gwpText,
    isActive: Boolean(row.isActive),
    isFeatured: Boolean(row.isFeatured),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

// ─── Dropdown data ────────────────────────────────────────────────────────────

export async function getAllCategories() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(isNull(categories.deletedAt), eq(categories.isActive, true)))
    .orderBy(asc(categories.name));
}

export async function getAllBrands() {
  return db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(and(isNull(brands.deletedAt), eq(brands.isActive, true)))
    .orderBy(asc(brands.name));
}

// ─── Admin stats ─────────────────────────────────────────────────────────────

export async function getAdminProductStats() {
  const [row] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END)`,
      outOfStock: sql<number>`SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END)`,
      lowStock: sql<number>`SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= low_stock_threshold THEN 1 ELSE 0 END)`,
    })
    .from(products)
    .where(isNull(products.deletedAt));

  return {
    total: Number(row.total),
    active: Number(row.active),
    outOfStock: Number(row.outOfStock),
    lowStock: Number(row.lowStock),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function adminCreateProduct(data: CreateProductInput) {
  const result = await db.insert(products).values({
    categoryId: data.categoryId,
    brandId: data.brandId ?? null,
    sku: data.sku,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    shortDescription: data.shortDescription || null,
    ingredients: data.ingredients || null,
    howToUse: data.howToUse || null,
    price: String(data.price),
    salePrice: data.salePrice ? String(data.salePrice) : null,
    priceOffPercent: data.priceOffPercent ?? null,
    stockQuantity: data.stockQuantity ?? 0,
    lowStockThreshold: data.lowStockThreshold ?? 10,
    bgColor: data.bgColor || null,
    badgeType: data.badgeType ?? null,
    badgeText: data.badgeText || null,
    gwpText: data.gwpText || null,
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? false,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
  });
  return Number(result[0].insertId);
}

export async function adminUpdateProduct(
  id: number,
  data: Partial<CreateProductInput>
) {
  await db
    .update(products)
    .set({
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
      ...(data.sku !== undefined && { sku: data.sku }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription || null }),
      ...(data.ingredients !== undefined && { ingredients: data.ingredients || null }),
      ...(data.howToUse !== undefined && { howToUse: data.howToUse || null }),
      ...(data.price !== undefined && { price: String(data.price) }),
      ...(data.salePrice !== undefined && { salePrice: data.salePrice ? String(data.salePrice) : null }),
      ...(data.priceOffPercent !== undefined && { priceOffPercent: data.priceOffPercent }),
      ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
      ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
      ...(data.bgColor !== undefined && { bgColor: data.bgColor || null }),
      ...(data.badgeType !== undefined && { badgeType: data.badgeType }),
      ...(data.badgeText !== undefined && { badgeText: data.badgeText || null }),
      ...(data.gwpText !== undefined && { gwpText: data.gwpText || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id));
}

export async function adminDeleteProduct(id: number) {
  await db
    .update(products)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(products.id, id));
}

// ─── Product Images ───────────────────────────────────────────────────────────

export type AdminProductImage = {
  id: number;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
};

export async function getAdminProductImages(productId: number): Promise<AdminProductImage[]> {
  const rows = await db
    .select({
      id: productImages.id,
      imageUrl: productImages.imageUrl,
      thumbnailUrl: productImages.thumbnailUrl,
      altText: productImages.altText,
      displayOrder: productImages.displayOrder,
      isPrimary: productImages.isPrimary,
    })
    .from(productImages)
    .where(and(eq(productImages.productId, productId), isNull(productImages.deletedAt)))
    .orderBy(desc(productImages.isPrimary), asc(productImages.displayOrder));

  return rows.map((r) => ({
    ...r,
    id: Number(r.id),
    displayOrder: Number(r.displayOrder),
    isPrimary: Boolean(r.isPrimary),
  }));
}

export async function addProductImage(
  productId: number,
  imageUrl: string,
  altText?: string,
  isPrimary?: boolean
): Promise<number> {
  // If marking as primary, unset any existing primary first
  if (isPrimary) {
    await db
      .update(productImages)
      .set({ isPrimary: false })
      .where(and(eq(productImages.productId, productId), isNull(productImages.deletedAt)));
  }

  const result = await db.insert(productImages).values({
    productId,
    imageUrl,
    altText: altText || null,
    isPrimary: isPrimary ?? false,
    displayOrder: 0,
  });
  return Number(result[0].insertId);
}

export async function setProductImagePrimary(productId: number, imageId: number): Promise<void> {
  await db
    .update(productImages)
    .set({ isPrimary: false })
    .where(and(eq(productImages.productId, productId), isNull(productImages.deletedAt)));

  await db
    .update(productImages)
    .set({ isPrimary: true })
    .where(eq(productImages.id, imageId));
}

export async function removeProductImage(imageId: number): Promise<void> {
  await db
    .update(productImages)
    .set({ deletedAt: new Date() })
    .where(eq(productImages.id, imageId));
}

"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  type CreateProductInput,
} from "@/db/queries/admin-products";
import { revalidatePath } from "next/cache";

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!session?.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/");
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const data = extractProductFormData(formData);
  const id = await adminCreateProduct(data);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect(`/admin/products/${id}/edit`);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();

  const data = extractProductFormData(formData);
  await adminUpdateProduct(id, data);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/products");
  redirect(`/admin/products/${id}/edit?saved=1`);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: number) {
  await requireAdmin();

  await adminDeleteProduct(id);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

// ─── Helper: parse FormData → CreateProductInput ──────────────────────────────

function extractProductFormData(formData: FormData): CreateProductInput {
  const str = (key: string) => (formData.get(key) as string | null)?.trim() ?? "";
  const num = (key: string) => {
    const v = str(key);
    return v ? parseFloat(v) : undefined;
  };
  const bool = (key: string) => formData.get(key) === "on" || formData.get(key) === "true";

  return {
    categoryId: parseInt(str("categoryId")),
    brandId: str("brandId") ? parseInt(str("brandId")) : null,
    sku: str("sku"),
    name: str("name"),
    slug: str("slug"),
    description: str("description") || undefined,
    shortDescription: str("shortDescription") || undefined,
    ingredients: str("ingredients") || undefined,
    howToUse: str("howToUse") || undefined,
    price: parseFloat(str("price")),
    salePrice: num("salePrice") ?? null,
    priceOffPercent: num("priceOffPercent") ? Math.round(num("priceOffPercent")!) : null,
    stockQuantity: parseInt(str("stockQuantity") || "0"),
    lowStockThreshold: parseInt(str("lowStockThreshold") || "10"),
    bgColor: str("bgColor") || undefined,
    badgeType: (str("badgeType") as CreateProductInput["badgeType"]) || null,
    badgeText: str("badgeText") || undefined,
    gwpText: str("gwpText") || undefined,
    isActive: bool("isActive"),
    isFeatured: bool("isFeatured"),
    metaTitle: str("metaTitle") || undefined,
    metaDescription: str("metaDescription") || undefined,
  };
}

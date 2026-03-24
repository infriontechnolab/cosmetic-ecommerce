"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createDiscount, updateDiscount, deleteDiscount } from "@/db/queries/admin-discounts";

async function requireAdmin() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!session?.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/");
  }
}

function parseForm(formData: FormData) {
  const discountType = formData.get("discountType") as "percentage" | "fixed_amount";
  const minOrderValue = formData.get("minOrderValue") ? Number(formData.get("minOrderValue")) : null;
  const maxDiscountAmount =
    discountType === "percentage" && formData.get("maxDiscountAmount")
      ? Number(formData.get("maxDiscountAmount"))
      : null;

  return {
    code: (formData.get("code") as string).trim().toUpperCase(),
    description: (formData.get("description") as string).trim() || undefined,
    discountType,
    discountValue: Number(formData.get("discountValue")),
    minOrderValue,
    maxDiscountAmount,
    usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : null,
    usageLimitPerUser: formData.get("usageLimitPerUser") ? Number(formData.get("usageLimitPerUser")) : 1,
    isActive: formData.get("isActive") === "true",
    validFrom: new Date(formData.get("validFrom") as string),
    validUntil: new Date(formData.get("validUntil") as string),
  };
}

export async function createDiscountAction(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  await createDiscount(data);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function updateDiscountAction(id: number, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  await updateDiscount(id, data);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function deleteDiscountAction(id: number) {
  await requireAdmin();
  await deleteDiscount(id);
  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

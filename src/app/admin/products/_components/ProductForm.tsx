"use client"

import { useRef } from "react"
import type { AdminProductDetail } from "@/db/queries/admin-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InfoCard } from "@/components/admin/InfoCard"
import Link from "next/link"

type Category = { id: number; name: string }
type Brand    = { id: number; name: string }

interface ProductFormProps {
  product?:   AdminProductDetail
  categories: Category[]
  brands:     Brand[]
  action:     (formData: FormData) => Promise<void>
  saved?:     boolean
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/** Shared field wrapper: label + input slot */
function Field({
  label,
  name,
  required,
  children,
}: {
  label: string
  name: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="text-xs font-semibold text-chalk-3 uppercase tracking-wider"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      {children}
    </div>
  )
}

/** Shared class for native <select> elements (kept native for FormData compatibility) */
const selectCls =
  "w-full px-3 py-2 bg-surface border border-border text-sm text-chalk outline-none focus:border-border-hi transition-colors"

const inputCls =
  "bg-surface border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-border-hi"

export default function ProductForm({
  product,
  categories,
  brands,
  action,
  saved,
}: ProductFormProps) {
  const slugRef = useRef<HTMLInputElement>(null)
  const isEdit  = !!product

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit && slugRef.current) {
      slugRef.current.value = slugify(e.target.value)
    }
  }

  return (
    <form action={action} className="space-y-6">
      {saved && (
        <div className="px-4 py-3 bg-acid/10 border border-acid/20 text-sm text-acid font-medium">
          ✓ Changes saved successfully.
        </div>
      )}

      {/* ── Core Info ─────────────────────────────────────────────────────── */}
      <InfoCard title="Core Info">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Product Name" name="name" required>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              onChange={handleNameChange}
              placeholder="e.g. Glow Serum 30ml"
              className={inputCls}
            />
          </Field>

          <Field label="SKU" name="sku" required>
            <Input
              id="sku"
              name="sku"
              required
              defaultValue={product?.sku}
              placeholder="e.g. SKU-001"
              className={inputCls}
            />
          </Field>

          <Field label="Slug" name="slug" required>
            <Input
              id="slug"
              name="slug"
              required
              ref={slugRef}
              defaultValue={product?.slug}
              placeholder="auto-generated from name"
              className={inputCls}
            />
          </Field>

          <Field label="Category" name="categoryId" required>
            {/* Native select — preserves name/value for FormData */}
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className={selectCls}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Brand" name="brandId">
            <select
              id="brandId"
              name="brandId"
              defaultValue={product?.brandId ?? ""}
              className={selectCls}
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <Field label="Short Description" name="shortDescription">
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              placeholder="One-line summary for product cards"
              maxLength={500}
              className={inputCls}
            />
          </Field>

          <Field label="Description" name="description">
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              rows={4}
              placeholder="Full product description…"
              className={`${inputCls} resize-y`}
            />
          </Field>
        </div>
      </InfoCard>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <InfoCard title="Pricing">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (₹)" name="price" required>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price ?? ""}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>

          <Field label="Sale Price (₹)" name="salePrice">
            <Input
              id="salePrice"
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.salePrice ?? ""}
              placeholder="Leave blank if no sale"
              className={inputCls}
            />
          </Field>

          <Field label="Discount %" name="priceOffPercent">
            <Input
              id="priceOffPercent"
              name="priceOffPercent"
              type="number"
              min="0"
              max="100"
              defaultValue={product?.priceOffPercent ?? ""}
              placeholder="e.g. 20"
              className={inputCls}
            />
          </Field>
        </div>
      </InfoCard>

      {/* ── Inventory ─────────────────────────────────────────────────────── */}
      <InfoCard title="Inventory">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock Quantity" name="stockQuantity" required>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              required
              defaultValue={product?.stockQuantity ?? 0}
              className={inputCls}
            />
          </Field>

          <Field label="Low Stock Threshold" name="lowStockThreshold">
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={product?.lowStockThreshold ?? 10}
              className={inputCls}
            />
          </Field>
        </div>
      </InfoCard>

      {/* ── Display ───────────────────────────────────────────────────────── */}
      <InfoCard title="Display">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Card BG Color" name="bgColor">
            <div className="flex gap-2">
              {/* Color picker stays native — no shadcn equivalent */}
              <input
                id="bgColor"
                name="bgColor"
                type="color"
                defaultValue={product?.bgColor ?? "#f5f0eb"}
                className="h-[38px] w-12 border border-border bg-surface cursor-pointer"
              />
              <Input
                type="text"
                defaultValue={product?.bgColor ?? "#f5f0eb"}
                placeholder="#f5f0eb"
                className={inputCls}
                onChange={(e) => {
                  const colorInput = document.getElementById("bgColor") as HTMLInputElement
                  if (colorInput) colorInput.value = e.target.value
                }}
              />
            </div>
          </Field>

          <Field label="Badge Type" name="badgeType">
            <select
              id="badgeType"
              name="badgeType"
              defaultValue={product?.badgeType ?? ""}
              className={selectCls}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="hot">Hot</option>
              <option value="low">Low Stock</option>
            </select>
          </Field>

          <Field label="Badge Text" name="badgeText">
            <Input
              id="badgeText"
              name="badgeText"
              defaultValue={product?.badgeText ?? ""}
              placeholder="e.g. Best Seller"
              className={inputCls}
            />
          </Field>

          <div className="col-span-3">
            <Field label="Gift With Purchase Text" name="gwpText">
              <Input
                id="gwpText"
                name="gwpText"
                defaultValue={product?.gwpText ?? ""}
                placeholder="e.g. Free mini cleanser with purchase"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </InfoCard>

      {/* ── Product Details ───────────────────────────────────────────────── */}
      <InfoCard title="Product Details">
        <div className="space-y-4">
          <Field label="Ingredients" name="ingredients">
            <Textarea
              id="ingredients"
              name="ingredients"
              defaultValue={product?.ingredients ?? ""}
              rows={3}
              placeholder="Aqua, Glycerin, Niacinamide…"
              className={`${inputCls} resize-y`}
            />
          </Field>

          <Field label="How To Use" name="howToUse">
            <Textarea
              id="howToUse"
              name="howToUse"
              defaultValue={product?.howToUse ?? ""}
              rows={3}
              placeholder="Apply to clean, dry skin…"
              className={`${inputCls} resize-y`}
            />
          </Field>
        </div>
      </InfoCard>

      {/* ── Visibility ────────────────────────────────────────────────────── */}
      <InfoCard title="Visibility">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            {/* shadcn Checkbox works uncontrolled with defaultChecked + name for FormData */}
            <Checkbox
              name="isActive"
              defaultChecked={product?.isActive ?? true}
              className="border-border data-[state=checked]:bg-acid data-[state=checked]:border-acid data-[state=checked]:text-void"
            />
            <span className="text-sm text-chalk">Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="border-border data-[state=checked]:bg-acid data-[state=checked]:border-acid data-[state=checked]:text-void"
            />
            <span className="text-sm text-chalk">Featured</span>
          </label>
        </div>
      </InfoCard>

      {/* ── SEO ───────────────────────────────────────────────────────────── */}
      <InfoCard title="SEO (optional)">
        <div className="space-y-4">
          <Field label="Meta Title" name="metaTitle">
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={product?.metaTitle ?? ""}
              maxLength={255}
              className={inputCls}
            />
          </Field>
          <Field label="Meta Description" name="metaDescription">
            <Textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={product?.metaDescription ?? ""}
              rows={2}
              className={`${inputCls} resize-y`}
            />
          </Field>
        </div>
      </InfoCard>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          type="submit"
          className="bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold px-6"
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
        <Button asChild variant="ghost" className="text-chalk-3 hover:text-chalk">
          <Link href="/admin/products">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

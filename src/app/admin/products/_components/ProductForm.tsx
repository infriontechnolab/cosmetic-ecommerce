"use client";

import { useRef } from "react";
import type { AdminProductDetail } from "@/db/queries/admin-products";

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: Category[];
  brands: Brand[];
  action: (formData: FormData) => Promise<void>;
  saved?: boolean;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-border-hi transition-colors";

const textareaCls =
  "w-full px-3 py-2.5 bg-surface border border-border rounded text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-border-hi transition-colors resize-y";

export default function ProductForm({
  product,
  categories,
  brands,
  action,
  saved,
}: ProductFormProps) {
  const slugRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit && slugRef.current) {
      slugRef.current.value = slugify(e.target.value);
    }
  }

  return (
    <form action={action} className="space-y-8">
      {saved && (
        <div className="px-4 py-3 bg-acid/10 border border-acid/20 rounded text-sm text-acid font-medium">
          ✓ Changes saved successfully.
        </div>
      )}

      {/* Core info */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Core Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Product Name" name="name" required>
            <input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              onChange={handleNameChange}
              className={inputCls}
              placeholder="e.g. Glow Serum 30ml"
            />
          </Field>

          <Field label="SKU" name="sku" required>
            <input
              id="sku"
              name="sku"
              required
              defaultValue={product?.sku}
              className={inputCls}
              placeholder="e.g. SKU-001"
            />
          </Field>

          <Field label="Slug" name="slug" required>
            <input
              id="slug"
              name="slug"
              required
              ref={slugRef}
              defaultValue={product?.slug}
              className={inputCls}
              placeholder="auto-generated from name"
            />
          </Field>

          <Field label="Category" name="categoryId" required>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className={inputCls}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Brand" name="brandId">
            <select
              id="brandId"
              name="brandId"
              defaultValue={product?.brandId ?? ""}
              className={inputCls}
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Short Description" name="shortDescription">
            <input
              id="shortDescription"
              name="shortDescription"
              defaultValue={product?.shortDescription ?? ""}
              className={inputCls}
              placeholder="One-line summary for product cards"
              maxLength={500}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description" name="description">
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              rows={4}
              className={textareaCls}
              placeholder="Full product description…"
            />
          </Field>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Pricing
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (₹)" name="price" required>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price ?? ""}
              className={inputCls}
              placeholder="0.00"
            />
          </Field>

          <Field label="Sale Price (₹)" name="salePrice">
            <input
              id="salePrice"
              name="salePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.salePrice ?? ""}
              className={inputCls}
              placeholder="Leave blank if no sale"
            />
          </Field>

          <Field label="Discount %" name="priceOffPercent">
            <input
              id="priceOffPercent"
              name="priceOffPercent"
              type="number"
              min="0"
              max="100"
              defaultValue={product?.priceOffPercent ?? ""}
              className={inputCls}
              placeholder="e.g. 20"
            />
          </Field>
        </div>
      </section>

      {/* Inventory */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Inventory
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock Quantity" name="stockQuantity" required>
            <input
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
            <input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              defaultValue={product?.lowStockThreshold ?? 10}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Display */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Display
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Card BG Color" name="bgColor">
            <div className="flex gap-2">
              <input
                id="bgColor"
                name="bgColor"
                type="color"
                defaultValue={product?.bgColor ?? "#f5f0eb"}
                className="h-[42px] w-12 rounded border border-border bg-surface cursor-pointer"
              />
              <input
                type="text"
                defaultValue={product?.bgColor ?? "#f5f0eb"}
                className={inputCls}
                placeholder="#f5f0eb"
                onChange={(e) => {
                  const colorInput = document.getElementById("bgColor") as HTMLInputElement;
                  if (colorInput) colorInput.value = e.target.value;
                }}
              />
            </div>
          </Field>

          <Field label="Badge Type" name="badgeType">
            <select
              id="badgeType"
              name="badgeType"
              defaultValue={product?.badgeType ?? ""}
              className={inputCls}
            >
              <option value="">None</option>
              <option value="new">New</option>
              <option value="sale">Sale</option>
              <option value="hot">Hot</option>
              <option value="low">Low Stock</option>
            </select>
          </Field>

          <Field label="Badge Text" name="badgeText">
            <input
              id="badgeText"
              name="badgeText"
              defaultValue={product?.badgeText ?? ""}
              className={inputCls}
              placeholder="e.g. Best Seller"
            />
          </Field>

          <div className="col-span-3">
            <Field label="Gift With Purchase Text" name="gwpText">
              <input
                id="gwpText"
                name="gwpText"
                defaultValue={product?.gwpText ?? ""}
                className={inputCls}
                placeholder="e.g. Free mini cleanser with purchase"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Details */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Product Details
        </h2>
        <div className="space-y-4">
          <Field label="Ingredients" name="ingredients">
            <textarea
              id="ingredients"
              name="ingredients"
              defaultValue={product?.ingredients ?? ""}
              rows={3}
              className={textareaCls}
              placeholder="Aqua, Glycerin, Niacinamide…"
            />
          </Field>

          <Field label="How To Use" name="howToUse">
            <textarea
              id="howToUse"
              name="howToUse"
              defaultValue={product?.howToUse ?? ""}
              rows={3}
              className={textareaCls}
              placeholder="Apply to clean, dry skin…"
            />
          </Field>
        </div>
      </section>

      {/* Visibility */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          Visibility
        </h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={product?.isActive ?? true}
              className="w-4 h-4 accent-[#ccff00] rounded"
            />
            <span className="text-sm text-chalk">Active (visible in store)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="w-4 h-4 accent-[#ccff00] rounded"
            />
            <span className="text-sm text-chalk">Featured</span>
          </label>
        </div>
      </section>

      {/* SEO */}
      <section>
        <h2 className="text-xs font-bold text-chalk-3 uppercase tracking-widest mb-4 pb-2 border-b border-border">
          SEO (optional)
        </h2>
        <div className="space-y-4">
          <Field label="Meta Title" name="metaTitle">
            <input
              id="metaTitle"
              name="metaTitle"
              defaultValue={product?.metaTitle ?? ""}
              className={inputCls}
              maxLength={255}
            />
          </Field>
          <Field label="Meta Description" name="metaDescription">
            <textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={product?.metaDescription ?? ""}
              rows={2}
              className={textareaCls}
            />
          </Field>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          className="px-6 py-2.5 bg-acid text-void text-sm font-bold rounded hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </button>
        <a href="/admin/products" className="text-sm text-chalk-3 hover:text-chalk">
          Cancel
        </a>
      </div>
    </form>
  );
}

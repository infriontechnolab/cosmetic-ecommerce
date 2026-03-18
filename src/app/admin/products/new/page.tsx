import { getAllCategories, getAllBrands } from "@/db/queries/admin-products";
import { createProduct } from "@/lib/admin-actions";
import ProductForm from "../_components/ProductForm";
import Link from "next/link";

export const metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
  ]);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <div className="text-xs text-chalk-3 mb-2">
          <Link href="/admin" className="hover:text-chalk">Admin</Link>
          {" / "}
          <Link href="/admin/products" className="hover:text-chalk">Products</Link>
          {" / "}New
        </div>
        <h1 className="text-2xl font-extrabold text-chalk tracking-tight">New Product</h1>
      </div>

      <ProductForm
        categories={categories.map((c) => ({ id: Number(c.id), name: c.name }))}
        brands={brands.map((b) => ({ id: Number(b.id), name: b.name }))}
        action={createProduct}
      />
    </div>
  );
}

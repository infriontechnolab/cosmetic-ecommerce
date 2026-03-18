import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getAllCategories,
  getAllBrands,
} from "@/db/queries/admin-products";
import { updateProduct } from "@/lib/admin-actions";
import ProductForm from "../../_components/ProductForm";
import Link from "next/link";

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const productId = parseInt(id);

  const [product, categories, brands] = await Promise.all([
    getAdminProductById(productId),
    getAllCategories(),
    getAllBrands(),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, productId);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <div className="text-xs text-chalk-3 mb-2">
          <Link href="/admin" className="hover:text-chalk">Admin</Link>
          {" / "}
          <Link href="/admin/products" className="hover:text-chalk">Products</Link>
          {" / "}Edit
        </div>
        <h1 className="text-2xl font-extrabold text-chalk tracking-tight">{product.name}</h1>
        <p className="text-sm text-chalk-3 font-mono mt-0.5">SKU: {product.sku}</p>
      </div>

      <ProductForm
        product={product}
        categories={categories.map((c) => ({ id: Number(c.id), name: c.name }))}
        brands={brands.map((b) => ({ id: Number(b.id), name: b.name }))}
        action={action}
        saved={sp.saved === "1"}
      />
    </div>
  );
}

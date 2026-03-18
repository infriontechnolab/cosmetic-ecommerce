import Link from "next/link";
import { getAdminProductStats } from "@/db/queries/admin-products";
import { getAdminOrderStats } from "@/db/queries/admin-orders";

export const metadata = { title: "Admin Dashboard — MAISON" };

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

export default async function AdminDashboard() {
  const [productStats, orderStats] = await Promise.all([
    getAdminProductStats(),
    getAdminOrderStats(),
  ]);

  const productCards = [
    { label: "Total Products", value: productStats.total, color: "text-chalk" },
    { label: "Active", value: productStats.active, color: "text-acid" },
    { label: "Out of Stock", value: productStats.outOfStock, color: "text-red-400" },
    { label: "Low Stock", value: productStats.lowStock, color: "text-amber-400" },
  ];

  const orderCards = [
    { label: "Total Orders", value: orderStats.total, color: "text-chalk" },
    { label: "Pending", value: orderStats.pending, color: "text-yellow-400" },
    { label: "Shipped", value: orderStats.shipped, color: "text-cyan-400" },
    { label: "Delivered", value: orderStats.delivered, color: "text-acid" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Dashboard</h1>
        <p className="text-sm text-chalk-3 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Revenue */}
      <div className="bg-surface border border-border p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-chalk-3 uppercase tracking-wider mb-1">Total Revenue (paid orders)</p>
          <p className="text-4xl font-extrabold text-acid">{fmt(orderStats.revenue)}</p>
        </div>
        <div className="text-right text-sm text-chalk-3">
          <div>{orderStats.cancelled} cancelled</div>
          <div>{orderStats.confirmed} confirmed</div>
        </div>
      </div>

      {/* Order stats */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Orders</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {orderCards.map((c) => (
          <div key={c.label} className="bg-surface border border-border p-5">
            <p className="text-xs text-chalk-3 uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Product stats */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Products</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {productCards.map((c) => (
          <div key={c.label} className="bg-surface border border-border p-5">
            <p className="text-xs text-chalk-3 uppercase tracking-wider mb-2">{c.label}</p>
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="border border-border p-6">
        <h2 className="text-sm font-semibold text-chalk mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
          >
            View Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 border border-border text-chalk-2 text-sm font-medium hover:border-border-hi transition-colors"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-border text-chalk-2 text-sm font-medium hover:border-border-hi transition-colors"
          >
            All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

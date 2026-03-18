import Link from "next/link"
import { getAdminProductStats } from "@/db/queries/admin-products"
import { getAdminOrderStats } from "@/db/queries/admin-orders"
import { StatCard } from "@/components/admin/StatCard"
import { InfoCard } from "@/components/admin/InfoCard"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Admin Dashboard — MAISON" }

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`

export default async function AdminDashboard() {
  const [productStats, orderStats] = await Promise.all([
    getAdminProductStats(),
    getAdminOrderStats(),
  ])

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back. Here's what's happening."
      />

      {/* Revenue highlight */}
      <InfoCard className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-chalk-3 uppercase tracking-wider mb-1">
              Total Revenue (paid orders)
            </p>
            <p className="text-4xl font-extrabold text-acid">{fmt(orderStats.revenue)}</p>
          </div>
          <div className="text-right text-sm text-chalk-3">
            <div>{orderStats.cancelled} cancelled</div>
            <div>{orderStats.confirmed} confirmed</div>
          </div>
        </div>
      </InfoCard>

      {/* Order stats */}
      <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Orders</p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders"  value={orderStats.total}     color="text-chalk" />
        <StatCard label="Pending"       value={orderStats.pending}   color="text-yellow-400" />
        <StatCard label="Shipped"       value={orderStats.shipped}   color="text-cyan-400" />
        <StatCard label="Delivered"     value={orderStats.delivered} color="text-acid" />
      </div>

      {/* Product stats */}
      <p className="text-xs font-semibold text-chalk-3 uppercase tracking-wider mb-3">Products</p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={productStats.total}       color="text-chalk" />
        <StatCard label="Active"         value={productStats.active}      color="text-acid" />
        <StatCard label="Out of Stock"   value={productStats.outOfStock}  color="text-red-400" />
        <StatCard label="Low Stock"      value={productStats.lowStock}    color="text-amber-400" />
      </div>

      {/* Quick actions */}
      <InfoCard title="Quick Actions">
        <div className="flex gap-3">
          <Button asChild className="bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-xs font-bold h-9">
            <Link href="/admin/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-chalk-2 rounded-none h-9">
            <Link href="/admin/products/new">+ Add Product</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-chalk-2 rounded-none h-9">
            <Link href="/admin/products">All Products</Link>
          </Button>
        </div>
      </InfoCard>
    </div>
  )
}

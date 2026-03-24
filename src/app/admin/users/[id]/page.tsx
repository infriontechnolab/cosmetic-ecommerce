import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminUserDetail } from '@/db/queries/admin-users'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Customer — Admin' }

const fmt = (n: string | number) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

const TIERS = [
  { name: 'Diamond',  points: 2500 },
  { name: 'Platinum', points: 1000 },
  { name: 'Gold',     points: 400  },
  { name: 'Pearl',    points: 0    },
]

function getTier(points: number) {
  return TIERS.find(t => points >= t.points)?.name ?? 'Pearl'
}

function getNextTier(points: number) {
  const idx = TIERS.findIndex(t => points >= t.points)
  return idx > 0 ? TIERS[idx - 1] : null
}

const STATUS_COLOR: Record<string, string> = {
  active:   'bg-acid/10 text-acid border-acid/20',
  inactive: 'bg-white/5 text-chalk-3 border-border',
  blocked:  'bg-red-500/15 text-red-400 border-red-500/20',
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAdminUserDetail(Number(id))
  if (!user) notFound()

  const tier = getTier(user.loyaltyPoints)
  const nextTier = getNextTier(user.loyaltyPoints)
  const totalSpent = user.orders
    .filter(o => o.paymentStatus === 'completed')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const totalOrders = user.orders.length

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="text-xs text-chalk-3 mb-4">
        <Link href="/admin" className="hover:text-chalk">Admin</Link>
        {' / '}
        <Link href="/admin/users" className="hover:text-chalk">Customers</Link>
        {' / '}{user.name}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">{user.name}</h1>
          <p className="text-sm text-chalk-3 mt-0.5">{user.email}</p>
          {user.phone && <p className="text-xs text-chalk-3">{user.phone}</p>}
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-sm',
            STATUS_COLOR[user.status] ?? 'bg-white/5 text-chalk-3 border-border'
          )}
        >
          {user.status}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders',  value: String(totalOrders) },
          { label: 'Total Spent',   value: fmt(totalSpent) },
          { label: 'Loyalty Points', value: `${user.loyaltyPoints} pts` },
          { label: 'Current Tier',  value: tier },
        ].map(card => (
          <div key={card.label} className="bg-surface border border-border p-5">
            <div className="text-xl font-extrabold text-acid font-display">{card.value}</div>
            <div className="text-[11px] font-semibold text-chalk-3 uppercase tracking-[0.06em] mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Orders table */}
        <div>
          <h2 className="text-sm font-bold text-chalk uppercase tracking-wider mb-3">Order History</h2>
          {user.orders.length === 0 ? (
            <div className="border border-border bg-surface p-8 text-center">
              <p className="text-chalk-3 text-sm">No orders yet.</p>
            </div>
          ) : (
            <div className="border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {user.orders.map(o => (
                    <tr key={o.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-chalk font-semibold">{o.orderNumber}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} type="order" /></td>
                      <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} type="payment" /></td>
                      <td className="px-4 py-3 text-sm font-semibold text-chalk">{fmt(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-xs text-chalk-3">
                        {o.createdAt
                          ? o.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/orders/${o.id}`} className="text-xs text-chalk-3 hover:text-acid font-semibold transition-colors">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar: account info + loyalty */}
        <div className="space-y-4">
          <div className="bg-surface border border-border p-5">
            <h3 className="text-[11px] font-semibold text-chalk-3 uppercase tracking-wider mb-3">Account Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-chalk-3">Joined</span>
                <span className="text-chalk">
                  {user.createdAt
                    ? user.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-chalk-3">Last updated</span>
                <span className="text-chalk">
                  {user.updatedAt
                    ? user.updatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-chalk-3">Payment method</span>
                <span className="text-chalk capitalize">
                  {user.orders[0]?.paymentMethod ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-5">
            <h3 className="text-[11px] font-semibold text-chalk-3 uppercase tracking-wider mb-3">Loyalty</h3>
            <div className="text-2xl font-extrabold text-acid mb-1">{tier}</div>
            <p className="text-xs text-chalk-3 mb-3">{user.loyaltyPoints} points</p>
            {nextTier ? (
              <div>
                <div className="flex justify-between text-[11px] text-chalk-3 mb-1">
                  <span>{tier}</span>
                  <span>{nextTier.name}</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-acid h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((user.loyaltyPoints / nextTier.points) * 100))}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-chalk-3 mt-1.5">
                  {nextTier.points - user.loyaltyPoints} pts to {nextTier.name}
                </p>
              </div>
            ) : (
              <p className="text-xs text-acid font-semibold">Max tier reached 🏆</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

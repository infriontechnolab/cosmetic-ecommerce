import Link from 'next/link'
import { listAdminUsers } from '@/db/queries/admin-users'
import { PageHeader } from '@/components/admin/PageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Customers — Admin' }

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`

const TIER_THRESHOLDS = [
  { name: 'Diamond',  points: 2500 },
  { name: 'Platinum', points: 1000 },
  { name: 'Gold',     points: 400  },
  { name: 'Pearl',    points: 0    },
]

function getTier(points: number) {
  return TIER_THRESHOLDS.find(t => points >= t.points)?.name ?? 'Pearl'
}

const STATUS_COLOR: Record<string, string> = {
  active:   'bg-acid/10 text-acid border-acid/20',
  inactive: 'bg-white/5 text-chalk-3 border-border',
  blocked:  'bg-red-500/15 text-red-400 border-red-500/20',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 25

  const { users, total } = await listAdminUsers({ search: q, page, perPage })
  const totalPages = Math.ceil(total / perPage)

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({ ...(q ? { q } : {}), page: String(page), ...overrides })
    return `/admin/users?${p}`
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Customers"
        subtitle={`${total} customer${total !== 1 ? 's' : ''} total`}
      />

      {/* Search */}
      <form method="GET" action="/admin/users" className="flex gap-2 mb-6">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="bg-surface border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid w-72 h-8 text-sm"
        />
        <Button type="submit" variant="outline" className="rounded-none border-border text-chalk-3 h-8 px-4 text-xs">
          Search
        </Button>
        {q && (
          <Button asChild variant="ghost" className="rounded-none text-chalk-3 h-8 px-3 text-xs hover:text-chalk">
            <Link href="/admin/users">Clear</Link>
          </Button>
        )}
      </form>

      {/* Table */}
      {users.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center">
          <p className="text-chalk-3 text-sm">{q ? `No customers matching "${q}"` : 'No customers yet.'}</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Loyalty</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-chalk text-sm">{u.name}</span>
                    <p className="text-[11px] text-chalk-3 mt-0.5">{u.email}</p>
                    {u.phone && <p className="text-[11px] text-chalk-3">{u.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm',
                        STATUS_COLOR[u.status] ?? 'bg-white/5 text-chalk-3 border-border'
                      )}
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-chalk-2 text-sm font-semibold">{u.orderCount}</td>
                  <td className="px-4 py-3 text-chalk-2 text-sm font-semibold">{fmt(u.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-acid">{getTier(u.loyaltyPoints)}</span>
                    <p className="text-[11px] text-chalk-3">{u.loyaltyPoints} pts</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-chalk-3">
                    {u.createdAt
                      ? u.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-xs text-chalk-3 hover:text-acid font-semibold transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} hrefFn={p => href({ page: String(p) })} />
        </div>
      )}
    </div>
  )
}

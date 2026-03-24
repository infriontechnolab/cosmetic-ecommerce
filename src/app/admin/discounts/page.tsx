import Link from 'next/link'
import { listDiscounts } from '@/db/queries/admin-discounts'
import { PageHeader } from '@/components/admin/PageHeader'
import { FilterTabs } from '@/components/admin/FilterTabs'
import { Pagination } from '@/components/admin/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Coupons — Admin' }

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const fmt = (n: string | null) =>
  n ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—'

function isExpired(validUntil: Date | null) {
  return validUntil ? validUntil < new Date() : false
}

export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const { q, status, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))
  const perPage = 20

  const { discounts, total } = await listDiscounts({ search: q, status: status ?? 'all', page, perPage })
  const totalPages = Math.ceil(total / perPage)
  const currentStatus = status ?? 'all'

  function href(overrides: Record<string, string>) {
    const p = new URLSearchParams({
      ...(q ? { q } : {}),
      status: currentStatus,
      page: String(page),
      ...overrides,
    })
    return `/admin/discounts?${p}`
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Coupons"
        subtitle={`${total} coupon${total !== 1 ? 's' : ''} total`}
        action={
          <Button asChild className="rounded-none bg-acid text-void hover:bg-acid/90 font-bold h-8 px-4 text-xs">
            <Link href="/admin/discounts/new">+ New Coupon</Link>
          </Button>
        }
      />

      {/* Filter + Search */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <FilterTabs options={STATUS_OPTIONS} current={currentStatus} hrefFn={(v) => href({ status: v, page: '1' })} />
        <form method="GET" action="/admin/discounts" className="flex gap-2">
          <input type="hidden" name="status" value={currentStatus} />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search code…"
            className="bg-surface border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid w-52 h-8 text-sm"
          />
          <Button type="submit" variant="outline" className="rounded-none border-border text-chalk-3 h-8 px-4 text-xs">
            Search
          </Button>
        </form>
      </div>

      {/* Table */}
      {discounts.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center">
          <p className="text-chalk-3 text-sm">No coupons found.</p>
          <Link href="/admin/discounts/new" className="text-acid text-sm font-semibold mt-2 inline-block hover:underline">
            Create your first coupon →
          </Link>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Min Order</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Usage</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Valid Until</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discounts.map(d => {
                const expired = isExpired(d.validUntil)
                return (
                  <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-chalk tracking-wide">{d.code}</span>
                      {d.description && (
                        <p className="text-[11px] text-chalk-3 mt-0.5 truncate max-w-[180px]">{d.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-chalk-2 text-xs">
                      {d.discountType === 'percentage' ? 'Percent' : 'Flat'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-acid">
                      {d.discountType === 'percentage'
                        ? `${Number(d.discountValue).toFixed(0)}%`
                        : fmt(d.discountValue)}
                      {d.maxDiscountAmount && (
                        <span className="text-[11px] text-chalk-3 ml-1">(cap {fmt(d.maxDiscountAmount)})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-chalk-2 text-xs">{fmt(d.minOrderValue)}</td>
                    <td className="px-4 py-3 text-chalk-2 text-xs">
                      {d.timesUsed ?? 0}{d.usageLimit ? ` / ${d.usageLimit}` : ''}
                    </td>
                    <td className={cn('px-4 py-3 text-xs', expired ? 'text-red-400' : 'text-chalk-2')}>
                      {d.validUntil
                        ? d.validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                      {expired && <span className="ml-1 text-[10px] font-bold">(expired)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm',
                          d.isActive && !expired
                            ? 'bg-acid/10 text-acid border-acid/20'
                            : 'bg-white/5 text-chalk-3 border-border'
                        )}
                      >
                        {d.isActive && !expired ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/discounts/${d.id}/edit`}
                        className="text-xs text-chalk-3 hover:text-acid font-semibold transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} hrefFn={(p) => href({ page: String(p) })} />
        </div>
      )}
    </div>
  )
}

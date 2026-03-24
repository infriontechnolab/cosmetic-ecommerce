import Link from 'next/link'
import { listAdminReviews } from '@/db/queries/reviews'
import { FilterTabs } from '@/components/admin/FilterTabs'
import { approveReviewAction, rejectReviewAction } from '@/lib/admin-actions'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Reviews — Admin' }

const STATUS_OPTS = [
  { value: 'all',      label: 'All'      },
  { value: 'pending',  label: 'Pending'  },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_STYLE: Record<string, string> = {
  pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-acid/10 text-acid border-acid/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const STARS = ['★★★★★', '★★★★☆', '★★★☆☆', '★★☆☆☆', '★☆☆☆☆']

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const sp = await searchParams
  const status = (['pending', 'approved', 'rejected'] as const).find(s => s === sp.status)
  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = 20

  const { reviews, total } = await listAdminReviews({ status, page, perPage })
  const totalPages = Math.ceil(total / perPage)

  function href(params: { status?: string; page?: string }) {
    const u = new URLSearchParams()
    const s = params.status ?? sp.status
    if (s && s !== 'all') u.set('status', s)
    if (params.page && params.page !== '1') u.set('page', params.page)
    const qs = u.toString()
    return `/admin/reviews${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-chalk tracking-tight">Reviews</h1>
          <p className="text-sm text-chalk-3 mt-0.5">{total} review{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <FilterTabs
        options={STATUS_OPTS}
        current={sp.status ?? 'all'}
        hrefFn={v => href({ status: v, page: '1' })}
        className="mb-5"
      />

      {/* Table */}
      {reviews.length === 0 ? (
        <div className="border border-border bg-surface p-12 text-center">
          <p className="text-chalk-3 text-sm">No reviews found.</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider w-[320px]">Review</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-chalk-3 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-surface/50 transition-colors align-top">
                  {/* Product */}
                  <td className="px-4 py-3">
                    {r.productSlug ? (
                      <Link
                        href={`/products/${r.productSlug}`}
                        target="_blank"
                        className="text-xs font-semibold text-chalk hover:text-acid transition-colors"
                      >
                        {r.productName ?? r.productSlug}
                      </Link>
                    ) : (
                      <span className="text-xs text-chalk-3">—</span>
                    )}
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-chalk">{r.userName ?? '—'}</div>
                    {r.userEmail && (
                      <div className="text-[11px] text-chalk-3 truncate max-w-[140px]">{r.userEmail}</div>
                    )}
                    {r.isVerifiedPurchase && (
                      <div className="text-[10px] text-acid mt-0.5">✓ Verified</div>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-yellow-400 tracking-tight">{STARS[5 - r.rating] ?? '★'}</span>
                    <span className="ml-1 text-xs font-bold text-chalk">{r.rating}/5</span>
                  </td>

                  {/* Review text */}
                  <td className="px-4 py-3">
                    {r.title && (
                      <div className="text-xs font-semibold text-chalk mb-0.5">{r.title}</div>
                    )}
                    {r.reviewText && (
                      <div className="text-xs text-chalk-3 line-clamp-3 leading-relaxed">{r.reviewText}</div>
                    )}
                    {!r.title && !r.reviewText && (
                      <span className="text-xs text-chalk-3 italic">No text</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 border',
                      STATUS_STYLE[r.status] ?? 'bg-white/5 text-chalk-3 border-border'
                    )}>
                      {r.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-chalk-3 whitespace-nowrap">
                    {r.createdAt
                      ? r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5 items-end">
                      {r.status !== 'approved' && (
                        <form action={async () => { 'use server'; await approveReviewAction(r.id) }}>
                          <button
                            type="submit"
                            className="text-[11px] font-semibold text-acid hover:underline uppercase tracking-[0.04em] whitespace-nowrap"
                          >
                            Approve
                          </button>
                        </form>
                      )}
                      {r.status !== 'rejected' && (
                        <form action={async () => { 'use server'; await rejectReviewAction(r.id) }}>
                          <button
                            type="submit"
                            className="text-[11px] font-semibold text-red-400 hover:underline uppercase tracking-[0.04em] whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={href({ page: String(p) })}
              className={cn(
                'w-8 h-8 flex items-center justify-center text-xs font-semibold border transition-colors',
                p === page
                  ? 'border-acid bg-acid/[0.08] text-acid'
                  : 'border-border text-chalk-3 hover:border-border-hi hover:text-chalk'
              )}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'

type ReviewRow = {
  id: number
  rating: number
  title: string | null
  reviewText: string | null
  userName: string
  productName: string
  productSlug: string
  isVerifiedPurchase: boolean | null
  createdAtStr: string
}

export default function ReviewsClient({ reviews }: { reviews: ReviewRow[] }) {
  const [star, setStar] = useState<number | null>(null)
  const filtered = star ? reviews.filter(r => r.rating === star) : reviews

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {[null, 5, 4, 3].map(s => (
          <button
            key={s ?? 'all'}
            onClick={() => setStar(s)}
            className={`px-4 py-2 text-sm font-semibold border transition-all ${
              star === s
                ? 'bg-acid text-void border-acid'
                : 'bg-surface border-border text-chalk-2 hover:border-acid hover:text-acid'
            }`}
          >
            {s === null ? 'All' : `${s}★`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface border border-border p-12 text-center">
          <div className="mb-4 flex justify-center" style={{ color: 'var(--color-terracotta)' }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.3" stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <p className="text-chalk-2 font-semibold">No reviews yet</p>
          <p className="text-chalk-3 text-sm mt-1">Be the first to review a product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-surface border border-border p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-acid text-sm tracking-wider">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                {r.isVerifiedPurchase && (
                  <span className="text-[10px] font-bold text-acid border border-acid/30 px-1.5 py-0.5 uppercase tracking-[0.06em] flex-shrink-0">
                    Verified
                  </span>
                )}
              </div>
              {r.title && (
                <p className="text-sm font-bold text-chalk leading-snug">{r.title}</p>
              )}
              {r.reviewText && (
                <p className="text-sm text-chalk-2 leading-relaxed line-clamp-3">
                  {r.reviewText.length > 120 ? r.reviewText.slice(0, 120) + '...' : r.reviewText}
                </p>
              )}
              <div className="mt-auto pt-2 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs text-chalk-3">
                  <span className="font-semibold text-chalk-2">{r.userName}</span>
                  {' · '}
                  <Link href={`/products/${r.productSlug}`} className="hover:text-acid transition-colors">
                    {r.productName}
                  </Link>
                </div>
                <span className="text-[11px] text-chalk-3">{r.createdAtStr}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { listRecentReviews } from '@/db/queries/reviews'
import ReviewsClient from './ReviewsClient'

export const metadata: Metadata = {
  title: 'Customer Reviews — MAISON',
  description: 'Real reviews from verified MAISON customers.',
}

export default async function ReviewsPage() {
  const reviews = await listRecentReviews({ limit: 20 })
  const total = reviews.length
  const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '0.0'
  const verifiedPct = total > 0 ? Math.round((reviews.filter(r => r.isVerifiedPurchase).length / total) * 100) : 0

  // Serialize dates before passing to client component
  const serialized = reviews.map(r => ({
    ...r,
    isVerifiedPurchase: r.isVerifiedPurchase ?? false,
    createdAtStr: r.createdAt
      ? r.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
      : '',
    createdAt: undefined,
  }))

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[900px] mx-auto px-6 py-16">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.1em] mb-6">
          <Link href="/" className="hover:text-acid transition-colors">Home</Link> / Reviews
        </div>
        <h1 className="text-[clamp(32px,4vw,56px)] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-2">
          Customer <span className="text-acid">Reviews</span>
        </h1>
        <p className="text-chalk-3 text-sm mb-10">Real experiences from our community.</p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Reviews', value: String(total) },
            { label: 'Average Rating', value: `${avg} ★` },
            { label: 'Verified Buyers', value: `${verifiedPct}%` },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border p-5 text-center">
              <div className="text-2xl font-extrabold text-acid font-display">{s.value}</div>
              <div className="text-xs text-chalk-3 uppercase tracking-[0.06em] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <ReviewsClient reviews={serialized} />
      </div>
    </div>
  )
}

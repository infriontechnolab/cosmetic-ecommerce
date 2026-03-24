'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

type Review = {
  id: number
  rating: number
  title: string | null
  reviewText: string | null
  isVerifiedPurchase: boolean | null
  helpfulCount: number | null
  createdAt: string | null
  userName: string
}

interface Props {
  productSlug: string
  initialReviews: Review[]
  initialTotal: number
  avgRating: number
}

function Stars({ rating, size = 'md', interactive = false, onRate }: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (r: number) => void
}) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <div className={`flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`${interactive ? 'cursor-pointer' : ''} ${(interactive ? (hover || rating) : rating) >= i ? 'text-acid' : 'text-chalk-3'}`}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(i)}
        >★</span>
      ))}
    </div>
  )
}

export default function ReviewsSection({ productSlug, initialReviews, initialTotal, avgRating }: Props) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 0, title: '', reviewText: '' })

  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/reviews/${productSlug}?check=1`)
      .then(r => r.json())
      .then(d => setCanReview(d.canReview ?? false))
      .catch(() => {})
  }, [session, productSlug])

  const loadMore = useCallback(async () => {
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/reviews/${productSlug}?page=${nextPage}`)
      const data = await res.json()
      setReviews(prev => [...prev, ...(data.reviews ?? [])])
      setTotal(data.total ?? total)
      setPage(nextPage)
    } finally {
      setLoading(false)
    }
  }, [page, productSlug, total])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.rating) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${productSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
        setCanReview(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const hasMore = reviews.length < total

  return (
    <div className="py-12 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6">
        <h2 className="text-[20px] font-extrabold text-chalk tracking-[-0.04em] font-display uppercase mb-6">
          Customer <span className="text-acid">Reviews</span>
        </h2>

        {/* Summary */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-surface border border-border">
          <div className="text-center">
            <div className="text-[48px] font-extrabold text-chalk leading-none">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
            <Stars rating={Math.round(avgRating)} size="lg" />
            <div className="text-xs text-chalk-3 mt-1">{total} {total === 1 ? 'review' : 'reviews'}</div>
          </div>
          <div className="flex-1" />
          {submitted && (
            <div className="text-sm text-acid font-semibold">✓ Review submitted — pending approval</div>
          )}
          {!submitted && session?.user && canReview && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="px-5 py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em]"
            >
              {showForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
          {!submitted && session?.user && !canReview && (
            <p className="text-xs text-chalk-3">Purchase this product to leave a review</p>
          )}
          {!session?.user && (
            <p className="text-xs text-chalk-3">Sign in to leave a review</p>
          )}
        </div>

        {/* Review form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-surface border border-border flex flex-col gap-4 max-w-[600px]">
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-2">Your Rating</label>
              <Stars rating={form.rating} size="lg" interactive onRate={r => setForm(p => ({ ...p, rating: r }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Review Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Summarise your experience"
                className="w-full bg-void-2 border border-border-hi px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">Review</label>
              <textarea
                value={form.reviewText}
                onChange={e => setForm(p => ({ ...p, reviewText: e.target.value }))}
                placeholder="Share your thoughts on this product..."
                rows={4}
                className="w-full bg-void-2 border border-border-hi px-3 py-[10px] text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!form.rating || submitting}
              className="self-start px-6 py-3 bg-acid text-void text-sm font-bold hover:bg-acid-dim transition-colors uppercase tracking-[0.04em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="p-8 bg-surface border border-border text-center">
            <p className="text-chalk-3 text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map(review => (
              <div key={review.id} className="p-5 bg-surface border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <Stars rating={review.rating} size="sm" />
                  {review.title && <span className="text-sm font-semibold text-chalk">{review.title}</span>}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-chalk-2">{review.userName}</span>
                  {review.isVerifiedPurchase && (
                    <span className="text-[10px] font-bold text-acid border border-acid px-1.5 py-0.5 uppercase tracking-[0.06em]">Verified Purchase</span>
                  )}
                  {review.createdAt && (
                    <span className="text-xs text-chalk-3">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
                {review.reviewText && <p className="text-sm text-chalk-2 leading-relaxed">{review.reviewText}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 border border-border text-chalk-2 text-sm font-bold hover:border-acid hover:text-acid transition-all uppercase tracking-[0.04em] disabled:opacity-50"
            >
              {loading ? 'Loading...' : `Show More Reviews (${total - reviews.length} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

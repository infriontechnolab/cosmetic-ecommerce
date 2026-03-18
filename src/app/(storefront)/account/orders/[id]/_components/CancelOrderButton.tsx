'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: number
  orderNumber: string
}

export default function CancelOrderButton({ orderId, orderNumber }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() || 'Cancelled by customer' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to cancel order')
        return
      }
      router.refresh()
      setOpen(false)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-400 transition-colors uppercase tracking-[0.04em]"
      >
        Cancel Order
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-[420px] mx-4 p-6">
            <h3 className="text-base font-bold text-chalk font-display mb-1">
              Cancel Order #{orderNumber}?
            </h3>
            <p className="text-sm text-chalk-3 mb-5">
              This action cannot be undone. Your payment (if any) will be refunded per our policy.
            </p>

            <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Tell us why you're cancelling..."
              rows={3}
              className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid resize-none transition-colors"
            />

            {error && (
              <p className="mt-2 text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setOpen(false); setError('') }}
                disabled={loading}
                className="flex-1 py-2.5 border border-border text-chalk-2 text-sm font-semibold hover:border-border-hi transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
              >
                {loading ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

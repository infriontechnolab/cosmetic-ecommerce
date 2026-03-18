'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReturnReason = 'defective' | 'wrong_item' | 'not_as_described' | 'damaged' | 'changed_mind' | 'other'
type RefundMethod = 'original_payment' | 'store_credit' | 'replacement'

const REASONS: { value: ReturnReason; label: string }[] = [
  { value: 'defective', label: 'Defective product' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'damaged', label: 'Damaged in transit' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
]

interface Props {
  orderId: number
  paymentMethod: string
  existingReturn?: { returnNumber: string; status: string } | null
}

export default function ReturnRequestForm({ orderId, paymentMethod, existingReturn }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReturnReason>('defective')
  const [details, setDetails] = useState('')
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    paymentMethod === 'razorpay' ? 'original_payment' : 'store_credit'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const STATUS_COLOR: Record<string, string> = {
    pending: 'text-yellow-400',
    approved: 'text-blue-400',
    received: 'text-purple-400',
    refunded: 'text-acid',
    rejected: 'text-red-400',
  }

  if (existingReturn) {
    return (
      <div className="border border-border p-4 bg-surface">
        <div className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
          Return Request
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-mono text-chalk">{existingReturn.returnNumber}</span>
          </div>
          <span className={`text-xs font-bold uppercase ${STATUS_COLOR[existingReturn.status] ?? 'text-chalk-3'}`}>
            {existingReturn.status}
          </span>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="border border-acid/30 p-4 bg-[rgba(204,255,0,.04)]">
        <div className="text-sm font-semibold text-acid">✓ Return request submitted</div>
        <div className="text-xs text-chalk-3 mt-1">We&apos;ll review your request and respond within 2-3 business days.</div>
      </div>
    )
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason, reasonDetails: details.trim() || undefined, refundMethod }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to submit return'); return }
      setSubmitted(true)
      setOpen(false)
      router.refresh()
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
        className="w-full py-3 border border-border text-chalk-2 text-sm font-semibold hover:border-border-hi hover:text-chalk transition-colors uppercase tracking-[0.04em]"
      >
        Request Return / Refund
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-[460px] mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-chalk font-display mb-4">
              Request Return / Refund
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as ReturnReason)}
                  className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
                >
                  {REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                  Details <span className="font-normal normal-case text-chalk-3">(optional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue in more detail…"
                  className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                  Preferred Resolution
                </label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value as RefundMethod)}
                  className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
                >
                  {paymentMethod === 'razorpay' && (
                    <option value="original_payment">Refund to original payment</option>
                  )}
                  <option value="store_credit">Store credit</option>
                  <option value="replacement">Send replacement</option>
                </select>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setOpen(false); setError('') }}
                  disabled={loading}
                  className="flex-1 py-2.5 border border-border text-chalk-2 text-sm font-semibold hover:border-border-hi transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
                >
                  {loading ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

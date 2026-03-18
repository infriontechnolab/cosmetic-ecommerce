'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'refunded'
type RefundMethod = 'original_payment' | 'store_credit' | 'replacement'

interface Props {
  returnId: number
  status: ReturnStatus
  paymentMethod: string
  currentRefundAmount: string | null
  orderTotal: string
}

export default function ReturnActionPanel({
  returnId,
  status,
  paymentMethod,
  currentRefundAmount,
  orderTotal,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Approve form state
  const [refundAmount, setRefundAmount] = useState(currentRefundAmount ?? orderTotal)
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    paymentMethod === 'razorpay' ? 'original_payment' : 'store_credit'
  )
  const [adminNotes, setAdminNotes] = useState('')

  // Reject form state
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  async function callAction(
    action: string,
    extra?: Record<string, unknown>
  ) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Action failed'); return }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Pending → approve or reject */}
      {status === 'pending' && (
        <>
          <div className="bg-surface border border-border p-5 flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
              Approve Return
            </h3>
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                Refund Amount (₹)
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
                className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                Refund Method
              </label>
              <select
                value={refundMethod}
                onChange={e => setRefundMethod(e.target.value as RefundMethod)}
                className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
              >
                {paymentMethod === 'razorpay' && (
                  <option value="original_payment">Original Payment (Razorpay)</option>
                )}
                <option value="store_credit">Store Credit</option>
                <option value="replacement">Send Replacement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                Admin Notes <span className="font-normal normal-case text-chalk-3">(optional)</span>
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={2}
                className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid resize-none transition-colors"
                placeholder="Internal notes…"
              />
            </div>
            <button
              onClick={() => callAction('approve', {
                refundAmount: parseFloat(refundAmount),
                refundMethod,
                adminNotes: adminNotes || undefined,
              })}
              disabled={!!loading}
              className="w-full py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
            >
              {loading === 'approve' ? 'Approving…' : 'Approve Return'}
            </button>
          </div>

          {!showRejectForm ? (
            <button
              onClick={() => setShowRejectForm(true)}
              className="w-full py-2.5 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors uppercase tracking-[0.04em]"
            >
              Reject Return
            </button>
          ) : (
            <div className="bg-surface border border-red-500/20 p-5 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-[0.06em]">
                Reject Return
              </h3>
              <div>
                <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this return is being rejected…"
                  className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-red-500 resize-none transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 py-2 border border-border text-chalk-2 text-sm hover:border-border-hi transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => callAction('reject', { rejectionReason })}
                  disabled={!!loading}
                  className="flex-1 py-2 bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {loading === 'reject' ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Approved → mark received */}
      {status === 'approved' && (
        <div className="bg-surface border border-border p-5">
          <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
            Next Step
          </h3>
          <p className="text-sm text-chalk-2 mb-4">
            Once you receive the returned item, mark it as received.
          </p>
          <button
            onClick={() => callAction('mark_received')}
            disabled={!!loading}
            className="w-full py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
          >
            {loading === 'mark_received' ? 'Updating…' : 'Mark as Received'}
          </button>
        </div>
      )}

      {/* Received → process refund */}
      {status === 'received' && (
        <div className="bg-surface border border-border p-5">
          <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-3">
            Process Refund
          </h3>
          <p className="text-sm text-chalk-2 mb-4">
            {paymentMethod === 'razorpay'
              ? 'This will trigger a Razorpay refund automatically.'
              : 'Mark as refunded after processing the COD refund manually.'}
          </p>
          <button
            onClick={() => callAction('mark_refunded')}
            disabled={!!loading}
            className="w-full py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
          >
            {loading === 'mark_refunded'
              ? 'Processing…'
              : paymentMethod === 'razorpay'
              ? 'Issue Razorpay Refund'
              : 'Mark as Refunded'}
          </button>
        </div>
      )}

      {/* Terminal states */}
      {status === 'refunded' && (
        <div className="px-4 py-3 bg-[rgba(204,255,0,.06)] border border-acid/20 text-sm text-acid">
          ✓ Refund has been processed
        </div>
      )}
      {status === 'rejected' && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          This return has been rejected
        </div>
      )}
    </div>
  )
}

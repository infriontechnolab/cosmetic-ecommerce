'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OrderStatus =
  | 'pending' | 'confirmed' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

interface Props {
  orderId: number
  currentStatus: OrderStatus
  currentTracking: string | null
  currentCourier: string | null
  currentAdminNotes: string | null
}

export default function OrderUpdateForm({
  orderId,
  currentStatus,
  currentTracking,
  currentCourier,
  currentAdminNotes,
}: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [tracking, setTracking] = useState(currentTracking ?? '')
  const [courier, setCourier] = useState(currentCourier ?? '')
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: tracking.trim() || null,
          courierPartner: courier.trim() || null,
          adminNotes: adminNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Update failed'); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border p-5 flex flex-col gap-4">
      <h3 className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
        Update Order
      </h3>

      {/* Status */}
      <div>
        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
          Order Status
        </label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as OrderStatus)}
          className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tracking */}
      <div>
        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
          Tracking Number
        </label>
        <input
          type="text"
          value={tracking}
          onChange={e => setTracking(e.target.value)}
          placeholder="e.g. 1234567890"
          className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors font-mono"
        />
      </div>

      {/* Courier */}
      <div>
        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
          Courier Partner
        </label>
        <input
          type="text"
          value={courier}
          onChange={e => setCourier(e.target.value)}
          placeholder="e.g. Bluedart, Delhivery, Ekart"
          className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid transition-colors"
        />
      </div>

      {/* Admin notes */}
      <div>
        <label className="block text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em] mb-1">
          Admin Notes
        </label>
        <textarea
          value={adminNotes}
          onChange={e => setAdminNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes (not visible to customer)"
          className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk placeholder:text-chalk-3 outline-none focus:border-acid resize-none transition-colors"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-2.5 bg-acid text-void text-sm font-bold hover:bg-acid-dim disabled:opacity-60 transition-colors uppercase tracking-[0.04em]"
      >
        {loading ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}

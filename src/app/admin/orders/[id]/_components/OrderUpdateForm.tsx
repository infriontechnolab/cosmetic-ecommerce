"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InfoCard } from "@/components/admin/InfoCard"

type OrderStatus =
  | "pending" | "confirmed" | "processing"
  | "shipped" | "delivered" | "cancelled" | "refunded"

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "refunded",   label: "Refunded" },
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
  const [status, setStatus]         = useState<OrderStatus>(currentStatus)
  const [tracking, setTracking]     = useState(currentTracking ?? "")
  const [courier, setCourier]       = useState(currentCourier ?? "")
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? "")
  const [loading, setLoading]       = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState("")

  async function handleSave() {
    setLoading(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber:  tracking.trim() || null,
          courierPartner:  courier.trim() || null,
          adminNotes:      adminNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Update failed"); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <InfoCard title="Update Order">
      <div className="flex flex-col gap-4">
        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Order Status
          </Label>
          {/* Keep native select for form compatibility */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tracking */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Tracking Number
          </Label>
          <Input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="e.g. 1234567890"
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid font-mono"
          />
        </div>

        {/* Courier */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Courier Partner
          </Label>
          <Input
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Bluedart, Delhivery, Ekart"
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid"
          />
        </div>

        {/* Admin notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Admin Notes
          </Label>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes (not visible to customer)"
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold"
        >
          {loading ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
        </Button>
      </div>
    </InfoCard>
  )
}

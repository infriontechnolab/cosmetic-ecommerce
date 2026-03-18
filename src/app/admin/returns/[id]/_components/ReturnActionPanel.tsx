"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoCard } from "@/components/admin/InfoCard"

type ReturnStatus = "pending" | "approved" | "rejected" | "received" | "refunded"
type RefundMethod = "original_payment" | "store_credit" | "replacement"

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
  const [loading, setLoading]           = useState<string | null>(null)
  const [error, setError]               = useState("")
  const [refundAmount, setRefundAmount] = useState(currentRefundAmount ?? orderTotal)
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(
    paymentMethod === "razorpay" ? "original_payment" : "store_credit"
  )
  const [adminNotes, setAdminNotes]     = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  async function callAction(action: string, extra?: Record<string, unknown>) {
    setLoading(action)
    setError("")
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Action failed"); return }
      router.refresh()
    } catch {
      setError("Network error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 rounded-none">
          <AlertDescription className="text-xs text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Pending → approve or reject */}
      {status === "pending" && (
        <>
          <InfoCard title="Approve Return">
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
                  Refund Amount (₹)
                </Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-void border-border text-chalk rounded-none focus-visible:ring-0 focus-visible:border-acid"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
                  Refund Method
                </Label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as RefundMethod)}
                  className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
                >
                  {paymentMethod === "razorpay" && (
                    <option value="original_payment">Original Payment (Razorpay)</option>
                  )}
                  <option value="store_credit">Store Credit</option>
                  <option value="replacement">Send Replacement</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
                  Admin Notes <span className="font-normal normal-case text-chalk-3">(optional)</span>
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Internal notes…"
                  className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid resize-none"
                />
              </div>
              <Button
                onClick={() =>
                  callAction("approve", {
                    refundAmount: parseFloat(refundAmount),
                    refundMethod,
                    adminNotes: adminNotes || undefined,
                  })
                }
                disabled={!!loading}
                className="w-full bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold"
              >
                {loading === "approve" ? "Approving…" : "Approve Return"}
              </Button>
            </div>
          </InfoCard>

          {!showRejectForm ? (
            <Button
              variant="outline"
              onClick={() => setShowRejectForm(true)}
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-none uppercase tracking-[0.04em]"
            >
              Reject Return
            </Button>
          ) : (
            <InfoCard title="Reject Return" className="border-red-500/20">
              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
                    Rejection Reason
                  </Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Explain why this return is being rejected…"
                    className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-red-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 border-border text-chalk-2 rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => callAction("reject", { rejectionReason })}
                    disabled={!!loading}
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-none"
                  >
                    {loading === "reject" ? "Rejecting…" : "Confirm Reject"}
                  </Button>
                </div>
              </div>
            </InfoCard>
          )}
        </>
      )}

      {/* Approved → mark received */}
      {status === "approved" && (
        <InfoCard title="Next Step">
          <p className="text-sm text-chalk-2 mb-4">
            Once you receive the returned item, mark it as received.
          </p>
          <Button
            onClick={() => callAction("mark_received")}
            disabled={!!loading}
            className="w-full bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold"
          >
            {loading === "mark_received" ? "Updating…" : "Mark as Received"}
          </Button>
        </InfoCard>
      )}

      {/* Received → process refund */}
      {status === "received" && (
        <InfoCard title="Process Refund">
          <p className="text-sm text-chalk-2 mb-4">
            {paymentMethod === "razorpay"
              ? "This will trigger a Razorpay refund automatically."
              : "Mark as refunded after processing the COD refund manually."}
          </p>
          <Button
            onClick={() => callAction("mark_refunded")}
            disabled={!!loading}
            className="w-full bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold"
          >
            {loading === "mark_refunded"
              ? "Processing…"
              : paymentMethod === "razorpay"
              ? "Issue Razorpay Refund"
              : "Mark as Refunded"}
          </Button>
        </InfoCard>
      )}

      {/* Terminal states */}
      {status === "refunded" && (
        <div className="px-4 py-3 bg-acid/[0.06] border border-acid/20 text-sm text-acid">
          ✓ Refund has been processed
        </div>
      )}
      {status === "rejected" && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          This return has been rejected
        </div>
      )}
    </div>
  )
}

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InfoCard } from "@/components/admin/InfoCard"

type ChangeType = "purchase" | "sale" | "return" | "adjustment" | "damage" | "expired"

const CHANGE_TYPES: { value: ChangeType; label: string; sign: 1 | -1 | 0 }[] = [
  { value: "purchase",   label: "Purchase / Restock (+)",  sign: 1  },
  { value: "return",     label: "Customer Return (+)",      sign: 1  },
  { value: "adjustment", label: "Manual Adjustment (±)",   sign: 0  },
  { value: "sale",       label: "Manual Sale (−)",          sign: -1 },
  { value: "damage",     label: "Damaged / Lost (−)",       sign: -1 },
  { value: "expired",    label: "Expired / Disposed (−)",   sign: -1 },
]

interface Props {
  productId: number
  currentStock: number
}

export default function StockAdjustForm({ productId, currentStock }: Props) {
  const router    = useRouter()
  const [changeType, setChangeType] = useState<ChangeType>("purchase")
  const [qty,       setQty]         = useState("")
  const [refNum,    setRefNum]       = useState("")
  const [notes,     setNotes]        = useState("")
  const [loading,   setLoading]      = useState(false)
  const [saved,     setSaved]        = useState(false)
  const [error,     setError]        = useState("")

  const selectedType  = CHANGE_TYPES.find((t) => t.value === changeType)!
  const rawQty        = parseInt(qty, 10)
  const change        =
    selectedType.sign === 0
      ? isNaN(rawQty) ? 0 : rawQty
      : isNaN(rawQty) ? 0 : Math.abs(rawQty) * selectedType.sign
  const previewStock  = Math.max(0, currentStock + change)
  const hasPreview    = qty.trim() !== "" && !isNaN(rawQty) && rawQty !== 0

  async function handleSubmit() {
    if (!qty.trim() || isNaN(rawQty) || rawQty === 0) {
      setError("Enter a non-zero quantity")
      return
    }
    setLoading(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          change,
          changeType,
          referenceNumber: refNum.trim() || undefined,
          notes:           notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed"); return }
      setSaved(true)
      setQty("")
      setRefNum("")
      setNotes("")
      setTimeout(() => setSaved(false), 2500)
      router.refresh()
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <InfoCard title="Adjust Stock">
      <div className="flex flex-col gap-4">
        {/* Current → Preview */}
        <div className="flex items-center gap-3 p-3 bg-void border border-border">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-chalk font-display">{currentStock}</div>
            <div className="text-[10px] text-chalk-3 uppercase tracking-wide">Current</div>
          </div>
          <div className="text-chalk-3 text-lg">→</div>
          <div className="text-center">
            <div
              className={`text-2xl font-extrabold font-display ${
                hasPreview
                  ? previewStock > currentStock
                    ? "text-acid"
                    : previewStock < currentStock
                    ? "text-red-400"
                    : "text-chalk"
                  : "text-chalk-3"
              }`}
            >
              {hasPreview ? previewStock : "—"}
            </div>
            <div className="text-[10px] text-chalk-3 uppercase tracking-wide">After</div>
          </div>
          {hasPreview && (
            <div className={`ml-auto text-sm font-bold ${change > 0 ? "text-acid" : "text-red-400"}`}>
              {change > 0 ? "+" : ""}{change}
            </div>
          )}
        </div>

        {/* Change type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Type
          </Label>
          <select
            value={changeType}
            onChange={(e) => setChangeType(e.target.value as ChangeType)}
            className="w-full bg-void border border-border px-3 py-2 text-sm text-chalk outline-none focus:border-acid transition-colors"
          >
            {CHANGE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Quantity
            {selectedType.sign !== 0 && (
              <span className="ml-1 text-chalk-3 normal-case font-normal">
                ({selectedType.sign === 1 ? "units to add" : "units to remove"})
              </span>
            )}
          </Label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={selectedType.sign === 0 ? "e.g. +10 or -5" : "e.g. 20"}
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid"
          />
        </div>

        {/* Reference */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Reference # <span className="font-normal text-chalk-3 normal-case">(optional)</span>
          </Label>
          <Input
            value={refNum}
            onChange={(e) => setRefNum(e.target.value)}
            placeholder="PO number, invoice, etc."
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            Notes <span className="font-normal text-chalk-3 normal-case">(optional)</span>
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Reason for adjustment…"
            className="bg-void border-border text-chalk placeholder:text-chalk-3 rounded-none focus-visible:ring-0 focus-visible:border-acid resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-acid text-void hover:bg-acid-dim rounded-none uppercase tracking-[0.04em] text-sm font-bold"
        >
          {loading ? "Saving…" : saved ? "✓ Stock Updated!" : "Apply Adjustment"}
        </Button>
      </div>
    </InfoCard>
  )
}

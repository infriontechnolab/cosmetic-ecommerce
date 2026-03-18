import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Order status ────────────────────────────────────────────────────────────
const ORDER_VARIANTS: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  delivered:  "bg-acid/10 text-acid border-acid/20",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/20",
  refunded:   "bg-white/5 text-chalk-3 border-border",
}

// ── Payment status ───────────────────────────────────────────────────────────
const PAYMENT_VARIANTS: Record<string, string> = {
  completed:  "bg-acid/10 text-acid border-acid/20",
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  failed:     "bg-red-500/15 text-red-400 border-red-500/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  refunded:   "bg-white/5 text-chalk-3 border-border",
}

// ── Return status ────────────────────────────────────────────────────────────
const RETURN_VARIANTS: Record<string, string> = {
  pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  received: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  refunded: "bg-acid/10 text-acid border-acid/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
}

// ── Inventory status ─────────────────────────────────────────────────────────
const INVENTORY_VARIANTS: Record<string, string> = {
  in_stock:     "bg-acid/10 text-acid border-acid/20",
  low_stock:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  out_of_stock: "bg-red-500/15 text-red-400 border-red-500/20",
}

// ── Product active state ─────────────────────────────────────────────────────
const PRODUCT_VARIANTS: Record<string, string> = {
  active:   "bg-acid/10 text-acid border-acid/20",
  inactive: "bg-white/5 text-chalk-3 border-border",
}

type BadgeType = "order" | "payment" | "return" | "inventory" | "product"

const MAP: Record<BadgeType, Record<string, string>> = {
  order:     ORDER_VARIANTS,
  payment:   PAYMENT_VARIANTS,
  return:    RETURN_VARIANTS,
  inventory: INVENTORY_VARIANTS,
  product:   PRODUCT_VARIANTS,
}

interface StatusBadgeProps {
  status: string
  type?: BadgeType
  className?: string
}

export function StatusBadge({ status, type = "order", className }: StatusBadgeProps) {
  const variants = MAP[type] ?? ORDER_VARIANTS
  const cls = variants[status] ?? "bg-white/5 text-chalk-3 border-border"
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm",
        cls,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  )
}

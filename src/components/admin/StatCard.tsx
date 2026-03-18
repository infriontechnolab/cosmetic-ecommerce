import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  color?: string
  title?: string
  className?: string
}

export function StatCard({ label, value, color = "text-chalk", title, className }: StatCardProps) {
  return (
    <Card className={cn("bg-surface border-border rounded-none", className)}>
      <CardContent className="p-5">
        <p className="text-xs text-chalk-3 uppercase tracking-wider mb-2">{label}</p>
        <p className={cn("text-3xl font-extrabold font-display", color)} title={title}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  title?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function InfoCard({ title, children, className, contentClassName }: InfoCardProps) {
  return (
    <Card className={cn("bg-surface border-border rounded-none", className)}>
      {title && (
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-xs font-semibold text-chalk-3 uppercase tracking-[0.06em]">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}

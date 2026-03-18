import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  /** Build the href for a given page number */
  hrefFn: (page: number) => string
  className?: string
}

export function Pagination({ page, totalPages, hrefFn, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn("flex items-center justify-between mt-4", className)}>
      <p className="text-xs text-chalk-3">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1">
        {page > 1 && (
          <Button variant="outline" size="sm" asChild className="rounded-none h-7 text-xs border-border">
            <Link href={hrefFn(page - 1)}>← Prev</Link>
          </Button>
        )}
        {page < totalPages && (
          <Button variant="outline" size="sm" asChild className="rounded-none h-7 text-xs border-border">
            <Link href={hrefFn(page + 1)}>Next →</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

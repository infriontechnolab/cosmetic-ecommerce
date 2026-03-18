import Link from "next/link"
import { cn } from "@/lib/utils"

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterTabsProps {
  options: FilterOption[]
  current: string
  hrefFn: (value: string) => string
  className?: string
}

export function FilterTabs({ options, current, hrefFn, className }: FilterTabsProps) {
  return (
    <div className={cn("flex gap-1 flex-wrap", className)}>
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={hrefFn(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold border transition-colors",
            current === opt.value
              ? "border-acid bg-acid/[0.08] text-acid"
              : "border-border text-chalk-3 hover:border-border-hi hover:text-chalk"
          )}
        >
          {opt.label}
          {opt.count != null && opt.count > 0 && (
            <span className="ml-1.5 opacity-70">{opt.count}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  /** Icon + label are rendered server-side and passed as children (avoids serialization error) */
  children: React.ReactNode
  exact?: boolean
}

export function NavItem({ href, children, exact = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors border-l-2",
        isActive
          ? "text-acid bg-acid/[0.06] border-acid"
          : "text-chalk-3 hover:bg-surface hover:text-chalk border-transparent"
      )}
    >
      {children}
    </Link>
  )
}

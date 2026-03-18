import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { signOut } from "@/auth"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { NavItem } from "@/components/admin/NavItem"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  RotateCcw,
  TrendingUp,
} from "lucide-react"

const NAV = [
  { href: "/admin",           label: "Dashboard", Icon: LayoutDashboard, exact: true  },
  { href: "/admin/products",  label: "Products",  Icon: Package                       },
  { href: "/admin/orders",    label: "Orders",    Icon: ShoppingCart                  },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes                         },
  { href: "/admin/returns",   label: "Returns",   Icon: RotateCcw                     },
  { href: "/admin/analytics", label: "Analytics", Icon: TrendingUp                    },
]

async function requireAdmin() {
  const session = await auth()
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
  if (!session?.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/")
  }
  return session
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  const initials = (session.user?.name ?? session.user?.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/" className="text-xs font-bold text-acid uppercase tracking-widest">
            MAISON
          </Link>
          <p className="text-[10px] text-chalk-3 mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        <Separator className="bg-border" />

        {/* Nav — icons rendered here (Server Component) so they're plain JSX, not functions */}
        <nav className="flex-1 py-3 space-y-0.5">
          {NAV.map(({ href, label, Icon, exact }) => (
            <NavItem key={href} href={href} exact={exact}>
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavItem>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-acid/10 border border-acid/20 flex items-center justify-center text-acid text-[10px] font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-chalk-2 font-medium truncate">{session.user?.name}</p>
              <p className="text-[11px] text-chalk-3 truncate">{session.user?.email}</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full text-xs border-border text-chalk-3 hover:text-chalk rounded-none h-7"
            >
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

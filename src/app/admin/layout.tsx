import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "⬛" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/inventory", label: "Inventory", icon: "📊" },
  { href: "/admin/returns", label: "Returns", icon: "↩️" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
];

async function requireAdmin() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  if (!session?.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/");
  }
  return session;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-void flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <Link href="/" className="text-xs font-bold text-acid uppercase tracking-widest">
            MAISON
          </Link>
          <p className="text-[10px] text-chalk-3 mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-chalk-3 hover:bg-surface hover:text-chalk transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-chalk-2 font-medium truncate">{session.user?.name}</p>
          <p className="text-[11px] text-chalk-3 truncate mb-3">{session.user?.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full text-xs text-chalk-3 hover:text-chalk py-1.5 border border-border rounded hover:border-border-hi transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

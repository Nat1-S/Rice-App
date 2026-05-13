"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, LayoutDashboard, ListOrdered, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/rice-principles", label: "כללי ה-RICE", icon: BookOpen },
  { href: "/", label: "מחשבון RICE", icon: Calculator },
  { href: "/list", label: "רשימת תעדוף", icon: ListOrdered },
  { href: "/dashboard", label: "דאשבורד תובנות", icon: LayoutDashboard },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-border border-e bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-sidebar-border border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary-foreground">
          <span className="font-semibold text-xs">PM</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm tracking-tight">PriorityMaster</span>
          <span className="text-[10px] text-muted-foreground">RICE &amp; תעדוף</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0 opacity-80" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

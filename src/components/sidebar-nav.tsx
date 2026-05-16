"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calculator,
  LayoutDashboard,
  ListOrdered,
  LogOut,
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { TapMotion } from "@/components/tap-motion"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  onNavigate?: () => void
  className?: string
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  const nav = [
    { href: "/rice-principles", label: t.nav.ricePrinciples, icon: BookOpen },
    { href: "/", label: t.nav.calculator, icon: Calculator },
    { href: "/list", label: t.nav.list, icon: ListOrdered },
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
  ] as const

  return (
    <div className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground",
        className
      )}>
      <div className="flex h-14 shrink-0 items-center gap-2 border-sidebar-border border-b px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary-foreground">
          <span className="font-semibold text-xs">PM</span>
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-semibold text-sm tracking-tight">
            {t.meta.appName}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {t.meta.tagline}
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block"
              onClick={onNavigate}
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors md:py-2",
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

      <div className="flex shrink-0 flex-col gap-3 border-sidebar-border border-t p-3">
        <LanguageSwitcher />
        {user?.email && (
          <p
            className="truncate px-1 text-[10px] text-muted-foreground"
            title={user.email}
          >
            {user.email}
          </p>
        )}
        <TapMotion>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => void signOut()}
          >
            <LogOut className="size-3.5" />
            {t.auth.signOut}
          </Button>
        </TapMotion>
      </div>
    </div>
  )
}

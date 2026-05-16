"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTranslation } from "@/contexts/language-context"

const PUBLIC_PREFIXES = ["/login", "/auth"]

function isPublicRoute(pathname: string) {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { t, dir } = useTranslation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  if (isPublicRoute(pathname)) {
    return <>{children}</>
  }

  const navSheetSide = dir === "rtl" ? "right" : "left"

  return (
    <AuthGuard>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col md:flex-row">
        <header className="flex h-14 shrink-0 items-center gap-3 border-border border-b bg-background px-4 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            aria-label={t.nav.openMenu}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate font-semibold text-sm">
              {t.meta.appName}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {t.meta.tagline}
            </span>
          </div>
        </header>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side={navSheetSide}
            className="w-[min(100%,16rem)] gap-0 p-0 sm:max-w-xs"
            showCloseButton
          >
            <SheetTitle className="sr-only">{t.meta.appName}</SheetTitle>
            <SidebarNav
              className="h-full"
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <AppSidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}

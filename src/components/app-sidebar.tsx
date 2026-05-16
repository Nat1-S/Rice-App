"use client"

import { SidebarNav } from "@/components/sidebar-nav"

/** סרגל צד קבוע — דסקטופ בלבד (md+). במובייל: AppShell + Sheet */
export function AppSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-border border-e md:flex">
      <SidebarNav className="w-full" />
    </aside>
  )
}

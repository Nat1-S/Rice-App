"use client"

import { useEffect } from "react"
import { getSupabaseBrowser } from "@/lib/supabase/client"

/**
 * מנוי לשינויים בטבלת priorities (INSERT/UPDATE/DELETE).
 * דורש הפעלת Realtime לטבלה בפרויקט Supabase (Database → Replication).
 */
export function usePrioritiesRealtime(onChange: () => void) {
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    if (!supabase) return

    const channel = supabase
      .channel("priorities-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "priorities" },
        () => {
          onChange()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [onChange])
}

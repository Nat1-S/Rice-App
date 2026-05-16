"use client"

import { useEffect } from "react"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { PRIORITIES_USER_ID_COLUMN } from "@/lib/supabase/priorities"

/**
 * מנוי לשינויים בטבלת priorities — מסונן לפי user_id (תואם RLS).
 * דורש הפעלת Realtime לטבלה בפרויקט Supabase (Database → Replication).
 */
export function usePrioritiesRealtime(
  userId: string | undefined | null,
  onChange: () => void
) {
  useEffect(() => {
    const supabase = getSupabaseBrowser()
    if (!supabase || !userId) return

    const channel = supabase
      .channel(`priorities-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "priorities",
          filter: `${PRIORITIES_USER_ID_COLUMN}=eq.${userId}`,
        },
        () => {
          onChange()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, onChange])
}

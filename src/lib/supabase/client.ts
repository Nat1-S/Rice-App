/**
 * לקוח Supabase לדפדפן — session ב-cookies דרך @supabase/ssr.
 */
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { isSupabaseConfigured, readSupabaseEnv } from "./env"

export type PriorityRow = {
  id: string
  user_id: string
  name: string
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
}

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient | null {
  const env = readSupabaseEnv()
  if (!env) return null
  if (browserClient) return browserClient
  browserClient = createBrowserClient(env.url, env.key)
  return browserClient
}

export { isSupabaseConfigured }

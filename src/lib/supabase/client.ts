/**
 * לקוח Supabase לדפדפן — `@supabase/supabase-js`.
 * כתובת ומפתח נטענים מ-.env.local (או .env): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * לא Firebase — כל הגישה לנתונים דרך Supabase בלבד.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export type PriorityRow = {
  id: string
  name: string
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
}

let browserClient: SupabaseClient | null = null

/** כתובת פרויקט Supabase — בלי נתיב /rest/v1/ (טעות נפוצה בהעתקה). */
function normalizeSupabaseProjectUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "")
  if (u.endsWith("/rest/v1")) u = u.slice(0, -"/rest/v1".length).replace(/\/+$/, "")
  return u
}

function readSupabaseEnv(): { url: string; key: string } | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!rawUrl || !key) return null
  const url = normalizeSupabaseProjectUrl(rawUrl)
  if (!url.startsWith("http") || key.length < 20) return null
  return { url, key }
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseEnv() != null
}

export function getSupabaseBrowser(): SupabaseClient | null {
  const env = readSupabaseEnv()
  if (!env) return null
  if (browserClient) return browserClient
  browserClient = createClient(env.url, env.key)
  return browserClient
}

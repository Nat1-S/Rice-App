/** כתובת פרויקט Supabase — בלי נתיב /rest/v1/ (טעות נפוצה בהעתקה). */
export function normalizeSupabaseProjectUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "")
  if (u.endsWith("/rest/v1")) {
    u = u.slice(0, -"/rest/v1".length).replace(/\/+$/, "")
  }
  return u
}

export function readSupabaseEnv(): { url: string; key: string } | null {
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

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { readSupabaseEnv } from "./env"

export async function createSupabaseServerClient() {
  const env = readSupabaseEnv()
  if (!env) {
    throw new Error("Supabase env vars are not configured")
  }

  const cookieStore = await cookies()

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          /* נקרא מ-Server Component ללא אפשרות כתיבת cookies */
        }
      },
    },
  })
}

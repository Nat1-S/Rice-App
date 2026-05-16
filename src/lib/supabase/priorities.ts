import type { SupabaseClient } from "@supabase/supabase-js"

/** Column used for multi-tenant isolation — must match RLS policies in Supabase. */
export const PRIORITIES_USER_ID_COLUMN = "user_id" as const

type PriorityInsert = {
  name: string
  reach: number
  impact: number
  confidence: number
  effort: number
  score: number
  user_id: string
}

type PriorityUpdate = Omit<PriorityInsert, "user_id">

/** SELECT scoped to the signed-in user. */
export function selectPrioritiesForUser(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("priorities")
    .select("*")
    .eq(PRIORITIES_USER_ID_COLUMN, userId)
}

/**
 * Resolves the authenticated user's id from the live Supabase session (JWT).
 * Prefer this over React state alone so `auth.uid()` matches `user_id` on INSERT.
 */
export async function resolveAuthenticatedUserId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()
  if (sessionError) return null
  if (sessionData.session?.user?.id) return sessionData.session.user.id

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) return null
  return userData.user?.id ?? null
}

/** INSERT — `user_id` must equal `auth.uid()` for RLS (authenticated role). */
export function insertPriorityForUser(
  supabase: SupabaseClient,
  row: PriorityInsert
) {
  return supabase.from("priorities").insert([row])
}

/** UPDATE scoped to the signed-in user. */
export function updatePriorityForUser(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: PriorityUpdate
) {
  return supabase
    .from("priorities")
    .update(patch)
    .eq("id", id)
    .eq(PRIORITIES_USER_ID_COLUMN, userId)
}

/** DELETE scoped to the signed-in user. */
export function deletePriorityForUser(
  supabase: SupabaseClient,
  userId: string,
  id: string
) {
  return supabase
    .from("priorities")
    .delete()
    .eq("id", id)
    .eq(PRIORITIES_USER_ID_COLUMN, userId)
}

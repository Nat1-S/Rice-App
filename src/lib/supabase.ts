/**
 * נקודת כניסה אחת ל-Supabase (תואם בקשה ל־`lib/supabase.ts`).
 * המימוש בפועל ב־`./supabase/client.ts` — משתני סביבה מ־`.env.local`.
 */
export {
  getSupabaseBrowser,
  isSupabaseConfigured,
  type PriorityRow,
} from "./supabase/client"

/**
 * OAuth redirect helpers — always derive from the live browser origin in the client,
 * never from a hardcoded localhost URL.
 */
export function getBrowserOrigin(): string {
  if (typeof window === "undefined") return ""
  return window.location.origin
}

/** Full callback URL for Supabase `signInWithOAuth` (client-only). */
export function getOAuthCallbackUrl(): string {
  const origin = getBrowserOrigin()
  if (!origin) {
    throw new Error("OAuth redirect requires a browser environment")
  }
  return `${origin}/auth/callback`
}

/** Production-safe origin for server redirects (e.g. Vercel `x-forwarded-host`). */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim()
    if (host) {
      return `${forwardedProto}://${host}`
    }
  }

  return new URL(request.url).origin
}

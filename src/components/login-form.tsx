"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { getOAuthCallbackUrl } from "@/lib/auth-redirect"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { TapMotion } from "@/components/tap-motion"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function LoginForm() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authError = searchParams.get("error") === "auth"

  useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [loading, user, router])

  const handleGoogle = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const supabase = getSupabaseBrowser()
      if (!supabase) {
        throw new Error(t.auth.notConfigured)
      }
      const redirectTo = getOAuthCallbackUrl()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
      if (oauthError) throw oauthError
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.authError)
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="absolute top-4 end-4 z-20">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-[18rem] border-border/80 shadow-md sm:max-w-xs">
        <CardHeader className="space-y-1 px-5 pt-5 pb-1 text-center">
          <CardTitle className="text-base font-semibold leading-snug">
            {t.auth.loginTitle}
          </CardTitle>
          <CardDescription className="text-balance text-xs leading-relaxed">
            {t.auth.loginSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 px-5 pb-5">
          {!isSupabaseConfigured() && (
            <p className="text-center text-amber-600 text-xs leading-relaxed dark:text-amber-400">
              {t.auth.notConfigured}
            </p>
          )}
          {(authError || error) && (
            <p className="text-center text-destructive text-sm">
              {error ?? t.auth.authError}
            </p>
          )}
          <TapMotion className="w-full">
            <Button
              type="button"
              size="default"
              className="h-10 w-full justify-center gap-2.5 bg-white text-[#3c4043] text-sm shadow-sm ring-1 ring-border hover:bg-zinc-50 dark:bg-white dark:text-[#3c4043] dark:hover:bg-zinc-100"
              disabled={!isSupabaseConfigured() || submitting || loading}
              onClick={() => void handleGoogle()}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white">
                <GoogleIcon className="size-5" />
              </span>
              <span className="font-medium">
                {submitting ? t.auth.signingIn : t.auth.signInGoogle}
              </span>
            </Button>
          </TapMotion>
        </CardContent>
      </Card>
    </>
  )
}

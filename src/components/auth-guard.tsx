"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TapMotion } from "@/components/tap-motion"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured()) {
      router.replace("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </div>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md border-border/80">
          <CardHeader>
            <CardTitle className="text-base">{t.auth.notConfigured}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {t.calculator.envHint}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md border-border/80 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle>{t.auth.guardTitle}</CardTitle>
            <p className="text-muted-foreground text-sm">{t.auth.guardSubtitle}</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <TapMotion>
              <Button type="button" onClick={() => void signInWithGoogle()}>
                {t.auth.signInGoogle}
              </Button>
            </TapMotion>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

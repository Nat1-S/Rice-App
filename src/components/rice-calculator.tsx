"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricOptionsGrid } from "@/components/metric-options-grid"
import { TapMotion } from "@/components/tap-motion"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import {
  calculateRiceScore,
  confidenceAsDecimal,
  confidenceFromSliderUi,
  confidenceSliderUiValue,
  confidenceTrackGradient,
  getEffortOptionsForDir,
  getImpactOptionsForDir,
  REACH_MAX,
  REACH_MIN,
  reachFillJustifyClass,
  reachFromSliderUi,
  reachFillPercent,
  reachSliderUiValue,
  scoreTier,
} from "@/lib/rice"
import { scoreTierFromDictionary } from "@/lib/score-tier-ui"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  insertPriorityForUser,
  resolveAuthenticatedUserId,
} from "@/lib/supabase/priorities"
import { pageContainerNarrow, sliderTouchClass } from "@/lib/layout"
import { cn } from "@/lib/utils"

function confidenceHue(percent: number): string {
  const t = Math.min(100, Math.max(0, percent)) / 100
  const h = 120 * t
  return `oklch(0.72 0.17 ${h})`
}

function ScoreResultIcon({ tier }: { tier: "high" | "medium" | "low" }) {
  const base = "size-14 shrink-0 drop-shadow-sm"
  if (tier === "high") {
    return <CheckCircle2 className={cn(base, "text-emerald-500")} aria-hidden />
  }
  if (tier === "medium") {
    return <CircleHelp className={cn(base, "text-amber-400")} aria-hidden />
  }
  return <XCircle className={cn(base, "text-red-500")} aria-hidden />
}

export function RiceCalculator() {
  const { user, session, loading: authLoading } = useAuth()
  const { t, dir } = useTranslation()
  const router = useRouter()
  const rtl = dir === "rtl"

  const impactOptions = useMemo(
    () => getImpactOptionsForDir(rtl),
    [rtl]
  )
  const effortOptions = useMemo(() => getEffortOptionsForDir(rtl), [rtl])

  const [name, setName] = useState("")
  const [reach, setReach] = useState<number[]>([5])
  const [impact, setImpact] = useState<number>(1)
  const [confidence, setConfidence] = useState<number[]>([70])
  const [effort, setEffort] = useState(1)
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState(0)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "ok" | "err">(
    "idle"
  )
  const [saveErrorDetail, setSaveErrorDetail] = useState<string | null>(null)

  const conf = confidence[0] ?? 70
  const reachVal = reach[0] ?? 5

  const previewScore = useMemo(() => {
    return calculateRiceScore(reachVal, impact, conf, effort)
  }, [reachVal, effort, impact, conf])

  const isSignedIn = Boolean(user?.id && session)
  const canSave =
    isSupabaseConfigured() &&
    isSignedIn &&
    !authLoading &&
    Boolean(name.trim()) &&
    previewScore != null

  const runConfetti = useCallback(() => {
    const end = Date.now() + 1200
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#a855f7", "#38bdf8", "#fbbf24"],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#a855f7", "#38bdf8", "#fbbf24"],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  useEffect(() => {
    if (!open) return
    if (scoreTier(score) === "high") runConfetti()
  }, [open, score, runConfetti])

  const reachHintText = useMemo(
    () =>
      t.calculator.reachHint
        .replace("{max}", String(REACH_MAX))
        .replace("{min}", String(REACH_MIN)),
    [t.calculator.reachHint]
  )

  const handleCalculate = () => {
    if (previewScore == null) return
    setScore(previewScore)
    setSaveStatus("idle")
    setSaveErrorDetail(null)
    setOpen(true)
  }

  const handleSave = async () => {
    const supabase = getSupabaseBrowser()
    if (!supabase) {
      setSaveStatus("err")
      setSaveErrorDetail(t.calculator.envHint)
      return
    }
    if (!name.trim() || previewScore == null) {
      setSaveStatus("err")
      setSaveErrorDetail(t.calculator.missingNameOrScore)
      return
    }
    if (authLoading) return

    if (!user?.id || !session) {
      setSaveStatus("err")
      setSaveErrorDetail(t.calculator.notSignedIn)
      router.replace("/login")
      return
    }

    setSaveStatus("saving")
    setSaveErrorDetail(null)
    try {
      let userId = await resolveAuthenticatedUserId(supabase)

      if (!userId) {
        const { data: refreshed, error: refreshError } =
          await supabase.auth.refreshSession()
        if (refreshError) {
          setSaveStatus("err")
          setSaveErrorDetail(refreshError.message)
          return
        }
        userId = refreshed.session?.user?.id ?? null
      }

      if (!userId) {
        setSaveStatus("err")
        setSaveErrorDetail(t.calculator.notSignedIn)
        router.replace("/login")
        return
      }

      const { error } = await insertPriorityForUser(supabase, {
        name: name.trim(),
        reach: reachVal,
        impact,
        confidence: conf,
        effort,
        score: previewScore,
        user_id: userId,
      })
      if (error) {
        setSaveStatus("err")
        setSaveErrorDetail(error.message)
      } else {
        setSaveStatus("ok")
      }
    } catch (e) {
      setSaveStatus("err")
      setSaveErrorDetail(
        e instanceof Error ? e.message : t.common.networkError
      )
    }
  }

  const resultUi = scoreTierFromDictionary(score, t.scoreTier)

  const confDec = confidenceAsDecimal(conf)

  return (
    <div className={pageContainerNarrow}>
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">{t.calculator.title}</h1>
        <p className="mt-1 text-muted-foreground text-sm">{t.calculator.subtitle}</p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.calculator.ideaDetails}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="idea-name">{t.calculator.ideaName}</Label>
            <Input
              id="idea-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.calculator.ideaPlaceholder}
              autoComplete="off"
              className="bg-transparent dark:bg-input/30"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>{t.calculator.reach}</Label>
              <span
                dir="ltr"
                className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs tabular-nums"
              >
                {reachVal} / {REACH_MAX}
              </span>
            </div>
            <div dir="ltr" className={cn("rounded-xl p-3 ring-1 ring-border/60", sliderTouchClass)}>
              <div className="relative min-w-0 px-1">
                <div
                  className="pointer-events-none absolute inset-x-1 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-muted"
                  aria-hidden
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-1 top-1/2 z-[1] flex h-1 -translate-y-1/2 overflow-hidden rounded-full",
                    reachFillJustifyClass(rtl)
                  )}
                  aria-hidden
                >
                  <div
                    className="h-full shrink-0 rounded-full bg-white/55 transition-[width] duration-150 ease-out"
                    style={{ width: `${reachFillPercent(reachVal)}%` }}
                  />
                </div>
                <Slider
                  min={REACH_MIN}
                  max={REACH_MAX}
                  step={1}
                  value={[reachSliderUiValue(reachVal, rtl)]}
                  onValueChange={(v) => {
                    const ui = Array.isArray(v) ? v[0]! : v
                    setReach([reachFromSliderUi(ui, rtl)])
                  }}
                  className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">{reachHintText}</p>
          </div>

          <div className="space-y-2">
            <Label>{t.calculator.impact}</Label>
            <MetricOptionsGrid
              options={impactOptions}
              selected={impact}
              onSelect={setImpact}
              renderOption={(value) => (
                <>
                  <span className="font-medium tabular-nums">{value}</span>
                  <span className="opacity-80">
                    {t.impactLabels[String(value)]}
                  </span>
                </>
              )}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>{t.calculator.confidence}</Label>
              <span
                dir="ltr"
                className="rounded-md px-2 py-0.5 font-medium text-xs tabular-nums"
                style={{
                  backgroundColor: `${confidenceHue(conf)}22`,
                  color: confidenceHue(conf),
                }}
              >
                {conf}% ({confDec.toFixed(2)})
              </span>
            </div>
            <div dir="ltr" className={cn("rounded-xl p-3 ring-1 ring-border/60", sliderTouchClass)}>
              <div
                className="relative min-w-0 rounded-lg px-1"
                style={{
                  background: confidenceTrackGradient(rtl),
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-2 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-black/30"
                  aria-hidden
                />
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[confidenceSliderUiValue(conf, rtl)]}
                  onValueChange={(v) => {
                    const ui = Array.isArray(v) ? v[0]! : v
                    setConfidence([confidenceFromSliderUi(ui, rtl)])
                  }}
                  className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">{t.calculator.confidenceHint}</p>
          </div>

          <div className="space-y-2">
            <Label>{t.calculator.effort}</Label>
            <MetricOptionsGrid
              options={effortOptions}
              selected={effort}
              onSelect={setEffort}
              renderOption={(value) => (
                <>
                  <span className="font-medium tabular-nums">{value}</span>
                  <span className="opacity-80">{t.common.months}</span>
                </>
              )}
            />
          </div>

          {previewScore != null && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground text-xs"
            >
              {t.calculator.previewFormula
                .replace("{reach}", String(reachVal))
                .replace("{impact}", String(impact))
                .replace("{confidence}", confDec.toFixed(2))
                .replace("{effort}", String(effort))}{" "}
              <span className="font-mono text-foreground">
                {previewScore.toFixed(1)}
              </span>
            </motion.p>
          )}

          <TapMotion className="inline-flex w-full sm:w-auto">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleCalculate}
              disabled={previewScore == null}
            >
              {t.common.calculate}
            </Button>
          </TapMotion>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(90dvh,640px)] overflow-y-auto sm:max-w-md">
          <DialogHeader className="relative gap-4 pe-11 ps-4">
            <DialogTitle className="text-start text-base">{t.calculator.resultTitle}</DialogTitle>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="flex items-start gap-3 text-start"
            >
              <ScoreResultIcon tier={resultUi.tier} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Badge
                  variant={resultUi.variant}
                  className="h-auto w-fit max-w-full whitespace-normal py-2 ps-3 pe-3 text-sm leading-snug font-semibold"
                  title={resultUi.description}
                >
                  <span className="me-1.5" aria-hidden>
                    {resultUi.emoji}
                  </span>
                  {resultUi.label}
                </Badge>
                <DialogDescription className="text-start text-muted-foreground">
                  <span className="block text-foreground/90">{resultUi.description}</span>
                  <span className="mt-2 block">{t.calculator.thresholds}</span>
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 px-4 py-3 font-mono text-2xl tabular-nums tracking-tight">
            {score.toFixed(1)}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {!isSupabaseConfigured() && (
              <p className="text-amber-600 text-xs leading-relaxed dark:text-amber-400">
                {t.calculator.envHint}
              </p>
            )}
            <AnimatePresence mode="wait">
              {saveStatus === "ok" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-600 text-xs dark:text-emerald-400"
                >
                  {t.calculator.savedToList}
                </motion.p>
              )}
              {saveStatus === "err" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-destructive text-xs">{t.calculator.saveFailed}</p>
                  {saveErrorDetail && (
                    <pre className="max-h-24 overflow-auto rounded-md bg-muted/80 p-2 font-mono text-[10px] leading-snug whitespace-pre-wrap break-words text-muted-foreground">
                      {saveErrorDetail}
                    </pre>
                  )}
                  {saveErrorDetail &&
                    /row-level security|rls|permission denied|42501/i.test(
                      saveErrorDetail
                    ) && (
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        {t.calculator.rlsHint}
                      </p>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-wrap gap-2">
              <TapMotion>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleSave()}
                  disabled={!canSave || saveStatus === "saving"}
                  title={
                    !isSignedIn && !authLoading
                      ? t.calculator.notSignedIn
                      : undefined
                  }
                >
                  {saveStatus === "saving" ? t.common.saving : t.calculator.saveToList}
                </Button>
              </TapMotion>
              <TapMotion>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t.common.close}
                </Button>
              </TapMotion>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

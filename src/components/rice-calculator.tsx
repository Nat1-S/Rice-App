"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { TapMotion } from "@/components/tap-motion"
import {
  calculateRiceScore,
  confidenceAsDecimal,
  confidenceFromSliderUi,
  confidenceSliderUiValue,
  EFFORT_OPTIONS,
  IMPACT_OPTIONS,
  REACH_MAX,
  REACH_MIN,
  reachFromSliderUi,
  reachFillPercent,
  reachSliderUiValue,
  scoreTier,
  scoreTierUi,
} from "@/lib/rice"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
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
      setSaveErrorDetail("אין הגדרת Supabase בדפדפן (משתני NEXT_PUBLIC_*).")
      return
    }
    if (!name.trim() || previewScore == null) {
      setSaveStatus("err")
      setSaveErrorDetail("חסר שם או ציון לא תקין.")
      return
    }
    setSaveStatus("saving")
    setSaveErrorDetail(null)
    try {
      const { error } = await supabase.from("priorities").insert({
        name: name.trim(),
        reach: reachVal,
        impact,
        confidence: conf,
        effort,
        score: previewScore,
      })
      if (error) {
        setSaveStatus("err")
        setSaveErrorDetail(error.message)
      } else {
        setSaveStatus("ok")
      }
    } catch (e) {
      setSaveStatus("err")
      setSaveErrorDetail(e instanceof Error ? e.message : "שגיאה לא ידועה")
    }
  }

  const resultUi = scoreTierUi(score)

  const confDec = confidenceAsDecimal(conf)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">מחשבון RICE</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          נוסחה: (Reach × Impact × Confidence) ÷ Effort — כאשר Confidence הוא
          מספר עשרוני (למשל 0.8 ל־80%).
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">פרטי הרעיון</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="idea-name">שם הרעיון / הפיצ&apos;ר</Label>
            <Input
              id="idea-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="למשל: אינטגרציה ל-Slack"
              autoComplete="off"
              className="bg-transparent dark:bg-input/30"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>Reach (תפוצה)</Label>
              <span
                dir="ltr"
                className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs tabular-nums"
              >
                {reachVal} / {REACH_MAX}
              </span>
            </div>
            <div dir="ltr" className="rounded-xl p-3 ring-1 ring-border/60">
              <div className="relative px-1 py-2.5">
                <div
                  className="pointer-events-none absolute inset-x-1 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-muted"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-1 top-1/2 z-[1] flex h-1 -translate-y-1/2 justify-end overflow-hidden rounded-full"
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
                  value={[reachSliderUiValue(reachVal)]}
                  onValueChange={(v) => {
                    const ui = Array.isArray(v) ? v[0]! : v
                    setReach([reachFromSliderUi(ui)])
                  }}
                  className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              שמאל = תפוצה רחבה ({REACH_MAX}), ימין = מיעוט ({REACH_MIN}).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Impact (השפעה)</Label>
            <div
              dir="ltr"
              className="grid grid-cols-5 gap-1 rounded-lg bg-muted/40 p-1 ring-1 ring-border/60"
            >
              {IMPACT_OPTIONS.map((opt) => {
                const selected = impact === opt.value
                return (
                  <TapMotion key={opt.value} className="block min-w-0">
                    <Button
                      type="button"
                      variant={selected ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-auto w-full flex-col gap-0.5 py-2 text-[10px] leading-tight",
                        selected && "shadow-sm"
                      )}
                      onClick={() => setImpact(opt.value)}
                    >
                      <span className="font-medium">{opt.value}</span>
                      <span className="opacity-80">{opt.label}</span>
                    </Button>
                  </TapMotion>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>Confidence (ביטחון)</Label>
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
            <div dir="ltr" className="rounded-xl p-3 ring-1 ring-border/60">
              <div
                className="relative rounded-lg px-1 py-2"
                style={{
                  background:
                    "linear-gradient(90deg, #16a34a 0%, #facc15 50%, #dc2626 100%)",
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
                  value={[confidenceSliderUiValue(conf)]}
                  onValueChange={(v) => {
                    const ui = Array.isArray(v) ? v[0]! : v
                    setConfidence([confidenceFromSliderUi(ui)])
                  }}
                  className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              שמאל = ביטחון גבוה (100%), ימין = ביטחון נמוך (0%). בנוסחה משתמשים
              בעשרוני (למשל 80% → 0.8).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Effort (מאמץ, חודשי-אדם)</Label>
            <div
              dir="ltr"
              className="grid grid-cols-5 gap-1 rounded-lg bg-muted/40 p-1 ring-1 ring-border/60"
            >
              {EFFORT_OPTIONS.map((opt) => {
                const selected = effort === opt.value
                return (
                  <TapMotion key={opt.value} className="block min-w-0">
                    <Button
                      type="button"
                      variant={selected ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-auto w-full flex-col gap-0.5 py-2 text-[10px] leading-tight",
                        selected && "shadow-sm"
                      )}
                      onClick={() => setEffort(opt.value)}
                    >
                      <span className="font-medium tabular-nums">{opt.value}</span>
                      <span className="opacity-80">{opt.label}</span>
                    </Button>
                  </TapMotion>
                )
              })}
            </div>
          </div>

          {previewScore != null && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-muted-foreground text-xs"
            >
              ({reachVal} × {impact} × {confDec.toFixed(2)}) ÷ {effort} ={" "}
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
              חשב
            </Button>
          </TapMotion>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="relative gap-4 pr-11 pl-4">
            <DialogTitle className="text-start text-base">תוצאת RICE</DialogTitle>
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
                  <span className="mt-2 block">
                    ספים: 1–10 נמוך · 11–24 בינוני · 25 ומעלה גבוה.
                  </span>
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
                צרו קובץ{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">.env.local</code>{" "}
                בתיקיית <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">priority-master</code>{" "}
                (ליד <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">package.json</code>
                ), עם <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                (כתובת בסיס <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">…supabase.co</code> בלי{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">/rest/v1/</code>
                ) ו־
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                . אפשר להעתיק מ־
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">.env.example</code>
                . אחרי שמירה: עצרו והפעילו מחדש את <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">npm run dev</code>{" "}
                כדי ש־Next יטעין את המשתנים — בלי זה כפתור השמירה והחיוויים ברשימה לא יופעלו.
              </p>
            )}
            <AnimatePresence mode="wait">
              {saveStatus === "ok" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-600 text-xs dark:text-emerald-400"
                >
                  נשמר ברשימת תעדוף.
                </motion.p>
              )}
              {saveStatus === "err" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-destructive text-xs">
                    שמירה נכשלה — בדקו חיבור, טבלת priorities והרשאות (RLS) ב-Supabase.
                  </p>
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
                        הריצו ב-SQL Editor של Supabase את הקובץ{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                          supabase/migrations/20260514140000_priorities_anon_grants.sql
                        </code>{" "}
                        (או <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">supabase db push</code>
                        ) כדי לפתוח הרשאות ל־anon על הטבלה.
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
                  onClick={handleSave}
                  disabled={
                    !isSupabaseConfigured() ||
                    saveStatus === "saving" ||
                    !name.trim() ||
                    previewScore == null
                  }
                >
                  {saveStatus === "saving" ? "שומר…" : "שמור לרשימה"}
                </Button>
              </TapMotion>
              <TapMotion>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  סגור
                </Button>
              </TapMotion>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

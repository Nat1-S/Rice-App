"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TapMotion } from "@/components/tap-motion"
import {
  calculateRiceScore,
  clampReach,
  confidenceFromSliderUi,
  confidenceSliderUiValue,
  EFFORT_OPTIONS,
  IMPACT_OPTIONS,
  REACH_MAX,
  REACH_MIN,
  reachFillPercent,
  reachFromSliderUi,
  reachSliderUiValue,
  scoreTierUi,
  snapEffortToDiscrete,
} from "@/lib/rice"
import { cn } from "@/lib/utils"
import type { PriorityRow } from "@/lib/supabase/client"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import { usePrioritiesRealtime } from "@/hooks/use-priorities-realtime"

export function PriorityList() {
  const [rows, setRows] = useState<PriorityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<PriorityRow | null>(null)
  const [form, setForm] = useState({
    name: "",
    reach: [5] as number[],
    impact: 1 as number,
    confidence: [70] as number[],
    effort: 1 as number,
  })

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowser()
    if (!supabase) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from("priorities")
        .select("*")
        .order("score", { ascending: false })
      if (error) {
        setFetchError(error.message)
        setRows([])
      } else {
        setRows((data ?? []) as PriorityRow[])
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "שגיאת רשת")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onRealtime = useCallback(() => {
    void load()
  }, [load])

  usePrioritiesRealtime(onRealtime)

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.score - a.score),
    [rows]
  )

  const openEdit = (row: PriorityRow) => {
    setActionError(null)
    setEditing(row)
    setForm({
      name: row.name,
      reach: [clampReach(Number(row.reach))],
      impact: row.impact,
      confidence: [row.confidence],
      effort: snapEffortToDiscrete(Number(row.effort)),
    })
    setSheetOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("להסיר את הרעיון מהרשימה? (הדאשבורד יתעדכן אוטומטית)")) return
    const supabase = getSupabaseBrowser()
    if (!supabase) return
    setActionError(null)
    try {
      const { error } = await supabase.from("priorities").delete().eq("id", id)
      if (error) {
        setActionError(error.message)
        return
      }
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "מחיקה נכשלה")
    }
  }

  const saveEdit = async () => {
    if (!editing) return
    const supabase = getSupabaseBrowser()
    if (!supabase) return
    const reachVal = form.reach[0] ?? REACH_MIN
    const effort = form.effort
    const conf = form.confidence[0] ?? 70
    const score = calculateRiceScore(reachVal, form.impact, conf, effort)
    if (score == null) return
    setActionError(null)
    try {
      const { error } = await supabase
        .from("priorities")
        .update({
          name: form.name.trim(),
          reach: reachVal,
          impact: form.impact,
          confidence: conf,
          effort,
          score,
        })
        .eq("id", editing.id)
      if (error) {
        setActionError(error.message)
        return
      }
      setSheetOpen(false)
      await load()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "עדכון נכשל")
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-6 text-center sm:px-6">
        <h1 className="font-semibold text-2xl tracking-tight">רשימת תעדוף</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          רק רעיונות שנשמרו. ממוין לפי ציון יורד.
        </p>
        <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
          אין חיבור ל-Supabase (משתני <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_*</code> לא נטענו). צרו קובץ{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            .env.local
          </code>{" "}
          בתיקיית <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">priority-master</code> (ליד{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">package.json</code>
          ) והגדירו בו{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          (כתובת בסיס <code className="rounded bg-muted px-1.5 py-0.5 text-xs">…supabase.co</code> בלי{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/rest/v1/</code>
          ) ו־
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          — ראו <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env.example</code>
          . אחרי שמירה: הפעילו מחדש את <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run dev</code>
          . בלי זה לא תופיע כאן הטבלה עם חיווי הציונים. טבלת{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">priorities</code> ב-Supabase צריכה לכלול: id, name, reach, impact, confidence, effort, score.
        </p>
      </div>
    )
  }

  return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 py-6 sm:px-6">
      <div className="w-full text-center">
        <h1 className="font-semibold text-2xl tracking-tight">רשימת תעדוף</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          רק רעיונות שנשמרו. ממוין לפי ציון יורד.
        </p>
      </div>

      {fetchError && (
        <p className="w-full max-w-md rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-destructive text-sm">
          {fetchError}
        </p>
      )}
      {actionError && !sheetOpen && (
        <p className="w-full max-w-md rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-amber-700 text-sm dark:text-amber-400">
          {actionError}
        </p>
      )}

      <div className="w-fit max-w-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
        <Table dir="rtl" className="w-auto table-auto text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="max-w-[12rem] text-end whitespace-normal px-3 py-2 text-xs font-semibold">
                שם הרעיון
              </TableHead>
              <TableHead className="min-w-[10.5rem] text-end whitespace-nowrap px-3 py-2 text-xs font-semibold">
                ציון
              </TableHead>
              <TableHead className="text-end whitespace-nowrap px-2 py-2 text-xs font-semibold">
                פעולות
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3} className="px-2 py-4 text-center text-muted-foreground text-sm">
                  טוען…
                </TableCell>
              </TableRow>
            )}
            {!loading && sorted.length === 0 && !fetchError && (
              <TableRow>
                <TableCell colSpan={3} className="px-2 py-4 text-center text-muted-foreground text-sm">
                  אין עדיין רעיונות. חשבו RICE בעמוד הבית ושמרו לרשימה.
                </TableCell>
              </TableRow>
            )}
            {sorted.map((row) => {
              const tier = scoreTierUi(row.score)
              return (
                <TableRow
                  key={row.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => openEdit(row)}
                >
                  <TableCell className="max-w-[12rem] text-end align-middle whitespace-normal px-3 py-2">
                    <span className="font-medium leading-snug">{row.name}</span>
                  </TableCell>
                  <TableCell className="min-w-[10.5rem] text-end align-middle whitespace-nowrap px-3 py-2">
                    <div className="flex flex-row flex-nowrap items-center justify-end gap-2">
                      <span className="font-mono text-sm tabular-nums leading-none">
                        {row.score.toFixed(1)}
                      </span>
                      <Badge
                        variant={tier.variant}
                        title={tier.description}
                        className="h-6 shrink-0 gap-0.5 px-2 py-0 text-[11px] font-medium leading-none"
                      >
                        <span aria-hidden>{tier.emoji}</span>
                        {tier.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-2 align-middle">
                    <div className="flex justify-end gap-0">
                      <TapMotion>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="עריכה"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(row)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </TapMotion>
                      <TapMotion>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label="מחיקה"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleDelete(row.id)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TapMotion>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          closeOnLeft
          className="w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b p-4 ps-14 pe-4">
            <SheetTitle>עריכה מהירה</SheetTitle>
          </SheetHeader>
          {actionError && sheetOpen && (
            <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-destructive text-xs">
              {actionError}
            </p>
          )}
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">שם</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>
                    Reach ({REACH_MIN}–{REACH_MAX})
                  </Label>
                  <span
                    dir="ltr"
                    className="rounded-md bg-muted px-2 py-0.5 font-medium text-xs tabular-nums"
                  >
                    {form.reach[0] ?? REACH_MIN}
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
                        style={{
                          width: `${reachFillPercent(form.reach[0] ?? REACH_MIN)}%`,
                        }}
                      />
                    </div>
                    <Slider
                      min={REACH_MIN}
                      max={REACH_MAX}
                      step={1}
                      value={[
                        reachSliderUiValue(form.reach[0] ?? REACH_MIN),
                      ]}
                      onValueChange={(v) => {
                        const ui = Array.isArray(v) ? v[0]! : v
                        setForm((f) => ({
                          ...f,
                          reach: [reachFromSliderUi(ui)],
                        }))
                      }}
                      className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Impact</Label>
                <div
                  dir="ltr"
                  className="grid grid-cols-5 gap-1 rounded-lg bg-muted/40 p-1 ring-1 ring-border/60"
                >
                  {IMPACT_OPTIONS.map((opt) => {
                    const selected = form.impact === opt.value
                    return (
                      <TapMotion key={opt.value} className="block min-w-0">
                        <Button
                          type="button"
                          variant={selected ? "default" : "ghost"}
                          size="sm"
                          className="h-auto w-full flex-col gap-0.5 py-2 text-[10px]"
                          onClick={() =>
                            setForm((f) => ({ ...f, impact: opt.value }))
                          }
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
                <Label>Confidence (%)</Label>
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
                      value={[
                        confidenceSliderUiValue(
                          form.confidence[0] ?? 0
                        ),
                      ]}
                      onValueChange={(v) => {
                        const ui = Array.isArray(v) ? v[0]! : v
                        setForm((f) => ({
                          ...f,
                          confidence: [confidenceFromSliderUi(ui)],
                        }))
                      }}
                      className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Effort (חודשי-אדם)</Label>
                <div
                  dir="ltr"
                  className="grid grid-cols-5 gap-1 rounded-lg bg-muted/40 p-1 ring-1 ring-border/60"
                >
                  {EFFORT_OPTIONS.map((opt) => {
                    const selected = form.effort === opt.value
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
                          onClick={() =>
                            setForm((f) => ({ ...f, effort: opt.value }))
                          }
                        >
                          <span className="font-medium tabular-nums">
                            {opt.value}
                          </span>
                          <span className="opacity-80">{opt.label}</span>
                        </Button>
                      </TapMotion>
                    )
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="border-t p-4">
            <TapMotion className="w-full">
              <Button type="button" className="w-full" onClick={() => void saveEdit()}>
                שמור שינויים
              </Button>
            </TapMotion>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

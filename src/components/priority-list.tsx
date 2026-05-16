"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { MetricOptionsGrid } from "@/components/metric-options-grid"
import { TapMotion } from "@/components/tap-motion"
import {
  calculateRiceScore,
  clampReach,
  confidenceFromSliderUi,
  confidenceSliderUiValue,
  confidenceTrackGradient,
  getEffortOptionsForDir,
  getImpactOptionsForDir,
  REACH_MAX,
  REACH_MIN,
  reachFillJustifyClass,
  reachFillPercent,
  reachFromSliderUi,
  reachSliderUiValue,
  snapEffortToDiscrete,
} from "@/lib/rice"
import { scoreTierFromDictionary } from "@/lib/score-tier-ui"
import { pageContainerNarrow, sliderTouchClass } from "@/lib/layout"
import { cn } from "@/lib/utils"
import type { PriorityRow } from "@/lib/supabase/client"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import { usePrioritiesRealtime } from "@/hooks/use-priorities-realtime"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"

export function PriorityList() {
  const { user, loading: authLoading } = useAuth()
  const { t, dir } = useTranslation()
  const rtl = dir === "rtl"
  const impactOptions = useMemo(
    () => getImpactOptionsForDir(rtl),
    [rtl]
  )
  const effortOptions = useMemo(() => getEffortOptionsForDir(rtl), [rtl])

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
    if (!user) {
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
      setFetchError(e instanceof Error ? e.message : t.common.networkError)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [user, t.common.networkError])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    if (authLoading) {
      setLoading(true)
      return
    }
    void load()
  }, [authLoading, load])

  const onRealtime = useCallback(() => {
    void load()
  }, [load])

  usePrioritiesRealtime(user?.id, onRealtime)

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.score - a.score),
    [rows]
  )

  const needsSignIn = !authLoading && !user
  const editSheetSide = dir === "rtl" ? "left" : "right"

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
    if (!confirm(t.common.confirmDelete)) return
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
      setActionError(e instanceof Error ? e.message : t.common.deleteFailed)
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
      setActionError(e instanceof Error ? e.message : t.common.updateFailed)
    }
  }

  const renderRowActions = (row: PriorityRow) => (
    <div className="flex shrink-0 gap-0">
      <TapMotion>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label={t.common.edit}
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
          size="icon"
          className="size-9 text-destructive hover:text-destructive"
          aria-label={t.common.delete}
          onClick={(e) => {
            e.stopPropagation()
            void handleDelete(row.id)
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </TapMotion>
    </div>
  )

  if (!isSupabaseConfigured()) {
    return (
      <div className={cn(pageContainerNarrow, "items-center text-center")}>
        <h1 className="font-semibold text-2xl tracking-tight">
          {t.list.notConfiguredTitle}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
          {t.list.notConfiguredBody}
        </p>
      </div>
    )
  }

  return (
    <div className={cn(pageContainerNarrow, "items-center")}>
      <div className="w-full text-center">
        <h1 className="font-semibold text-2xl tracking-tight">{t.list.title}</h1>
        <p className="mt-1 text-muted-foreground text-sm">{t.list.subtitle}</p>
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

      {(loading || authLoading) && (
        <p className="w-full text-center text-muted-foreground text-sm md:hidden">
          {t.common.loading}
        </p>
      )}
      {!loading && !authLoading && sorted.length === 0 && !fetchError && (
        <p className="w-full text-center text-muted-foreground text-sm md:hidden">
          {needsSignIn ? t.list.notConfiguredBody : t.list.empty}
        </p>
      )}

      <ul className="flex w-full flex-col gap-3 md:hidden">
        {!loading &&
          !authLoading &&
          sorted.map((row, index) => {
            const tier = scoreTierFromDictionary(row.score, t.scoreTier)
            const rank = index + 1
            return (
              <li key={row.id}>
                <Card
                  className="cursor-pointer border-border/80 shadow-sm transition-colors hover:bg-muted/20"
                  onClick={() => openEdit(row)}
                >
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start gap-2">
                      <span
                        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-muted-foreground text-xs tabular-nums"
                        aria-hidden
                      >
                        {rank}
                      </span>
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                        <p
                          className="min-w-0 flex-1 break-all font-medium leading-snug"
                          title={row.name}
                        >
                          {row.name}
                        </p>
                        {renderRowActions(row)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm tabular-nums">
                        {row.score.toFixed(1)}
                      </span>
                      <Badge
                        variant={tier.variant}
                        title={tier.description}
                        className="h-6 shrink-0 gap-0.5 px-2 py-0 text-[11px] font-medium"
                      >
                        <span aria-hidden>{tier.emoji}</span>
                        {tier.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
      </ul>

      <div className="hidden w-full min-w-0 rounded-lg border border-border/80 bg-card shadow-sm md:block">
        <Table dir={dir} className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-12" />
            <col />
            <col className="w-[11.5rem]" />
            <col className="w-[5.25rem]" />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-2 py-2 text-center text-xs font-semibold">
                {t.list.rank}
              </TableHead>
              <TableHead className="min-w-0 px-3 py-2 text-end text-xs font-semibold">
                {t.list.ideaName}
              </TableHead>
              <TableHead className="px-3 py-2 text-end text-xs font-semibold whitespace-nowrap">
                {t.common.score}
              </TableHead>
              <TableHead className="px-2 py-2 text-end text-xs font-semibold whitespace-nowrap">
                {t.common.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(loading || authLoading) && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="px-2 py-4 text-center text-muted-foreground text-sm"
                >
                  {t.common.loading}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              !authLoading &&
              sorted.length === 0 &&
              !fetchError && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-2 py-4 text-center text-muted-foreground text-sm"
                  >
                    {needsSignIn ? t.list.notConfiguredBody : t.list.empty}
                  </TableCell>
                </TableRow>
              )}
            {!loading &&
              !authLoading &&
              sorted.map((row, index) => {
                const tier = scoreTierFromDictionary(row.score, t.scoreTier)
                const rank = index + 1
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => openEdit(row)}
                  >
                    <TableCell className="w-12 px-2 py-2 text-center align-middle font-mono text-muted-foreground text-xs tabular-nums whitespace-nowrap">
                      {rank}
                    </TableCell>
                    <TableCell className="min-w-0 max-w-0 px-3 py-2 text-end align-middle whitespace-normal">
                      <span
                        className="block overflow-hidden font-medium [overflow-wrap:anywhere] line-clamp-2 leading-snug"
                        title={row.name}
                      >
                        {row.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-end align-middle whitespace-nowrap">
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
                    <TableCell className="px-2 py-2 align-middle whitespace-nowrap">
                      <div className="flex justify-end gap-0">
                        <TapMotion>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t.common.edit}
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
                            aria-label={t.common.delete}
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
          side={editSheetSide}
          closeOnLeft={dir === "rtl"}
          className="w-full max-w-full gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b p-4 ps-14 pe-4">
            <SheetTitle>{t.list.quickEdit}</SheetTitle>
          </SheetHeader>
          {actionError && sheetOpen && (
            <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-destructive text-xs">
              {actionError}
            </p>
          )}
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t.common.name}</Label>
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
                    {t.list.reachLabel} ({REACH_MIN}–{REACH_MAX})
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
                      className={cn(
                        "pointer-events-none absolute inset-x-1 top-1/2 z-[1] flex h-1 -translate-y-1/2 overflow-hidden rounded-full",
                        reachFillJustifyClass(rtl)
                      )}
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
                        reachSliderUiValue(form.reach[0] ?? REACH_MIN, rtl),
                      ]}
                      onValueChange={(v) => {
                        const ui = Array.isArray(v) ? v[0]! : v
                        setForm((f) => ({
                          ...f,
                          reach: [reachFromSliderUi(ui, rtl)],
                        }))
                      }}
                      className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.list.impact}</Label>
                <MetricOptionsGrid
                  options={impactOptions}
                  selected={form.impact}
                  onSelect={(value) =>
                    setForm((f) => ({ ...f, impact: value }))
                  }
                  renderOption={(value) => (
                    <>
                      <span className="font-medium tabular-nums">{value}</span>
                      <span className="opacity-80">
                        {t.impactLabels[String(value)] ?? String(value)}
                      </span>
                    </>
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label>{t.list.confidencePercent}</Label>
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
                      value={[
                        confidenceSliderUiValue(
                          form.confidence[0] ?? 0,
                          rtl
                        ),
                      ]}
                      onValueChange={(v) => {
                        const ui = Array.isArray(v) ? v[0]! : v
                        setForm((f) => ({
                          ...f,
                          confidence: [confidenceFromSliderUi(ui, rtl)],
                        }))
                      }}
                      className="relative z-10 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.list.effortPersonMonths}</Label>
                <MetricOptionsGrid
                  options={effortOptions}
                  selected={form.effort}
                  onSelect={(value) =>
                    setForm((f) => ({ ...f, effort: value }))
                  }
                  renderOption={(value) => (
                    <>
                      <span className="font-medium tabular-nums">{value}</span>
                      <span className="opacity-80">{t.common.months}</span>
                    </>
                  )}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="border-t p-4">
            <TapMotion className="w-full">
              <Button type="button" className="w-full" onClick={() => void saveEdit()}>
                {t.common.saveChanges}
              </Button>
            </TapMotion>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

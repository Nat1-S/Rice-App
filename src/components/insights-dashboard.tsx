"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { CSSProperties } from "react"
import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildConfidenceDistribution,
  buildDashboardRecommendations,
  buildRoiRanking,
  confidenceBucketLabel,
  type ConfidenceBucketKey,
} from "@/lib/dashboard-insights"
import { riceNumerator, scoreTier } from "@/lib/rice"
import type { PriorityRow } from "@/lib/supabase/client"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import { usePrioritiesRealtime } from "@/hooks/use-priorities-realtime"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { pageContainerWide } from "@/lib/layout"

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

type QuadrantKey = "quickWins" | "bigBets" | "fillIns" | "timeWasters"

const QUADRANT_ORDER: QuadrantKey[] = [
  "quickWins",
  "bigBets",
  "fillIns",
  "timeWasters",
]

const QUADRANT_COLORS: Record<QuadrantKey, string> = {
  quickWins: "hsl(142 70% 45%)",
  bigBets: "hsl(262 70% 55%)",
  fillIns: "hsl(215 20% 50%)",
  timeWasters: "hsl(0 72% 55%)",
}

const CONFIDENCE_BUCKET_COLORS: Record<ConfidenceBucketKey, string> = {
  b100: "hsl(142 70% 42%)",
  b80: "hsl(168 55% 42%)",
  b50: "hsl(45 93% 47%)",
  bLow: "hsl(0 72% 55%)",
}

const chartTooltipStyle: CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  fontSize: 12,
  color: "#fafafa",
}

function ChartSectionHeader({
  title,
  description,
  microcopy,
}: {
  title: string
  description: string
  microcopy?: string
}) {
  return (
    <CardHeader className="space-y-2 pb-3">
      <CardTitle className="text-base">{title}</CardTitle>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
      {microcopy ? (
        <p className="rounded-md border border-border/50 bg-muted/25 px-2.5 py-1.5 text-[11px] text-muted-foreground leading-relaxed">
          {microcopy}
        </p>
      ) : null}
    </CardHeader>
  )
}

function truncateLabel(name: string, max = 22): string {
  const t = name.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/** תוויות Y משמאל לקו הציר — LTR/RTL מותאם לעברית */
function RoiYAxisTick({
  x = 0,
  y = 0,
  payload,
  maxChars = 26,
  rtl = false,
  compact = false,
}: {
  x?: number
  y?: number
  payload?: { value?: string | number }
  maxChars?: number
  rtl?: boolean
  compact?: boolean
}) {
  const raw = String(payload?.value ?? "")
  const label =
    maxChars >= 200 ? raw : truncateLabel(raw, maxChars)
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={rtl ? -12 : -8}
        y={0}
        dy={4}
        textAnchor={rtl ? "start" : "end"}
        direction={rtl ? "rtl" : "ltr"}
        fill="#94a3b8"
        fontSize={compact ? 9 : 10}
        className="select-none"
      >
        {label}
      </text>
    </g>
  )
}

const scatterTooltipBoxStyle: CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  fontSize: 12,
  color: "#fafafa",
  padding: "8px 10px",
  maxWidth: 280,
}

function formatScatterAxisNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    const update = () => setCoarse(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return coarse
}

/** מסכים צרים (מובייל) — לפריסת גרף ROI בלבד */
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])
  return mobile
}

function BarCategoryTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number
  y?: number
  payload?: { value?: string | number }
}) {
  const label = String(payload?.value ?? "")
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={10}
        className="select-none"
      >
        {label}
      </text>
    </g>
  )
}

/** מספרים בציר Y — מרווח משמאל לקו הציר */
function NumericYAxisTick({
  x = 0,
  y = 0,
  payload,
  formatDecimals = false,
}: {
  x?: number
  y?: number
  payload?: { value?: string | number }
  formatDecimals?: boolean
}) {
  const raw = payload?.value
  const num = typeof raw === "number" ? raw : Number(raw)
  const label =
    formatDecimals && Number.isFinite(num)
      ? formatScatterAxisNumber(num)
      : String(raw ?? "")

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-12}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#94a3b8"
        fontSize={11}
        className="select-none tabular-nums"
      >
        {label}
      </text>
    </g>
  )
}

type ScatterTooltipAnchor = {
  id: string
  name: string
  effort: number
  value: number
  clientX: number
  clientY: number
}

const SCATTER_TOOLTIP_MAX_W = 220

function estimateScatterTooltipSize(title: string) {
  const titleLen = title.length
  const estW = Math.min(
    SCATTER_TOOLTIP_MAX_W,
    Math.max(112, Math.ceil(titleLen * 6.5) + 28)
  )
  const estH = titleLen > 22 ? 78 : 64
  return { estW, estH }
}

function clampScatterTooltipPosition(
  clientX: number,
  clientY: number,
  estW: number,
  estH: number
) {
  const pad = 12
  let left = clientX + 12
  if (left + estW > window.innerWidth - pad) {
    left = clientX - estW - 12
  }
  left = Math.max(pad, Math.min(left, window.innerWidth - estW - pad))

  let top = clientY - estH / 2
  top = Math.max(pad, Math.min(top, window.innerHeight - estH - pad))

  return { left, top }
}

function ScatterTooltipPortal({ anchor }: { anchor: ScatterTooltipAnchor }) {
  const { t } = useTranslation()
  const title = anchor.name.trim() || "—"
  const effortStr = formatScatterAxisNumber(anchor.effort)
  const valueStr = formatScatterAxisNumber(anchor.value)
  const { estW, estH } = estimateScatterTooltipSize(title)
  const { left, top } = clampScatterTooltipPosition(
    anchor.clientX,
    anchor.clientY,
    estW,
    estH
  )

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[200] w-max shadow-lg"
      dir="ltr"
      style={{
        ...scatterTooltipBoxStyle,
        left,
        top,
        maxWidth: `min(${SCATTER_TOOLTIP_MAX_W}px, calc(100vw - 24px))`,
        padding: "6px 9px",
      }}
    >
      <div className="flex flex-col items-start gap-1">
        <p
          className="max-w-[200px] text-start font-semibold text-xs leading-snug"
          style={{ margin: 0, wordBreak: "break-word" }}
          dir="auto"
        >
          {title}
        </p>
        <div className="flex flex-col gap-0.5 text-[11px] leading-tight tabular-nums opacity-90">
          <span>
            {t.dashboard.effortAxis}: {effortStr}
          </span>
          <span>
            {t.dashboard.valueAxis}: {valueStr}
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function InsightsDashboard() {
  const { user } = useAuth()
  const { t, dir } = useTranslation()
  const rtl = dir === "rtl"
  const coarsePointer = useCoarsePointer()
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<PriorityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [scatterTooltip, setScatterTooltip] =
    useState<ScatterTooltipAnchor | null>(null)

  const bindScatterTooltip = useCallback(
    (raw: unknown, e: { clientX: number; clientY: number }) => {
      if (!raw || typeof raw !== "object") return
      const d = raw as {
        id?: string
        name?: string
        effort?: number
        value?: number
      }
      if (d.id == null || d.name == null) return
      setScatterTooltip({
        id: String(d.id),
        name: String(d.name),
        effort: Number(d.effort),
        value: Number(d.value),
        clientX: e.clientX,
        clientY: e.clientY,
      })
    },
    []
  )

  const toggleScatterTooltip = useCallback(
    (raw: unknown, e: { clientX: number; clientY: number }) => {
      if (!raw || typeof raw !== "object") return
      const d = raw as { id?: string; name?: string; effort?: number; value?: number }
      if (d.id == null) return
      setScatterTooltip((prev) =>
        prev?.id === String(d.id)
          ? null
          : {
              id: String(d.id),
              name: String(d.name ?? ""),
              effort: Number(d.effort),
              value: Number(d.value),
              clientX: e.clientX,
              clientY: e.clientY,
            }
      )
    },
    []
  )

  useEffect(() => {
    if (!coarsePointer || !scatterTooltip) return
    const close = () => setScatterTooltip(null)
    window.addEventListener("scroll", close, true)
    return () => window.removeEventListener("scroll", close, true)
  }, [coarsePointer, scatterTooltip])

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
      const { data, error } = await supabase.from("priorities").select("*")
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
  }, [t.common.networkError])

  useEffect(() => {
    void load()
  }, [load])

  const onRealtime = useCallback(() => {
    void load()
  }, [load])

  usePrioritiesRealtime(user?.id, onRealtime)

  const scatterData = useMemo(() => {
    const pts = rows.map((r) => {
      const value = riceNumerator(r.reach, r.impact, r.confidence)
      return {
        id: r.id,
        name: r.name,
        effort: Number(r.effort),
        value,
      }
    })
    const medE = median(pts.map((p) => p.effort))
    const medV = median(pts.map((p) => p.value))
    return pts.map((p) => {
      const highValue = p.value >= medV
      const lowEffort = p.effort <= medE
      let quadrant: QuadrantKey
      if (highValue && lowEffort) quadrant = "quickWins"
      else if (highValue && !lowEffort) quadrant = "bigBets"
      else if (!highValue && lowEffort) quadrant = "fillIns"
      else quadrant = "timeWasters"
      return { ...p, quadrant, fill: QUADRANT_COLORS[quadrant] }
    })
  }, [rows])

  const barData = useMemo(() => {
    let high = 0
    let medium = 0
    let low = 0
    for (const r of rows) {
      const tier = scoreTier(r.score)
      if (tier === "high") high++
      else if (tier === "medium") medium++
      else low++
    }
    return [
      { name: t.dashboard.barHigh, count: high, key: "high" as const },
      { name: t.dashboard.barMedium, count: medium, key: "medium" as const },
      { name: t.dashboard.barLow, count: low, key: "low" as const },
    ]
  }, [rows, t.dashboard.barHigh, t.dashboard.barMedium, t.dashboard.barLow])

  const top = useMemo(() => {
    if (rows.length === 0) return null
    return [...rows].sort((a, b) => b.score - a.score)[0]!
  }, [rows])

  const avgConfidence = useMemo(() => {
    if (rows.length === 0) return 0
    const sum = rows.reduce((a, r) => a + r.confidence, 0)
    return sum / rows.length
  }, [rows])

  const confidenceBarData = useMemo(() => {
    return buildConfidenceDistribution(rows).map((b) => ({
      key: b.key,
      name: confidenceBucketLabel(b.key, t),
      count: b.count,
    }))
  }, [rows, t])

  const roiBarData = useMemo(() => buildRoiRanking(rows, 8), [rows])

  const roiChartWrapRef = useRef<HTMLDivElement>(null)
  const [roiChartLayout, setRoiChartLayout] = useState({
    height: 300,
    yAxisWidth: 120,
    chartWidth: 320,
  })

  useLayoutEffect(() => {
    const el = roiChartWrapRef.current
    if (!el || roiBarData.length === 0) return

    const update = () => {
      const containerW = Math.max(el.clientWidth, 280)
      const longest = Math.max(...roiBarData.map((d) => d.name.length))
      const perRow = isMobile ? 50 : 40
      const height = Math.max(
        isMobile ? 300 : 200,
        Math.min(isMobile ? 420 : 360, roiBarData.length * perRow + (isMobile ? 64 : 48))
      )

      if (isMobile) {
        const charW = rtl ? 6.5 : 6
        const yAxisWidth = Math.max(72, Math.ceil(longest * charW) + 12)
        const plotMin = 110
        const chartWidth = Math.max(containerW, yAxisWidth + plotMin)
        setRoiChartLayout({ height, yAxisWidth, chartWidth })
      } else {
        const charW = rtl ? 8.5 : 6.2
        const yAxisWidth = Math.min(
          rtl ? 240 : 200,
          Math.max(rtl ? 140 : 112, Math.ceil(longest * charW) + 24)
        )
        setRoiChartLayout({ height, yAxisWidth, chartWidth: containerW })
      }
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [roiBarData, isMobile, rtl])

  const roiTickMaxChars = isMobile ? 999 : rtl ? 24 : 28

  const recommendations = useMemo(
    () => buildDashboardRecommendations(rows, t),
    [rows, t]
  )

  if (!isSupabaseConfigured()) {
    return (
      <div className={pageContainerWide}>
        <h1 className="font-semibold text-2xl tracking-tight">{t.dashboard.title}</h1>
        <p className="mt-2 text-muted-foreground text-sm">{t.dashboard.notConfigured}</p>
      </div>
    )
  }

  return (
    <div className={pageContainerWide}>
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">{t.dashboard.title}</h1>
        <p className="mt-1 text-muted-foreground text-sm">{t.dashboard.subtitle}</p>
      </div>

      {fetchError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {fetchError}
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex h-full min-h-0"
            >
              <Card className="flex h-full w-full flex-col border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t.dashboard.totalIdeas}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-2">
                  <p className="font-semibold text-3xl tabular-nums">{rows.length}</p>
                  <p
                    className="text-muted-foreground text-xs leading-relaxed opacity-0 select-none"
                    aria-hidden
                  >
                    {t.dashboard.avgConfidenceHint}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex h-full min-h-0"
            >
              <Card className="flex h-full w-full flex-col border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t.dashboard.topPromise}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium leading-snug">{top?.name ?? "—"}</p>
                    {top && (
                      <p className="font-mono text-muted-foreground text-sm tabular-nums">
                        {t.dashboard.scoreLabel} {top.score.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <p
                    className="text-muted-foreground text-xs leading-relaxed opacity-0 select-none"
                    aria-hidden
                  >
                    {t.dashboard.avgConfidenceHint}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex h-full min-h-0 sm:col-span-2 lg:col-span-2"
            >
              <Card className="flex h-full w-full flex-col border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t.dashboard.avgConfidence}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-2">
                  <p className="font-semibold text-3xl tabular-nums">
                    {rows.length ? `${avgConfidence.toFixed(0)}%` : "—"}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {t.dashboard.avgConfidenceHint}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="min-w-0 overflow-visible border-border/80 shadow-sm">
              <ChartSectionHeader
                title={t.dashboard.valueEffortTitle}
                description={t.dashboard.valueEffortDesc}
              />
              <CardContent className="flex flex-col gap-3 overflow-visible pb-4">
                {scatterData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t.dashboard.noData}</p>
                ) : (
                  <>
                    <div className="h-64 min-w-0 w-full sm:h-72 md:h-80" dir="ltr">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <ScatterChart
                          margin={{ top: 12, right: 32, bottom: 28, left: 28 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis
                            type="number"
                            dataKey="effort"
                            name={t.dashboard.effortAxis}
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            padding={{ left: 24, right: 28 }}
                            label={{
                              value: t.dashboard.effortAxis,
                              position: "bottom",
                              offset: 0,
                              fill: "#94a3b8",
                              fontSize: 11,
                            }}
                          />
                          <YAxis
                            type="number"
                            dataKey="value"
                            name={t.dashboard.valueAxis}
                            width={56}
                            tickLine={false}
                            axisLine={{ stroke: "#333" }}
                            padding={{ top: 16, bottom: 16 }}
                            tick={<NumericYAxisTick formatDecimals />}
                            label={{
                              value: t.dashboard.valueAxis,
                              angle: -90,
                              position: "left",
                              offset: 16,
                              fill: "#94a3b8",
                              fontSize: 10,
                            }}
                          />
                          <ZAxis range={coarsePointer ? [160, 160] : [60, 60]} />
                          <Scatter
                            data={scatterData}
                            fill="hsl(var(--primary))"
                            isAnimationActive={false}
                            onMouseEnter={(data, _i, e) => {
                              if (!coarsePointer) bindScatterTooltip(data, e)
                            }}
                            onMouseMove={(data, _i, e) => {
                              if (!coarsePointer) bindScatterTooltip(data, e)
                            }}
                            onMouseLeave={() => {
                              if (!coarsePointer) setScatterTooltip(null)
                            }}
                            onClick={(data, _i, e) => {
                              if (coarsePointer) toggleScatterTooltip(data, e)
                            }}
                          >
                            {scatterData.map((e) => (
                              <Cell key={e.id} fill={e.fill} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    {scatterTooltip ? (
                      <ScatterTooltipPortal anchor={scatterTooltip} />
                    ) : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground leading-snug">
                      {QUADRANT_ORDER.map((key) => (
                        <span key={key} className="inline-flex items-center gap-1.5">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: QUADRANT_COLORS[key] }}
                          />
                          {t.dashboard.quadrants[key]}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/80 shadow-sm">
              <ChartSectionHeader
                title={t.dashboard.distributionTitle}
                description={t.dashboard.distributionDesc}
              />
              <CardContent className="h-64 min-w-0 sm:h-72 md:h-80">
                <div dir="ltr" className="h-full w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                      data={barData}
                      margin={{ top: 8, right: 4, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tickLine={false}
                        axisLine={{ stroke: "#333" }}
                        tick={<BarCategoryTick />}
                        height={52}
                      />
                      <YAxis
                        allowDecimals={false}
                        width={36}
                        tickLine={false}
                        axisLine={{ stroke: "#333" }}
                        tick={<NumericYAxisTick />}
                      />
                    <Tooltip
                      cursor={false}
                      labelStyle={{ color: "#fafafa" }}
                      itemStyle={{ color: "#fafafa" }}
                      contentStyle={chartTooltipStyle}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      name={t.dashboard.ideasCount}
                      activeBar={false}
                    >
                      {barData.map((e) => (
                        <Cell
                          key={e.key}
                          fill={
                            e.key === "high"
                              ? "hsl(142 70% 42%)"
                              : e.key === "medium"
                                ? "hsl(45 93% 47%)"
                                : "hsl(0 72% 55%)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="min-w-0 border-border/80 shadow-sm">
              <ChartSectionHeader
                title={t.dashboard.confidenceDistTitle}
                description={t.dashboard.confidenceDistDesc}
                microcopy={t.dashboard.confidenceDistMicrocopy}
              />
              <CardContent className="h-64 min-w-0 pb-4 sm:h-72">
                {rows.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t.dashboard.noData}</p>
                ) : (
                  <div dir="ltr" className="h-full w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <BarChart
                        data={confidenceBarData}
                        margin={{ top: 8, right: 4, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          tickLine={false}
                          axisLine={{ stroke: "#333" }}
                          tick={<BarCategoryTick />}
                          height={52}
                        />
                        <YAxis
                          allowDecimals={false}
                          width={36}
                          tickLine={false}
                          axisLine={{ stroke: "#333" }}
                          tick={<NumericYAxisTick />}
                        />
                      <Tooltip
                        cursor={false}
                        labelStyle={{ color: "#fafafa" }}
                        itemStyle={{ color: "#fafafa" }}
                        contentStyle={chartTooltipStyle}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        name={t.dashboard.ideasCount}
                        activeBar={false}
                      >
                        {confidenceBarData.map((e) => (
                          <Cell
                            key={e.key}
                            fill={CONFIDENCE_BUCKET_COLORS[e.key]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 overflow-visible border-border/80 shadow-sm max-md:mx-auto max-md:w-full max-md:max-w-lg">
              <ChartSectionHeader
                title={t.dashboard.roiTitle}
                description={t.dashboard.roiDesc}
                microcopy={t.dashboard.roiMicrocopy}
              />
              <CardContent
                className="min-w-0 pb-4 max-md:mx-auto max-md:px-2"
                style={{
                  height: roiBarData.length ? roiChartLayout.height : 200,
                }}
              >
                {roiBarData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t.dashboard.noData}</p>
                ) : (
                  <div
                    ref={roiChartWrapRef}
                    dir="ltr"
                    className="w-full min-w-0 max-md:overflow-x-auto"
                  >
                    <div
                      style={{
                        width: isMobile
                          ? roiChartLayout.chartWidth || "100%"
                          : "100%",
                        height: roiChartLayout.height,
                        minWidth: isMobile
                          ? roiChartLayout.chartWidth
                          : undefined,
                      }}
                    >
                      <ResponsiveContainer
                        width={
                          isMobile ? roiChartLayout.chartWidth : "100%"
                        }
                        height={roiChartLayout.height}
                        minWidth={isMobile ? roiChartLayout.chartWidth : 0}
                      >
                        <BarChart
                          layout="vertical"
                          data={roiBarData}
                          margin={{
                            top: 8,
                            right: 12,
                            left: 4,
                            bottom: 8,
                          }}
                        >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          type="number"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={roiChartLayout.yAxisWidth}
                          tickLine={false}
                          axisLine={{ stroke: "#333" }}
                          tick={
                            <RoiYAxisTick
                              maxChars={roiTickMaxChars}
                              rtl={rtl}
                              compact={isMobile}
                            />
                          }
                        />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                        labelStyle={{ color: "#fafafa" }}
                        itemStyle={{ color: "#fafafa" }}
                        contentStyle={chartTooltipStyle}
                        formatter={(value) => [
                          typeof value === "number" ? value : String(value ?? ""),
                          t.dashboard.roiAxis,
                        ]}
                      />
                      <Bar
                        dataKey="roi"
                        radius={[0, 6, 6, 0]}
                        fill="hsl(142 65% 42%)"
                        name={t.dashboard.roiAxis}
                        activeBar={false}
                      />
                      </BarChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/25 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">
                {t.dashboard.summary.title}{" "}
                <span className="font-normal text-muted-foreground text-xs">
                  {t.dashboard.summary.titleBasis}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <ul className="space-y-3">
                {recommendations.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-sm leading-relaxed text-foreground/90"
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

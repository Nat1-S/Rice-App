"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { riceNumerator, scoreTier } from "@/lib/rice"
import type { PriorityRow } from "@/lib/supabase/client"
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client"
import { usePrioritiesRealtime } from "@/hooks/use-priorities-realtime"

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

const QUADRANT_COLORS: Record<string, string> = {
  "Quick Wins": "hsl(142 70% 45%)",
  "Big Bets": "hsl(262 70% 55%)",
  "Fill-ins": "hsl(215 20% 50%)",
  "Time Wasters": "hsl(0 72% 55%)",
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

function ValueEffortScatterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
}) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.payload
  if (!raw || typeof raw !== "object") return null
  const d = raw as { name?: string; effort?: number; value?: number }
  const title = (d.name ?? "").trim() || "—"
  const effort = d.effort
  const value = d.value
  const effortStr =
    typeof effort === "number" && Number.isFinite(effort)
      ? formatScatterAxisNumber(effort)
      : "—"
  const valueStr =
    typeof value === "number" && Number.isFinite(value)
      ? formatScatterAxisNumber(value)
      : "—"

  return (
    <div style={scatterTooltipBoxStyle}>
      <p
        className="mb-1.5 font-semibold leading-snug"
        style={{ margin: 0, wordBreak: "break-word" }}
      >
        {title}
      </p>
      <p style={{ margin: "4px 0 0", opacity: 0.9 }} dir="ltr">
        Effort : {effortStr}
      </p>
      <p style={{ margin: "4px 0 0", opacity: 0.9 }} dir="ltr">
        Value : {valueStr}
      </p>
    </div>
  )
}

export function InsightsDashboard() {
  const [rows, setRows] = useState<PriorityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

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
      let quadrant: keyof typeof QUADRANT_COLORS
      if (highValue && lowEffort) quadrant = "Quick Wins"
      else if (highValue && !lowEffort) quadrant = "Big Bets"
      else if (!highValue && lowEffort) quadrant = "Fill-ins"
      else quadrant = "Time Wasters"
      return { ...p, quadrant, fill: QUADRANT_COLORS[quadrant] }
    })
  }, [rows])

  const barData = useMemo(() => {
    let high = 0
    let medium = 0
    let low = 0
    for (const r of rows) {
      const t = scoreTier(r.score)
      if (t === "high") high++
      else if (t === "medium") medium++
      else low++
    }
    return [
      { name: "גבוה (25+)", count: high, key: "high" },
      { name: "בינוני (11–24)", count: medium, key: "medium" },
      { name: "נמוך (1–10)", count: low, key: "low" },
    ]
  }, [rows])

  const top = useMemo(() => {
    if (rows.length === 0) return null
    return [...rows].sort((a, b) => b.score - a.score)[0]!
  }, [rows])

  const avgConfidence = useMemo(() => {
    if (rows.length === 0) return 0
    const sum = rows.reduce((a, r) => a + r.confidence, 0)
    return sum / rows.length
  }, [rows])

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-6">
        <h1 className="font-semibold text-2xl tracking-tight">דאשבורד תובנות</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          הוסיפו <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.local</code> עם מפתחות Supabase כדי לטעון נתונים מהטבלה priorities.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">דאשבורד תובנות</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          מצב הרשימה, ערך מול מאמץ, והתפלגות עדיפויות — נתונים מ-Supabase עם ריענון אוטומטי בשינויים.
        </p>
      </div>

      {fetchError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          {fetchError}
        </p>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">טוען…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    סה״כ רעיונות
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-semibold text-3xl tabular-nums">
                  {rows.length}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    ההבטחה הגדולה
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-medium leading-snug">
                    {top?.name ?? "—"}
                  </p>
                  {top && (
                    <p className="font-mono text-muted-foreground text-sm tabular-nums">
                      ציון {top.score.toFixed(1)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="sm:col-span-2"
            >
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    ביטחון ממוצע
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="font-semibold text-3xl tabular-nums">
                    {rows.length ? `${avgConfidence.toFixed(0)}%` : "—"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    ככל שהממוצע נמוך, ייתכן שהתעדוף מבוסס יותר על הנחות מאשר על
                    דאטה.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">מטריצת Value vs Effort</CardTitle>
                <p className="text-muted-foreground text-xs">
                  ציר X: מאמץ (חודשי-אדם). ציר Y: ערך (Reach × Impact ×
                  Confidence%). פיצול לרבעים לפי חציון בכל ציר.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pb-4">
                {scatterData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">אין נתונים להצגה.</p>
                ) : (
                  <>
                    <div className="h-72 w-full shrink-0 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 8, right: 8, bottom: 28, left: 8 }}
                        >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        type="number"
                        dataKey="effort"
                        name="Effort"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        label={{
                          value: "Effort",
                          position: "bottom",
                          offset: 0,
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="value"
                        name="Value"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        label={{
                          value: "Value",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#94a3b8",
                          fontSize: 11,
                        }}
                      />
                      <ZAxis range={[60, 60]} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={<ValueEffortScatterTooltip />}
                      />
                      <Scatter data={scatterData} fill="hsl(var(--primary))">
                        {scatterData.map((e) => (
                          <Cell key={e.id} fill={e.fill} />
                        ))}
                      </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground leading-snug">
                      {Object.entries(QUADRANT_COLORS).map(([q, c]) => (
                        <span key={q} className="inline-flex items-center gap-1.5">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: c }}
                          />
                          {q}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">התפלגות לפי עדיפות</CardTitle>
                <p className="text-muted-foreground text-xs">
                  מספר רעיונות לפי חיווי: 1–10 נמוך, 11–24 בינוני, 25 ומעלה גבוה.
                </p>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={false}
                      labelStyle={{ color: "#fafafa" }}
                      itemStyle={{ color: "#fafafa" }}
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "#fafafa",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      name="רעיונות"
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
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

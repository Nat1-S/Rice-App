import type { Dictionary } from "@/i18n/types"
import type { PriorityRow } from "@/lib/supabase/client"

export type ConfidenceBucketKey = "b100" | "b80" | "b50" | "bLow"

export type ConfidenceBucket = {
  key: ConfidenceBucketKey
  count: number
}

export type RoiBarItem = {
  id: string
  name: string
  roi: number
  impact: number
  effort: number
}

const CONFIDENCE_BUCKET_ORDER: ConfidenceBucketKey[] = [
  "b100",
  "b80",
  "b50",
  "bLow",
]

function confidenceBucketKey(confidence: number): ConfidenceBucketKey {
  if (confidence >= 100) return "b100"
  if (confidence >= 80) return "b80"
  if (confidence >= 50) return "b50"
  return "bLow"
}

export function buildConfidenceDistribution(
  rows: PriorityRow[]
): ConfidenceBucket[] {
  const counts: Record<ConfidenceBucketKey, number> = {
    b100: 0,
    b80: 0,
    b50: 0,
    bLow: 0,
  }
  for (const r of rows) {
    counts[confidenceBucketKey(r.confidence)]++
  }
  return CONFIDENCE_BUCKET_ORDER.map((key) => ({ key, count: counts[key] }))
}

export function buildRoiRanking(
  rows: PriorityRow[],
  limit = 8
): RoiBarItem[] {
  return rows
    .map((r) => {
      const effort = Number(r.effort)
      const impact = Number(r.impact)
      const roi = effort > 0 ? impact / effort : 0
      return {
        id: r.id,
        name: r.name,
        roi: Math.round(roi * 100) / 100,
        impact,
        effort,
      }
    })
    .filter((r) => r.roi > 0)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, limit)
}

function formatRoi(roi: number): string {
  return Number.isInteger(roi) ? String(roi) : roi.toFixed(2)
}

function joinNames(names: string[], max = 3): string {
  const slice = names.slice(0, max)
  return slice.join(", ")
}

/** עד 5 המלצות דטרמיניסטיות — ללא AI */
export function buildDashboardRecommendations(
  rows: PriorityRow[],
  t: Dictionary
): string[] {
  const s = t.dashboard.summary
  if (rows.length === 0) return [s.empty]

  const insights: string[] = []

  const quickWinCandidates = rows.filter(
    (r) => Number(r.impact) >= 1 && Number(r.effort) <= 1
  )
  if (quickWinCandidates.length > 0) {
    const best = [...quickWinCandidates].sort((a, b) => {
      const roiA = Number(a.impact) / Number(a.effort)
      const roiB = Number(b.impact) / Number(b.effort)
      return roiB - roiA
    })[0]!
    const roi = Number(best.impact) / Number(best.effort)
    insights.push(
      s.quickWin
        .replace("{name}", best.name)
        .replace("{roi}", formatRoi(roi))
    )
  }

  const risky = rows.filter(
    (r) => Number(r.effort) >= 2 && r.confidence < 50
  )
  if (risky.length > 0) {
    insights.push(
      risky.length === 1
        ? s.riskyOne.replace("{name}", risky[0]!.name)
        : s.riskyMany
            .replace("{count}", String(risky.length))
            .replace("{names}", joinNames(risky.map((r) => r.name)))
    )
  }

  const fullConfidence = rows.filter((r) => r.confidence >= 100).length
  const fullPct = Math.round((fullConfidence / rows.length) * 100)
  if (rows.length >= 3 && fullConfidence / rows.length > 0.7) {
    insights.push(
      s.confidenceBias
        .replace("{pct}", String(fullPct))
        .replace("{count}", String(fullConfidence))
    )
  }

  const bigBets = rows.filter(
    (r) => Number(r.impact) >= 2 && Number(r.effort) >= 2
  )
  if (bigBets.length > 0) {
    const lead = [...bigBets].sort((a, b) => b.score - a.score)[0]!
    insights.push(
      s.bigBet
        .replace("{name}", lead.name)
        .replace("{score}", lead.score.toFixed(1))
    )
  }

  if (insights.length === 0) {
    insights.push(s.balanced)
  } else if (insights.length < 5) {
    insights.push(s.balancedClosing)
  }

  return insights.slice(0, 5)
}

export function confidenceBucketLabel(
  key: ConfidenceBucketKey,
  t: Dictionary
): string {
  return t.dashboard.confidenceBuckets[key]
}

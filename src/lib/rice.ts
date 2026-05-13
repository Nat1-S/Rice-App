/** Reach בסולם 1–10 (10 = כל המשתמשים). */
export const REACH_MIN = 1
export const REACH_MAX = 10

/** ערך לסליידר LTR: גבוה משמאל — UI = MIN + MAX - reach */
export function reachSliderUiValue(reach: number): number {
  return REACH_MIN + REACH_MAX - reach
}

export function reachFromSliderUi(ui: number): number {
  return REACH_MIN + REACH_MAX - ui
}

/** אחוז רוחב מילוי לפי Reach אמיתי 1–10 (מוצמד לימין במסילה: 1→0%, 10→100%). */
export function reachFillPercent(reach: number): number {
  const r = Math.min(REACH_MAX, Math.max(REACH_MIN, reach))
  return ((r - REACH_MIN) / (REACH_MAX - REACH_MIN)) * 100
}

/** Confidence 0–100 על סליידר LTR: גבוה משמאל — UI = 100 - אחוז */
export function confidenceSliderUiValue(confidencePercent: number): number {
  return 100 - confidencePercent
}

export function confidenceFromSliderUi(ui: number): number {
  return 100 - ui
}

/** מאמץ מינימלי — חודשי-אדם (מונע חלוקה ב-0 ועיוות). */
export const MIN_EFFORT = 0.5

/** Impact: ערכים מהגבוה לנמוך; בתצוגה עוטפים ב־dir=ltr כדי שב־RTL יופיע גבוה משמאל. */
export const IMPACT_OPTIONS = [
  { value: 3, label: "עצום" },
  { value: 2, label: "גבוה" },
  { value: 1, label: "בינוני" },
  { value: 0.5, label: "נמוך" },
  { value: 0.25, label: "מזערי" },
] as const

/** אחוז בקלט UI (0–100) → מספר עשרוני לנוסחה (למשל 80 → 0.8). */
export function confidenceAsDecimal(confidencePercent: number): number {
  return confidencePercent / 100
}

/**
 * מונה RICE לפני חלוקה במאמץ:
 * Reach × Impact × Confidence (כאשר Confidence בעשרוני).
 */
export function riceNumerator(
  reach: number,
  impact: number,
  confidencePercent: number
): number {
  return reach * impact * confidenceAsDecimal(confidencePercent)
}

export function roundRiceScore(raw: number): number {
  return Math.round(raw * 10) / 10
}

/**
 * (Reach × Impact × Confidence) / Effort
 * Confidence מהאחוזים בקלט (0–100) — מומר לעשרוני בפנים.
 */
export function calculateRiceScore(
  reach: number,
  impact: number,
  confidencePercent: number,
  effort: number
): number | null {
  if (
    !Number.isFinite(reach) ||
    reach < REACH_MIN ||
    reach > REACH_MAX
  ) {
    return null
  }
  if (!Number.isFinite(effort) || effort < MIN_EFFORT) {
    return null
  }
  if (!Number.isFinite(impact) || !Number.isFinite(confidencePercent)) {
    return null
  }
  const raw = riceNumerator(reach, impact, confidencePercent) / effort
  return roundRiceScore(raw)
}

export function clampReach(n: number): number {
  if (!Number.isFinite(n)) return REACH_MIN
  return Math.min(REACH_MAX, Math.max(REACH_MIN, Math.round(n)))
}

export type ScoreTier = "high" | "medium" | "low"

/**
 * חיווי UI לפי ציון: 1–19 נמוך, 20–39 בינוני, 40 ומעלה גבוה (מעל 60 נשאר גבוה).
 */
export function scoreTier(score: number): ScoreTier {
  if (score >= 40) return "high"
  if (score >= 20) return "medium"
  return "low"
}

export type ScoreTierUi = {
  tier: ScoreTier
  /** טקסט קצר ל־Badge */
  label: string
  /** שורה מתארת */
  description: string
  variant: "default" | "secondary" | "destructive"
  /** אימוג׳י ליד החיווי (בנוסף לאייקון ב־UI) */
  emoji: string
}

/** תווית + צבע לרשימה / מודאל / דאשבורד */
export function scoreTierUi(score: number): ScoreTierUi {
  const tier = scoreTier(score)
  if (tier === "high") {
    return {
      tier,
      label: "גבוה",
      description: "ציון 40 ומעלה (טווח יעד 40–60) — כדאי לבצע",
      variant: "default",
      emoji: "✅",
    }
  }
  if (tier === "medium") {
    return {
      tier,
      label: "בינוני",
      description: "ציון 20–39 — לשקול",
      variant: "secondary",
      emoji: "🤔",
    }
  }
  return {
    tier,
    label: "נמוך",
    description: "מתחת ל־20 (טווח נמוך 1–19) — לא לבצע כעת",
    variant: "destructive",
    emoji: "✖️",
  }
}

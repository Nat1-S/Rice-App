/** Reach בסולם 1–10 (10 = כל המשתמשים). */
export const REACH_MIN = 1
export const REACH_MAX = 10

/** RTL (עברית): היפוך סליידר — גבוה בצד התחלתי. LTR (אנגלית): נמוך משמאל, גבוה מימין. */
export function reachSliderUiValue(reach: number, rtl = true): number {
  if (rtl) return REACH_MIN + REACH_MAX - reach
  return reach
}

export function reachFromSliderUi(ui: number, rtl = true): number {
  if (rtl) return REACH_MIN + REACH_MAX - ui
  return ui
}

/** אחוז רוחב מילוי לפי Reach אמיתי 1–10 */
export function reachFillPercent(reach: number): number {
  const r = Math.min(REACH_MAX, Math.max(REACH_MIN, reach))
  return ((r - REACH_MIN) / (REACH_MAX - REACH_MIN)) * 100
}

/** RTL: מילוי מוצמד לימין. LTR: מילוי מוצמד לשמאל */
export function reachFillJustifyClass(rtl: boolean): string {
  return rtl ? "justify-end" : "justify-start"
}

/** Confidence 0–100 — היפוך ב-RTL בלבד */
export function confidenceSliderUiValue(
  confidencePercent: number,
  rtl = true
): number {
  if (rtl) return 100 - confidencePercent
  return confidencePercent
}

export function confidenceFromSliderUi(ui: number, rtl = true): number {
  if (rtl) return 100 - ui
  return ui
}

/** רקע מסילת ביטחון: ירוק = גבוה, אדום = נמוך (לפי כיוון קריאה) */
export function confidenceTrackGradient(rtl: boolean): string {
  return rtl
    ? "linear-gradient(90deg, #16a34a 0%, #facc15 50%, #dc2626 100%)"
    : "linear-gradient(90deg, #dc2626 0%, #facc15 50%, #16a34a 100%)"
}

/** סדר תצוגה: RTL = גבוה→נמוך, LTR = נמוך→גבוה */
export function getImpactOptionsForDir(rtl: boolean) {
  return rtl ? [...IMPACT_OPTIONS] : [...IMPACT_OPTIONS].reverse()
}

export function getEffortOptionsForDir(rtl: boolean) {
  return rtl ? [...EFFORT_OPTIONS] : [...EFFORT_OPTIONS].reverse()
}

/** מאמץ מינימלי — חודשי-אדם (ערכים מותרים ב־UI: ראה EFFORT_OPTIONS). */
export const MIN_EFFORT = 0.25

/** Effort: בחירה מתוך ערכים קבועים; בתצוגה עוטפים ב־dir=ltr (גבוה משמאל). */
export const EFFORT_OPTIONS = [
  { value: 3, label: "חודשים" },
  { value: 2, label: "חודשים" },
  { value: 1, label: "חודשים" },
  { value: 0.5, label: "חודשים" },
  { value: 0.25, label: "חודשים" },
] as const

export type EffortOptionValue = (typeof EFFORT_OPTIONS)[number]["value"]

const EFFORT_VALUE_SET = new Set<number>(EFFORT_OPTIONS.map((o) => o.value))

/** ממפה מאמץ ממסד (או ישן) לערך הקרוב ביותר מתוך EFFORT_OPTIONS. */
export function snapEffortToDiscrete(effort: number): EffortOptionValue {
  if (!Number.isFinite(effort)) return 1
  if (EFFORT_VALUE_SET.has(effort)) return effort as EffortOptionValue
  let best: EffortOptionValue = EFFORT_OPTIONS[0]!.value
  let bestDist = Math.abs(best - effort)
  for (const o of EFFORT_OPTIONS) {
    const d = Math.abs(o.value - effort)
    if (d < bestDist) {
      best = o.value
      bestDist = d
    }
  }
  return best
}

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
 * חיווי UI לפי ציון: 1–10 נמוך, 11–29 בינוני, 30 ומעלה גבוה (30 נספר בגבוה).
 */
export function scoreTier(score: number): ScoreTier {
  if (score >= 30) return "high"
  if (score >= 11) return "medium"
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
      description: "ציון 30 ומעלה — כדאי לבצע",
      variant: "default",
      emoji: "✅",
    }
  }
  if (tier === "medium") {
    return {
      tier,
      label: "בינוני",
      description: "ציון 11–29 — לשקול",
      variant: "secondary",
      emoji: "🤔",
    }
  }
  return {
    tier,
    label: "נמוך",
    description: "ציון 1–10 — לא לבצע כעת",
    variant: "destructive",
    emoji: "✖️",
  }
}

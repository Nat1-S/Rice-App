import type { Dictionary, ScoreTierKey } from "@/i18n/types"
import { scoreTier } from "@/lib/rice"

export function scoreTierFromDictionary(
  score: number,
  tiers: Dictionary["scoreTier"]
) {
  const tier = scoreTier(score) as ScoreTierKey
  const t = tiers[tier]
  return {
    tier,
    label: t.label,
    description: t.description,
    emoji: t.emoji,
    variant:
      tier === "high"
        ? ("default" as const)
        : tier === "medium"
          ? ("secondary" as const)
          : ("destructive" as const),
  }
}

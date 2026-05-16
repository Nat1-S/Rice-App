"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { pageContainerWide } from "@/lib/layout"
import {
  EFFORT_OPTIONS,
  IMPACT_OPTIONS,
  REACH_MAX,
  REACH_MIN,
} from "@/lib/rice"

export function RicePrinciplesContent() {
  const { t } = useTranslation()

  const reachNormalize = t.principles.reach.normalize
    .replace(/\{min\}/g, String(REACH_MIN))
    .replace(/\{max\}/g, String(REACH_MAX))

  const impactOptionsDisplay = IMPACT_OPTIONS.map(
    (o) => `${o.value} (${t.impactLabels[String(o.value)] ?? o.label})`
  ).join(" · ")

  const effortOptionsDisplay = EFFORT_OPTIONS.map(
    (o) => `${o.value} ${t.common.months}`
  ).join(" · ")

  const impactValuesCsv = IMPACT_OPTIONS.map((o) => o.value).join(", ")
  const effortValuesCsv = EFFORT_OPTIONS.map((o) => o.value).join(", ")

  const codeRawFilled = t.principles.formula.codeRaw
    .replace("{reachMin}", String(REACH_MIN))
    .replace("{reachMax}", String(REACH_MAX))
    .replace("{impactValues}", impactValuesCsv)
    .replace("{effortValues}", effortValuesCsv)

  return (
    <div className={cn(pageContainerWide, "max-w-3xl space-y-6 sm:space-y-8")}>
      <header className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight">{t.principles.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{t.principles.intro}</p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.principles.reach.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t.principles.reach.what}</p>
          <p className="text-muted-foreground">{reachNormalize}</p>
          <div>
            <p className="mb-2 font-medium">{t.principles.formula.guidingQuestions}</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>{t.principles.reach.q1}</li>
              <li>{t.principles.reach.q2}</li>
              <li>{t.principles.reach.q3}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.principles.impact.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t.principles.impact.what}</p>
          <p className="text-muted-foreground">
            <strong>{t.principles.formula.normalizeInApp}</strong> {t.principles.impact.normalize}{" "}
            {impactOptionsDisplay}.
          </p>
          <div>
            <p className="mb-2 font-medium">{t.principles.formula.guidingQuestions}</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>{t.principles.impact.q1}</li>
              <li>{t.principles.impact.q2}</li>
              <li>{t.principles.impact.q3}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.principles.confidence.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t.principles.confidence.what}</p>
          <p className="text-muted-foreground">{t.principles.confidence.normalize}</p>
          <div>
            <p className="mb-2 font-medium">{t.principles.formula.guidingQuestions}</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>{t.principles.confidence.q1}</li>
              <li>{t.principles.confidence.q2}</li>
              <li>{t.principles.confidence.q3}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.principles.effort.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t.principles.effort.what}</p>
          <p className="text-muted-foreground">
            <strong>{t.principles.formula.normalizeInApp}</strong> {t.principles.effort.normalize}{" "}
            {effortOptionsDisplay}.
          </p>
          <div>
            <p className="mb-2 font-medium">{t.principles.formula.guidingQuestions}</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>{t.principles.effort.q1}</li>
              <li>{t.principles.effort.q2}</li>
              <li>{t.principles.effort.q3}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t.principles.formula.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>{t.principles.formula.rawIntro}</p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed sm:text-sm">
            {codeRawFilled}
          </pre>
          <Separator />
          <p>{t.principles.formula.displayIntro}</p>
          <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs sm:text-sm">
            {t.principles.formula.codeRounded}
          </pre>
          <Separator />
          <p>{t.principles.formula.tiersIntro}</p>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>{t.principles.formula.tierLow}</li>
            <li>{t.principles.formula.tierMedium}</li>
            <li>{t.principles.formula.tierHigh}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

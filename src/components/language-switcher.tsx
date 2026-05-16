"use client"

import { Languages } from "lucide-react"
import { useTranslation } from "@/contexts/language-context"
import type { Locale } from "@/i18n"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, locale, setLocale } = useTranslation()

  const options: { value: Locale; label: string }[] = [
    { value: "he", label: t.language.he },
    { value: "en", label: t.language.en },
  ]

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        <Languages className="size-3" aria-hidden />
        {t.language.label}
      </span>
      <div className="flex gap-1 rounded-lg bg-muted/40 p-1 ring-1 ring-border/60">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={locale === opt.value ? "default" : "ghost"}
            size="sm"
            className="h-7 flex-1 text-xs"
            onClick={() => setLocale(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** מחלקות משותפות לעמודי האפליקציה — רספונסיבי mobile-first */
export const pageContainerNarrow =
  "mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:py-6 md:px-6"

export const pageContainerWide =
  "mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:py-6 md:px-8"

/** עוטף סליידר — מטרות מגע נוחות במובייל */
export const sliderTouchClass =
  "min-w-0 py-3 md:py-2.5 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:after:-inset-4 md:[&_[data-slot=slider-thumb]]:size-3 md:[&_[data-slot=slider-thumb]]:after:-inset-2"

/** מעטפת אפשרויות Impact / Effort (ראה MetricOptionsGrid) */
export const metricOptionsShellClass =
  "rounded-lg bg-muted/40 p-1.5 ring-1 ring-border/60"

export const metricOptionButtonClass =
  "h-auto w-full flex-col gap-0.5 py-1.5 px-1 text-[10px] leading-tight md:py-2 md:px-2"

"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { TapMotion } from "@/components/tap-motion"
import { metricOptionButtonClass, metricOptionsShellClass } from "@/lib/layout"
import { cn } from "@/lib/utils"

type MetricOptionsGridProps = {
  options: readonly { value: number }[]
  selected: number
  onSelect: (value: number) => void
  renderOption: (value: number) => ReactNode
}

function OptionButton({
  value,
  selected,
  onSelect,
  children,
}: {
  value: number
  selected: boolean
  onSelect: (value: number) => void
  children: ReactNode
}) {
  return (
    <TapMotion className="block min-w-0">
      <Button
        type="button"
        variant={selected ? "default" : "ghost"}
        size="sm"
        className={cn(metricOptionButtonClass, selected && "shadow-sm")}
        onClick={() => onSelect(value)}
      >
        {children}
      </Button>
    </TapMotion>
  )
}

/** 5 אפשרויות: במובייל 3+2 ממורכז, בדסקטופ שורה אחת */
export function MetricOptionsGrid({
  options,
  selected,
  onSelect,
  renderOption,
}: MetricOptionsGridProps) {
  const top = options.slice(0, 3)
  const bottom = options.slice(3)

  const renderBtn = (opt: { value: number }) => (
    <OptionButton
      key={opt.value}
      value={opt.value}
      selected={selected === opt.value}
      onSelect={onSelect}
    >
      {renderOption(opt.value)}
    </OptionButton>
  )

  return (
    <div dir="ltr" className={metricOptionsShellClass}>
      <div className="flex flex-col gap-1.5 md:hidden">
        <div className="grid grid-cols-3 gap-1.5">{top.map(renderBtn)}</div>
        <div className="mx-auto grid w-[calc(66.666%+0.375rem)] max-w-full grid-cols-2 gap-1.5">
          {bottom.map(renderBtn)}
        </div>
      </div>
      <div className="hidden grid-cols-5 gap-1 md:grid">
        {options.map(renderBtn)}
      </div>
    </div>
  )
}

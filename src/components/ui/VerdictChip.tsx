import type { ReactNode } from 'react'

export type ChipTone = 'ok' | 'warn' | 'alarm' | 'neutral' | 'todo'

/** Il colore È il verdetto (§13.5) — mai usato per decorare. */
const TONES: Record<ChipTone, string> = {
  ok: 'bg-ok-bg text-ok-ink',
  warn: 'bg-warn-bg text-warn-ink',
  alarm: 'bg-bad-bg text-bad-ink',
  neutral: 'bg-surface-2 text-ink-mute ring-1 ring-inset ring-hairline',
  todo: 'bg-surface-2 text-ink-mute ring-1 ring-inset ring-hairline',
}

export function VerdictChip({
  tone,
  className = '',
  children,
}: {
  tone: ChipTone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-bold tabular-nums ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

import { useMemo, useState } from 'react'
import { useSession } from '@/lib/auth/session'
import { useToast } from '@/components/ui/Toast'
import { VerdictChip, type ChipTone } from '@/components/ui/VerdictChip'
import { ChevronDownIcon, PointTypeIcon, RepartiIcon } from '@/components/icons'
import {
  formatC,
  POINT_TYPE_LABELS,
  ruleRangeLabel,
  VERDICT_WORDS,
} from '@/compliance/point-verdict'
import { KeypadSheet, type EsitoLettura } from './KeypadSheet'
import { useMyDepartments, usePuntiOggi, type PuntoOggi } from './hooks'

type MarkerTone = ChipTone
function markerToneFor(p: PuntoOggi): MarkerTone {
  if (p.daControllare) return 'todo'
  if (p.lastToday?.verdict) return p.lastToday.verdict
  return 'neutral'
}

/** Slot deterministici dei marker: schematico onesto finché non esiste il
 *  builder-mappa di Regia (§12.3) — posizioni vere = roadmap. */
function markerPos(i: number, total: number) {
  const perRow = Math.min(4, total)
  const rows = Math.ceil(total / perRow)
  const row = Math.floor(i / perRow)
  const inRow = row === rows - 1 ? total - perRow * (rows - 1) : perRow
  const col = i % perRow
  return {
    left: `${(((col + 1) / (inRow + 1)) * 100).toFixed(1)}%`,
    top: `${(((row + 1) / (rows + 1)) * 100).toFixed(1)}%`,
  }
}

const MARKER_RING: Record<MarkerTone, string> = {
  ok: 'shadow-[var(--shadow),inset_0_0_0_2px_var(--ok)] text-ok-ink',
  warn: 'shadow-[var(--shadow),inset_0_0_0_2px_var(--warn)] text-warn-ink',
  alarm: 'shadow-[var(--shadow),inset_0_0_0_2px_var(--bad)] text-bad-ink',
  todo: 'shadow-[var(--shadow),inset_0_0_0_2px_var(--accent)] text-accent anim-pulse-accent',
  neutral: 'shadow-[var(--shadow),inset_0_0_0_2px_var(--hairline)] text-ink-soft',
}

const MARKER_VAL: Record<MarkerTone, string> = {
  ok: 'bg-ok-bg text-ok-ink',
  warn: 'bg-warn-bg text-warn-ink',
  alarm: 'bg-bad-bg text-bad-ink',
  todo: 'bg-surface text-accent',
  neutral: 'bg-surface text-ink-mute',
}

function chipFor(p: PuntoOggi): { tone: ChipTone; text: string } {
  if (p.lastToday) {
    const v = p.lastToday.verdict
    return v
      ? { tone: v, text: `${formatC(p.lastToday.valueC)} °C · ${VERDICT_WORDS[v].chip}` }
      : { tone: 'neutral', text: `${formatC(p.lastToday.valueC)} °C · registrata` }
  }
  if (p.daControllare) return { tone: 'todo', text: 'da controllare' }
  return { tone: 'neutral', text: 'nessuna lettura oggi' }
}

export default function RepartiPage() {
  const { displayName } = useSession()
  const { departments } = useMyDepartments()
  const { punti, isLoading } = usePuntiOggi()
  const [depId, setDepId] = useState<string | null>(null)
  const [selId, setSelId] = useState<string | null>(null)
  const [keypadId, setKeypadId] = useState<string | null>(null)
  const { toast, show } = useToast()

  const currentDepId = depId ?? departments[0]?.id ?? null
  const currentDep = departments.find(d => d.id === currentDepId) ?? null

  const visibili = useMemo(() => {
    const inDep = currentDep
      ? punti.filter(p => !p.departmentId || p.departmentId === currentDep.id)
      : punti
    const rank = (p: PuntoOggi) =>
      p.daControllare ? 0 : p.lastToday?.verdict === 'alarm' ? 1 : p.lastToday?.verdict === 'warn' ? 2 : 3
    return [...inDep].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
  }, [punti, currentDep])

  const daControllare = visibili.filter(p => p.daControllare).length
  const keypadPoint = visibili.find(p => p.id === keypadId) ?? null

  const onSaved = (esito: EsitoLettura) => {
    setKeypadId(null)
    show(esito.verdict === 'ok' || esito.verdict === null ? 'Fatto!' : 'Registrata.')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 md:px-7 md:py-8">
      <header className="flex items-start justify-between gap-3 px-0.5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-mute">
            Reparto
          </p>
          {departments.length > 1 ? (
            <div className="relative inline-flex items-center gap-2 rounded-full bg-surface py-1.5 pl-2 pr-3 shadow-card">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-accent-soft text-accent">
                <RepartiIcon className="h-[18px] w-[18px]" />
              </span>
              <select
                value={currentDepId ?? ''}
                onChange={e => setDepId(e.target.value)}
                aria-label="Cambia reparto"
                className="appearance-none bg-transparent pr-6 text-xl font-bold tracking-tight text-ink outline-none"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-ink-mute" />
            </div>
          ) : (
            <h2 className="text-2xl font-bold tracking-tight">
              {currentDep?.name ?? 'Reparti'}
            </h2>
          )}
          <p className="ml-1 mt-2 text-[13.5px] text-ink-mute">
            {visibili.length} {visibili.length === 1 ? 'punto' : 'punti'} ·{' '}
            {daControllare > 0 ? (
              <b className="font-bold text-warn-ink">{daControllare} da controllare</b>
            ) : (
              <span className="font-bold text-ok-ink">tutti controllati</span>
            )}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-sm font-bold text-white shadow-card md:hidden"
        >
          {(displayName ?? '·').slice(0, 2).toUpperCase()}
        </div>
      </header>

      {/* schematico dei punti: il manuale operativo visivo (mockup 02) */}
      {visibili.length > 0 && (
        <div className="flex flex-col gap-2">
          <div
            role="group"
            aria-label={`Schematico dei punti${currentDep ? ` del reparto ${currentDep.name}` : ''}`}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface-2 shadow-[inset_0_0_0_2px_var(--hairline)] [background-image:linear-gradient(var(--hairline-2)_1px,transparent_1px),linear-gradient(90deg,var(--hairline-2)_1px,transparent_1px)] [background-size:100%_26px,26px_100%]"
          >
            <span className="absolute left-3 top-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-mute">
              {currentDep?.name ?? 'Tutti i reparti'}
            </span>
            {visibili.map((p, i) => {
              const tone = markerToneFor(p)
              const pos = markerPos(i, visibili.length)
              return (
                <button
                  key={p.id}
                  type="button"
                  style={pos}
                  onClick={() => {
                    setSelId(p.id)
                    setKeypadId(p.id)
                  }}
                  aria-label={`${p.name}: ${chipFor(p).text}`}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 p-0.5"
                >
                  <span
                    className={`grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-surface transition-transform ${MARKER_RING[tone]} ${
                      selId === p.id ? 'scale-110' : ''
                    }`}
                  >
                    <PointTypeIcon pointType={p.type} className="h-[18px] w-[18px]" />
                  </span>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-px text-[11px] font-bold tabular-nums shadow-card ${MARKER_VAL[tone]}`}
                  >
                    {p.lastToday ? `${formatC(p.lastToday.valueC)}°` : '–'}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3.5 px-0.5" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-mute">
              <i className="h-2.5 w-2.5 rounded bg-ok" /> in range
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-mute">
              <i className="h-2.5 w-2.5 rounded bg-warn" /> attento
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-mute">
              <i className="h-2.5 w-2.5 rounded bg-accent" /> da controllare
            </span>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 px-0.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-mute">
          <span>Punti di conservazione</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        {isLoading && (
          <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
            Un attimo — leggo i punti del reparto…
          </div>
        )}

        {!isLoading && visibili.length === 0 && (
          <div className="rounded-card bg-surface p-5 text-sm leading-relaxed text-ink-soft shadow-card">
            Qui non c'è ancora nessun punto di conservazione. Si impostano dalla
            Regia, durante l'onboarding: frigo, banconi e congelatori compariranno
            qui, pronti per la temperatura.
          </div>
        )}

        {visibili.map(p => {
          const chip = chipFor(p)
          return (
            <article
              key={p.id}
              onClick={() => setSelId(p.id)}
              className={`flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card transition-shadow ${
                selId === p.id ? 'shadow-[var(--shadow),inset_0_0_0_2px_var(--accent)]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
                  <PointTypeIcon pointType={p.type} className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-[17px] font-bold leading-tight tracking-tight">{p.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-mute">
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
                      {POINT_TYPE_LABELS[p.type] ?? p.type}
                    </span>
                    {p.rule ? `atteso ${ruleRangeLabel(p.rule)}` : 'senza soglia HACCP'}
                  </p>
                </div>
                <VerdictChip tone={chip.tone}>{chip.text}</VerdictChip>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setSelId(p.id)
                  setKeypadId(p.id)
                }}
                className={
                  p.daControllare
                    ? 'flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-accent-ink shadow-card transition-transform active:scale-[0.975]'
                    : 'flex w-full items-center justify-center rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--hairline)] transition-transform active:scale-[0.975]'
                }
              >
                {p.lastToday ? 'Registra di nuovo' : 'Registra temperatura'}
              </button>
            </article>
          )
        })}
      </section>

      <KeypadSheet
        punto={keypadPoint}
        open={!!keypadPoint}
        onClose={() => setKeypadId(null)}
        onSaved={onSaved}
      />
      {toast}
    </div>
  )
}

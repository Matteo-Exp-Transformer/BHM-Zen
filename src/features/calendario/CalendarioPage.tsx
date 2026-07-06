/**
 * Calendario (dec. 13) — agenda verticale del mese: la vista completa delle
 * cose da fare per tutti i ruoli, col completamento anticipato («domani non
 * ci sono: lo faccio oggi e lo spunto da qui»). UI clinico-calda §13: niente
 * griglia FullCalendar, un blocco per giorno, gesti da guanti.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/Toast'
import { VerdictChip } from '@/components/ui/VerdictChip'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FreezerIcon,
  SprayIcon,
  TaskIcon,
  ThermoIcon,
  UndoIcon,
} from '@/components/icons'
import { formatDayLong, formatTimeShort, localDateKey } from '@/lib/dates'
import { formatC } from '@/compliance/point-verdict'
import {
  useCompletaMansione,
  useCompletaManutenzione,
  useStorna,
  type CompletamentoFatto,
} from '@/features/oggi/hooks'
import { useCalendario, type GiornoCalendario, type OccorrenzaGiorno } from './hooks'

function IconaOccorrenza({ occ }: { occ: OccorrenzaGiorno }) {
  const cls = 'h-[19px] w-[19px]'
  if (occ.kind === 'temperatura') return <ThermoIcon className={cls} />
  if (occ.kind === 'manutenzione') {
    if (occ.manutenzione?.tipo === 'sanitization') return <SprayIcon className={cls} />
    if (occ.manutenzione?.tipo === 'defrosting') return <FreezerIcon className={cls} />
  }
  return <TaskIcon className={cls} />
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'ogni giorno',
  weekly: 'ogni settimana',
  monthly: 'ogni mese',
  annually: 'ogni anno',
  annual: 'ogni anno',
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
      {children}
    </span>
  )
}

function RigaDaFare({
  occ,
  giorno,
  onSpunta,
  pending,
}: {
  occ: OccorrenzaGiorno
  giorno: GiornoCalendario
  onSpunta: (occ: OccorrenzaGiorno) => void
  pending: boolean
}) {
  const navigate = useNavigate()
  const [armed, setArmed] = useState(false)
  const anticipato = !giorno.oggi && !giorno.passato
  const spuntabile = !!occ.mansione || !!occ.manutenzione

  return (
    <article className="flex flex-col gap-2 rounded-[14px] bg-surface p-3 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
          <IconaOccorrenza occ={occ} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold leading-tight">{occ.titolo}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-mute">
            {occ.dove && <Pill>{occ.dove}</Pill>}
            {FREQ_LABEL[occ.frequency] ?? null}
            {occ.proiezione && <Pill>in programma</Pill>}
          </p>
        </div>
        {spuntabile && (
          <button
            type="button"
            disabled={pending}
            onClick={() => (anticipato ? setArmed(a => !a) : onSpunta(occ))}
            className="shrink-0 rounded-[11px] bg-surface-2 px-3.5 py-2 text-[13.5px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--hairline)] transition-transform active:scale-95 disabled:opacity-70"
          >
            Spunta
          </button>
        )}
        {occ.kind === 'temperatura' && giorno.oggi && (
          <button
            type="button"
            onClick={() => navigate('/reparti')}
            className="shrink-0 rounded-[11px] bg-accent-soft px-3.5 py-2 text-[13.5px] font-semibold text-accent transition-transform active:scale-95"
          >
            Vai al punto
          </button>
        )}
      </div>
      {occ.kind === 'temperatura' && !giorno.oggi && (
        <p className="px-1 text-[12.5px] leading-snug text-ink-mute">
          La temperatura si registra al punto di conservazione, il giorno stesso.
        </p>
      )}
      {armed && (
        <div className="anim-rise flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <p className="text-[12.5px] leading-snug text-ink-soft">
            Lo segni fatto in anticipo per {formatDayLong(giorno.date).toLowerCase()}:
            nel registro resta ora e firma di adesso.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setArmed(false)
              onSpunta(occ)
            }}
            className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[13px] font-bold text-accent-ink transition-transform active:scale-95 disabled:opacity-70"
          >
            Conferma
          </button>
        </div>
      )}
    </article>
  )
}

function RigaFatta({
  fatto,
  onStorna,
  pending,
}: {
  fatto: CompletamentoFatto
  onStorna: (f: CompletamentoFatto) => void
  pending: boolean
}) {
  const [armed, setArmed] = useState(false)
  return (
    <article className="flex flex-col gap-2 rounded-[14px] bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--hairline)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-ok-bg text-ok-ink">
            <CheckIcon className="h-[18px] w-[18px]" />
          </span>
          <p className="truncate text-[14.5px] font-bold text-ink-soft">{fatto.titolo}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <VerdictChip tone="ok">{formatTimeShort(new Date(fatto.completedAt))}</VerdictChip>
          {fatto.storno && (
            <button
              type="button"
              aria-label={`Annulla ${fatto.titolo}`}
              onClick={() => setArmed(a => !a)}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface hover:text-ink"
            >
              <UndoIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {armed && (
        <div className="anim-rise flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <p className="text-[12.5px] leading-snug text-ink-soft">
            Torna tra le cose da fare. Nel registro resta una riga di storno —
            niente si cancella.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setArmed(false)
              onStorna(fatto)
            }}
            className="shrink-0 rounded-lg bg-bad-bg px-3 py-1.5 text-[13px] font-bold text-bad-ink transition-transform active:scale-95 disabled:opacity-70"
          >
            Storna
          </button>
        </div>
      )}
    </article>
  )
}

export default function CalendarioPage() {
  const [offset, setOffset] = useState(0)
  const oggi = new Date()
  const mese = new Date(oggi.getFullYear(), oggi.getMonth() + offset, 1)
  const { giorni, isLoading } = useCalendario(mese)
  const completaMansione = useCompletaMansione()
  const completaManutenzione = useCompletaManutenzione()
  const storna = useStorna()
  const { toast, show } = useToast()

  const meseLabel = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  }).format(mese)

  const pending =
    completaMansione.isPending || completaManutenzione.isPending || storna.isPending

  const spunta = (occ: OccorrenzaGiorno) => {
    const opts = {
      onSuccess: () => show('Fatto!'),
      onError: () => show('Non registrato — riprova.'),
    }
    if (occ.mansione) {
      completaMansione.mutate(
        {
          id: occ.mansione.id,
          nome: occ.titolo,
          frequency: occ.mansione.frequency,
          departmentId: null,
          nextDue: occ.mansione.occorrenzaISO, // il completamento copre QUEL periodo
          dueLabel: null,
        },
        opts,
      )
    } else if (occ.manutenzione) {
      completaManutenzione.mutate(
        {
          id: occ.manutenzione.id,
          titolo: occ.titolo,
          tipo: occ.manutenzione.tipo,
          pointName: occ.dove,
          departmentId: null,
          arretrata: false,
        },
        opts,
      )
    }
  }

  const stornaFatto = (f: CompletamentoFatto) => {
    storna.mutate(f, {
      onSuccess: () => show('Stornato — torna tra le cose da fare.'),
      onError: () => show('Storno non riuscito — riprova.'),
    })
  }

  const giorniVisibili = giorni.filter(
    g => g.daFare.length + g.fatte.length + g.letture.length > 0,
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 md:px-7 md:py-8">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Torna a Oggi"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-surface text-ink-soft shadow-card transition-transform active:scale-95"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            La vista completa
          </p>
          <h2 className="text-[22px] font-bold leading-tight tracking-tight">Calendario</h2>
        </div>
      </header>

      {/* navigazione mese — calma, un mese alla volta */}
      <div className="flex items-center justify-between rounded-card bg-surface px-2 py-2 shadow-card">
        <button
          type="button"
          aria-label="Mese precedente"
          onClick={() => setOffset(o => o - 1)}
          className="grid h-10 w-10 place-items-center rounded-[12px] text-ink-soft transition-colors hover:bg-surface-2"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="text-[15.5px] font-bold capitalize tracking-tight">{meseLabel}</p>
        <button
          type="button"
          aria-label="Mese successivo"
          onClick={() => setOffset(o => o + 1)}
          className="grid h-10 w-10 place-items-center rounded-[12px] text-ink-soft transition-colors hover:bg-surface-2"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {isLoading && (
        <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
          Un attimo — preparo il mese…
        </div>
      )}

      {!isLoading && giorniVisibili.length === 0 && (
        <div className="rounded-card bg-surface p-5 text-sm leading-relaxed text-ink-soft shadow-card">
          Niente in programma questo mese. Le mansioni e le manutenzioni impostate
          in Regia compaiono qui, giorno per giorno.
        </div>
      )}

      {giorniVisibili.map(g => (
        <section key={g.dateKey} className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-0.5">
            <span
              className={`text-[12.5px] font-bold uppercase tracking-[0.12em] ${
                g.oggi ? 'text-accent' : 'text-ink-mute'
              }`}
            >
              {formatDayLong(g.date)}
            </span>
            {g.oggi && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
                Oggi
              </span>
            )}
            {g.chiuso && !g.oggi && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-mute shadow-[inset_0_0_0_1px_var(--hairline)]">
                chiuso
              </span>
            )}
            <span className="h-px flex-1 bg-hairline" />
          </div>
          {!g.passato &&
            g.daFare.map(occ => (
              <RigaDaFare
                key={occ.key}
                occ={occ}
                giorno={g}
                onSpunta={spunta}
                pending={pending}
              />
            ))}
          {g.letture.map(l => (
            <article
              key={l.id}
              className="flex items-center justify-between gap-2 rounded-[14px] bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--hairline)]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-ok-bg text-ok-ink">
                  <ThermoIcon className="h-[18px] w-[18px]" />
                </span>
                <p className="truncate text-[14.5px] font-bold text-ink-soft">
                  Temperatura · {l.pointName}
                </p>
              </div>
              <VerdictChip tone="neutral">{formatC(l.valueC)} °C</VerdictChip>
            </article>
          ))}
          {g.fatte.map(f => (
            <RigaFatta key={f.id} fatto={f} onStorna={stornaFatto} pending={pending} />
          ))}
        </section>
      ))}

      <p className="px-1 pb-2 text-center text-[12px] leading-relaxed text-ink-mute">
        I giorni futuri mostrano cosa è in programma; quelli passati il registro.
        {localDateKey(mese) <= localDateKey(oggi)
          ? ' Puoi completare in anticipo le cose dei prossimi giorni.'
          : ''}
      </p>
      {toast}
    </div>
  )
}

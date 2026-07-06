import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/lib/auth/session'
import { useToast } from '@/components/ui/Toast'
import { Sheet } from '@/components/ui/Sheet'
import { VerdictChip } from '@/components/ui/VerdictChip'
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  FreezerIcon,
  SprayIcon,
  StampIcon,
  TaskIcon,
  ThermoIcon,
  UndoIcon,
} from '@/components/icons'
import { formatDayLong, formatTimeShort } from '@/lib/dates'
import { formatC, ruleRangeLabel, VERDICT_WORDS } from '@/compliance/point-verdict'
import { KeypadSheet, type EsitoLettura } from '@/features/reparti/KeypadSheet'
import type { PuntoOggi } from '@/features/reparti/hooks'
import {
  useCompletaMansione,
  useCompletaManutenzione,
  useOggi,
  useStorna,
  useTimbra,
  type CompletamentoFatto,
  type ManutenzioneOggi,
} from './hooks'

function SecLabel({ children, count }: { children: string; count?: number }) {
  return (
    <div className="flex items-center gap-2.5 px-0.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-mute">
      <span>{children}</span>
      {count !== undefined && (
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] shadow-[inset_0_0_0_1px_var(--hairline)]">
          {count}
        </span>
      )}
      <span className="h-px flex-1 bg-hairline" />
    </div>
  )
}

function IconaManutenzione({ tipo }: { tipo: string }) {
  if (tipo === 'sanitization') return <SprayIcon className="h-[22px] w-[22px]" />
  if (tipo === 'defrosting') return <FreezerIcon className="h-[22px] w-[22px]" />
  return <TaskIcon className="h-[22px] w-[22px]" />
}

function CardDaFare({
  icona,
  verbo,
  dove,
  azione,
  hero,
  onAction,
  disabled,
}: {
  icona: ReactNode
  verbo: string
  dove: ReactNode
  azione: string
  hero?: boolean
  onAction: () => void
  disabled?: boolean
}) {
  return (
    <article
      className={`flex flex-col gap-3.5 rounded-card bg-surface p-4 shadow-card ${
        hero ? 'shadow-[var(--shadow),inset_0_0_0_1.5px_color-mix(in_srgb,var(--accent)_20%,transparent)]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${
            hero
              ? 'bg-accent-soft text-accent'
              : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
          }`}
        >
          {icona}
        </span>
        <div className="flex-1">
          <p className="text-lg font-bold leading-tight tracking-tight">{verbo}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-mute">
            {dove}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={
          hero
            ? 'flex w-full items-center justify-center rounded-[13px] bg-accent px-4 py-3.5 text-[15.5px] font-semibold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-70'
            : 'flex w-full items-center justify-center rounded-[13px] bg-surface-2 px-4 py-3 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--hairline)] transition-transform active:scale-[0.975] disabled:opacity-70'
        }
      >
        {azione}
      </button>
    </article>
  )
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-semibold text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
      {children}
    </span>
  )
}

export default function OggiPage() {
  const { displayName } = useSession()
  const oggi = useOggi()
  const completaMansione = useCompletaMansione()
  const completaManutenzione = useCompletaManutenzione()
  const storna = useStorna()
  const timbra = useTimbra()
  const { toast, show } = useToast()

  const [keypadPoint, setKeypadPoint] = useState<PuntoOggi | null>(null)
  const [stornoArmedId, setStornoArmedId] = useState<string | null>(null)
  const [sealSheetOpen, setSealSheetOpen] = useState(false)
  const [sealNotes, setSealNotes] = useState('')
  const [stampPlaying, setStampPlaying] = useState(false)
  const [sealedDismissed, setSealedDismissed] = useState(false)

  const nome = (displayName ?? '').split(/\s+/)[0] || 'ciao'
  const daFare = oggi.ora.length + oggi.mansioni.length + oggi.manutenzioni.length
  const fatti = oggi.letture.length + oggi.completamenti.length
  const quieted = oggi.sealedToday && !sealedDismissed && !stampPlaying

  const onLetturaSalvata = (esito: EsitoLettura) => {
    setKeypadPoint(null)
    show(esito.verdict === 'ok' || esito.verdict === null ? 'Fatto!' : 'Registrata.')
  }

  const spuntaManutenzione = (m: ManutenzioneOggi) => {
    completaManutenzione.mutate(m, {
      onSuccess: () => show('Fatto!'),
      onError: () => show('Non registrato — riprova.'),
    })
  }

  const stornaFatto = (f: CompletamentoFatto) => {
    storna.mutate(f, {
      onSuccess: () => {
        setStornoArmedId(null)
        show('Stornato — torna tra le cose da fare.')
      },
      onError: () => show('Storno non riuscito — riprova.'),
    })
  }

  const sigilla = () => {
    const openedAt = oggi.firstActivityAt
      ? new Date(oggi.firstActivityAt)
      : new Date()
    timbra.mutate(
      { openedAt, notes: sealNotes.trim() || undefined },
      {
        onSuccess: () => {
          setSealSheetOpen(false)
          setSealNotes('')
          setSealedDismissed(false)
          setStampPlaying(true)
          setTimeout(() => setStampPlaying(false), 750)
        },
        onError: () => show('Timbro non riuscito — riprova.'),
      },
    )
  }

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 md:px-7 md:py-8">
      {/* nastro gentile (mai una tab): il primo punto non controllato */}
      {oggi.ribbon && !quieted && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-warn-bg px-3.5 py-2.5 text-[13.5px] font-medium leading-snug text-warn-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--warn)_22%,transparent)]">
          <AlertIcon className="h-[18px] w-[18px] shrink-0" />
          <span>{oggi.ribbon}</span>
        </div>
      )}

      <header className="flex items-start justify-between gap-3 px-0.5">
        <div>
          <p className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-mute">
            {formatDayLong()}
          </p>
          <h2 className="text-[27px] font-bold leading-tight tracking-tight">
            Ciao, {nome}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Ecco il tuo oggi.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* 📅 la vista completa (dec. 13): i prossimi giorni, non solo il turno */}
          <Link
            to="/calendario"
            aria-label="Apri il calendario"
            className="grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-surface text-ink-soft shadow-card transition-transform active:scale-95"
          >
            <CalendarIcon className="h-[21px] w-[21px]" />
          </Link>
          <div
            aria-hidden="true"
            className="grid h-[42px] w-[42px] place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-[15px] font-bold text-white shadow-card md:hidden"
          >
            {(displayName ?? '·').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div
        className={`flex flex-col gap-5 transition-all duration-500 ease-calm ${
          quieted ? 'scale-[0.992] opacity-50 grayscale-[0.7]' : ''
        }`}
      >
        {oggi.isLoading && (
          <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
            Un attimo — preparo il tuo diario…
          </div>
        )}

        {!oggi.isLoading && daFare === 0 && fatti === 0 && (
          <div className="rounded-card bg-surface p-5 text-sm leading-relaxed text-ink-soft shadow-card">
            Niente in lista per oggi. Quando la Regia imposta mansioni e punti di
            conservazione, il tuo diario si popola qui — le cose da fare ora, poi
            il timbro a fine turno.
          </div>
        )}

        {/* ORA — la temperatura che aspetta (gesto-firma 🌡️) */}
        {oggi.ora.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <SecLabel>Ora</SecLabel>
            {oggi.ora.map(p => (
              <CardDaFare
                key={p.id}
                hero
                icona={<ThermoIcon className="h-6 w-6" />}
                verbo="Registra temperatura"
                dove={
                  <>
                    <Pill>{p.name}</Pill>
                    {p.departmentName ?? ''}
                    {p.rule ? ` · atteso ${ruleRangeLabel(p.rule)}` : ''}
                  </>
                }
                azione="Registra"
                onAction={() => setKeypadPoint(p)}
              />
            ))}
          </section>
        )}

        {/* A BREVE — mansioni e manutenzioni del giorno */}
        {oggi.mansioni.length + oggi.manutenzioni.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <SecLabel>A breve</SecLabel>
            {oggi.manutenzioni.map(m => (
              <CardDaFare
                key={m.id}
                icona={<IconaManutenzione tipo={m.tipo} />}
                verbo={m.titolo}
                dove={
                  <>
                    {m.pointName && <Pill>{m.pointName}</Pill>}
                    {m.arretrata && (
                      <span className="font-semibold text-warn-ink">arretrata</span>
                    )}
                  </>
                }
                azione="Spunta"
                disabled={completaManutenzione.isPending}
                onAction={() => spuntaManutenzione(m)}
              />
            ))}
            {oggi.mansioni.map(t => (
              <CardDaFare
                key={t.id}
                icona={<TaskIcon className="h-[22px] w-[22px]" />}
                verbo={t.nome}
                dove={
                  <>
                    <Pill>Mansione</Pill>
                    {t.dueLabel ?? ''}
                  </>
                }
                azione="Spunta"
                disabled={completaMansione.isPending}
                onAction={() =>
                  completaMansione.mutate(t, {
                    onSuccess: () => show('Fatto!'),
                    onError: () => show('Non registrato — riprova.'),
                  })
                }
              />
            ))}
          </section>
        )}

        {/* FATTO — il registro di oggi, con lo storno (dec. 1) */}
        {fatti > 0 && (
          <section className="flex flex-col gap-2.5">
            <SecLabel count={fatti}>Fatto</SecLabel>
            {oggi.letture.map(l => (
              <article
                key={l.id}
                className="flex items-center justify-between gap-2.5 rounded-card bg-surface-2 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-ok-bg text-ok-ink">
                    <CheckIcon className="h-[22px] w-[22px]" />
                  </span>
                  <p className="text-[15.5px] font-bold text-ink-soft">
                    Temperatura · {l.pointName}
                  </p>
                </div>
                <VerdictChip tone={l.verdict ?? 'neutral'}>
                  {formatC(l.valueC)} °C{l.verdict ? ` · ${VERDICT_WORDS[l.verdict].chip}` : ''}
                </VerdictChip>
              </article>
            ))}
            {oggi.completamenti.map(f => (
              <article
                key={f.id}
                className="flex flex-col gap-2.5 rounded-card bg-surface-2 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-ok-bg text-ok-ink">
                      <CheckIcon className="h-[22px] w-[22px]" />
                    </span>
                    <p className="text-[15.5px] font-bold text-ink-soft">{f.titolo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerdictChip tone="ok">
                      {formatTimeShort(new Date(f.completedAt))}
                    </VerdictChip>
                    {f.storno && !quieted && (
                      <button
                        type="button"
                        aria-label={`Annulla ${f.titolo}`}
                        onClick={() =>
                          setStornoArmedId(id => (id === f.id ? null : f.id))
                        }
                        className="grid h-8 w-8 place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface hover:text-ink"
                      >
                        <UndoIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {stornoArmedId === f.id && (
                  <div className="anim-rise flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
                    <p className="text-[13px] leading-snug text-ink-soft">
                      Torna tra le cose da fare. Nel registro resta una riga di
                      storno — niente si cancella.
                    </p>
                    <button
                      type="button"
                      onClick={() => stornaFatto(f)}
                      disabled={storna.isPending}
                      className="shrink-0 rounded-lg bg-bad-bg px-3 py-1.5 text-[13px] font-bold text-bad-ink transition-transform active:scale-95 disabled:opacity-70"
                    >
                      Storna
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {/* 🔖 il timbro — sigilla la giornata (dec. 7) */}
        {!oggi.isLoading && (daFare > 0 || fatti > 0) && !oggi.sealedToday && (
          <button
            type="button"
            onClick={() => setSealSheetOpen(true)}
            className="mt-1 flex w-full items-center justify-center gap-2.5 rounded-card border-2 border-dashed border-[color-mix(in_srgb,var(--ink)_18%,transparent)] bg-surface p-4 text-base font-bold shadow-card transition-transform active:scale-[0.98]"
          >
            <StampIcon className="h-[22px] w-[22px] text-ink-mute" />
            Timbra fine turno
          </button>
        )}
      </div>

      {/* nota di sigillo — «il tuo l'hai fatto» */}
      {oggi.sealedToday && !stampPlaying && (
        <div className="anim-rise flex flex-col items-center gap-1 rounded-card bg-surface px-4 py-5 text-center shadow-card">
          <StampIcon className="mb-1 h-[30px] w-[30px] text-ok" />
          <b className="text-base font-bold">Il tuo l'hai fatto.</b>
          <span className="text-[13.5px] text-ink-mute">
            Turno chiuso{oggi.sealClosedAt ? ` alle ${formatTimeShort(new Date(oggi.sealClosedAt))}` : ''}
            {nome !== 'ciao' ? ` · buona serata, ${nome}.` : '.'}
          </span>
          {!sealedDismissed && (
            <button
              type="button"
              onClick={() => setSealedDismissed(true)}
              className="mt-2 text-[13px] font-semibold text-accent underline underline-offset-4"
            >
              Devo aggiungere ancora qualcosa
            </button>
          )}
        </div>
      )}

      {/* sovraimpressione del timbro che si imprime */}
      {stampPlaying && (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
          <div className="anim-stamp grid h-[180px] w-[180px] place-items-center rounded-full border-4 border-ok text-center text-[15px] font-extrabold uppercase leading-tight tracking-[0.08em] text-ok shadow-[0_0_0_6px_color-mix(in_srgb,var(--ok)_12%,transparent)]">
            Turno
            <br />
            chiuso
          </div>
        </div>
      )}

      {/* conferma timbro: attestazione + voce per le eccezioni (§9.4) */}
      <Sheet
        open={sealSheetOpen}
        onClose={() => setSealSheetOpen(false)}
        label="Timbra fine turno"
      >
        <p className="text-center text-[17px] font-bold tracking-tight">
          Timbra fine turno
        </p>
        <p className="px-2 text-center text-[13.5px] leading-relaxed text-ink-soft">
          Il timbro sigilla i registri di oggi: confermi che quello che dovevi
          registrare è registrato. Resta scritto, con la tua firma e l'orario.
        </p>
        <textarea
          value={sealNotes}
          onChange={e => setSealNotes(e.target.value)}
          rows={2}
          placeholder="Qualcosa non è stato possibile registrare? Scrivilo qui."
          className="w-full resize-none rounded-xl bg-surface-2 px-3.5 py-3 text-sm text-ink shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]"
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={sigilla}
            disabled={timbra.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-[13px] bg-accent px-4 py-3.5 text-[15.5px] font-semibold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-70"
          >
            <StampIcon className="h-5 w-5" />
            Sigilla il turno
          </button>
          <button
            type="button"
            onClick={() => setSealSheetOpen(false)}
            className="p-1.5 text-sm font-semibold text-ink-mute"
          >
            Non ancora
          </button>
        </div>
      </Sheet>

      <KeypadSheet
        punto={keypadPoint}
        open={!!keypadPoint}
        onClose={() => setKeypadPoint(null)}
        onSaved={onLetturaSalvata}
      />
      {toast}
    </div>
  )
}

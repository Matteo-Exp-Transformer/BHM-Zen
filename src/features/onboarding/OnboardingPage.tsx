/**
 * Onboarding titolare (mockup 05 v2, FU-013) — «l'azienda che prende forma».
 * Full-screen, fuori dalla shell: rail-cantiere collassabile a sinistra
 * (progresso + anteprima azienda viva), un passo alla volta nel pannello.
 * RIPETIBILE (owner 08-07): ogni passo legge il DB, quindi riaprendo il
 * cantiere tutto compare già compilato e si ritocca con lo schermo intero.
 * Temperatura punti: derivata dal LOCK (mai digitata) — i profili frigo
 * arriveranno col track compliance (FU-005).
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/Toast'
import {
  CalendarIcon,
  CartIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  PlusIcon,
  PointTypeIcon,
  RepartiIcon,
  TaskIcon,
  UsersIcon,
} from '@/components/icons'
import {
  formatC,
  POINT_TYPE_LABELS,
  ruleForPointType,
  ruleRangeLabel,
  suggestedSetpointForType,
} from '@/compliance/point-verdict'
import {
  useAggiungiPersona,
  usePuntiRegia,
  useRepartiRegia,
  useSalvaPunto,
  useSalvaReparto,
  useStaffRegia,
} from '@/features/regia/hooks'
import {
  MANUTENZIONE_LABEL,
  MANUTENZIONI_RICHIESTE,
  useAzienda,
  useCalendarioImpostazioni,
  useCompletaOnboarding,
  useCreaMansione,
  useGeneraManutenzioni,
  useInventarioRecap,
  useMansioni,
  useManutenzioni,
  useSalvaAnagrafica,
  useSalvaCalendario,
} from './hooks'

const RUOLO_LABEL: Record<string, string> = {
  admin: 'titolare',
  responsabile: 'responsabile',
  dipendente: 'dipendente',
}
const RUOLI = ['dipendente', 'responsabile', 'admin'] as const
const FREQ_LABEL: Record<string, string> = {
  daily: 'ogni giorno',
  weekly: 'ogni settimana',
  monthly: 'ogni mese',
  annually: 'ogni anno',
}
const GIORNI = [
  [1, 'Lun'],
  [2, 'Mar'],
  [3, 'Mer'],
  [4, 'Gio'],
  [5, 'Ven'],
  [6, 'Sab'],
  [0, 'Dom'],
] as const

const inputCls =
  'w-full rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14.5px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]'
const pillCls = (attiva: boolean) =>
  `rounded-full px-3 py-2 text-[12.5px] font-bold transition-all ${
    attiva
      ? 'bg-accent text-accent-ink'
      : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
  }`
const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-[14.5px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-50'
const ghostBtnCls =
  'rounded-xl bg-surface px-4 py-2.5 text-[13.5px] font-bold text-ink shadow-card transition-transform active:scale-[0.985]'

interface StepDef {
  n: number
  nome: string
  icona: React.ReactNode
}

const STEP_DEFS: StepDef[] = [
  { n: 1, nome: 'Anagrafica', icona: <ClipboardIcon className="h-4 w-4" /> },
  { n: 2, nome: 'Reparti', icona: <RepartiIcon className="h-4 w-4" /> },
  { n: 3, nome: 'Staff & ruoli', icona: <UsersIcon className="h-4 w-4" /> },
  { n: 4, nome: 'Punti di conservazione', icona: <PointTypeIcon pointType="fridge" className="h-4 w-4" /> },
  { n: 5, nome: 'Attività & manutenzioni', icona: <TaskIcon className="h-4 w-4" /> },
  { n: 6, nome: 'Inventario', icona: <CartIcon className="h-4 w-4" /> },
  { n: 7, nome: 'Calendario & orari', icona: <CalendarIcon className="h-4 w-4" /> },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { toast, show } = useToast()

  // il cantiere legge tutto vivo: riaprirlo = vedere l'azienda nel suo insieme
  const { azienda } = useAzienda()
  const { reparti } = useRepartiRegia()
  const { persone } = useStaffRegia()
  const { punti } = usePuntiRegia()
  const { manutenzioni } = useManutenzioni()
  const { mansioni } = useMansioni()
  const { inventario } = useInventarioRecap()
  const { calendario } = useCalendarioImpostazioni()

  const [passo, setPasso] = useState(1)
  const [railAperta, setRailAperta] = useState(false)

  const mancantiManutenzioni = useMemo(() => {
    const per = new Map<string, Set<string>>()
    for (const m of manutenzioni) {
      if (!per.has(m.puntoId)) per.set(m.puntoId, new Set())
      per.get(m.puntoId)!.add(m.tipo)
    }
    const out: { puntoId: string; puntoNome: string; tipo: string }[] = []
    for (const p of punti) {
      const richieste = MANUTENZIONI_RICHIESTE[p.tipo] ?? []
      for (const t of richieste) {
        if (!per.get(p.id)?.has(t)) out.push({ puntoId: p.id, puntoNome: p.nome, tipo: t })
      }
    }
    return out
  }, [punti, manutenzioni])

  const fatto: Record<number, boolean> = {
    1: !!azienda && azienda.nome.trim().length >= 2 && azienda.indirizzo.trim().length > 0,
    2: reparti.length > 0,
    3: persone.length > 0,
    4: punti.length > 0,
    5: punti.length > 0 && mancantiManutenzioni.length === 0 && mansioni.length > 0,
    6: (inventario?.prodotti ?? 0) > 0,
    7: !!calendario?.configurato,
  }
  const completati = STEP_DEFS.filter(s => fatto[s.n]).length

  // dipendenze reali tra passi (mappa onboarding): senza reparti niente punti…
  const bloccato: Record<number, boolean> = {
    1: false,
    2: false,
    3: reparti.length === 0,
    4: reparti.length === 0,
    5: punti.length === 0,
    6: false,
    7: false,
  }

  // azienda già viva → si può uscire; azienda vuota → il cantiere è la strada
  const puoUscire = reparti.length > 0 || !!azienda?.onboardingCompletato

  const vai = (n: number) => {
    if (!bloccato[n]) setPasso(n)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ground md:flex-row">
      {/* ── rail cantiere: mini (pallini) ↔ aperta (progresso + anteprima) ── */}
      <aside
        className={`shrink-0 border-b border-hairline bg-surface transition-all duration-300 ease-calm md:border-b-0 md:border-r ${
          railAperta ? 'md:w-[320px]' : 'md:w-[72px]'
        }`}
      >
        <div className="flex items-center justify-between px-3 pt-3 md:justify-end">
          <span className="text-[13px] font-bold tracking-tight md:hidden">
            Cantiere · {completati} di 7
          </span>
          <button
            type="button"
            onClick={() => setRailAperta(a => !a)}
            aria-expanded={railAperta}
            aria-label="Apri o chiudi la barra cantiere"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft shadow-[inset_0_0_0_1.5px_var(--hairline)]"
          >
            <ChevronRightIcon
              className={`h-4 w-4 transition-transform ${railAperta ? 'rotate-180 max-md:rotate-[270deg]' : 'max-md:rotate-90'}`}
            />
          </button>
        </div>

        {!railAperta && (
          <div className="flex gap-2 overflow-x-auto px-3 py-2.5 md:flex-col md:items-center md:overflow-visible md:py-4">
            {STEP_DEFS.map(s => (
              <button
                key={s.n}
                type="button"
                onClick={() => vai(s.n)}
                disabled={bloccato[s.n]}
                aria-label={`Passo ${s.n}: ${s.nome}`}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-[13px] font-bold tabular-nums transition-transform active:scale-95 ${
                  s.n === passo
                    ? 'bg-accent text-accent-ink shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_18%,transparent)]'
                    : fatto[s.n]
                      ? 'bg-ok text-white'
                      : 'bg-surface-2 text-ink-mute shadow-[inset_0_0_0_1.5px_var(--hairline)] disabled:opacity-50'
                }`}
              >
                {fatto[s.n] && s.n !== passo ? <CheckIcon className="h-4 w-4" /> : s.n}
              </button>
            ))}
          </div>
        )}

        {railAperta && (
          <div className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto px-4 pb-5 pt-1 md:max-h-none">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_58%,#6f2b13)] text-[14px] font-extrabold text-white">
                B
              </span>
              <span>
                <span className="block text-[13.5px] font-bold leading-tight">
                  {azienda?.nome ?? '…'}
                </span>
                <span className="block text-[11.5px] text-ink-mute">Il cantiere della tua azienda</span>
              </span>
            </div>

            <div>
              <p className="flex justify-between text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink-mute">
                <span>Progresso</span>
                <span className="text-accent">{completati} di 7</span>
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hairline">
                <span
                  className="block h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.round((completati / 7) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col">
              {STEP_DEFS.map(s => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => vai(s.n)}
                  disabled={bloccato[s.n]}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors disabled:opacity-50 ${
                    s.n === passo ? 'bg-accent-soft' : ''
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums ${
                      fatto[s.n]
                        ? 'bg-ok text-white'
                        : s.n === passo
                          ? 'bg-accent text-accent-ink'
                          : 'bg-surface text-ink-mute shadow-[inset_0_0_0_1.5px_var(--hairline)]'
                    }`}
                  >
                    {fatto[s.n] ? <CheckIcon className="h-3 w-3" /> : s.n}
                  </span>
                  <span
                    className={`text-[13px] ${s.n === passo ? 'font-bold' : 'font-semibold text-ink-soft'}`}
                  >
                    {s.nome}
                  </span>
                </button>
              ))}
            </div>

            {/* anteprima: la tua azienda, viva */}
            <div className="flex flex-col gap-3 border-t border-dashed border-hairline pt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-mute">
                La tua azienda
              </p>
              <div>
                <p className="mb-1.5 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-mute">
                  Reparti
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-extrabold text-accent tabular-nums">
                    {reparti.filter(r => r.attivo).length}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {reparti
                    .filter(r => r.attivo)
                    .slice(0, 5)
                    .map(r => (
                      <span
                        key={r.id}
                        className="rounded-[7px] bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]"
                      >
                        {r.nome}
                      </span>
                    ))}
                  {reparti.filter(r => r.attivo).length > 5 && (
                    <span className="px-1 text-[11px] font-bold text-ink-mute">
                      +{reparti.filter(r => r.attivo).length - 5}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-mute">
                  Staff
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-extrabold text-accent tabular-nums">
                    {persone.length}
                  </span>
                </p>
                <div className="flex">
                  {persone.slice(0, 5).map((p, i) => (
                    <span
                      key={p.id}
                      className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-[10px] font-bold text-white shadow-[0_0_0_2px_var(--surface)] ${i > 0 ? '-ml-1.5' : ''}`}
                    >
                      {p.nome.slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                  {persone.length > 5 && (
                    <span className="-ml-1.5 grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-[10px] font-bold text-ink-mute shadow-[0_0_0_2px_var(--surface),inset_0_0_0_1px_var(--hairline)]">
                      +{persone.length - 5}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-1.5 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-mute">
                  Punti conservazione
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-extrabold text-accent tabular-nums">
                    {punti.length}
                  </span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {punti.slice(0, 5).map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-[10px] bg-surface-2 px-2 py-1.5 shadow-[inset_0_0_0_1px_var(--hairline)]"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-surface text-ink-soft shadow-card">
                        <PointTypeIcon pointType={p.tipo} className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold">{p.nome}</span>
                        <span className="block truncate text-[10.5px] text-ink-mute">
                          {p.departmentName ?? POINT_TYPE_LABELS[p.tipo] ?? p.tipo}
                        </span>
                      </span>
                      <span className="text-[12px] font-bold tabular-nums text-ink-soft">
                        {ruleForPointType(p.tipo) ? `${formatC(p.setpoint)}°` : 'amb'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── pannello del passo ── */}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-9">
        <div className="mx-auto flex max-w-[760px] flex-col gap-5">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                Passo {passo} di 7 · {STEP_DEFS[passo - 1]!.nome}
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-[26px]">
                {TITOLI[passo]}
              </h1>
              <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-relaxed text-ink-soft">
                {SOTTOTITOLI[passo]}
              </p>
            </div>
            {puoUscire && (
              <button type="button" onClick={() => navigate('/')} className={ghostBtnCls}>
                Torna all'app
              </button>
            )}
          </header>

          {passo === 1 && <StepAnagrafica show={show} />}
          {passo === 2 && <StepReparti show={show} />}
          {passo === 3 && <StepStaff show={show} />}
          {passo === 4 && <StepPunti show={show} />}
          {passo === 5 && (
            <StepAttivita show={show} mancanti={mancantiManutenzioni} />
          )}
          {passo === 6 && <StepInventario />}
          {passo === 7 && (
            <StepCalendario show={show} tuttoFatto={completati >= 6 || !!fatto[7]} />
          )}

          <div className="flex items-center gap-2.5 pb-4">
            {passo > 1 && (
              <button type="button" onClick={() => vai(passo - 1)} className={ghostBtnCls}>
                ← Indietro
              </button>
            )}
            <span className="flex-1" />
            {passo < 7 && (
              <button
                type="button"
                onClick={() => vai(passo + 1)}
                disabled={!!bloccato[passo + 1]}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-[14px] font-bold text-surface shadow-card transition-transform active:scale-[0.985] disabled:opacity-50"
              >
                {STEP_DEFS[passo]!.nome} →
              </button>
            )}
          </div>
        </div>
      </main>
      {toast}
    </div>
  )
}

const TITOLI: Record<number, string> = {
  1: 'Chi sei, nero su bianco',
  2: 'Le stanze del lavoro',
  3: 'Chi firma il registro',
  4: 'Dove tieni il freddo',
  5: 'Cosa si fa, e ogni quanto',
  6: 'Cosa hai in casa',
  7: 'Quando siete aperti',
}
const SOTTOTITOLI: Record<number, string> = {
  1: 'Ragione sociale e indirizzo finiscono sull\'intestazione del dossier: scrivili come li vuoi leggere lì.',
  2: 'Cucina, sala, magazzino: ogni reparto avrà la sua piantina e le sue mansioni.',
  3: 'Aggiungi le persone; con un\'email puoi invitarle nell\'app dalla Regia quando vuoi.',
  4: 'Ogni frigo, freezer o abbattitore diventa un punto da controllare. Alla temperatura pensiamo noi: è derivata dalle regole HACCP.',
  5: 'Le manutenzioni obbligatorie nascono dai punti che hai messo; le mansioni ricorrenti le decidi tu.',
  6: 'Il carico prodotti (la cascata) arriva a breve: intanto ecco cosa risulta in casa.',
  7: 'Giorni di apertura e anno lavorativo: servono al Calendario per proporre le cose giuste nei giorni giusti.',
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card">{children}</section>
}

function Etichetta({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">{children}</span>
  )
}

/* ── passo 1 · anagrafica ─────────────────────────────────────────────────── */
function StepAnagrafica({ show }: { show: (m: string) => void }) {
  const { azienda } = useAzienda()
  const salva = useSalvaAnagrafica()
  const [nome, setNome] = useState('')
  const [indirizzo, setIndirizzo] = useState('')
  const [email, setEmail] = useState('')
  const [piva, setPiva] = useState('')
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (azienda && !pronto) {
      setNome(azienda.nome)
      setIndirizzo(azienda.indirizzo)
      setEmail(azienda.email)
      setPiva(azienda.partitaIva)
      setPronto(true)
    }
  }, [azienda, pronto])

  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <Etichetta>Ragione sociale *</Etichetta>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <Etichetta>Partita IVA</Etichetta>
          <input type="text" value={piva} onChange={e => setPiva(e.target.value)} placeholder="IT…" className={inputCls} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <Etichetta>Indirizzo *</Etichetta>
        <input type="text" value={indirizzo} onChange={e => setIndirizzo(e.target.value)} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <Etichetta>Email aziendale</Etichetta>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
      </label>
      <button
        type="button"
        disabled={nome.trim().length < 2 || !indirizzo.trim() || salva.isPending}
        onClick={() =>
          salva.mutate(
            { nome: nome.trim(), indirizzo: indirizzo.trim(), email: email.trim(), partitaIva: piva },
            {
              onSuccess: () => show('Anagrafica salvata.'),
              onError: () => show('Non salvata — riprova.'),
            },
          )
        }
        className={primaryBtnCls}
      >
        Salva anagrafica
      </button>
    </Card>
  )
}

/* ── passo 2 · reparti ────────────────────────────────────────────────────── */
function StepReparti({ show }: { show: (m: string) => void }) {
  const { reparti } = useRepartiRegia()
  const salva = useSalvaReparto()
  const [nuovo, setNuovo] = useState('')

  const aggiungi = () => {
    const n = nuovo.trim()
    if (n.length < 2) return
    if (reparti.some(r => r.nome.toLowerCase() === n.toLowerCase())) {
      show('C\'è già un reparto con questo nome.')
      return
    }
    salva.mutate(
      { nome: n },
      {
        onSuccess: () => {
          setNuovo('')
          show(`«${n}» è tra i reparti.`)
        },
        onError: () => show('Non salvato — riprova.'),
      },
    )
  }

  return (
    <Card>
      <div className="flex flex-col gap-2">
        {reparti.length === 0 && (
          <p className="text-sm leading-relaxed text-ink-soft">
            Nessun reparto ancora: parti da quelli veri — Cucina, Sala, Bancone, Magazzino…
          </p>
        )}
        {reparti.map(r => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--hairline)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-surface text-ink-soft shadow-card">
              <RepartiIcon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{r.nome}</span>
            <button
              type="button"
              onClick={() =>
                salva.mutate(
                  { id: r.id, nome: r.nome, attivo: !r.attivo },
                  { onError: () => show('Non salvato — riprova.') },
                )
              }
              className={pillCls(r.attivo)}
            >
              {r.attivo ? 'attivo' : 'spento'}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-hairline pt-3">
        <input
          type="text"
          value={nuovo}
          onChange={e => setNuovo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && aggiungi()}
          placeholder="Nome del reparto (es. Cucina)"
          className={inputCls}
        />
        <button
          type="button"
          disabled={nuovo.trim().length < 2 || salva.isPending}
          onClick={aggiungi}
          className={primaryBtnCls}
        >
          <PlusIcon className="h-4 w-4" /> Aggiungi
        </button>
      </div>
    </Card>
  )
}

/* ── passo 3 · staff ──────────────────────────────────────────────────────── */
function StepStaff({ show }: { show: (m: string) => void }) {
  const { persone } = useStaffRegia()
  const aggiungi = useAggiungiPersona()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [ruolo, setRuolo] = useState<string>('dipendente')

  return (
    <Card>
      <div className="flex flex-col gap-2">
        {persone.map(p => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--hairline)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-[12px] font-bold text-white">
              {p.nome.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold">{p.nome}</span>
              <span className="block truncate text-[12px] text-ink-mute">
                {RUOLO_LABEL[p.ruolo] ?? p.ruolo}
                {p.reparti.length > 0 && ` · ${p.reparti.join(', ')}`}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-hairline pt-3">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome e cognome"
            className={inputCls}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (per l'invito, opzionale)"
            className={inputCls}
          />
        </div>
        <div className="flex gap-1.5">
          {RUOLI.map(r => (
            <button key={r} type="button" onClick={() => setRuolo(r)} className={pillCls(ruolo === r)}>
              {RUOLO_LABEL[r]}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!nome.trim() || aggiungi.isPending}
          onClick={() =>
            aggiungi.mutate(
              { nome: nome.trim(), ruolo, email: email.trim() || undefined },
              {
                onSuccess: () => {
                  show(`${nome.trim()} è nello staff.`)
                  setNome('')
                  setEmail('')
                },
                onError: () => show('Non salvato — riprova.'),
              },
            )
          }
          className={primaryBtnCls}
        >
          <PlusIcon className="h-4 w-4" /> Aggiungi allo staff
        </button>
        <p className="text-[11.5px] leading-snug text-ink-mute">
          Reparti assegnati e inviti nell'app si gestiscono da Regia → Staff & ruoli, toccando la persona.
        </p>
      </div>
    </Card>
  )
}

/* ── passo 4 · punti (temperatura DERIVATA dal LOCK, mai digitata) ───────── */
function StepPunti({ show }: { show: (m: string) => void }) {
  const { reparti } = useRepartiRegia()
  const { punti } = usePuntiRegia()
  const salva = useSalvaPunto()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('fridge')
  const [repartoId, setRepartoId] = useState<string | null>(null)

  const attivi = reparti.filter(r => r.attivo)
  const repartoSel = repartoId ?? attivi[0]?.id ?? null
  const rule = ruleForPointType(tipo)
  const setpoint = suggestedSetpointForType(tipo)

  const aggiungi = () => {
    const n = nome.trim()
    if (!n) return
    salva.mutate(
      { nome: n, tipo, setpoint: setpoint ?? 20, departmentId: repartoSel },
      {
        onSuccess: () => {
          show(`«${n}» è sulla piantina.`)
          setNome('')
        },
        onError: () => show('Non salvato — riprova.'),
      },
    )
  }

  return (
    <>
      <Card>
        <p className="text-[13px] font-bold tracking-tight">Nuovo punto di conservazione</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <Etichetta>Nome *</Etichetta>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="es. Frigo cucina"
              className={inputCls}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <Etichetta>Reparto</Etichetta>
            <div className="flex flex-wrap gap-1.5">
              {attivi.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRepartoId(r.id)}
                  className={pillCls(repartoSel === r.id)}
                >
                  {r.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Etichetta>Tipo *</Etichetta>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.keys(POINT_TYPE_LABELS).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex flex-col items-center gap-1.5 rounded-[13px] px-2 py-3 transition-all ${
                  tipo === t
                    ? 'bg-accent-soft text-ink shadow-[inset_0_0_0_1.5px_var(--accent)]'
                    : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                }`}
              >
                <PointTypeIcon pointType={t} className={`h-6 w-6 ${tipo === t ? 'text-accent' : 'text-ink-mute'}`} />
                <span className="text-[12px] font-bold">{POINT_TYPE_LABELS[t]}</span>
              </button>
            ))}
          </div>
        </div>
        {/* temperatura: la decide l'app (fonte-unica HACCP), qui non si digita */}
        <div className="flex flex-wrap items-center gap-4 rounded-[14px] bg-surface-2 px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <span className="inline-flex items-baseline gap-1 tabular-nums">
            <span className="text-[34px] font-bold leading-none tracking-tight">
              {setpoint !== null ? formatC(setpoint) : 'non monitorata'}
            </span>
            {setpoint !== null && <span className="text-[17px] font-semibold text-ink-mute">°C</span>}
          </span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-mute shadow-[inset_0_0_0_1px_var(--hairline)]">
            derivata dalle regole HACCP
          </span>
          <span className="min-w-[160px] flex-1 text-[12.5px] leading-snug text-ink-soft">
            {rule
              ? `Atteso ${ruleRangeLabel(rule)}. Si può rifinire da Regia → Reparti & punti.`
              : 'Per questo tipo non c\'è una soglia da registrare: si controllano pulizia e scadenze.'}
          </span>
        </div>
        <button
          type="button"
          disabled={!nome.trim() || salva.isPending}
          onClick={aggiungi}
          className={primaryBtnCls}
        >
          <PlusIcon className="h-4 w-4" /> Aggiungi punto
        </button>
      </Card>

      {punti.length > 0 && (
        <Card>
          <p className="text-[13px] font-bold tracking-tight">Già sulla piantina · {punti.length}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {punti.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-surface text-ink-soft shadow-card">
                  <PointTypeIcon pointType={p.tipo} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{p.nome}</span>
                  <span className="block truncate text-[11.5px] text-ink-mute">
                    {POINT_TYPE_LABELS[p.tipo] ?? p.tipo}
                    {p.departmentName && ` · ${p.departmentName}`}
                  </span>
                </span>
                <span className="text-[13px] font-bold tabular-nums text-ink-soft">
                  {ruleForPointType(p.tipo) ? `${formatC(p.setpoint)}°` : 'amb'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}

/* ── passo 5 · attività & manutenzioni ───────────────────────────────────── */
function StepAttivita({
  show,
  mancanti,
}: {
  show: (m: string) => void
  mancanti: { puntoId: string; puntoNome: string; tipo: string }[]
}) {
  const { punti } = usePuntiRegia()
  const { manutenzioni } = useManutenzioni()
  const { mansioni } = useMansioni()
  const { reparti } = useRepartiRegia()
  const genera = useGeneraManutenzioni()
  const crea = useCreaMansione()

  const [nome, setNome] = useState('')
  const [frequenza, setFrequenza] = useState('daily')
  const [ruolo, setRuolo] = useState('dipendente')
  const [repartoId, setRepartoId] = useState<string | null>(null)

  const perPunto = new Map<string, Set<string>>()
  for (const m of manutenzioni) {
    if (!perPunto.has(m.puntoId)) perPunto.set(m.puntoId, new Set())
    perPunto.get(m.puntoId)!.add(m.tipo)
  }

  return (
    <>
      <Card>
        <p className="text-[13px] font-bold tracking-tight">
          Manutenzioni obbligatorie — nascono dai punti
        </p>
        <div className="flex flex-col gap-2">
          {punti.map(p => {
            const richieste = MANUTENZIONI_RICHIESTE[p.tipo] ?? []
            const esistenti = perPunto.get(p.id) ?? new Set()
            return (
              <div
                key={p.id}
                className="flex flex-col gap-1.5 rounded-xl bg-surface-2 p-3 shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <p className="flex items-center gap-2 text-[13px] font-bold">
                  <PointTypeIcon pointType={p.tipo} className="h-4 w-4 text-ink-mute" />
                  {p.nome}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {richieste.map(t => {
                    const ok = esistenti.has(t)
                    return (
                      <span
                        key={t}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
                          ok ? 'bg-ok-bg text-ok-ink' : 'bg-warn-bg text-warn-ink'
                        }`}
                      >
                        {ok && <CheckIcon className="h-3 w-3" />}
                        {MANUTENZIONE_LABEL[t]}
                        {!ok && ' · manca'}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {mancanti.length > 0 ? (
          <button
            type="button"
            disabled={genera.isPending}
            onClick={() =>
              genera.mutate(mancanti, {
                onSuccess: n => show(`${n} manutenzioni create — le vedi nel Calendario.`),
                onError: () => show('Non create — riprova.'),
              })
            }
            className={primaryBtnCls}
          >
            Genera le {mancanti.length} mancanti
          </button>
        ) : (
          <p className="flex items-center gap-2 text-[13px] font-bold text-ok-ink">
            <CheckIcon className="h-4 w-4" /> Ogni punto ha le sue manutenzioni.
          </p>
        )}
      </Card>

      <Card>
        <p className="text-[13px] font-bold tracking-tight">
          Mansioni ricorrenti · {mansioni.length}
        </p>
        {mansioni.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2">
            {mansioni.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 rounded-xl bg-surface-2 p-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-surface text-ink-soft shadow-card">
                  <TaskIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{m.nome}</span>
                  <span className="block truncate text-[11.5px] text-ink-mute">
                    {FREQ_LABEL[m.frequenza] ?? m.frequenza}
                    {m.ruolo && ` · ${RUOLO_LABEL[m.ruolo] ?? m.ruolo}`}
                    {m.repartoNome && ` · ${m.repartoNome}`}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-hairline pt-3">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nuova mansione (es. Pulizia piani di lavoro)"
            className={inputCls}
          />
          <div className="flex flex-wrap gap-1.5">
            {(['daily', 'weekly', 'monthly'] as const).map(f => (
              <button key={f} type="button" onClick={() => setFrequenza(f)} className={pillCls(frequenza === f)}>
                {FREQ_LABEL[f]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {RUOLI.map(r => (
              <button key={r} type="button" onClick={() => setRuolo(r)} className={pillCls(ruolo === r)}>
                {RUOLO_LABEL[r]}
              </button>
            ))}
          </div>
          {reparti.filter(r => r.attivo).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {reparti
                .filter(r => r.attivo)
                .map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRepartoId(id => (id === r.id ? null : r.id))}
                    className={pillCls(repartoId === r.id)}
                  >
                    {r.nome}
                  </button>
                ))}
            </div>
          )}
          <button
            type="button"
            disabled={!nome.trim() || crea.isPending}
            onClick={() =>
              crea.mutate(
                { nome: nome.trim(), frequenza, ruolo, departmentId: repartoId },
                {
                  onSuccess: () => {
                    show('Mansione creata — parte da domani in Oggi.')
                    setNome('')
                  },
                  onError: () => show('Non creata — riprova.'),
                },
              )
            }
            className={primaryBtnCls}
          >
            <PlusIcon className="h-4 w-4" /> Crea mansione
          </button>
        </div>
      </Card>
    </>
  )
}

/* ── passo 6 · inventario (recap — la cascata è FU-014) ──────────────────── */
function StepInventario() {
  const { inventario } = useInventarioRecap()
  return (
    <Card>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-mute">
            Prodotti vivi
          </span>
          <span className="text-[24px] font-bold tabular-nums">{inventario?.prodotti ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-mute">
            Categorie
          </span>
          <span className="text-[24px] font-bold tabular-nums">{inventario?.categorie ?? '—'}</span>
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Il carico prodotti con la <strong>cascata</strong> (mockup 03) arriva a breve: inquadri,
        scegli, e il prodotto scende in casa con le sue regole. Intanto l'inventario si tiene con
        il giro conteggi in Scorte — questo passo non blocca la chiusura del cantiere.
      </p>
    </Card>
  )
}

/* ── passo 7 · calendario + chiusura cantiere ────────────────────────────── */
function StepCalendario({
  show,
  tuttoFatto,
}: {
  show: (m: string) => void
  tuttoFatto: boolean
}) {
  const navigate = useNavigate()
  const { calendario } = useCalendarioImpostazioni()
  const salva = useSalvaCalendario()
  const completa = useCompletaOnboarding()
  const { azienda } = useAzienda()

  const anno = new Date().getFullYear()
  const [inizio, setInizio] = useState(`${anno}-01-01`)
  const [fine, setFine] = useState(`${anno}-12-31`)
  const [giorni, setGiorni] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    if (calendario && !pronto) {
      setInizio(calendario.annoInizio)
      setFine(calendario.annoFine)
      setGiorni(calendario.giorniApertura)
      setPronto(true)
    }
  }, [calendario, pronto])

  return (
    <>
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <Etichetta>Anno lavorativo — dal</Etichetta>
            <input type="date" value={inizio} onChange={e => setInizio(e.target.value)} className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <Etichetta>al</Etichetta>
            <input type="date" value={fine} onChange={e => setFine(e.target.value)} className={inputCls} />
          </label>
        </div>
        <div className="flex flex-col gap-1.5">
          <Etichetta>Giorni di apertura</Etichetta>
          <div className="flex flex-wrap gap-1.5">
            {GIORNI.map(([num, label]) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  setGiorni(g => (g.includes(num) ? g.filter(x => x !== num) : [...g, num]))
                }
                className={pillCls(giorni.includes(num))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={!inizio || !fine || giorni.length === 0 || salva.isPending}
          onClick={() =>
            salva.mutate(
              { annoInizio: inizio, annoFine: fine, giorni },
              {
                onSuccess: () => show('Calendario impostato.'),
                onError: () => show('Non salvato — riprova.'),
              },
            )
          }
          className={primaryBtnCls}
        >
          Salva calendario
        </button>
      </Card>

      <Card>
        <p className="text-[15px] font-bold tracking-tight">
          {tuttoFatto ? 'L\'azienda è in piedi.' : 'Manca ancora qualche passo.'}
        </p>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          {tuttoFatto
            ? 'Chiudi il cantiere: da qui in poi si lavora — e puoi sempre riaprirlo da Regia per vedere o ritoccare l\'azienda nel suo insieme.'
            : 'Puoi comunque chiudere il cantiere e completare il resto da Regia, oppure torna sui passi con il pallino ancora vuoto.'}
        </p>
        <button
          type="button"
          disabled={completa.isPending || !azienda}
          onClick={() =>
            completa.mutate(undefined, {
              onSuccess: () => navigate('/', { replace: true }),
              onError: () => show('Non chiuso — riprova.'),
            })
          }
          className={primaryBtnCls}
        >
          <CheckIcon className="h-4 w-4" />
          Chiudi il cantiere — si lavora
        </button>
      </Card>
    </>
  )
}

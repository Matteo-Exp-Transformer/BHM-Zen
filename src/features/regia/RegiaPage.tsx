/**
 * Regia (mockup 04) — «il respiro dell'azienda»: ① Imposto · ③ Controllo ·
 * ④ Dimostro. Solo titolare/responsabile (§12.2, route guard in App).
 * Ogni numero è reale (dec. 2); parametri HACCP in SOLA lettura (dec. 6).
 */
import { useState } from 'react'
import { useSession } from '@/lib/auth/session'
import { useToast } from '@/components/ui/Toast'
import { Sheet } from '@/components/ui/Sheet'
import {
  CheckIcon,
  DownloadIcon,
  FileIcon,
  PlusIcon,
  RepartiIcon,
  ThermoIcon,
  UsersIcon,
} from '@/components/icons'
import { formatDayLong } from '@/lib/dates'
import { TEMPERATURE_RULES } from '@/compliance/haccp-rules'
import { ruleRangeLabel } from '@/compliance/point-verdict'
import {
  scaricaDossier,
  tonoRespiro,
  useAggiungiPersona,
  useGeneraDossier,
  useModificaPersona,
  useRepartiRegia,
  useRespiro,
  useStaffRegia,
  type DossierGiorno,
  type PersonaStaff,
} from './hooks'
import { StrutturaSheet } from './StrutturaSheet'

const RESPIRO_UI = {
  ok: {
    orb: 'bg-ok',
    halo: 'bg-ok-bg',
    titolo: 'Tutto in ordine.',
    frase: (d: { lettureOggi: number }) =>
      d.lettureOggi > 0
        ? 'Sei pronto a un controllo: le temperature di oggi sono a posto e il registro è aggiornato.'
        : 'Nessuna lettura ancora oggi — la giornata parte da qui.',
  },
  warn: {
    orb: 'bg-warn',
    halo: 'bg-warn-bg',
    titolo: 'Giornata in corso.',
    frase: (d: { puntiDaControllare: number }) =>
      `${d.puntiDaControllare} ${d.puntiDaControllare === 1 ? 'punto aspetta' : 'punti aspettano'} ancora la temperatura di oggi.`,
  },
  alarm: {
    orb: 'bg-bad',
    halo: 'bg-bad-bg',
    titolo: 'Serve uno sguardo.',
    frase: (d: { lettureAlarm: number }) =>
      `${d.lettureAlarm} ${d.lettureAlarm === 1 ? 'lettura' : 'letture'} fuori norma oggi: controlla il punto e registra l'intervento.`,
  },
} as const

const RUOLI = ['dipendente', 'responsabile', 'admin'] as const
const RUOLO_LABEL: Record<string, string> = {
  admin: 'titolare',
  responsabile: 'responsabile',
  dipendente: 'dipendente',
}

export default function RegiaPage() {
  const { displayName } = useSession()
  const { respiro, isLoading } = useRespiro()
  const { persone } = useStaffRegia()
  const aggiungi = useAggiungiPersona()
  const genera = useGeneraDossier()
  const { toast, show } = useToast()

  const [dossier, setDossier] = useState<DossierGiorno | null>(null)
  const [sheet, setSheet] = useState<'staff' | 'haccp' | 'struttura' | null>(null)
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuovaEmail, setNuovaEmail] = useState('')
  const [nuovoRuolo, setNuovoRuolo] = useState<string>('dipendente')

  // modifica persona (owner 08-07: «da Regia devo poter modificare staff»)
  const modifica = useModificaPersona()
  const { reparti } = useRepartiRegia()
  const [personaSel, setPersonaSel] = useState<PersonaStaff | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRuolo, setEditRuolo] = useState('dipendente')
  const [editReparti, setEditReparti] = useState<string[]>([])
  const [editAttivo, setEditAttivo] = useState(true)

  const apriModifica = (p: PersonaStaff) => {
    setPersonaSel(p)
    setEditNome(p.nome)
    setEditEmail(p.email ?? '')
    setEditRuolo(p.ruolo)
    setEditReparti(reparti.filter(r => p.reparti.includes(r.nome)).map(r => r.id))
    setEditAttivo(true)
  }

  const salvaModifica = () => {
    if (!personaSel || !editNome.trim()) return
    modifica.mutate(
      {
        id: personaSel.id,
        nome: editNome.trim(),
        ruolo: editRuolo,
        email: editEmail.trim() || undefined,
        reparti: editReparti,
        attivo: editAttivo,
      },
      {
        onSuccess: () => {
          show(editAttivo ? 'Persona aggiornata.' : 'Persona disattivata.')
          setPersonaSel(null)
        },
        onError: () => show('Non salvato — riprova.'),
      },
    )
  }

  const tono = respiro ? tonoRespiro(respiro) : 'ok'
  const ui = RESPIRO_UI[tono]

  const generaDossier = () => {
    genera.mutate(undefined, {
      onSuccess: setDossier,
      onError: () => show('Dossier non generato — riprova.'),
    })
  }

  const aggiungiPersona = () => {
    const nome = nuovoNome.trim()
    if (!nome) return
    aggiungi.mutate(
      { nome, ruolo: nuovoRuolo, email: nuovaEmail.trim() || undefined },
      {
        onSuccess: () => {
          setNuovoNome('')
          setNuovaEmail('')
          show(`${nome} è nello staff.`)
        },
        onError: () => show('Non salvato — riprova.'),
      },
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 md:px-7 md:py-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            Regia
          </p>
          <h2 className="text-2xl font-bold tracking-tight md:text-[25px]">
            {displayName ? `Ciao, ${displayName.split(' ')[0]}` : 'Regia'}
          </h2>
          <p className="mt-1 text-[13.5px] text-ink-mute">{formatDayLong()}</p>
        </div>
      </header>

      {/* ③ il respiro: calmo e onesto, mai numeri urlati */}
      {isLoading && (
        <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
          Un attimo — ascolto il respiro dell'azienda…
        </div>
      )}
      {respiro && (
        <>
          <section className="flex items-center gap-5 rounded-card bg-surface p-5 shadow-card">
            <div className="relative grid h-[88px] w-[88px] shrink-0 place-items-center">
              <span
                className={`absolute inset-0 rounded-full ${ui.halo} anim-breathe`}
                aria-hidden="true"
              />
              <span
                className={`relative grid h-12 w-12 place-items-center rounded-full text-white shadow-card ${ui.orb}`}
              >
                <CheckIcon className="h-6 w-6" />
              </span>
            </div>
            <div>
              <h3 className="text-[19px] font-bold tracking-tight">{ui.titolo}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
                {ui.frase(respiro)}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(
              [
                {
                  label: 'Temperature',
                  dot: respiro.lettureAlarm > 0 ? 'bg-bad' : 'bg-ok',
                  num: `${respiro.lettureOggi - respiro.lettureAlarm}/${respiro.lettureOggi}`,
                  sub: respiro.lettureOggi > 0 ? 'in range oggi' : 'nessuna lettura oggi',
                },
                {
                  label: 'Mansioni',
                  dot: 'bg-ok',
                  num: String(respiro.mansioniCompletate),
                  sub: 'completate oggi',
                },
                {
                  label: 'Scadenze',
                  dot: respiro.scadenzeSettimana > 0 ? 'bg-warn' : 'bg-ok',
                  num: String(respiro.scadenzeSettimana),
                  sub: 'entro 7 giorni',
                },
                {
                  label: 'Turni',
                  dot: 'bg-ink-mute',
                  num: String(respiro.turniSigillati),
                  sub: 'sigillati oggi',
                },
              ] as const
            ).map(t => (
              <div key={t.label} className="flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-card">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-mute">
                  <i className={`h-2 w-2 rounded-full ${t.dot}`} aria-hidden="true" />
                  {t.label}
                </span>
                <span className="text-[24px] font-bold tabular-nums tracking-tight">{t.num}</span>
                <span className="text-[12px] text-ink-mute">{t.sub}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ④ Dimostro — il dossier si assembla da solo */}
      <section className="flex flex-col gap-1.5 rounded-card bg-gradient-to-b from-accent-soft to-surface p-5 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Dimostro</p>
        <h3 className="text-[19px] font-bold tracking-tight">Il dossier del controllo</h3>
        <p className="mb-2 max-w-[52ch] text-[13.5px] leading-relaxed text-ink-soft">
          Non lo compili: lo hai già scritto, gesto dopo gesto. Premi e i registri
          di oggi si assemblano da soli.
        </p>
        {!dossier ? (
          <button
            type="button"
            disabled={genera.isPending}
            onClick={generaDossier}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-60"
          >
            <FileIcon className="h-[18px] w-[18px]" />
            {genera.isPending ? 'Ci penso io…' : 'Genera dossier'}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {(
              [
                [`Registro temperature · ${dossier.letture} letture`, dossier.letture],
                [`Mansioni svolte · ${dossier.mansioni}`, dossier.mansioni],
                [`Manutenzioni & controlli · ${dossier.manutenzioni}`, dossier.manutenzioni],
                [`Sigilli di turno · ${dossier.sigilli}`, dossier.sigilli],
              ] as const
            ).map(([label]) => (
              <p key={label} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-soft">
                <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-ok-bg text-ok-ink">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {label}
              </p>
            ))}
            <p className="text-[13px] font-bold text-ok-ink">Pronto. Ce l'hai tutto.</p>
            <button
              type="button"
              onClick={() => {
                scaricaDossier(dossier)
                show('Dossier scaricato.')
              }}
              className="inline-flex items-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975]"
            >
              <DownloadIcon className="h-[18px] w-[18px]" />
              Scarica CSV del giorno
            </button>
          </div>
        )}
      </section>

      {/* ① Imposto */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5 px-0.5 text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-mute">
          <span>Imposta la tua azienda</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setSheet('struttura')}
            className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-card transition-transform active:scale-[0.985]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
              <RepartiIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[14.5px] font-bold">Reparti & punti</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-mute">
                {respiro
                  ? `${respiro.reparti} reparti · ${respiro.punti} punti`
                  : '—'}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSheet('staff')}
            className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-card transition-transform active:scale-[0.985]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
              <UsersIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[14.5px] font-bold">Staff & ruoli</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-mute">
                {respiro ? `${respiro.persone} persone` : '—'}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSheet('haccp')}
            className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-left shadow-card transition-transform active:scale-[0.985]"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]">
              <ThermoIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[14.5px] font-bold">Parametri HACCP</span>
              <span className="mt-0.5 block text-[12.5px] text-ink-mute">
                soglie · sola lettura
              </span>
            </span>
          </button>
        </div>
      </section>

      {/* sheet Staff & ruoli (tap su una persona = modifica, owner 08-07) */}
      <Sheet
        open={sheet === 'staff'}
        onClose={() => {
          setPersonaSel(null)
          setSheet(null)
        }}
        label="Staff e ruoli"
      >
        {personaSel ? (
          <>
            <h3 className="text-lg font-bold tracking-tight">Modifica persona</h3>
            <input
              type="text"
              value={editNome}
              onChange={e => setEditNome(e.target.value)}
              placeholder="Nome e cognome"
              className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]"
            />
            <input
              type="email"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              placeholder="Email (per l'invito, opzionale)"
              className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]"
            />
            <div className="flex gap-1.5">
              {RUOLI.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEditRuolo(r)}
                  className={`flex-1 rounded-full px-2 py-2 text-[12.5px] font-bold transition-all ${
                    editRuolo === r
                      ? 'bg-accent text-accent-ink'
                      : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                  }`}
                >
                  {RUOLO_LABEL[r]}
                </button>
              ))}
            </div>
            {reparti.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {reparti
                  .filter(r => r.attivo || editReparti.includes(r.id))
                  .map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setEditReparti(sel =>
                          sel.includes(r.id) ? sel.filter(id => id !== r.id) : [...sel, r.id],
                        )
                      }
                      className={`rounded-full px-2.5 py-2 text-[12.5px] font-bold transition-all ${
                        editReparti.includes(r.id)
                          ? 'bg-accent text-accent-ink'
                          : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                      }`}
                    >
                      {r.nome}
                    </button>
                  ))}
              </div>
            )}
            <div className="flex gap-1.5">
              {(
                [
                  [true, 'in servizio'],
                  [false, 'non più in staff'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setEditAttivo(val)}
                  className={`flex-1 rounded-full px-2 py-2 text-[12.5px] font-bold transition-all ${
                    editAttivo === val
                      ? 'bg-accent text-accent-ink'
                      : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!editNome.trim() || modifica.isPending}
              onClick={salvaModifica}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-50"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={() => setPersonaSel(null)}
              className="p-1.5 text-sm font-semibold text-ink-mute"
            >
              Indietro
            </button>
          </>
        ) : (
          <>
        <h3 className="text-lg font-bold tracking-tight">Staff & ruoli</h3>
        <div className="flex max-h-[38vh] flex-col gap-2 overflow-y-auto">
          {persone.length === 0 && (
            <p className="text-sm leading-relaxed text-ink-soft">
              Nessuna persona ancora: aggiungi il tuo staff qui sotto.
            </p>
          )}
          {persone.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => apriModifica(p)}
              className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-left transition-transform active:scale-[0.985]"
            >
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-[12px] font-bold text-white"
              >
                {p.nome.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{p.nome}</p>
                <p className="truncate text-[12px] text-ink-mute">
                  {RUOLO_LABEL[p.ruolo] ?? p.ruolo}
                  {p.reparti.length > 0 && ` · ${p.reparti.join(', ')}`}
                  {p.email && ` · ${p.email}`}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-hairline pt-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-mute">
            Aggiungi una persona
          </p>
          <input
            type="text"
            value={nuovoNome}
            onChange={e => setNuovoNome(e.target.value)}
            placeholder="Nome e cognome"
            className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]"
          />
          <input
            type="email"
            value={nuovaEmail}
            onChange={e => setNuovaEmail(e.target.value)}
            placeholder="Email (per l'invito, opzionale)"
            className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]"
          />
          <div className="flex gap-1.5">
            {RUOLI.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setNuovoRuolo(r)}
                className={`flex-1 rounded-full px-2 py-2 text-[12.5px] font-bold transition-all ${
                  nuovoRuolo === r
                    ? 'bg-accent text-accent-ink'
                    : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                }`}
              >
                {RUOLO_LABEL[r]}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!nuovoNome.trim() || aggiungi.isPending}
            onClick={aggiungiPersona}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Aggiungi allo staff
          </button>
          <p className="text-[11.5px] leading-snug text-ink-mute">
            L'accesso all'app (invito con password) arriva con il sistema inviti —
            intanto la persona esiste nei registri e nelle assegnazioni.
          </p>
        </div>
          </>
        )}
      </Sheet>

      {/* sheet Reparti & punti (① Imposto — owner 08-07) */}
      <StrutturaSheet
        open={sheet === 'struttura'}
        onClose={() => setSheet(null)}
        show={show}
      />

      {/* sheet Parametri HACCP — SOLA lettura (dec. 6) */}
      <Sheet open={sheet === 'haccp'} onClose={() => setSheet(null)} label="Parametri HACCP">
        <h3 className="text-lg font-bold tracking-tight">Parametri HACCP</h3>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Le soglie vivono nel codice sotto controllo di qualità (change-control a
          3 livelli): qui le vedi, non si modificano dall'app.
        </p>
        <div className="flex flex-col gap-2">
          {TEMPERATURE_RULES.map(r => (
            <div key={r.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-surface text-ink-soft shadow-card">
                <ThermoIcon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold">{r.label}</p>
                <p className="text-[12px] text-ink-mute">
                  atteso {ruleRangeLabel(r)} · fonte {r.sourceRef}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase ${
                  r.validatedBy === 'pending'
                    ? 'bg-warn-bg text-warn-ink'
                    : 'bg-ok-bg text-ok-ink'
                }`}
              >
                {r.validatedBy === 'pending' ? 'in validazione' : 'validata'}
              </span>
            </div>
          ))}
        </div>
      </Sheet>

      {toast}
    </div>
  )
}

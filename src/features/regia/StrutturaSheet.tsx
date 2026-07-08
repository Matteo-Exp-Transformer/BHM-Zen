/**
 * ① Imposto — «Reparti & punti» (owner 08-07: modifica pdc/reparti da Regia).
 * Il form riusa la LOGICA del legacy (tipo → temperatura proposta, reparto,
 * setpoint) ma ogni numero viene dalla fonte-unica via point-verdict: il
 * suggerimento è derivato dalla regola LOCK, mai hardcoded (RULE HACCP-lock).
 * UI dai mockup (sheet, pill, voce umana) — niente componenti legacy.
 */
import { useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { PlusIcon, RepartiIcon, ThermoIcon } from '@/components/icons'
import {
  formatC,
  POINT_TYPE_LABELS,
  ruleForPointType,
  ruleRangeLabel,
  verdictForPoint,
} from '@/compliance/point-verdict'
import {
  usePuntiRegia,
  useRepartiRegia,
  useSalvaPunto,
  useSalvaReparto,
  type PuntoRegia,
  type RepartoRegia,
} from './hooks'

type Vista =
  | { kind: 'lista' }
  | { kind: 'reparto'; reparto: RepartoRegia | null }
  | { kind: 'punto'; punto: PuntoRegia | null }

const TIPI_PUNTO = Object.keys(POINT_TYPE_LABELS)

/** Setpoint proposto DAL LOCK: centro del range, o il limite se aperto. */
function setpointSuggerito(tipo: string): number | null {
  const rule = ruleForPointType(tipo)
  if (!rule) return null
  if (rule.minC !== null && rule.maxC !== null) return (rule.minC + rule.maxC) / 2
  return rule.maxC ?? rule.minC
}

const inputCls =
  'rounded-xl bg-surface-2 px-3.5 py-2.5 text-[14px] shadow-[inset_0_0_0_1px_var(--hairline)] outline-none placeholder:text-ink-mute focus:shadow-[inset_0_0_0_2px_var(--accent)]'
const primaryBtnCls =
  'mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-50'
const pillCls = (attiva: boolean) =>
  `rounded-full px-2.5 py-2 text-[12.5px] font-bold transition-all ${
    attiva
      ? 'bg-accent text-accent-ink'
      : 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
  }`

export function StrutturaSheet({
  open,
  onClose,
  show,
}: {
  open: boolean
  onClose: () => void
  show: (msg: string) => void
}) {
  const { reparti } = useRepartiRegia()
  const { punti } = usePuntiRegia()
  const salvaReparto = useSalvaReparto()
  const salvaPunto = useSalvaPunto()

  const [vista, setVista] = useState<Vista>({ kind: 'lista' })
  const [nome, setNome] = useState('')
  const [attivo, setAttivo] = useState(true)
  const [tipo, setTipo] = useState('fridge')
  const [setpoint, setSetpoint] = useState('')
  const [repartoId, setRepartoId] = useState<string | null>(null)

  const apriReparto = (reparto: RepartoRegia | null) => {
    setNome(reparto?.nome ?? '')
    setAttivo(reparto?.attivo ?? true)
    setVista({ kind: 'reparto', reparto })
  }

  const apriPunto = (punto: PuntoRegia | null) => {
    const t = punto?.tipo ?? 'fridge'
    setNome(punto?.nome ?? '')
    setTipo(t)
    setSetpoint(String(punto?.setpoint ?? setpointSuggerito(t) ?? ''))
    setRepartoId(punto?.departmentId ?? reparti.find(r => r.attivo)?.id ?? null)
    setVista({ kind: 'punto', punto })
  }

  const cambiaTipo = (t: string) => {
    setTipo(t)
    // come nel form legacy: il tipo propone la temperatura — qui dal LOCK
    const sugg = setpointSuggerito(t)
    setSetpoint(sugg === null ? '' : String(sugg))
  }

  const chiudi = () => {
    setVista({ kind: 'lista' })
    onClose()
  }

  const salva = () => {
    const n = nome.trim()
    if (!n) return
    if (vista.kind === 'reparto') {
      salvaReparto.mutate(
        { id: vista.reparto?.id, nome: n, attivo },
        {
          onSuccess: () => {
            show(vista.reparto ? 'Reparto aggiornato.' : `«${n}» è tra i reparti.`)
            setVista({ kind: 'lista' })
          },
          onError: () => show('Non salvato — riprova.'),
        },
      )
    } else if (vista.kind === 'punto') {
      const sp = Number(setpoint.replace(',', '.'))
      if (setpoint === '' || Number.isNaN(sp)) return
      salvaPunto.mutate(
        { id: vista.punto?.id, nome: n, tipo, setpoint: sp, departmentId: repartoId },
        {
          onSuccess: () => {
            show(vista.punto ? 'Punto aggiornato.' : `«${n}» è sulla piantina.`)
            setVista({ kind: 'lista' })
          },
          onError: () => show('Non salvato — riprova.'),
        },
      )
    }
  }

  const rule = ruleForPointType(tipo)
  const spNum = Number(setpoint.replace(',', '.'))
  const spVerdict =
    setpoint !== '' && !Number.isNaN(spNum) ? verdictForPoint(tipo, spNum) : null

  return (
    <Sheet open={open} onClose={chiudi} label="Reparti e punti di conservazione">
      {vista.kind === 'lista' && (
        <>
          <h3 className="text-lg font-bold tracking-tight">Reparti & punti</h3>
          <div className="flex max-h-[52vh] flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-mute">
                Reparti
              </p>
              {reparti.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => apriReparto(r)}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-left transition-transform active:scale-[0.985]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-surface text-ink-soft shadow-card">
                    <RepartiIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{r.nome}</span>
                  </span>
                  {!r.attivo && (
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10.5px] font-bold uppercase text-ink-mute">
                      spento
                    </span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => apriReparto(null)}
                className="inline-flex items-center gap-2 self-start px-1 py-1 text-[13.5px] font-bold text-accent"
              >
                <PlusIcon className="h-4 w-4" /> Nuovo reparto
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-hairline pt-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-mute">
                Punti di conservazione
              </p>
              {punti.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => apriPunto(p)}
                  className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-left transition-transform active:scale-[0.985]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-surface text-ink-soft shadow-card">
                    <ThermoIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{p.nome}</span>
                    <span className="block truncate text-[12px] text-ink-mute">
                      {POINT_TYPE_LABELS[p.tipo] ?? p.tipo}
                      {p.departmentName && ` · ${p.departmentName}`}
                      {` · set ${formatC(p.setpoint)} °C`}
                    </span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => apriPunto(null)}
                className="inline-flex items-center gap-2 self-start px-1 py-1 text-[13.5px] font-bold text-accent"
              >
                <PlusIcon className="h-4 w-4" /> Nuovo punto
              </button>
            </div>
          </div>
        </>
      )}

      {vista.kind === 'reparto' && (
        <>
          <h3 className="text-lg font-bold tracking-tight">
            {vista.reparto ? 'Modifica reparto' : 'Nuovo reparto'}
          </h3>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome del reparto (es. Cucina, Sala, Bar)"
            className={inputCls}
          />
          {vista.reparto && (
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setAttivo(true)} className={pillCls(attivo)}>
                attivo
              </button>
              <button type="button" onClick={() => setAttivo(false)} className={pillCls(!attivo)}>
                spento
              </button>
            </div>
          )}
          <button
            type="button"
            disabled={!nome.trim() || salvaReparto.isPending}
            onClick={salva}
            className={primaryBtnCls}
          >
            Salva
          </button>
          <button
            type="button"
            onClick={() => setVista({ kind: 'lista' })}
            className="p-1.5 text-sm font-semibold text-ink-mute"
          >
            Indietro
          </button>
        </>
      )}

      {vista.kind === 'punto' && (
        <>
          <h3 className="text-lg font-bold tracking-tight">
            {vista.punto ? 'Modifica punto' : 'Nuovo punto di conservazione'}
          </h3>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome del punto (es. Frigo 1)"
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-1.5">
            {TIPI_PUNTO.map(t => (
              <button key={t} type="button" onClick={() => cambiaTipo(t)} className={pillCls(tipo === t)}>
                {POINT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reparti
              .filter(r => r.attivo || r.id === repartoId)
              .map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRepartoId(r.id)}
                  className={pillCls(repartoId === r.id)}
                >
                  {r.nome}
                </button>
              ))}
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={setpoint}
            onChange={e => setSetpoint(e.target.value)}
            placeholder="Temperatura di esercizio °C"
            aria-label="Temperatura di esercizio in gradi"
            className={inputCls}
          />
          <p
            className={`min-h-[18px] text-[12.5px] ${
              spVerdict === 'alarm'
                ? 'text-bad-ink'
                : spVerdict === 'warn'
                  ? 'text-warn-ink'
                  : 'text-ink-mute'
            }`}
            aria-live="polite"
          >
            {rule
              ? spVerdict === 'alarm'
                ? `Fuori dal range HACCP (atteso ${ruleRangeLabel(rule)}) — sicuro?`
                : `atteso ${ruleRangeLabel(rule)}`
              : 'nessuna soglia HACCP per questo tipo — imposta tu la temperatura'}
          </p>
          <button
            type="button"
            disabled={
              !nome.trim() ||
              setpoint === '' ||
              Number.isNaN(Number(setpoint.replace(',', '.'))) ||
              salvaPunto.isPending
            }
            onClick={salva}
            className={primaryBtnCls}
          >
            Salva
          </button>
          <button
            type="button"
            onClick={() => setVista({ kind: 'lista' })}
            className="p-1.5 text-sm font-semibold text-ink-mute"
          >
            Indietro
          </button>
        </>
      )}
    </Sheet>
  )
}

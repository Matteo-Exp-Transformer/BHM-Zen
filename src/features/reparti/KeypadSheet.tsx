import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { ThermoIcon } from '@/components/icons'
import {
  ruleRangeLabel,
  VERDICT_WORDS,
  verdictForPoint,
} from '@/compliance/point-verdict'
import type { TemperatureVerdict } from '@/compliance/haccp-rules'
import { useRegistraTemperatura, type PuntoOggi } from './hooks'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'sign', '0', 'del'] as const

const DISPLAY_TONES: Record<TemperatureVerdict, { box: string; num: string }> = {
  ok: { box: 'bg-ok-bg', num: 'text-ok-ink' },
  warn: { box: 'bg-warn-bg', num: 'text-warn-ink' },
  alarm: { box: 'bg-bad-bg', num: 'text-bad-ink' },
}

const WHISPER_TONES: Record<TemperatureVerdict, string> = {
  ok: 'text-ok-ink',
  warn: 'text-warn-ink',
  alarm: 'text-bad-ink',
}

export interface EsitoLettura {
  valueC: number
  verdict: TemperatureVerdict | null
}

/**
 * 🌡️ Tastierone da guanti (mockup 01/02): il numero ATTERRA col colore-verdetto,
 * il sussurro HACCP dice il range atteso e si dissolve. Ritmo §13.6: il verdetto
 * resta in scena ~1s prima che il foglio si chiuda — il premio è nel feedback.
 */
export function KeypadSheet({
  punto,
  open,
  onClose,
  onSaved,
}: {
  punto: PuntoOggi | null
  open: boolean
  onClose: () => void
  onSaved: (esito: EsitoLettura) => void
}) {
  const [buf, setBuf] = useState('')
  const [neg, setNeg] = useState(false)
  const [landing, setLanding] = useState<TemperatureVerdict | 'saving' | null>(null)
  const [errore, setErrore] = useState<string | null>(null)
  const registra = useRegistraTemperatura()

  useEffect(() => {
    if (open) {
      setBuf('')
      setNeg(false)
      setLanding(null)
      setErrore(null)
    }
  }, [open, punto?.id])

  if (!punto) return null

  const whisperDefault = punto.rule
    ? `atteso ${ruleRangeLabel(punto.rule)}`
    : 'nessuna soglia HACCP per questo punto — la lettura resta nel registro'

  const press = (k: (typeof KEYS)[number]) => {
    if (landing) return
    setErrore(null)
    if (k === 'del') {
      setBuf(b => {
        const next = b.slice(0, -1)
        if (next === '') setNeg(false)
        return next
      })
    } else if (k === 'sign') {
      setNeg(n => !n)
    } else if (buf.length < 3) {
      setBuf(b => b + k)
    }
  }

  const conferma = async () => {
    if (landing || buf === '') return
    const valueC = Number((neg ? '-' : '') + buf)
    const verdict = verdictForPoint(punto.type, valueC)
    setLanding(verdict ?? 'saving')
    try {
      await Promise.all([
        registra.mutateAsync({ punto, valueC }),
        new Promise(r => setTimeout(r, 950)),
      ])
      onSaved({ valueC, verdict })
      onClose()
    } catch {
      setLanding(null)
      setErrore('Non registrata — riprova, il registro non ha ricevuto la lettura.')
    }
  }

  const shown = (neg ? '−' : '') + buf
  const verdictTone = landing && landing !== 'saving' ? DISPLAY_TONES[landing] : null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      label={`Registra temperatura ${punto.name}`}
      layout="stretto"
    >
      <p className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-mute">
        <ThermoIcon className="h-[15px] w-[15px]" />
        {punto.departmentName ? `${punto.departmentName} · ` : ''}
        {punto.name}
      </p>

      <div
        key={landing ? 'land' : 'input'}
        className={`rounded-2xl py-2 pb-1 text-center transition-colors duration-500 ${
          verdictTone?.box ?? ''
        } ${landing ? 'anim-land' : ''}`}
      >
        <span
          className={`inline-flex items-baseline gap-1 text-[56px] font-bold leading-none tracking-tight tabular-nums ${
            verdictTone?.num ?? (shown ? 'text-ink' : 'text-ink-mute opacity-45')
          }`}
        >
          {shown === '' ? '—' : shown}
          <span className="text-[25px] font-semibold text-ink-mute">°C</span>
        </span>
      </div>

      <p
        className={`min-h-[18px] text-center text-[13px] ${
          errore
            ? 'text-bad-ink'
            : landing && landing !== 'saving'
              ? WHISPER_TONES[landing]
              : 'text-ink-mute'
        }`}
        aria-live="polite"
      >
        {errore ??
          (landing && landing !== 'saving'
            ? VERDICT_WORDS[landing].whisper
            : landing === 'saving'
              ? 'Registrata.'
              : whisperDefault)}
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {KEYS.map(k => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            aria-label={k === 'del' ? 'Cancella' : k === 'sign' ? 'Cambia segno' : k}
            className={`rounded-[15px] bg-surface-2 py-[15px] font-semibold tabular-nums shadow-[inset_0_0_0_1px_var(--hairline)] transition-transform active:scale-95 ${
              k === 'sign' || k === 'del' ? 'text-[19px] text-ink-mute' : 'text-[23px] text-ink'
            }`}
          >
            {k === 'sign' ? '±' : k === 'del' ? '⌫' : k}
          </button>
        ))}
      </div>

      <div className="mt-0.5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void conferma()}
          disabled={!!landing}
          className="flex w-full items-center justify-center rounded-[13px] bg-accent px-4 py-3.5 text-[15.5px] font-semibold text-accent-ink shadow-card transition-transform active:scale-[0.975] disabled:opacity-70"
        >
          Conferma
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-sm font-semibold text-ink-mute"
        >
          Annulla
        </button>
      </div>
    </Sheet>
  )
}

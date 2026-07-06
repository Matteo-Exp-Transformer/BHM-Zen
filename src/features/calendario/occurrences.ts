/**
 * Calendario (dec. 13) — espansione PURA delle ricorrenze in occorrenze.
 * Specchia `calculate_next_due_date` del DB (daily/weekly/monthly/annually)
 * per le proiezioni delle manutenzioni; per le mansioni la verità resta
 * «un completamento valido copre il periodo» (periodForFrequency, come Oggi).
 * Nessuna soglia HACCP qui (LOCK §14.3) — solo aritmetica di date locali.
 */
import { startOfDayLocal } from '@/lib/dates'

/** Frequenze proiettabili (le stesse del trigger DB). */
const FREQUENZE_NOTE = new Set(['daily', 'weekly', 'monthly', 'annually', 'annual'])

/** Giorni di apertura di default: lun–sab (fallback legacy `[1..6]`, 0=domenica). */
export const OPEN_WEEKDAYS_DEFAULT = [1, 2, 3, 4, 5, 6]

/** Passo di ricorrenza — specchio client di `calculate_next_due_date`. */
export function addFrequency(d: Date, frequency: string): Date {
  const out = new Date(d)
  switch (frequency) {
    case 'weekly':
      out.setDate(out.getDate() + 7)
      break
    case 'monthly':
      out.setMonth(out.getMonth() + 1)
      break
    case 'annually':
    case 'annual':
      out.setFullYear(out.getFullYear() + 1)
      break
    default: // daily + frequenze non riconosciute (come il DB)
      out.setDate(out.getDate() + 1)
  }
  return out
}

const GUARDIA_ITERAZIONI = 800

/**
 * Occorrenze di una MANSIONE nel range [rangeStart, rangeEnd] (inclusivo).
 * Ancora = next_due. Frequenze non proiettabili (custom, as_needed, …):
 * solo l'ancora stessa, se cade nel range — niente proiezioni inventate.
 * Le occorrenze giornaliere nei giorni di chiusura non compaiono
 * (il giorno dopo ha già la sua).
 */
export function expandMansione(
  anchor: Date,
  frequency: string,
  rangeStart: Date,
  rangeEnd: Date,
  openWeekdays: number[] = OPEN_WEEKDAYS_DEFAULT,
): Date[] {
  let d = startOfDayLocal(anchor)
  if (!FREQUENZE_NOTE.has(frequency)) {
    return d >= rangeStart && d <= rangeEnd ? [d] : []
  }
  const occs: Date[] = []
  let guardia = 0
  while (d < rangeStart && guardia++ < GUARDIA_ITERAZIONI) d = addFrequency(d, frequency)
  while (d <= rangeEnd && guardia++ < GUARDIA_ITERAZIONI) {
    if (frequency !== 'daily' || openWeekdays.includes(d.getDay())) {
      occs.push(d)
    }
    d = addFrequency(d, frequency)
  }
  return occs
}

export interface OccorrenzaManutenzione {
  date: Date
  /** true = derivata dalla frequenza (informativa); false = next_due reale (completabile) */
  proiezione: boolean
}

/**
 * Occorrenze di una MANUTENZIONE nel range. La prima è la scadenza REALE
 * (`next_due`, unica completabile: il trigger DB ricalcola da lì); se è
 * arretrata viene mostrata su `oggi`. Le successive sono proiezioni.
 */
export function expandManutenzione(
  anchor: Date,
  frequency: string,
  rangeStart: Date,
  rangeEnd: Date,
  oggi: Date,
): OccorrenzaManutenzione[] {
  const inizioOggi = startOfDayLocal(oggi)
  let reale = startOfDayLocal(anchor)
  if (reale < inizioOggi) reale = inizioOggi // arretrata → visibile oggi

  const occs: OccorrenzaManutenzione[] = []
  if (reale >= rangeStart && reale <= rangeEnd) {
    occs.push({ date: reale, proiezione: false })
  }
  if (!FREQUENZE_NOTE.has(frequency)) return occs

  let d = addFrequency(reale, frequency)
  let guardia = 0
  while (d < rangeStart && guardia++ < GUARDIA_ITERAZIONI) d = addFrequency(d, frequency)
  while (d <= rangeEnd && guardia++ < GUARDIA_ITERAZIONI) {
    occs.push({ date: d, proiezione: true })
    d = addFrequency(d, frequency)
  }
  return occs
}

/**
 * Un'occorrenza è già coperta se un completamento VALIDO (non storno, non
 * stornato) copre il suo giorno — stessa semantica del filtro di Oggi.
 */
export function copertaDaCompletamento(
  occDate: Date,
  periodi: { periodStart: string; periodEnd: string }[],
): boolean {
  const t = occDate.getTime()
  return periodi.some(
    p => new Date(p.periodStart).getTime() <= t && t <= new Date(p.periodEnd).getTime(),
  )
}

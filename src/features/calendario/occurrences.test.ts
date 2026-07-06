import { describe, expect, it } from 'vitest'
import {
  addFrequency,
  copertaDaCompletamento,
  expandMansione,
  expandManutenzione,
} from './occurrences'

const d = (iso: string) => new Date(`${iso}T00:00:00`)

describe('addFrequency — specchio di calculate_next_due_date', () => {
  it('daily aggiunge un giorno', () => {
    expect(addFrequency(d('2026-07-06'), 'daily').getDate()).toBe(7)
  })
  it('weekly aggiunge sette giorni', () => {
    expect(addFrequency(d('2026-07-06'), 'weekly').getDate()).toBe(13)
  })
  it('monthly aggiunge un mese', () => {
    expect(addFrequency(d('2026-07-06'), 'monthly').getMonth()).toBe(7)
  })
  it('annually aggiunge un anno', () => {
    expect(addFrequency(d('2026-07-06'), 'annually').getFullYear()).toBe(2027)
  })
  it('frequenza ignota → +1 giorno (come il default del DB)', () => {
    expect(addFrequency(d('2026-07-06'), 'boh').getDate()).toBe(7)
  })
})

describe('expandMansione', () => {
  const start = d('2026-07-06') // lunedì
  const end = new Date(2026, 6, 12, 23, 59, 59) // domenica

  it('daily: una per giorno di apertura (domenica chiusa col default)', () => {
    const occs = expandMansione(d('2026-07-06'), 'daily', start, end)
    expect(occs).toHaveLength(6) // lun–sab, la domenica non compare
    expect(occs[0]!.getDate()).toBe(6)
    expect(occs[5]!.getDate()).toBe(11)
  })

  it('weekly: una sola nel range di 7 giorni, anche da ancora arretrata', () => {
    const occs = expandMansione(d('2026-06-01'), 'weekly', start, end)
    expect(occs).toHaveLength(1)
    // 2026-06-01 + n·7 giorni → lunedì: la prima nel range è il 6 luglio
    expect(occs[0]!.getDate()).toBe(6)
  })

  it('frequenza non proiettabile: solo l’ancora, se nel range', () => {
    expect(expandMansione(d('2026-07-08'), 'as_needed', start, end)).toHaveLength(1)
    expect(expandMansione(d('2026-08-01'), 'as_needed', start, end)).toHaveLength(0)
  })

  it('ancora oltre il range: nessuna occorrenza', () => {
    expect(expandMansione(d('2026-09-01'), 'daily', start, end)).toHaveLength(0)
  })
})

describe('expandManutenzione', () => {
  const oggi = d('2026-07-06')
  const start = d('2026-07-01')
  const end = new Date(2026, 6, 31, 23, 59, 59)

  it('la prima è la scadenza reale, le successive proiezioni', () => {
    const occs = expandManutenzione(d('2026-07-10'), 'weekly', start, end, oggi)
    expect(occs[0]).toMatchObject({ proiezione: false })
    expect(occs[0]!.date.getDate()).toBe(10)
    expect(occs.slice(1).every(o => o.proiezione)).toBe(true)
    expect(occs[1]!.date.getDate()).toBe(17)
  })

  it('arretrata: la scadenza reale si mostra oggi', () => {
    const occs = expandManutenzione(d('2025-10-25'), 'monthly', start, end, oggi)
    expect(occs[0]!.date.getDate()).toBe(6)
    expect(occs[0]!.proiezione).toBe(false)
  })

  it('frequenza ignota: solo la scadenza reale, zero proiezioni', () => {
    const occs = expandManutenzione(d('2026-07-10'), 'custom', start, end, oggi)
    expect(occs).toHaveLength(1)
  })
})

describe('copertaDaCompletamento', () => {
  const periodi = [
    { periodStart: '2026-07-06T00:00:00', periodEnd: '2026-07-12T23:59:59' },
  ]
  it('dentro il periodo → coperta', () => {
    expect(copertaDaCompletamento(d('2026-07-09'), periodi)).toBe(true)
  })
  it('fuori dal periodo → scoperta', () => {
    expect(copertaDaCompletamento(d('2026-07-13'), periodi)).toBe(false)
  })
})

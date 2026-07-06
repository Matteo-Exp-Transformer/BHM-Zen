import { describe, expect, it } from 'vitest'
import {
  endOfDayLocal,
  localDateKey,
  periodForFrequency,
  startOfDayLocal,
} from './dates'

describe('localDateKey — RULE timezone (mai toISOString per date locali)', () => {
  it('usa il giorno locale, non quello UTC', () => {
    // 00:30 locale: in UTC potrebbe essere ancora "ieri" — la chiave resta locale
    const d = new Date(2026, 6, 5, 0, 30)
    expect(localDateKey(d)).toBe('2026-07-05')
    expect(localDateKey(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01')
  })
})

describe('startOfDayLocal / endOfDayLocal', () => {
  it('delimitano il giorno locale', () => {
    const d = new Date(2026, 6, 5, 14, 22, 8)
    expect(startOfDayLocal(d).getHours()).toBe(0)
    expect(endOfDayLocal(d).getHours()).toBe(23)
    expect(localDateKey(startOfDayLocal(d))).toBe('2026-07-05')
    expect(localDateKey(endOfDayLocal(d))).toBe('2026-07-05')
  })
})

describe('periodForFrequency — il completamento copre il SUO periodo (♻️ legacy)', () => {
  it('daily: il giorno di riferimento', () => {
    const p = periodForFrequency('daily', new Date(2026, 6, 5, 15, 0))
    expect(localDateKey(p.start)).toBe('2026-07-05')
    expect(localDateKey(p.end)).toBe('2026-07-05')
  })

  it('weekly: lunedì–domenica della settimana di riferimento', () => {
    // 2026-07-05 è una domenica → settimana 29 giu – 5 lug
    const p = periodForFrequency('weekly', new Date(2026, 6, 5, 12, 0))
    expect(localDateKey(p.start)).toBe('2026-06-29')
    expect(localDateKey(p.end)).toBe('2026-07-05')
    // un lunedì resta ancorato alla sua settimana
    const p2 = periodForFrequency('weekly', new Date(2026, 6, 6, 8, 0))
    expect(localDateKey(p2.start)).toBe('2026-07-06')
    expect(localDateKey(p2.end)).toBe('2026-07-12')
  })

  it('monthly: primo–ultimo giorno del mese', () => {
    const p = periodForFrequency('monthly', new Date(2026, 1, 10))
    expect(localDateKey(p.start)).toBe('2026-02-01')
    expect(localDateKey(p.end)).toBe('2026-02-28')
  })

  it('annually e alias annual: anno solare', () => {
    for (const f of ['annually', 'annual']) {
      const p = periodForFrequency(f, new Date(2026, 6, 5))
      expect(localDateKey(p.start)).toBe('2026-01-01')
      expect(localDateKey(p.end)).toBe('2026-12-31')
    }
  })

  it('frequenze sconosciute: prudenza = un giorno', () => {
    const p = periodForFrequency('as_needed', new Date(2026, 6, 5))
    expect(localDateKey(p.start)).toBe('2026-07-05')
    expect(localDateKey(p.end)).toBe('2026-07-05')
  })
})

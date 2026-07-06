/**
 * GATE-2 «blindatura macchina» (masterplan §14.3) — MAI saltare.
 * Se questo test fallisce, la modifica a haccp-rules.ts NON entra.
 */
import { describe, expect, it } from 'vitest'
import {
  RETENTION_RULES,
  TEMPERATURE_RULES,
  computeTemperatureVerdict,
  validateHaccpRules,
  type TemperatureRule,
} from './haccp-rules'

describe('gate-2: struttura fonte-regole', () => {
  it('il file corrente è valido (zero errori strutturali)', () => {
    expect(validateHaccpRules()).toEqual([])
  })

  it('esiste almeno una regola di temperatura', () => {
    expect(TEMPERATURE_RULES.length).toBeGreaterThan(0)
  })

  it('gli id sono unici tra TUTTE le collezioni', () => {
    const ids = [...TEMPERATURE_RULES, ...RETENTION_RULES].map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ogni regola porta la sua identità completa (§14.3)', () => {
    for (const r of TEMPERATURE_RULES) {
      expect(r.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(r.version).toBeGreaterThanOrEqual(1)
      expect(Date.parse(r.effectiveFrom)).not.toBeNaN()
      expect(r.sourceRef.length).toBeGreaterThan(0)
      expect(r.validatedBy).toMatch(/^(pending|owner|professionista:.+)$/)
    }
  })
})

describe('gate-2: il validatore respinge regole malformate', () => {
  const base: TemperatureRule = {
    id: 'regola-di-prova',
    version: 1,
    effectiveFrom: '2026-07-06',
    category: 'test',
    label: 'Prova',
    minC: 0,
    maxC: 4,
    sourceRef: 'dpr-327-1980',
    validatedBy: 'pending',
  }

  it('respinge id duplicati', () => {
    const errors = validateHaccpRules([base, { ...base }], [])
    expect(errors.some(e => e.problem === 'id duplicato')).toBe(true)
  })

  it('respinge soglie implausibili', () => {
    const errors = validateHaccpRules([{ ...base, maxC: 500 }], [])
    expect(errors.some(e => e.problem.includes('range plausibile'))).toBe(true)
  })

  it('respinge min >= max', () => {
    const errors = validateHaccpRules([{ ...base, minC: 5, maxC: 4 }], [])
    expect(errors.some(e => e.problem === 'minC deve essere < maxC')).toBe(true)
  })

  it('respinge regole senza alcuna soglia', () => {
    const errors = validateHaccpRules([{ ...base, minC: null, maxC: null }], [])
    expect(errors.some(e => e.problem.includes('almeno una soglia'))).toBe(true)
  })

  it('respinge sourceRef assente', () => {
    const errors = validateHaccpRules([{ ...base, sourceRef: '' }], [])
    expect(errors.some(e => e.problem.includes('sourceRef'))).toBe(true)
  })

  it('respinge validatedBy non ammesso', () => {
    const errors = validateHaccpRules(
      [{ ...base, validatedBy: 'boh' as TemperatureRule['validatedBy'] }],
      [],
    )
    expect(errors.some(e => e.problem.includes('validatedBy'))).toBe(true)
  })
})

describe('il colore È il verdetto (§13.5)', () => {
  const frigo = { minC: 0, maxC: 4 }

  it('dentro il range, lontano dai bordi → verde', () => {
    expect(computeTemperatureVerdict(frigo, 2)).toBe('ok')
  })

  it('vicino al bordo (margine 1°C) → ambra', () => {
    expect(computeTemperatureVerdict(frigo, 3.5)).toBe('warn')
    expect(computeTemperatureVerdict(frigo, 0.5)).toBe('warn')
  })

  it('fuori range → rosso', () => {
    expect(computeTemperatureVerdict(frigo, 5)).toBe('alarm')
    expect(computeTemperatureVerdict(frigo, -1)).toBe('alarm')
  })

  it('range aperto (solo max, es. surgelati ≤ -18) funziona', () => {
    const freezer = { minC: null, maxC: -18 }
    expect(computeTemperatureVerdict(freezer, -25)).toBe('ok')
    expect(computeTemperatureVerdict(freezer, -18.5)).toBe('warn')
    expect(computeTemperatureVerdict(freezer, -17)).toBe('alarm')
  })
})

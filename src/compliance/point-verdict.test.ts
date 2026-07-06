import { describe, expect, it } from 'vitest'
import {
  formatC,
  POINT_TYPE_LABELS,
  ruleForPointType,
  ruleRangeLabel,
  verdictForPoint,
} from './point-verdict'

/**
 * Il ponte punto→regola legge SOLO dalla fonte-unica (LOCK §14.3).
 * I numeri qui sotto NON sono soglie nuove: sono il comportamento atteso
 * delle regole seed già blindate da haccp-rules.test.ts (gate-2).
 */
describe('ruleForPointType', () => {
  it('collega frigo e freezer alle regole della fonte-unica', () => {
    expect(ruleForPointType('fridge')?.id).toBe('frigo-carni-fresche')
    expect(ruleForPointType('freezer')?.id).toBe('congelatore-surgelati')
  })

  it('abbattitore e ambiente non hanno regola temperatura (come nel legacy)', () => {
    expect(ruleForPointType('blast')).toBeNull()
    expect(ruleForPointType('ambient')).toBeNull()
    expect(ruleForPointType('sconosciuto')).toBeNull()
  })
})

describe('verdictForPoint — il colore È il verdetto (§13.5)', () => {
  it('frigo: dentro il range = ok, vicino al bordo = warn, fuori = alarm', () => {
    expect(verdictForPoint('fridge', 2)).toBe('ok')
    expect(verdictForPoint('fridge', 3.5)).toBe('warn') // warn PRIMA di sforare
    expect(verdictForPoint('fridge', 0.5)).toBe('warn')
    expect(verdictForPoint('fridge', 5)).toBe('alarm')
    expect(verdictForPoint('fridge', -0.5)).toBe('alarm')
  })

  it('freezer: solo soglia massima', () => {
    expect(verdictForPoint('freezer', -20)).toBe('ok')
    expect(verdictForPoint('freezer', -18.5)).toBe('warn')
    expect(verdictForPoint('freezer', -17)).toBe('alarm')
  })

  it('punti senza regola: nessun verdetto', () => {
    expect(verdictForPoint('blast', 3)).toBeNull()
    expect(verdictForPoint('ambient', 20)).toBeNull()
  })
})

describe('etichette umane', () => {
  it('ruleRangeLabel formatta il range dalla regola', () => {
    expect(ruleRangeLabel(ruleForPointType('fridge')!)).toBe('0–4 °C')
    expect(ruleRangeLabel(ruleForPointType('freezer')!)).toBe('≤ −18 °C')
  })

  it('formatC usa virgola decimale e meno tipografico', () => {
    expect(formatC(2)).toBe('2')
    expect(formatC(3.55)).toBe('3,6')
    expect(formatC(-18)).toBe('−18')
  })

  it('ogni tipo di punto dello schema ha la sua etichetta', () => {
    for (const t of ['fridge', 'freezer', 'blast', 'ambient']) {
      expect(POINT_TYPE_LABELS[t]).toBeTruthy()
    }
  })
})

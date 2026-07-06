import { describe, expect, it } from 'vitest'
import {
  esaurito,
  labelScadenza,
  sottoScorta,
  statoScadenza,
  suggerimentiSpesa,
} from './stock'

const oggi = new Date(2026, 6, 6) // 6 luglio 2026

describe('statoScadenza', () => {
  it('null senza scadenza', () => {
    expect(statoScadenza(null, oggi)).toBeNull()
  })
  it('scaduto se prima di oggi', () => {
    expect(statoScadenza('2026-07-05', oggi)).toBe('scaduto')
  })
  it('a breve entro la finestra (oggi incluso)', () => {
    expect(statoScadenza('2026-07-06', oggi)).toBe('a_breve')
    expect(statoScadenza('2026-07-09', oggi)).toBe('a_breve')
  })
  it('ok oltre la finestra', () => {
    expect(statoScadenza('2026-07-10', oggi)).toBe('ok')
  })
})

describe('sottoScorta / esaurito', () => {
  it('sotto scorta quando ho meno del par', () => {
    expect(sottoScorta(2, 6)).toBe(true)
    expect(sottoScorta(6, 6)).toBe(false)
  })
  it('senza par non è mai sotto scorta', () => {
    expect(sottoScorta(0, null)).toBe(false)
    expect(sottoScorta(0, 0)).toBe(false)
  })
  it('esaurito a zero', () => {
    expect(esaurito(0)).toBe(true)
    expect(esaurito(1)).toBe(false)
  })
})

describe('suggerimentiSpesa', () => {
  const prodotti = [
    { id: 'a', nome: 'Latte', categoria: 'Latticini', quantita: 2, parLevel: 6, unit: 'pz' },
    { id: 'b', nome: 'Burro', categoria: 'Latticini', quantita: 3, parLevel: 3, unit: 'pz' },
    { id: 'c', nome: 'Basilico', categoria: 'Fresco', quantita: 0, parLevel: 2, unit: null },
    { id: 'd', nome: 'Sale', categoria: 'Dispensa', quantita: 1, parLevel: null, unit: 'kg' },
  ]
  it('solo i sotto-scorta, con quantità = par − rimanenza', () => {
    const sugg = suggerimentiSpesa(prodotti)
    expect(sugg.map(s => s.productId)).toEqual(['a', 'c'])
    expect(sugg[0]!.quantita).toBe(4)
    expect(sugg[1]!.quantita).toBe(2)
  })
})

describe('labelScadenza', () => {
  it('formato giorno/mese', () => {
    expect(labelScadenza('2026-07-12')).toBe('12/07')
  })
  it('null se assente o malformata', () => {
    expect(labelScadenza(null)).toBeNull()
    expect(labelScadenza('boh')).toBeNull()
  })
})

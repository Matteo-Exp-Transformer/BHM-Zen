/**
 * Scorte (dec. 12) — logica PURA dell'inventario: sotto-scorta, stato
 * scadenza, suggerimenti spesa. Nessuna soglia HACCP qui (LOCK §14.3):
 * la finestra «a breve» è UX di magazzino, non una regola normativa.
 */
import { startOfDayLocal } from '@/lib/dates'

/** Giorni entro cui una scadenza «emerge» come a breve (UX, non HACCP). */
export const SCADENZA_A_BREVE_GIORNI = 3

export type StatoScadenza = 'ok' | 'a_breve' | 'scaduto'

/** Stato della scadenza mostrata (= ultima unità disponibile, dec. 12.3). */
export function statoScadenza(
  expiryDate: string | null,
  oggi: Date = new Date(),
): StatoScadenza | null {
  if (!expiryDate) return null
  const [y, m, g] = expiryDate.slice(0, 10).split('-').map(Number)
  if (!y || !m || !g) return null
  const exp = new Date(y, m - 1, g)
  const diffGiorni = Math.round(
    (exp.getTime() - startOfDayLocal(oggi).getTime()) / 86_400_000,
  )
  if (diffGiorni < 0) return 'scaduto'
  if (diffGiorni <= SCADENZA_A_BREVE_GIORNI) return 'a_breve'
  return 'ok'
}

/** «dovrei avere N (par), ho M» → sotto scorta quando M < N (dec. 12.2). */
export function sottoScorta(have: number, par: number | null): boolean {
  return par !== null && par > 0 && have < par
}

export function esaurito(have: number): boolean {
  return have <= 0
}

export interface ProdottoScorta {
  id: string
  nome: string
  categoria: string
  quantita: number
  parLevel: number | null
  unit: string | null
}

export interface SuggerimentoSpesa {
  productId: string
  nome: string
  categoria: string
  quantita: number
  unit: string | null
}

/**
 * La spesa nasce dai sotto-scorta: quantità suggerita = par − rimanenza
 * (dec. 12.4 — proposta, mai obbligo: la lista resta libera).
 */
export function suggerimentiSpesa(prodotti: ProdottoScorta[]): SuggerimentoSpesa[] {
  return prodotti
    .filter(p => sottoScorta(p.quantita, p.parLevel))
    .map(p => ({
      productId: p.id,
      nome: p.nome,
      categoria: p.categoria,
      quantita: Math.max(1, (p.parLevel ?? 1) - p.quantita),
      unit: p.unit,
    }))
}

/** «fino al 12/07» — etichetta breve della scadenza (data locale, RULE tz). */
export function labelScadenza(expiryDate: string | null): string | null {
  if (!expiryDate) return null
  const [y, m, g] = expiryDate.slice(0, 10).split('-').map(Number)
  if (!y || !m || !g) return null
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit' }).format(
    new Date(y, m - 1, g),
  )
}

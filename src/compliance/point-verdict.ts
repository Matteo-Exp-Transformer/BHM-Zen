/**
 * Ponte tra i punti di conservazione (schema DB) e la fonte-unica HACCP.
 * QUI non vive NESSUN numero (LOCK §14.3): solo il collegamento
 * tipo-punto → rule-id e le parole del verdetto (voce umana §13.5).
 *
 * Beta: la regola si sceglie per TIPO di punto (fridge/freezer). Quando il
 * track compliance (FU-005) estende le categorie, il collegamento passerà
 * al profilo/categoria del punto senza toccare i componenti.
 */
import {
  computeTemperatureVerdict,
  getTemperatureRuleById,
  type TemperatureRule,
  type TemperatureVerdict,
} from './haccp-rules'

export type { TemperatureRule, TemperatureVerdict } from './haccp-rules'

/** blast/ambient: nessun controllo temperatura di norma (come nel legacy). */
const RULE_ID_BY_POINT_TYPE: Record<string, string> = {
  fridge: 'frigo-carni-fresche',
  freezer: 'congelatore-surgelati',
}

export function ruleForPointType(pointType: string): TemperatureRule | null {
  const id = RULE_ID_BY_POINT_TYPE[pointType]
  return id ? (getTemperatureRuleById(id) ?? null) : null
}

/** Verdetto per un punto; null = punto senza regola temperatura (blast/ambient). */
export function verdictForPoint(
  pointType: string,
  valueC: number,
): TemperatureVerdict | null {
  const rule = ruleForPointType(pointType)
  return rule ? computeTemperatureVerdict(rule, valueC) : null
}

/** «0–4 °C» · «≤ −18 °C» · «≥ 65 °C» — dal range della regola, mai hardcoded. */
export function ruleRangeLabel(rule: TemperatureRule): string {
  if (rule.minC !== null && rule.maxC !== null)
    return `${formatC(rule.minC)}–${formatC(rule.maxC)} °C`
  if (rule.maxC !== null) return `≤ ${formatC(rule.maxC)} °C`
  return `≥ ${formatC(rule.minC as number)} °C`
}

/** Temperatura in voce italiana: virgola decimale e segno meno tipografico. */
export function formatC(valueC: number): string {
  const rounded = Math.round(valueC * 10) / 10
  return String(rounded).replace('.', ',').replace('-', '−')
}

/** Il colore È il verdetto (§13.5) — parole brevi per chip e sussurro. */
export const VERDICT_WORDS: Record<
  TemperatureVerdict,
  { chip: string; whisper: string }
> = {
  ok: { chip: 'ok', whisper: 'Perfetto, in range.' },
  warn: { chip: 'attento', whisper: 'Attento — sei al limite del range.' },
  alarm: { chip: 'fuori norma', whisper: 'Fuori norma — segnala o intervieni.' },
}

/** Etichette umane dei tipi punto (schema: fridge/freezer/blast/ambient). */
export const POINT_TYPE_LABELS: Record<string, string> = {
  fridge: 'Frigorifero',
  freezer: 'Freezer',
  blast: 'Abbattitore',
  ambient: 'Ambiente',
}

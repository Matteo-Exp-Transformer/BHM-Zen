/**
 * 🔒 FONTE-UNICA REGOLE HACCP — file LOCK (Bussola §2, masterplan §14.3)
 *
 * QUI vivono i NUMERI (soglie, vincoli, retention). Il SENSO (fonte normativa,
 * razionale, chi ha validato) vive in docs/skill-system/context/COMPLIANCE_CONTEXT.md,
 * che linka ogni rule-id. MAI un numero scritto due volte.
 *
 * Change-Control (3 gate — mai saltare il gate-2):
 *   1. Proposta (agente-ufficiale, da AGGIORNAMENTI_HACCP.md): bumpa `version` +
 *      `effectiveFrom`, non sovrascrive mai la storia.
 *   2. Blindatura macchina: `haccp-rules.test.ts` valida struttura e plausibilità.
 *   3. Approvazione umana: professionista o owner. Le regole nascono `pending`
 *      (costruite da fonte ufficiale, usabili in beta — DESIGN_SKILL_CONSULENTI §2.4-bis).
 */

/** Chi ha validato la regola (gate-3). */
export type RuleValidation = 'pending' | 'owner' | `professionista:${string}`

/** Regola di temperatura per categoria di conservazione. */
export interface TemperatureRule {
  /** kebab-case, stabile nel tempo (le versioni bumpano `version`, non l'id) */
  id: string
  version: number
  /** ISO date (YYYY-MM-DD) da cui la versione è efficace */
  effectiveFrom: string
  /** categoria di conservazione a cui si applica */
  category: string
  /** etichetta breve, voce umana da cucina */
  label: string
  /** soglia minima in °C (null = nessun limite inferiore) */
  minC: number | null
  /** soglia massima in °C (null = nessun limite superiore) */
  maxC: number | null
  /** ancora in COMPLIANCE_CONTEXT.md §3 (fonte ufficiale) */
  sourceRef: string
  validatedBy: RuleValidation
  notes?: string
}

/** Regola di retention dei registri (quanti anni conservare). */
export interface RetentionRule {
  id: string
  version: number
  effectiveFrom: string
  /** cosa viene conservato (es. 'temperature_readings') */
  target: string
  /** anni minimi di conservazione */
  minYears: number
  sourceRef: string
  validatedBy: RuleValidation
  notes?: string
}

/**
 * Seed iniziale (2026-07-06): 3 regole classiche da fonti ufficiali, tutte `pending`.
 * Il track compliance (owner + agenti, §2.4-bis) le estende e le porta a certificazione.
 */
export const TEMPERATURE_RULES: readonly TemperatureRule[] = [
  {
    id: 'frigo-carni-fresche',
    version: 1,
    effectiveFrom: '2026-07-06',
    category: 'carni-fresche',
    label: 'Frigo carni fresche',
    minC: 0,
    maxC: 4,
    sourceRef: 'dpr-327-1980',
    validatedBy: 'pending',
    notes: 'Conservazione refrigerata carni fresche (allegato C, temperature di trasporto/conservazione).',
  },
  {
    id: 'congelatore-surgelati',
    version: 1,
    effectiveFrom: '2026-07-06',
    category: 'surgelati',
    label: 'Congelatore surgelati',
    minC: null,
    maxC: -18,
    sourceRef: 'dlgs-110-1992',
    validatedBy: 'pending',
    notes: 'Alimenti surgelati: temperatura ≤ -18 °C in ogni punto del prodotto.',
  },
  {
    id: 'mantenimento-caldo',
    version: 1,
    effectiveFrom: '2026-07-06',
    category: 'piatti-caldi',
    label: 'Mantenimento a caldo',
    minC: 65,
    maxC: null,
    sourceRef: 'dpr-327-1980',
    validatedBy: 'pending',
    notes: 'Alimenti da consumarsi caldi: mantenimento ≥ 65 °C.',
  },
] as const

/** Retention registri: si popola via Change-Control (nessun numero inventato). */
export const RETENTION_RULES: readonly RetentionRule[] = [] as const

/**
 * Margine di «attenzione» (verdetto ambra) in °C dentro il range consentito.
 * Scelta di PRODOTTO (non normativa): il colore-verdetto §13.5 avvisa PRIMA di
 * sforare. Da tarare con l'owner nelle sedute UI.
 */
export const WARN_MARGIN_C = 1

export type TemperatureVerdict = 'ok' | 'warn' | 'alarm'

/** Il colore È il verdetto (§13.5): verde ok · ambra attento · rosso fuori-norma. */
export function computeTemperatureVerdict(
  rule: Pick<TemperatureRule, 'minC' | 'maxC'>,
  valueC: number,
  warnMarginC: number = WARN_MARGIN_C,
): TemperatureVerdict {
  if (rule.minC !== null && valueC < rule.minC) return 'alarm'
  if (rule.maxC !== null && valueC > rule.maxC) return 'alarm'
  if (rule.minC !== null && valueC < rule.minC + warnMarginC) return 'warn'
  if (rule.maxC !== null && valueC > rule.maxC - warnMarginC) return 'warn'
  return 'ok'
}

export function getTemperatureRuleById(id: string): TemperatureRule | undefined {
  return TEMPERATURE_RULES.find(r => r.id === id)
}

/** Errore strutturale rilevato dal gate-2. */
export interface RuleValidationError {
  ruleId: string
  problem: string
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const VALIDATED_PATTERN = /^(pending|owner|professionista:.+)$/
/** range fisicamente plausibile per soglie alimentari (°C) */
const PLAUSIBLE_MIN = -40
const PLAUSIBLE_MAX = 130

/**
 * Gate-2 «blindatura macchina» (§14.3): valida il file. Se restituisce errori,
 * il cambio NON entra. Usata dal test e riusabile a runtime/CI.
 */
export function validateHaccpRules(
  tempRules: readonly TemperatureRule[] = TEMPERATURE_RULES,
  retentionRules: readonly RetentionRule[] = RETENTION_RULES,
): RuleValidationError[] {
  const errors: RuleValidationError[] = []
  const seen = new Set<string>()

  const checkCommon = (r: {
    id: string
    version: number
    effectiveFrom: string
    sourceRef: string
    validatedBy: string
  }) => {
    if (!ID_PATTERN.test(r.id)) errors.push({ ruleId: r.id, problem: 'id non kebab-case' })
    if (seen.has(r.id)) errors.push({ ruleId: r.id, problem: 'id duplicato' })
    seen.add(r.id)
    if (!Number.isInteger(r.version) || r.version < 1)
      errors.push({ ruleId: r.id, problem: 'version deve essere intero ≥ 1' })
    if (!DATE_PATTERN.test(r.effectiveFrom) || Number.isNaN(Date.parse(r.effectiveFrom)))
      errors.push({ ruleId: r.id, problem: 'effectiveFrom non è una data ISO valida' })
    if (!r.sourceRef || !ID_PATTERN.test(r.sourceRef))
      errors.push({ ruleId: r.id, problem: 'sourceRef assente o non kebab-case' })
    if (!VALIDATED_PATTERN.test(r.validatedBy))
      errors.push({ ruleId: r.id, problem: 'validatedBy non ammesso' })
  }

  for (const r of tempRules) {
    checkCommon(r)
    if (r.minC === null && r.maxC === null)
      errors.push({ ruleId: r.id, problem: 'almeno una soglia (minC/maxC) è obbligatoria' })
    for (const [name, v] of [['minC', r.minC], ['maxC', r.maxC]] as const) {
      if (v !== null && (v < PLAUSIBLE_MIN || v > PLAUSIBLE_MAX))
        errors.push({ ruleId: r.id, problem: `${name} fuori dal range plausibile [${PLAUSIBLE_MIN}, ${PLAUSIBLE_MAX}]` })
    }
    if (r.minC !== null && r.maxC !== null && r.minC >= r.maxC)
      errors.push({ ruleId: r.id, problem: 'minC deve essere < maxC' })
    if (!r.category) errors.push({ ruleId: r.id, problem: 'category obbligatoria' })
    if (!r.label) errors.push({ ruleId: r.id, problem: 'label obbligatoria' })
  }

  for (const r of retentionRules) {
    checkCommon(r)
    if (!r.target) errors.push({ ruleId: r.id, problem: 'target obbligatorio' })
    if (!Number.isInteger(r.minYears) || r.minYears < 1 || r.minYears > 30)
      errors.push({ ruleId: r.id, problem: 'minYears deve essere intero in [1, 30]' })
  }

  return errors
}

---
name: db-fondamenta
description: >-
  Skill per qualsiasi lavoro su schema DB, migrazioni, tipi generati, RLS, RPC (area
  Fondamenta). Caricala quando il task nomina migration, schema, tabelle, tipi, Supabase,
  RLS, trigger, append-only. ⚠️ Trigger DEEP sempre.
---

# 🧱 DB / FONDAMENTA — Skill di area (trasversale)

> Verità di dettaglio: [`MAPPA_Fondamenta_DB-tipi.md`](../../meta/MAPPATURA_AREE/MAPPA_Fondamenta_DB-tipi.md)
> (schema target audit-grade §4) + [`FASE3_MIGRATION_GAPS.md`](../../meta/FASE3_MIGRATION_GAPS.md)
> (inventario gap) + baseline live `supabase/migrations/20260706015742_remote_schema.sql`.
> **Gap ri-verificati sul live 2026-07-06 e CHIUSI in CP5/CP6/CP9** — stato in §3.

## 1. A che serve (il senso)

Lo **schema DB corretto è la verità** (regola d'oro §1 masterplan): uccide la classe di bug
«codice avanti al DB» che ha affossato il legacy (PGRST204 a runtime, tipi obsoleti, cast `as`).
Lo schema nasce **audit-grade** (§3): letture immutabili, chi-ha-registrato-cosa-quando,
retention, export con valore probatorio. Registro = sottoprodotto del fare, non feature a parte.

## 2. Procedura migration (FABLE_AVVIO §2.3 — NON derogabile)

1. Baseline = pull dallo schema live (✅ fatta: `20260706015742`, history allineata).
2. Nuove migration **incrementali e additive** in `supabase/migrations/` via
   `supabase migration new <nome>` → poi `db push` MIRATO (mai cieco).
3. Dopo ogni migration applicata: `npm run supabase:types` (rigenera i tipi).
4. Gate macchina: test di validazione su `haccp-rules.ts` e sugli invarianti append-only.
5. **Il DB `hjteuounjwkadmsbsmdm` è l'unico DB (condiviso col legacy deployato)**: solo dati
   test (conferma owner 2026-07-06), ma trattalo con cautela da PROD.

## 3. Stato migration — gap CHIUSI (CP5/CP6/CP9, 2026-07-06)

History locale = remota (**11/11**). Le migration applicate sono **LOCK** (append-only, Bussola §2):

| Migration | Cosa | Decisione |
|-----------|------|-----------|
| `20260706015742_remote_schema` | baseline dal live (37 tabelle) | regola d'oro §1 |
| `20260706040000_temperature_readings_audit_grade` | `method` NOT NULL + `notes`/`photo_evidence`/`recorded_by` | dec. 8 |
| `20260706040100_append_only_completions` | trigger no-UPDATE/DELETE su letture/completamenti | dec. 1 |
| `20260706040200_shift_seals` | timbro append-only (opened/closed/attestation) | dec. 7 |
| `20260706040300_products_expiry_cycle` | ciclo scadenze + reinserimento + `archived` | dec. 10 |
| `20260706040400_par_level_stock_counts` | `par_level` + storico conteggi `stock_counts` | dec. 12 |
| `20260706040500_companies_beta` | companies snella (`vat_number`, `onboarding_completed`) | dec. 4 |
| `20260706040600_shopping_rpcs` | 4 RPC shopping + RLS | dec. 3 |
| `20260706040700_realtime_publication` | publication + REPLICA IDENTITY ×10 | dec. 11 |
| `20260706050000_rls_hardening_relics` | RLS sulle 2 tabelle relitto scoperte in CP6 | PRATICHE §2 |
| `20260706070000_storno_maintenance_trigger` | trigger storno-aware manutenzioni (CP9; header «DRAFT» nel file = superato, file LOCK) | dec. 1 |

`notification_preferences` **non creata** (dec. 5) — non è un gap, è una decisione.

## 4. Limiti e regole VOLUTE — NON «aggiustarle»

- **Migration applicate = intoccabili** (LOCK Bussola §2): correzioni → nuova migration.
- **`database.types.ts` mai a mano, mai cast `as` di comodo** — il tipo che «dà fastidio» sta
  segnalando un drift schema: rigenera o correggi lo schema.
- **Append-only ≠ opzione UX**: è invariante di schema (trigger/policy), non convenzione client.
- **Numeri HACCP NON entrano nello schema**: vivono in `haccp-rules.ts` (qui solo STRUTTURA).
- **NO MCP Supabase** in sessione Fable: CLI + script npm (`scripts/sb.mjs` carica la password).

## 5. LOCK di area

```
LOCK  supabase/migrations/* — append-only (Bussola §2)
LOCK  src/types/database.types.ts — solo npm run supabase:types (Bussola §2)
RULE  ogni migration su tabelle-registro include/preserva i trigger append-only
RULE  ogni task DB = modalità DEEP (Bussola §6)
```

## 6. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| schema target per-campo | `MAPPA_Fondamenta_DB-tipi.md` §4 |
| dettaglio gap legacy | `FASE3_MIGRATION_GAPS.md` |
| riuso client/tipi legacy | mappa Fondamenta §3 (verdetti ♻️/✍️/🗑️) |
| soglie/categorie HACCP | `context/COMPLIANCE_CONTEXT.md` (MAI qui) |

---

**Ultimo aggiornamento**: 2026-07-08 · blindatura Fase 1: §3 riscritta da «gap da applicare» a «stato applicato» (11 migration, history 11/11) · → `sessioni/08-07-26/Report-senior-blindatura-fable.md`

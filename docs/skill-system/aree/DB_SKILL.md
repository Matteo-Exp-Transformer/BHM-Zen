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
> **Gap ri-verificati sul live 2026-07-06** (sessione Fable): tutti confermati.

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

## 3. Gap confermati sul live (ordine di applicazione indicativo)

| # | Gap | Decisione | Priorità |
|---|-----|-----------|----------|
| 1 | `temperature_readings`: `method` (NOT NULL target), `notes`, `photo_evidence`, `recorded_by` | dec. 8 + mig. 015 | **P0** |
| 2 | Append-only: trigger no-UPDATE/DELETE su `temperature_readings`, `task_completions`, `maintenance_completions` | dec. 1 | **P0** |
| 3 | 4 RPC shopping + RLS (`create_shopping_list_with_items`, `get_shopping_lists_with_stats`, `toggle_shopping_list_item`, `complete_shopping_list`) | dec. 3 (mig. 007) | **P0** |
| 4 | `shift_seals` append-only (company_id, user_id, opened_at, closed_at, attestation) | dec. 7 | P1 |
| 5 | `products`: `expired_at`, `previous_product_id`, `reinsertion_count`, `archived_at`, status `archived` | dec. 10 | P1 |
| 6 | `products.par_level` + storico conteggi (`stock_counts`) | dec. 12 | P1 |
| 7 | `companies`: + `vat_number`, + `onboarding_completed`; UI senza licenza | dec. 4 | P2 |
| 8 | Publication realtime + REPLICA IDENTITY su tabelle condivise beta | dec. 11 | P2 |
| 9 | `notification_preferences` | **NON creare** (dec. 5) | — |

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

**Ultimo aggiornamento**: 2026-07-06 · scaffolding iniziale + gap ri-verificati sul live, baseline allineata (installazione §14.5) · → sessione Fable CP3 (git log)

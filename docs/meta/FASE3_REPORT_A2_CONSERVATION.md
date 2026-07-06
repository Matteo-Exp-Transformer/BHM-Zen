# Report FASE 3 — Area A2 Conservation

**Data**: 2026-07-05  
**Agente**: A2 (Conservation)  
**Modalità**: read-only  
**Priorità**: P0 — BUG-005  
**Supplemento DB live**: 2026-07-05 (MCP `supabase-bhm`, read-only)

---

## Riferimento A0 (DB / Schema)

| Stato | Dettaglio |
|-------|-----------|
| Report A0 | ✅ [`FASE3_REPORT_A0_DB_SCHEMA.md`](./FASE3_REPORT_A0_DB_SCHEMA.md) — Supplemento DB live §S1–S8 |
| Verifica A2 | Rieseguita MCP `execute_sql` + `list_migrations` (conferma esiti A0 su entità Conservation) |
| Progetto | `hjteuounjwkadmsbsmdm.supabase.co` |

### Citazione A0 — `temperature_readings` (BUG-005)

> **A0 §S3 / §S6**: su `temperature_readings` le colonne `method`, `notes`, `photo_evidence`, `recorded_by` **assenti sul remoto live** (solo 6 colonne base). Migration 015 **non applicata**. Coerente con BUG-005 runtime (`PGRST204`).

**Conferma MCP A2** (`execute_sql` 2026-07-05):

```text
temperature_readings: id, company_id, conservation_point_id, temperature, recorded_at, created_at (6 righe)
```

**Payload app** (`useTemperatureReadings.ts:147-164`) invia in più: `method`, `notes`, `photo_evidence`, `recorded_by` → **insert bloccato**.

---

## Supplemento DB live — Conservation (MCP A2)

| Entità | Esito LIVE | Evidenza MCP |
|--------|------------|--------------|
| `temperature_readings` vs payload | ❌ **BUG-005** | 6 colonne; mancano 4 campi payload |
| `conservation_points` profili | ✅ | `appliance_category`, `profile_id`, `profile_config`, `is_custom_profile` presenti |
| `maintenance_tasks.recurrence_config` | ✅ | colonna `jsonb` presente |
| `maintenance_tasks.type` CHECK | ✅ | include `expiry_check` |
| `maintenance_completions` | ✅ tabella | 13 colonne; `next_due_date` sì, `next_due` no — insert auto-complete compatibile |
| Trigger `20260201120000` | ✅ **presente** | `trigger_update_task_on_completion` AFTER INSERT su `maintenance_completions` → `update_maintenance_task_on_completion()` (nome file migration; non in `list_migrations`) |
| `cons_point_custom_profile` | ✅ | tabella con 7 colonne |
| `list_migrations` | ⚠️ `[]` | schema da restore + SQL manuali, non da CLI tracker |

**Nota su trigger (correzione rispetto ad A0 §S6)**: A0 ha cercato trigger solo su `maintenance_tasks` (`update_maintenance_tasks_updated_at`). Il trigger ricorrenza della migration `20260201120000` è su **`maintenance_completions`** ed è **deployato** live con funzione identica al file repo.

---

## 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 32 |
| Allineati doc↔codice↔DB live | 14 |
| Gap critici | 2 |
| Gap medi/bassi | 8 |
| Non verificato (solo runtime UI / E2E) | 2 |

**Esito area**: 🔴 — flusso core “registra temperatura” **bloccato** da BUG-005 (confermato live). Resto schema Conservation (profili, manutenzioni, trigger ricorrenza) **ok su DB**.

---

## 5.2 Matrice verifica

### Seed HANDOFF §7 (priorità P0)

| # | Feature / Verifica | Doc dice | Codice reale | DB/Schema (LIVE MCP) | Esito |
|---|-------------------|----------|--------------|----------------------|-------|
| 1 | Insert temperatura | Campi `method`, `notes`, `photo_evidence`, `recorded_by` salvati (migration 015) | Payload include tutti e 4 campi: `useTemperatureReadings.ts:147-164` | ❌ 6 colonne base; **mancano** `method`, `notes`, `photo_evidence`, `recorded_by` (A0 §S3 + MCP A2) | ❌ **BUG-005** |
| 2 | Migration 015 applicata? | `00_MASTER_INDEX.md` Worker 2: “Migration APPLICATA” (2025-01-16) | File SQL presente in repo | ❌ **NON applicata** live; `list_migrations` = `[]` | ⚠️ Doc obsoleto |
| 3 | Modal chiusura (BUG-006) | Chiusura X/Annulla/overlay + post-salvataggio (`ADD_TEMPERATURE_MODAL.md` v2.2) | `closeTemperatureModal()` + `onSuccess` in `ConservationPage.tsx:220-258`; X/Annulla/overlay wired in `AddTemperatureModal.tsx:164,180,337` | N/A | ⚠️ Post-save: bloccato da BUG-005; X/Annulla: runtime non ri-testato |
| 4 | Auto-complete manutenzione su lettura | Task temperatura completate al salvataggio | Logica dopo insert OK: `useTemperatureReadings.ts:177-220` | ✅ `maintenance_completions` esiste; trigger `trigger_update_task_on_completion` presente; **non esegue** finché insert temperatura fallisce | ⚠️ Codice + DB ok; bloccato da BUG-005 |
| 5 | TODO “method when DB updated” | `BUG_TRACKER.md:36` cita TODO riga 138 | **Nessun TODO** in `AddTemperatureModal.tsx`; campo `method` implementato | N/A | ✅ TODO obsoleto in tracker |
| 6 | Doc ADD_TEMPERATURE “salvataggio OK” | v2.2: “Campi Salvati” | Codice invia campi; insert fallisce | ❌ colonne assenti live | ❌ Claim “salvati” **falso** su remoto |

### Conoscenze-Definizioni (confronto obbligatorio `00_MASTER_INDEX` + 6 file)

| Componente / Feature | Doc (`Conoscenze-Definizioni/`) | Codice | DB (LIVE MCP) | Esito |
|---------------------|--------------------------------|--------|---------------|-------|
| **ADD_TEMPERATURE_MODAL** — form method/notes/foto | Salvati in DB (v2.2) | UI + payload completi | ❌ colonne assenti | ❌ |
| **ADD_TEMPERATURE_MODAL** — preview stato ±1°C | Conforme/warning/critical | `calculateTemperatureStatus` + badge | N/A | ✅ |
| **ADD_TEMPERATURE_MODAL** — z-index mobile | Test/doc: `z-[9999]` | Overlay `z-50` (`AddTemperatureModal.tsx:163`) | N/A | ⚠️ Test/code mismatch |
| **ADD_POINT_MODAL** — z-index | Doc audit 2026-01-16: `z-50` | `z-[9999]` (`AddPointModal.tsx:1042`) | N/A | ✅ |
| **ADD_POINT_MODAL** — profilo HACCP / appliance | Profili e validazione | `profileId`, `applianceCategory`, `getProfilesForAppliance` | ✅ 4 colonne profilo su `conservation_points` | ✅ |
| **ADD_POINT_MODAL** — transazione atomica punto+manutenzioni | Rollback se manutenzioni falliscono | `useConservationPoints.ts:130-147` | N/A | ✅ |
| **CONSERVATION_PAGE** — real-time | 3 subscription Supabase | `useConservationRealtime()` montato | N/A (subscription) | ✅ codice |
| **CONSERVATION_PAGE** — task critici check-up | `useMaintenanceTasksCritical` | `ConservationPage.tsx:49` | N/A | ✅ |
| **CONSERVATION_POINT_CARD** — `getPointCheckup` | Check-up centralizzato v2.0 | `ConservationPointCard.tsx:58`, `pointCheckup.ts` | N/A | ✅ |
| **CONSERVATION_POINT_CARD** — due box separati | Temperatura + manutenzioni | `checkup.messages.priority === 'both'` | N/A | ✅ |
| **CONSERVATION_POINT_CARD** — dettagli espandibili | Pulsante Mostra/Nascondi | `showMaintenanceDetails` state | N/A | ✅ |
| **TEMPERATURE_READINGS_SECTION** — 3 tab | Stato / Storico / Analisi | `activeTemperatureTab` | N/A | ✅ |
| **TEMPERATURE_READINGS_SECTION** — nome utente su lettura | `recorded_by` → user_profiles | Query + fallback staff | ❌ `recorded_by` assente su `temperature_readings` | ⚠️ Codice ok; DB senza colonna |
| **SCHEDULED_MAINTENANCE_SECTION** — auto-complete su lettura | Documentato in hook | `useTemperatureReadings.ts:177-220` | ✅ `maintenance_completions` + trigger; bloccato da BUG-005 | ⚠️ |
| **SCHEDULED_MAINTENANCE_SECTION** — pulsante “Completa” inline | Doc audit: mancante | Solo link `/attivita` (`ScheduledMaintenanceCard.tsx:308-325`) | N/A | ⚠️ Gap UX |
| **SCHEDULED_MAINTENANCE_SECTION** — card espandibili | Doc audit: non espandibili | `expandedPointId`, `expandedMaintenanceTypes` | N/A | ✅ |
| **SCHEDULED_MAINTENANCE_SECTION** — trigger DB ricorrenza | Migration `20260201120000` | File in `supabase/migrations/` | ✅ `trigger_update_task_on_completion` su `maintenance_completions` (non in `list_migrations`) | ✅ |
| **MaintenanceTaskCard** — dettagli assegnazione | Ruolo + utente + reparto | Query join in `useMaintenanceTasks.ts` | N/A | ✅ |
| **useMaintenanceTasks** — completamento task | Migration 016 + `completeTaskMutation` | `@ts-ignore` su `maintenance_completions` | ✅ tabella live (13 col.); `next_due` assente, `next_due_date` ok | ⚠️ Tipi client obsoleti |
| **Profili custom** | Tabella `cons_point_custom_profile` | Usata da conservazione custom | ✅ tabella live (7 col.) | ✅ |
| **Hook legacy `useConservation.ts`** | Non in scope attivo | Filtri `method`/`recorded_by` commentati | ❌ colonne assenti live — coerente | ⚠️ Tech debt |
| **E2E conservation** | Test creati, non eseguiti | File `tests/conservation/*.spec.ts` | N/A | `non-verificato` esecuzione |

### Payload insert vs schema LIVE (dettaglio BUG-005)

| Campo payload (`useTemperatureReadings.ts:147-164`) | LIVE `temperature_readings` | Esito |
|-----------------------------------------------------|----------------------------|-------|
| `conservation_point_id`, `temperature`, `recorded_at`, `company_id` | ✅ | ✅ |
| `method` | ❌ assente | ❌ PGRST204 |
| `notes` | ❌ assente | ❌ |
| `photo_evidence` | ❌ assente | ❌ |
| `recorded_by` | ❌ assente | ❌ |

**Fonte**: A0 §S3 + MCP A2 `information_schema.columns` 2026-07-05.

---

## 5.3 Bug confermati (nuovi o aggiornati)

| ID | Severity | Evidenza | File:Riga | Note per A8 |
|----|----------|----------|-----------|-------------|
| BUG-005 | CRITICAL | **Confermato LIVE** (A0 §S3 + MCP A2): 6 colonne; payload 4 campi extra | `useTemperatureReadings.ts:151-164` | Già in tracker |
| BUG-006 | HIGH | Post-salvataggio: `onSuccess` non chiamato se mutation fallisce (BUG-005) | `ConservationPage.tsx:220-258` | Cascata BUG-005 |
| BUG-007 (proposta) | MEDIUM | Test `z-[9999]` vs codice `z-50` | `AddTemperatureModal.tsx:163` | Test/code drift |
| BUG-008 (proposta) | LOW | TODO tracker `AddTemperatureModal:138` obsoleto | — | Cleanup tracker |

---

## 5.4 Documentazione obsoleta

| Path doc | Claim errato / obsoleto | Evidenza LIVE | Azione suggerita |
|----------|-------------------------|---------------|------------------|
| `03_CONSERVATION/00_MASTER_INDEX.md` | Migration 015 APPLICATA | MCP: colonne assenti | `verificato-rotto` |
| `ADD_TEMPERATURE_MODAL.md` | “Campi Salvati” in DB | MCP: colonne assenti | `verificato-rotto` |
| `TEMPERATURE_READINGS_SECTION.md` | “Campi Salvati” migration 015 | MCP: colonne assenti | `verificato-rotto` |
| `ADD_TEMPERATURE_MODAL.md` | Checklist “DA IMPLEMENTARE: method…” | Codice già invia campi | `verificato-ok` codice |
| `00_MASTER_INDEX.md` § Problemi UI #1, #6 | z-index AddPoint; card non espandibili | Codice aggiornato | Marcare risolto |
| `Lavoro/04-02-2026/REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md` | Fix non riuscito | Post-save ancora bloccato da BUG-005 live | Nota cascata |

---

## 5.5 Aggiornamenti catalogo (`stato_percepito`)

| DOC-id / path | Campo | Nuovo `stato_percepito` |
|---------------|-------|-------------------------|
| `ADD_TEMPERATURE_MODAL.md` | Salvataggio DB | `verificato-rotto` (BUG-005 live) |
| `TEMPERATURE_READINGS_SECTION.md` | Campi salvati | `verificato-rotto` |
| `CONSERVATION_PAGE.md` | Auto-complete su lettura | `verificato-gap` (DB ok, insert bloccato) |
| `CONSERVATION_POINT_CARD.md` | Check-up v2.1 | `verificato-ok` |
| `ADD_POINT_MODAL.md` | Profili HACCP | `verificato-ok` (colonne live) |
| `SCHEDULED_MAINTENANCE_SECTION.md` | Trigger ricorrenza | `verificato-ok` (live) |
| `00_MASTER_INDEX.md` | Migration 015 | `verificato-rotto` |

### Append catalogo — sottosezione `3.2 Conservation` (per A8)

```markdown
### 3.2 — Conservation (2026-07-05, supplemento DB live)
**Agente**: A2 | **Esito area**: 🔴

| Feature | Doc (FASE 2) | Verifica codice | Verifica DB LIVE | Stato finale |
|---------|--------------|-----------------|------------------|--------------|
| Registra temperatura | ⚠️ modal | ❌ payload 4 campi extra — BUG-005 | ❌ 6 colonne; mancano method/notes/photo/recorded_by (A0 §S3) | 🔴 BLOCCATO |
| Auto-complete task temperatura | ✅ | ⚠️ dopo insert OK | ✅ maintenance_completions + trigger presenti | 🟡 DIPENDE DA BUG-005 |
| Profili HACCP AddPoint | ✅ | ✅ | ✅ 4 colonne conservation_points | 🟢 |
| maintenance_tasks recurrence | ✅ | ✅ | ✅ recurrence_config + expiry_check CHECK | 🟢 |
| Trigger ricorrenza 20260201 | ✅ | ✅ file repo | ✅ trigger_update_task_on_completion live | 🟢 |
| Profili custom | ✅ | ✅ | ✅ cons_point_custom_profile | 🟢 |
| Check-up card | ✅ | ✅ | N/A | 🟢 |

**Report**: [FASE3_REPORT_A2_CONSERVATION.md](./FASE3_REPORT_A2_CONSERVATION.md)
```

---

## 5.6 Non verificato / fuori scope

- **Runtime BUG-006** (X/Annulla senza salvataggio): non ri-testato browser in Fase 3.
- **Esecuzione test** Playwright/Vitest conservation: fuori scope.
- **Hook legacy** `useConservation.ts`, `TemperatureReadingModal.tsx`, `OfflineConservationDemo.tsx`.
- **Fix codice / apply migration 015**: fuori scope HANDOFF §13.
- ~~Schema DB remoto Conservation~~ → **verificato** MCP 2026-07-05 (questo supplemento).

---

## Dipendenze e raccomandazioni per fase implementativa

1. **P0**: Applicare `database/migrations/015_add_temperature_reading_fields.sql` — **unico gap critico live** su Conservation temperature.
2. **P0**: Aggiornare `BackupDB/apply-missing-schema-migrations.sql` per includere 015.
3. **P1**: Rigenerare `database.types.ts` (A0: obsoleto vs live — mancano colonne già presenti su profili/recurrence).
4. **P1**: Allineare `AddTemperatureModal` z-index o test.
5. **P2**: Rivalutare BUG-006 dopo fix BUG-005.
6. **P2**: `ScheduledMaintenanceCard` — pulsante “Completa” inline vs link Attività.

---

## File analizzati (scope A2)

| Path | Ruolo |
|------|-------|
| `META/FASE3_REPORT_A0_DB_SCHEMA.md` | Baseline + supplemento DB live (citazione A0) |
| `src/features/conservation/` | Feature principale |
| MCP `supabase-bhm` | `execute_sql`, `list_migrations` (2026-07-05) |
| `BUG_TRACKER.md` | BUG-005, BUG-006 (solo lettura) |
| `03_CONSERVATION/Conoscenze-Definizioni/*.md` | Spec di riferimento |

---

*Fine report A2 — supplemento DB live. Nessuna modifica a `src/`, migrations, DB, `BUG_TRACKER.md`.*

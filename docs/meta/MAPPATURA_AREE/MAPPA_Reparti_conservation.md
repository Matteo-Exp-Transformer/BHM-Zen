# MAPPA — 🧭 Reparti · Conservation (punti + temperatura + manutenzioni)
**Data:** 2026-07-06 · **Fonte verità:** codice + snapshot DB live A0/A2 (05-07) · **Report Fase 3 base:** A2 (+ A0)

> ⚠️ **Accesso DB**: schema live = **snapshot A0/A2 del 2026-07-05** (token MCP di sessione non
> raggiunge `hjteuounjwkadmsbsmdm`). Vedi nota in [`MAPPA_Fondamenta_DB-tipi.md`](./MAPPA_Fondamenta_DB-tipi.md).
> Schema target di riferimento: la mappa Fondamenta (questa area ne è il primo grande consumatore).

---

## 1. Dove vive nel prodotto nuovo
- **Casa/lente (§12):** 🧭 **Reparti** (Spazio) — è la lente "dove sono le cose": reparti → punti di conservazione → registra temperatura + manutenzioni (la **cascata**).
- **Ruoli coinvolti:** **dipendente** (registra temperatura, completa manutenzione) · **titolare/responsabile** (crea punti, imposta profili e manutenzioni in onboarding/Regia).
- **Punto del loop §9.1:** ② **faccio** (registro temperatura, completo task) è il cuore; ① **imposto** (creazione punto+profilo+manutenzioni) avviene in Regia/onboarding ma il dato **vive qui**.

> **Doppia lente §12.1**: una manutenzione compare **in Reparti** (nel suo punto) *e* **in Oggi** quando scade.
> Il confine con Oggi/Calendar (A3): le `maintenance_tasks` sono definite/visualizzate qui, ma la loro
> **scadenza** e il completamento come "cosa da fare oggi" appartengono alla lente Oggi.
> Il confine con Regia (A6): i **reparti** (departments) come CRUD sono in A6; qui sono il **contenitore-spazio**.
> Il confine con Scorte (A5): la mansione **«Inventario»** (dec.12) fa il **giro dei punti di conservazione
> di questo reparto** per contare le rimanenze — i *punti* sono di questa lente, i *conteggi/scorte* di Scorte.

---

## 2. Flusso utente (as-is → to-be)

| Passo | Cosa fa l'utente | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|------------------|---------------|--------------------|
| Crea punto conservazione | sceglie appliance + profilo HACCP, definisce manutenzioni | ✅ funziona: `AddPointModal` con profili live; creazione **atomica** punto+manutenzioni con rollback | Idem, ma rollback = **transazione DB reale** (vedi §4) |
| Vede lo stato del punto | card con check-up temperatura + manutenzioni | ✅ `ConservationPointCard` + `getPointCheckup`; due box (temp/manutenzioni); dettagli espandibili | Idem — asset maturo, riuso |
| **Registra temperatura** | apre modal, inserisce temp (+ metodo/note/foto) | 🔴 **BLOCCATO — BUG-005**: payload invia `method/notes/photo_evidence/recorded_by`, colonne assenti live → `PGRST204` | Sblocco con Migration 015; lettura **append-only** con `recorded_by` |
| Chiude il modal post-salvataggio | X / Annulla / overlay / auto-close | ⚠️ BUG-006: `onSuccess` non parte se l'insert fallisce (cascata di BUG-005) | Si risolve a valle di 015; da ri-testare |
| Task manutenzione auto-completato | registrando la temp, il task "Rilevamento Temperature" del giorno si chiude | ⚠️ codice + DB pronti (`maintenance_completions` + trigger ricorrenza live), ma **non esegue** finché l'insert temp fallisce | Funzionerà una volta sbloccato 015 |
| Completa manutenzione non-temp | pulsante "Completa" | ⚠️ gap UX: solo **link** a `/attivita`, no pulsante inline in `ScheduledMaintenanceCard` | Decisione UI (Track A) |

---

## 3. Flusso dati (verità = codice + snapshot DB live)

### Tabelle / RPC toccate — stato LIVE (snapshot A0/A2 05-07)

| Tabella | Stato live | Nota |
|---------|-----------|------|
| `conservation_points` | ✅ + 4 colonne profilo (`appliance_category, profile_id, profile_config, is_custom_profile`) | tipi generati non le hanno (rigenerare) |
| `temperature_readings` | ✅ 6 col. base · ❌ `method, notes, photo_evidence, recorded_by` | **BUG-005**, Migration 015 non applicata |
| `maintenance_tasks` | ✅ `recurrence_config` + CHECK `type` con `expiry_check`; usa colonna `next_due` | 53 righe live |
| `maintenance_completions` | ✅ tabella (13 col.), `next_due_date` (no `next_due` alias) | insert auto-complete **compatibile** |
| Trigger ricorrenza `20260201` | ✅ **PRESENTE live**: `trigger_update_task_on_completion` AFTER INSERT su `maintenance_completions` | ⚠️ **A2 corregge A0** (A0 lo dava assente) |
| `cons_point_custom_profile` | ✅ tabella (7 col., 0 righe), RLS on | profili custom |
| `user_profiles` / `company_members` / `staff` | ✅ | usate per risalire al nome di chi ha registrato |
| `departments` | ✅ | reparto = contenitore del punto (`department:departments(id,name)`) |

### Hook / service — riuso o no

| Path | Ruolo | Verdetto |
|------|-------|----------|
| `useConservationPoints.ts` | CRUD punti + **creazione atomica** punto+manutenzioni con rollback client-side (`:53-152`) | ♻️ Riuso logica · ✍️ rollback → transazione DB (RPC) |
| `useTemperatureReadings.ts` | insert lettura + **auto-complete** task temperatura (`:132-223`) | ♻️ Riuso · dipende da 015 per l'insert |
| `useMaintenanceTasks.ts` | task manutenzione + `completeTaskMutation` (usa `@ts-ignore` su `maintenance_completions`) | ♻️ Riuso · ✍️ togliere `@ts-ignore` post-rigenerazione tipi |
| `useMaintenanceTasksCritical.ts` | task critici per check-up | ♻️ Riuso |
| `useConservationRealtime.ts` | 3 subscription Supabase (punti/letture/task) | ♻️ Riuso |
| `utils/pointCheckup.ts`, `utils/correctiveActions.ts` | check-up centralizzato + azioni correttive | ♻️ Riuso (buona centralizzazione) |
| `src/hooks/useConservation.ts` (legacy globale) | filtri `method`/`recorded_by` **commentati** ("fields don't exist in DB") | 🗑️/✍️ tech debt: legacy, fuori dallo scope attivo |
| `TemperatureReadingModal.tsx`, `OfflineConservationDemo.tsx`, `CreateConservationPointModal.tsx` | componenti paralleli/legacy | ❓ verificare se duplicano `AddTemperatureModal`/`AddPointModal` (candidati 🗑️) |

### Ingresso → destinazione del dato
```
REGISTRA TEMP: AddTemperatureModal → useTemperatureReadings.createReadingMutation
   → insert temperature_readings {temp, recorded_at, method, notes, photo_evidence, recorded_by, company_id}
   → [BUG-005: 4 campi non esistono live ⇒ PGRST204]
   → (se ok) query maintenance_tasks type='temperature', next_due ≤ fine giornata
   → insert maintenance_completions {task_id, completed_by, completed_at, completed_by_name}
   → trigger DB ricalcola prossima scadenza task
   → invalidate query [temperature-readings, conservation-points, maintenance-tasks(-critical)]

CASCATA (crea punto): AddPointModal → useConservationPoints.createConservationPointMutation
   → insert conservation_points {profilo, setpoint_temp, department_id, profile_config, is_custom_profile}
   → insert maintenance_tasks[] (title, type, frequency, assigned_to, recurrence_config, next_due…)
   → se tasks falliscono ⇒ DELETE del punto (rollback MANUALE client-side, non transazione)
```

---

## 4. Schema target audit-grade (delta vs live)

| Campo/tabella | Live oggi | Target (audit-grade §3) | Migration/gap |
|---------------|-----------|--------------------------|---------------|
| `temperature_readings.method/notes/photo_evidence/recorded_by` | ❌ assenti | presenti; `recorded_by` = **attribuzione** obbligatoria | Migration **015** (P0) |
| `temperature_readings` (immutabilità) | nessun vincolo | **append-only**: una lettura registrata non si modifica/cancella; retention pluriennale | policy/trigger no-UPDATE/DELETE |
| Creazione punto+manutenzioni | rollback **client-side** (`DELETE` manuale, può lasciare orfani se il delete fallisce) | **transazione DB atomica** (RPC unica) → niente stato parziale | RPC `create_point_with_maintenances` |
| `maintenance_completions` (chi-quando) | `completed_by` + `completed_by_name` + `completed_at` | ok come attribuzione; renderla immutabile | vincolo append-only |
| Trigger ricorrenza | ✅ presente live | ok; **tracciarlo** in un canale migration unico (oggi fuori da `list_migrations`) | consolidamento (BUG-DB-003) |
| `database.types.ts` per quest'area | manca profili + `recurrence_config` + `next_due` | rigenerare dal live | post-015 |

> ⚠️ Le soglie temperatura (min/max, tolleranza ±) **non** vanno qui: `src/compliance/haccp-rules.ts` (§14.3). Qui solo struttura.

---

## 5. Verdetto riuso
- ♻️ **Riuso:** `useConservationPoints`, `useTemperatureReadings`, `useMaintenanceTasks(Critical)`, `useConservationRealtime`, `pointCheckup.ts`, `correctiveActions.ts`, `AddPointModal`, `AddTemperatureModal`, `ConservationPointCard` (asset più maturo dell'app).
- ✍️ **Riscrivo:** rollback creazione punto → **RPC transazionale**; togliere `@ts-ignore` su `maintenance_completions` dopo rigenerazione tipi; lettura `recorded_by`→nome (oggi query multi-fallback complessa: `user_profiles.auth_user_id` → `company_members`→`staff`) semplificabile.
- 🗑️ **Butto (dead code):** candidati `useConservation.ts` legacy (filtri commentati), `OfflineConservationDemo.tsx`; verificare `TemperatureReadingModal.tsx`/`CreateConservationPointModal.tsx` (probabile duplicazione dei modal attivi).
- ✅ **DECISO** ([`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md)): (dec.8) lettura = **temp + metodo obbligatori, note e foto opzionali** · (dec.1) letture **append-only** immutabili · (default) creazione punto+manutenzioni → **RPC transazionale**.
- ❓ **Dipende da owner (residuo):** pulsante "Completa" inline nella card manutenzione vs link ad Attività (UI/Track A).

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ **Ufficiale-HACCP:** la lettura temperatura è **la prova** per il controllo → deve essere **immutabile, attribuita (`recorded_by`) e datata**; oggi non salva nemmeno chi l'ha fatta. La creazione punto+manutenzioni **non atomica** può lasciare un punto senza le sue manutenzioni obbligatorie → buco di conformità. Definire **retention** letture e **immutabilità** a livello DB.
- 👨‍🍳 **Ristoratore:** registrare la temperatura deve essere **immediato** (in cucina, coi guanti): metodo con **default** (`digital_thermometer`), foto/note **opzionali** — confermare che l'auto-complete del task tolga davvero lavoro doppio. Il valore distintivo è la **cascata** (imposti il punto e le manutenzioni si generano da sole): va protetta e resa affidabile.

## 7. Non verificato / rimandato
- **Schema live NON ri-verificato in sessione** (token MCP): stati ✅/❌ da snapshot A0/A2 05-07.
- **Esistenza colonna `maintenance_tasks.next_due` live**: usata dal codice (`.lte('next_due',…)`), non esplicitata in A0/A2 — da confermare a token ripristinato.
- **BUG-006 runtime** (X/Annulla senza salvataggio) e **z-index** `AddTemperatureModal` (`z-50` vs test `z-[9999]`): non ri-testati browser.
- **Duplicazione modal** (`TemperatureReadingModal`/`CreateConservationPointModal` vs attivi): da confermare prima del verdetto 🗑️.
- **Esecuzione E2E** `tests/conservation/*.spec.ts`: fuori scope.

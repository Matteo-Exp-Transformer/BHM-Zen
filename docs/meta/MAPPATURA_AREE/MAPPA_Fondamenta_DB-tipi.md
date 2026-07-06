# MAPPA — 🧱 Fondamenta · DB schema + tipi/servizi condivisi (A0 + A7)
**Data:** 2026-07-06 · **Fonte verità:** codice + snapshot DB live A0 (05-07) · **Report Fase 3 base:** A0, A7

> ⚠️ **Nota accesso DB**: in questa sessione i token MCP Supabase **non raggiungono** il progetto BHM
> `hjteuounjwkadmsbsmdm` (vedono altri progetti). Lo schema live qui riportato = **snapshot A0 del
> 2026-07-05** (read-only, dettagliato). **To-do owner**: ripristinare il token MCP sul progetto BHM
> prima che Fable usi questa mappa per scrivere migration. Nessun dato marcato ✅ live è stato
> ri-verificato in sessione; tutti provengono dal Supplemento DB live di A0.

---

## 1. Dove vive nel prodotto nuovo
- **Casa/lente (§12):** 🧱 **Fondamenta** (trasversale) — schema DB audit-grade, tipi generati, servizi condivisi.
- **Ruoli coinvolti:** nessuno diretto (layer infrastrutturale); serve **tutte** le lenti (Oggi/Reparti/Scorte/Regia).
- **Punto del loop §9.1:** trasversale a ①②③④ — è la spina dorsale su cui poggiano gli altri quattro.

> **Regola**: le altre 4 mappe (Reparti, Oggi, Regia, Scorte) **citano lo schema target definito qui**.
> Questa mappa è il contratto dati; le altre descrivono i flussi che lo usano.

---

## 2. Flusso utente (as-is → to-be)

Fondamenta non ha un flusso utente proprio. Ha invece **tre disallineamenti strutturali** (GUIDA §6) che
si propagano come bug in ogni area. Riletti come "cosa deve cambiare a monte":

| Passo (a monte di ogni feature) | Cosa succede | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|------------------|---------------|--------------------|
| Il codice invia un payload | scrive N campi su una tabella | Codice **più avanti** del DB: invia colonne che il restore Nov-2025 non ha (`method`…) → `PGRST204` a runtime | Schema DB allineato al codice **prima** del rilancio; ogni campo inviato esiste |
| TypeScript dovrebbe bloccare | il tipo protegge l'insert | `database.types.ts` **obsoleto**: non ha né le colonne mancanti né quelle già live (profili, `open_weekdays`) → 163 errori TS, cast `as` che mascherano | `database.types.ts` **rigenerato dallo schema live**; niente cast di comodo |
| Una migration definisce lo schema | applicata sul remoto | Doppio canale (`database/` 27 · `supabase/` 11), `list_migrations`=`[]`, schema da **restore + SQL manuali** | Canale unico e tracciato; ogni tabella audit-grade ha immutabilità/retention definite |

---

## 3. Flusso dati (verità = codice + snapshot DB live A0)

### Tabelle / RPC toccate — stato LIVE (snapshot A0 05-07)

| Tabella | Stato live | Delta rilevante |
|---------|-----------|-----------------|
| `temperature_readings` | ✅ esiste (6 col. base) | ❌ mancano `method, notes, photo_evidence, recorded_by` (Migration 015 non applicata) → **BUG-005** |
| `conservation_points` | ✅ + profili live (`appliance_category, profile_id, profile_config, is_custom_profile`) | tipi generati **non** li hanno |
| `cons_point_custom_profile` | ✅ esiste (0 righe), RLS on | assente in `database.types.ts` |
| `maintenance_tasks` | ✅ `recurrence_config` + CHECK con `expiry_check` | trigger ricorrenza `20260201` **presente** live (`trigger_update_task_on_completion` su `maintenance_completions`) — ⚠️ A2 corregge A0, che lo dava assente |
| `maintenance_completions` | ✅ `next_due_date` | `next_due` (alias mig.016) assente; insert auto-complete **compatibile** |
| `tasks` | ✅ `time_management` + `recurrence_config` | tipi generati non li hanno |
| `company_calendar_settings` | ✅ `working_days` + `open_weekdays` | `open_weekdays` assente nei tipi |
| `companies` | ✅ base (`name, address, email, staff_count`…) | ❌ mancano `phone, vat_number, license_number`… che la UI Settings mostra (BUG-011) |
| `haccp_configurations` | ✅ (`configuration_name, configuration_type, settings: Json`) | UI Settings invia oggetto **flat** incompatibile |
| `notification_preferences` | ❌ **tabella assente** | UI `NotificationPreferences.tsx` la interroga (BUG-013/017) |
| `products` | ✅ 20 col. base | ❌ `expired_at, previous_product_id, reinsertion_count, archived_at` + status `archived` |
| `product_categories` | ✅ base (`id, company_id, name, …`) | ❌ colonne estese (allergeni, expiry default — mig.010) |
| `shopping_lists`, `shopping_list_items` | ✅ tabelle esistono | ❌ **4 RPC assenti** → flusso bloccato (BUG-008) |
| RPC `public` | ⚠️ solo `cleanup_expired_csrf_tokens` nei tipi | codice chiama **10+ RPC** (`log_user_activity`, `create_shopping_list_with_items`, `is_admin`…) non tipizzate/assenti |

### Hook / service — riuso o no

| Path | Ruolo | Verdetto |
|------|-------|----------|
| `src/types/helpers.ts` (106 righe) | `Db*` aliases + `computeTemperatureStatus` | ♻️ **Riuso — è il pattern-modello** verso cui convergere |
| `src/types/database.types.ts` (2096 righe) | fotografia schema per TS | ✍️ **Rigenerare** da schema live post-migration |
| `src/lib/supabase/client.ts` (288 righe) | singleton `createClient<Database>` **+** interfacce DEPRECATED duplicate (`Company`, `TemperatureReading`…) | ♻️ singleton buono · 🗑️ **le interfacce duplicate** (triplicazione tipi, `reading_time` vs `recorded_at`) |
| `src/types/conservation.ts`, `inventory.ts`, `auth.ts`, `shopping.ts` | custom types più ricchi/vecchi del DB | ✍️ **Riscrivere** convergendo su `helpers.ts` |
| `src/services/export/HACCPReportGenerator.ts` (584) | export PDF ispezione | ✍️ Riscrivere query (colonne obsolete) · sezioni `correctiveActions`/`staffTraining` = stub |
| `src/services/export/ExcelExporter.ts`, `EmailScheduler.ts` | export/scheduling | ✍️ schema query obsoleto |
| ~15 servizi B.9/B.10 (`WorkflowAutomationEngine`, `MultiTenantManager`, `SecurityDashboard`, `AdvancedAnalyticsIntegration`…) | scaffolding senza import UI | 🗑️ **Dead code** (~30% cartella `services/`, 50 file totali) |

### Ingresso → destinazione del dato (schema del percorso)
```
feature UI (payload) → hook (useX) → supabase.from('tabella').insert/select
                                    → [database.types.ts NON protegge il payload]
                                    → PostgREST → schema live (restore Nov-2025 + patch manuali)
                                    → se colonna assente ⇒ PGRST204 a runtime
```
Il punto di rottura è sempre lo **stesso**: il tipo generato non riflette il live, quindi il compilatore
lascia passare payload che il DB rifiuta.

---

## 4. Schema target audit-grade (delta vs live)

| Campo/tabella | Live oggi (snapshot A0) | Target (audit-grade §3) | Migration/gap |
|---------------|-------------------------|--------------------------|---------------|
| `temperature_readings.method, notes, photo_evidence, recorded_by` | ❌ assenti | presenti + **append-only** (una lettura non si modifica/cancella); `recorded_by` = chi-ha-registrato | Migration **015** (P0) |
| `temperature_readings` (immutabilità) | nessun vincolo | no UPDATE/DELETE post-insert; retention pluriennale per controllo | policy/trigger append-only |
| `maintenance_completions` (chi-quando) | `next_due_date` + `completed_by`/`completed_by_name`/`completed_at` | rendere l'attribuzione **immutabile** (append-only) | trigger ricorrenza `20260201` già live; tracciarlo nel canale unico |
| RPC shopping (×4) | ❌ assenti | presenti + RLS | Migration **007** + `shopping_lists_policies.sql` (P0) |
| `companies` estesi (`phone, vat_number, license_number`) | ❌ assenti | decidere se servono (vedi §6) | migration companies |
| `notification_preferences` | ❌ tabella assente | creare **o** rimuovere la UI | decisione owner |
| `products` scadenze (`expired_at`, reinsert, `archived`) | ❌ assenti | supporto ciclo scadenza/riordino | migration products |
| `products.par_level` + conteggi rimanenze (dec.12) | ❌ assenti | scorta minima «dovrei avere N» + storico conteggi (`stock_counts` o `counted_at/by`) per giro d'inventario | migration nuova |
| tipo mansione **«Inventario»** (dec.12) | ❌ solo manutenzioni | task ricorrente assegnabile → reminder in Oggi, giro punti in Reparti | schema tasks + generatore ricorrenze |
| **`shift_seals`** (timbro fine turno, dec. 7 «sigilla la giornata») | ❌ tabella assente | **nuova tabella append-only**: `company_id`, `user_id`, `opened_at`, `closed_at`, `attestation` (tutto-registrato) — immutabile come i registri; firma che chiude il turno | migration nuova (design Track A) |
| `database.types.ts` | obsoleto | **rigenerato dal live** dopo le migration | `generate_typescript_types` |
| canale migration | doppio, `list_migrations`=[] | canale **unico e tracciato** | consolidamento `database/` vs `supabase/` (BUG-DB-003) |

> ⚠️ Numeri/soglie HACCP **non** vanno qui: vivono in `src/compliance/haccp-rules.ts` (§14.3). Qui solo STRUTTURA.

---

## 5. Verdetto riuso
- ♻️ **Riuso:** `client.ts` singleton `createClient<Database>` · `helpers.ts` (`Db*` + computed, pattern-modello) · `sentry.ts` · `authSessionManager` · `CSRFService` (client layer).
- ✍️ **Riscrivo:** `database.types.ts` (rigenerare dal live) · custom types `conservation/inventory/auth/shopping.ts` → convergere su `helpers.ts` · query di `HACCPReportGenerator/ExcelExporter/EmailScheduler` (colonne obsolete).
- 🗑️ **Butto (dead code):** interfacce DEPRECATED in `client.ts` · ~15 servizi B.9/B.10 senza import UI (`WorkflowAutomationEngine`, `MultiTenantManager/Dashboard`, `SecurityDashboard`, `ComplianceMonitor`, `AdvancedAnalyticsIntegration`, `ProductionDeploymentManager`, `test-b10-*`…).
- ❓ **Dipende da owner:** (a) canale migration unico `database/` **o** `supabase/`; (b) `companies` estesi — servono in beta? (c) `notification_preferences` — feature o taglio? (d) colonne scadenze `products` — quanto ciclo di riordino in beta?

---

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ **Ufficiale-HACCP:** le letture temperatura e i completamenti manutenzione devono essere **immutabili e attribuibili** (chi-cosa-quando) per reggere un controllo → `temperature_readings` e `maintenance_completions` sono le tabelle audit-grade critiche; oggi `temperature_readings` non registra nemmeno `recorded_by`. Serve definire **retention** (quanti anni) e **append-only** a livello DB, non solo UI.
- 👨‍🍳 **Ristoratore:** quante di queste tabelle "ricche" servono davvero in beta? Il rischio è portare in produzione uno schema pesante (multi-tenant B.10, analytics) che nessuno usa. La lente ristoratore spinge a **tagliare** il dead code B.9/B.10 e tenere solo ciò che alimenta le 4 lenti reali.

---

## 7. Non verificato / rimandato
- **Schema live NON ri-verificato in sessione** (token MCP non raggiunge `hjteuounjwkadmsbsmdm`): tutti gli stati ✅/❌ live provengono dal Supplemento A0 del 2026-07-05. Da riconfermare quando il token è ripristinato.
- **RLS policy per-tabella**: A0 rimanda ad A1; advisory MCP segnalava RLS disabilitato su `admin_users`, `restaurant_settings` (verificare — quei nomi appartengono però a un DB diverso, vedi nota accesso).
- **Runtime export PDF/Excel**: mai eseguito E2E; probabile fallimento silenzioso.
- **Esistenza reale RPC sul remoto**: A7 la deduce dai tipi; A0/A5 la confermano assente per shopping. Le altre RPC (`log_user_activity`, `is_admin`) non ri-verificate live.
- **Audit `database/migrations/` vs `supabase/migrations/`**: diff mirato pendente prima di scegliere il canale unico.

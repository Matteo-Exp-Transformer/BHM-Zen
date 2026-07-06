## Report FASE 3 — Area A7 Shared / Services / Types

**Data**: 2026-07-05  
**Agente**: A7  
**Modalità**: read-only  
**Priorità area**: P2  
**Esito area**: 🔴 (layer condiviso disallineato da schema DB reale; BUG-004/TYPE-001 confermati e quantificati)

---

### 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 38 |
| Allineati doc↔codice | 5 |
| Gap critici | 4 |
| Gap medi/bassi | 12 |
| Non verificato (runtime) | 3 |

**Sintesi in parole semplici**

- **Cosa sono `src/types/`, `src/services/` e `src/lib/`**: sono il “sottofondo” dell’app — i tipi TypeScript che descrivono i dati, i servizi che parlano con Supabase (report, inviti, liste spesa, CSRF, export PDF), e la configurazione del client Supabase/Sentry. Non sono schermate visibili, ma tutte le aree (Conservation, Settings, Inventory…) passano da qui.
- **`database.types.ts`**: file generato automaticamente da Supabase — è la “fotografia” dello schema DB che TypeScript crede esista. Oggi descrive tabelle con colonne **base** (es. `temperature_readings` senza `method`, `companies` senza `license_number`, `conservation_points` con `setpoint_temp` invece di `temperature_min/max`).
- **Custom types** (`conservation.ts`, `inventory.ts`, `client.ts`…): descrivono un modello dati **più ricco** o **più vecchio** del DB reale. Il codice runtime invia campi che il DB non ha → BUG-005; TypeScript non blocca perché spesso si usano cast `as Company` o oggetti payload con proprietà in eccesso.
- **BUG-004 e TYPE-001 confermati**: `npm run type-check` → **163 errori** totali; **58** solo in `src/services/`. Il BUG_TRACKER stima “~50 incompatibilità” — la stima è **conservativa** (sottostimata).
- **Servizi export HACCP**: `HACCPReportGenerator` esiste ed è collegato a `useExportManager`, ma interroga colonne/tabelle con schema **obsoleto** (`license_number`, `temperature_min`, tabella `tasks` con `title`/`type`). Sezioni “azioni correttive” e “formazione staff” sono **stub vuoti** (TODO righe 236-237).
- **RPC mancanti nei tipi**: `database.types.ts` espone **1 sola** function (`cleanup_expired_csrf_tokens`), ma i servizi chiamano **10+ RPC** (`log_user_activity`, `create_shopping_list_with_items`, `is_admin`…). I tipi generati sono incompleti rispetto al codice.

---

### 5.2 Matrice verifica

| Feature/Componente | Doc dice (FASE 2 / BUG_TRACKER) | Codice reale | DB/Schema (`database.types.ts`) | Esito |
|--------------------|--------------------------------|--------------|----------------------------------|-------|
| **BUG-004 type mismatches** | ~50 incompatibilità custom vs generati | 163 errori TS; cast `as Company`/`as HACCPConfig` in Settings | Tipi generati riflettono schema **base** restore | ❌ `verificato-rotto` — BUG-004 **confermato e sottostimato** |
| **TYPE-001 migrazione types** | Piano 4 step; priorità MEDIUM | `helpers.ts` espone `Db*` aliases + computed helpers; **non adottato** massivamente | Parziale copertura | ⚠️ `verificato-gap` — tech debt aperto |
| **`database.types.ts` — temperature_readings** | Migration 015 aggiunge `method`, `notes`… | Custom type `conservation.ts:47-50` li dichiara opzionali | Row: solo `company_id`, `conservation_point_id`, `created_at`, `id`, `recorded_at`, `temperature` (`database.types.ts:1647-1655`) | ❌ `verificato-rotto` — allineato a BUG-005 |
| **`client.ts` — Supabase singleton** | BUG-002 risolto: client tipizzato | `createClient<Database>` — `client.ts:18-23` | Usa `Database` import | ✅ `verificato-ok` |
| **`client.ts` — interfacce duplicate DEPRECATED** | Non documentato | Esporta `Company`, `Staff`, `TemperatureReading`, `HACCPConfiguration`, `NotificationPreferences` (`client.ts:50-288`) con schema **diverso** da `database.types.ts` | Es. `TemperatureReading.reading_time` vs DB `recorded_at`; `ConservationPoint.temperature_min/max` vs DB `setpoint_temp` | ❌ `verificato-gap` — **triplicazione tipi** (client / types/* / database.types) |
| **`helpers.ts` bridge types** | TYPE-001 step 2 | `DbStaff`, `DbTemperatureReading`, `computeTemperatureStatus` — buon pattern | Allineato a DB generato | ✅ `verificato-ok` — modello da replicare |
| **`conservation.ts` TemperatureReading** | Doc Conservation: campi method/notes | Opzionali righe 47-50; TODO filtri status/method righe 522-523 | Non in DB types | ⚠️ `verificato-gap` — anticipa migration 015 non applicata |
| **`inventory.ts` ProductCategory** | Categorie con allergeni | `allergen_info: string[]` required — `inventory.ts:65` | `product_categories` Row: solo `id, company_id, name, created_at, updated_at` | ❌ `verificato-gap` — causa errori `useCategories.ts:40,64,100` |
| **`shopping.ts` ShoppingListItem** | Liste spesa funzionanti | `shopping_list_id`, `is_checked`, `added_at` | DB ha stessi campi (`database.types.ts:1302-1318`) | ⚠️ `verificato-gap` — mismatch su `product_id` nullability e RPC |
| **`auth.ts` AuthUser** | Login hardening 2025 | `AuthUser` con `tenant_id`, `first_name`… | Supabase `User` non ha questi campi — mismatch in `authClient.ts:328` | ⚠️ `verificato-gap` |
| **CompanyConfiguration** | Settings: dati azienda | Interface locale con `phone, vat_number, license_number…` — cast `as Company` | DB `companies`: `name, address, email, staff_count` only | ❌ `verificato-gap` — TS2352 `CompanyConfiguration.tsx:45` |
| **HACCPSettings** | Config HACCP strutturata | Interface flat `temperature_thresholds`, `alert_settings` | DB `haccp_configurations`: `configuration_name, configuration_type, settings: Json` | ❌ `verificato-gap` — TS2352/2769 `HACCPSettings.tsx:95,123` |
| **NotificationPreferences** | Tabella preferenze notifiche | Query `.from('notification_preferences')` | Tabella **assente** in `database.types.ts` | ❌ `verificato-rotto` — TS2769 `NotificationPreferences.tsx:102,130,138` |
| **HACCPReportGenerator** | Export report ispezione HACCP | Implementato 585 righe; usato da `useExportManager.ts:8` | Query colonne inesistenti: `companies.license_number`, `conservation_points.temperature_min/max`, `tasks.title` | ❌ `verificato-gap` — TS errori `HACCPReportGenerator.ts:202-215` |
| **HACCPReportGenerator — sezioni stub** | Report completo legalmente | `correctiveActions: []`, `staffTraining: []` TODO | N/A | ⚠️ `verificato-gap` — `HACCPReportGenerator.ts:236-237` |
| **EmailScheduler** | Schedulazione email report | Usa `frequency, time, day_of_week, day_of_month` | DB `email_schedules`: `schedule_type, schedule_name, next_scheduled, recipients: Json` | ❌ `verificato-gap` — schema diverso; TS errori multipli |
| **ExcelExporter** | Export Excel dati HACCP | Attivo via `useExportManager` | Query `conservation_points.temperature_min` — colonna assente | ⚠️ `verificato-gap` — `ExcelExporter.ts:312` |
| **shoppingListService** | CRUD liste via RPC | 5 chiamate `supabase.rpc(...)` | RPC **non** in `database.types.ts` Functions | ❌ `verificato-gap` — TS2345 su ogni RPC |
| **activityTrackingService** | Tracking attività admin | 7 RPC (`log_user_activity`, `get_active_sessions`…) | Solo `cleanup_expired_csrf_tokens` in Functions | ❌ `verificato-gap` — 7 errori TS2345 |
| **inviteService** | Inviti staff | RPC `is_admin`; type `InviteToken` vs Row DB | `role: string` vs union `StaffRole` | ⚠️ `verificato-gap` — 8+ errori TS |
| **CSRFService** | CSRF client-side | Implementato; token in localStorage | Edge/server CSRF via migration supabase | ✅ `verificato-ok` (client layer) |
| **RememberMeService** | Remember me auth | Usato da `useAuth.ts`; Edge Function | Non verificato runtime | ⚠️ `non-verificato` |
| **authSessionManager** | Singleton session listener | Pattern corretto anti-duplicati listener | N/A | ✅ `verificato-ok` |
| **sentry.ts** | Error tracking prod | Init condizionale su `VITE_SENTRY_DSN` | N/A | ✅ `verificato-ok` |
| **MultiTenantDashboard / MultiTenantManager** | Dashboard multi-tenant B.10 | File esistono; **zero import** da feature UI (confermato anche A4) | N/A | ⚠️ `verificato-gap` — dead code |
| **AdvancedAnalyticsIntegration** | Analytics avanzate B.10.2 | Stub con mock objects; import reali commentati | N/A | ⚠️ `verificato-gap` — scaffolding |
| **WorkflowAutomationEngine, IntelligentAlertManager, SmartSchedulingService** | Automazione B.10 | Esportati da `automation/index.ts`; no import UI | N/A | ⚠️ `verificato-gap` — dead code |
| **ProductionDeploymentManager, AdvancedServiceWorker** | PWA/deployment B.10 | Nessun import da `App.tsx` o features | N/A | ⚠️ `verificato-gap` — dead code |
| **SecurityDashboard, ComplianceMonitor, AuditLogger** | Security B.9 | Solo `security/test-integration.ts` e index | N/A | ⚠️ `verificato-gap` — non integrati UI |
| **BackgroundSync / IndexedDBManager** | Offline sync | Test unitari; import limitato | Tabelle sync non in DB types | ⚠️ `verificato-gap` |
| **RealtimeConnectionManager** | Realtime Supabase | Usato da `useRealtime.ts`; API `onOpen/onClose/onError` obsolete | N/A | ⚠️ `verificato-gap` — TS2339 API Supabase v2 |
| **TemperatureMonitor** | Monitor realtime temperature | Import da `useRealtime.ts` | Dipende da `temperature_readings` | ⚠️ `verificato-gap` — impattato BUG-005 |
| **Cross-ref BUG-005** | Insert fallisce su `method` | Payload in feature (non A7) invia campi extra | `database.types.ts` Insert **non** include `method` — TS non segnala (excess props su variabile) | ❌ `verificato-rotto` — types non proteggono da drift DB |

---

### 5.3 Bug confermati (nuovi o aggiornati)

> **Nota**: non modificato `BUG_TRACKER.md` (competenza consolidatore A8).

| ID suggerito | Severity | Evidenza | File:Riga |
|--------------|----------|----------|-----------|
| **BUG-004** (aggiornamento) | MEDIUM | Conteggio reale **163 errori TS** (non ~50). 58 in `src/services/` da solo. Cast unsafe diffusi | `npm run type-check` 2026-07-05 |
| **TYPE-001** (conferma) | MEDIUM | 7 aree BUG_TRACKER confermate + drift servizi export/RPC | Vedi matrice §5.2 |
| **BUG-013** | HIGH | `database.types.ts` Functions incompleto: 1 RPC vs 10+ usate nel codice → type-safety RPC assente | `database.types.ts:1963-1965` vs `activityTrackingService.ts:27,140,174…`, `shoppingListService.ts:32,74,251` |
| **BUG-014** | HIGH | `HACCPReportGenerator` query schema obsoleto (`license_number`, `temperature_min/max`, `tasks.title`) — report PDF potenzialmente vuoto/errato | `HACCPReportGenerator.ts:167-197,202-205` |
| **BUG-015** | MEDIUM | `EmailScheduler` usa colonne `frequency/time/day_of_week` assenti in `email_schedules` DB types | `EmailScheduler.ts:152-160` vs `database.types.ts:523-536` |
| **BUG-016** | MEDIUM | Triplicazione tipi deprecated in `client.ts` conflitto con `src/types/*` e DB generato | `client.ts:156-165` (`reading_time`) vs `database.types.ts:1653` (`recorded_at`) |
| **BUG-017** | MEDIUM | `NotificationPreferences.tsx` query tabella `notification_preferences` **inesistente** nei tipi generati | `NotificationPreferences.tsx:102,130,138` |
| **BUG-018** | LOW | ~15 servizi B.9/B.10 scaffolding senza integrazione UI (dead code ~30% cartella services) | `src/services/` grep import |

---

### 5.4 Documentazione obsoleta

| Path doc | Claim errato | Evidenza | Azione suggerita |
|----------|--------------|----------|------------------|
| `BUG_TRACKER.md` TYPE-001 | "~50 incompatibilità" | 163 errori TS attuali | Aggiornare conteggio e aggiungere servizi/RPC |
| `BUG_TRACKER.md` BUG-004 | "Multiple files" generico | Elenco verificato: settings 3 file, services export 3, inventory hooks 2, management 1, auth 1 | Dettagliare per consolidatore A8 |
| Export HACCP (implicito in feature docs) | Report ispezione completo | Sezioni correctiveActions/staffTraining vuote | Marcare `verificato-gap` in catalogo |
| `client.ts` commento DEPRECATED UserProfile | "in fase di deprecazione" | Ancora esportato; duplica tipi attivi | Documentare piano rimozione in TYPE-001 |

---

### 5.5 Aggiornamenti catalogo

Proposta append sezione **FASE 3 — 3.7 Shared/Services/Types** (per A8):

| DOC-id o path | Campo aggiornato | Nuovo valore `stato_percepito` |
|---------------|------------------|--------------------------------|
| BUG-004 | severity/evidence | `verificato-rotto` — 163 errori TS, cast unsafe |
| TYPE-001 | scope | `verificato-gap` — helpers.ts ok, adozione parziale |
| `src/types/database.types.ts` | allineamento schema | `verificato-gap` — riflette DB base, non migration 015+ |
| `src/lib/supabase/client.ts` | tipi duplicati | `verificato-gap` — DEPRECATED interfaces attive |
| `src/services/export/HACCPReportGenerator.ts` | funzionalità | `verificato-gap` — stub sezioni + schema query obsoleto |
| `src/services/export/EmailScheduler.ts` | funzionalità | `verificato-gap` — schema colonne mismatch |
| `src/services/*` (B.10 scaffolding) | utilità | `verificato-gap` — dead code non integrato |
| `src/types/helpers.ts` | pattern migrazione | `verificato-ok` — modello corretto |

---

### 5.6 Non verificato / fuori scope

- **Runtime export PDF/Excel**: non eseguito E2E; errori TS indicano probabile fallimento silenzioso o dati N/A.
- **Regenerazione `database.types.ts`**: non rieseguita; analisi basata su file in repo.
- **RPC esistenza su DB remoto**: non interrogato MCP Supabase in questa sessione; gap dedotto da tipi generati vs chiamate codice.
- **Edge Functions** (RememberMe, CSRF server): fuori scope A7 stricto (cartella `supabase/functions/`).
- **Fix codice / apply migration**: esplicitamente fuori scope Fase 3.

---

### Appendice A — Inventario `src/types/` (12 file)

| File | Ruolo | Allineamento DB |
|------|-------|-----------------|
| `database.types.ts` | Generato Supabase (~2097 righe) | Baseline schema remoto attuale |
| `conservation.ts` | Tipi Conservation UI + filtri | Gap: campi migration 015 opzionali |
| `inventory.ts` | Prodotti, categorie, allergeni | Gap: `allergen_info`, `reinsertion_count` |
| `shopping.ts` | Liste spesa | Quasi allineato; nullability |
| `auth.ts` | Auth hardening (CSRF, sessioni) | Gap: `AuthUser` vs Supabase User |
| `calendar.ts` / `calendar-filters.ts` | Eventi calendario | Gap: metadata custom vs DB tasks |
| `onboarding.ts` | Wizard onboarding | Non verificato vs DB |
| `activity.ts` | Activity tracking admin | Dipende da RPC assenti in types |
| `shared.ts` | Event, Note generici | Possibile drift tabelle |
| `helpers.ts` | Db* aliases + computed | ✅ Allineato |
| `env.d.ts` | Vite env vars | ✅ OK |

---

### Appendice B — Inventario `src/services/` (51 file, uso reale)

**Servizi con import da feature/hooks (attivi):**

| Servizio | Importato da | Note |
|----------|--------------|------|
| `auth/inviteService` | `useInvites`, RegisterPage | Errori type RPC `is_admin` |
| `auth/RememberMeService` | `useAuth` | Runtime non verificato |
| `security/CSRFService` | `useCsrfToken` | OK client-side |
| `export/HACCPReportGenerator` | `useExportManager` | Schema query obsoleto |
| `export/ExcelExporter` | `useExportManager` | Colonne conservation obsolete |
| `export/EmailScheduler` | `useExportManager` | Schema email_schedules mismatch |
| `shoppingListService` | inventory/shopping hooks | RPC non tipizzate |
| `activityTrackingService` | `useActivityTracking`, `useAuth` | 7 RPC non in types |
| `realtime/TemperatureMonitor` | `useRealtime` | Impattato BUG-005 |
| `realtime/RealtimeConnectionManager` | `useRealtime` | API Supabase obsolete |
| `offline/BackgroundSync` | test + hook limitato | Errori insert tipizzati |

**Servizi senza import UI (dead code / scaffolding B.9-B.10):**

`AutomatedReportingService`, `WorkflowAutomationEngine`, `IntelligentAlertManager`, `SmartSchedulingService`, `MultiTenantManager`, `CrossCompanyReporting`, `MultiTenantDashboard`, `ProductionDeploymentManager`, `AdvancedServiceWorker`, `AutomationServiceWorker`, `AutomationCacheManager`, `SecurityDashboard`, `ComplianceMonitor`, `CollaborativeEditing`, `AdvancedAnalyticsIntegration`, `SystemIntegrationTester`, `PerformanceBenchmarker`, `test-b10-*`, `test-integration.ts`

---

### Appendice C — Cross-reference A0 (schema drift)

| Entità | `database.types.ts` | Custom types / services | Impatto |
|--------|----------------------|-------------------------|---------|
| `temperature_readings` | 6 colonne base | `conservation.ts` + payload feature: +4 campi | BUG-005 |
| `conservation_points` | `setpoint_temp`, `status`, `type` | `client.ts`: `temperature_min/max`; HACCPReport: stesso | Export/report errati |
| `companies` | 7 colonne | `CompanyConfiguration`, HACCPReport: +6 campi | Settings cast unsafe |
| `haccp_configurations` | Json `settings` | `HACCPSettings`: struttura flat tipizzata | Settings non type-safe |
| `notification_preferences` | **Tabella assente** | `NotificationPreferences.tsx` query diretta | Feature potenzialmente rotta |
| `email_schedules` | `schedule_type`, `next_scheduled` | `EmailScheduler`: `frequency`, `time` | Scheduler non type-safe |
| `Functions` (RPC) | 1 function | 10+ chiamate in services | BUG-013 |

---

### Appendice D — Comando verifica

```bash
npm run type-check
# Output 2026-07-05: 163 errori TS
# src/services/: 58 errori
# settings (Company/HACCP/Notification): 7 errori
```

---

**Esito area finale**: 🔴 — Il layer condiviso **non garantisce type-safety** rispetto al DB deployato. BUG-004/TYPE-001 restano aperti; i servizi export e RPC amplificano il rischio oltre le ~50 incompatibilità documentate. Priorità post-Fase-3: rigenerare `database.types.ts` dopo apply migration mancanti (A0), poi convergere custom types verso `helpers.ts` pattern.

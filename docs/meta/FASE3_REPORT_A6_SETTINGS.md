## Report FASE 3 — Area A6 Settings + Management

**Data**: 2026-07-05  
**Agente**: A6  
**Modalità**: read-only  
**Esito area**: 🔴 (gap critici su Settings DB; Management parziale)  
**Supplemento DB**: 2026-07-05 · MCP `supabase-bhm` (progetto `hjteuounjwkadmsbsmdm`, read-only)

---

### 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 14 |
| Allineati doc↔codice | 3 |
| Gap critici | 5 |
| Gap medi/bassi | 4 |
| Non verificato (runtime) | 1 |

**In sintesi**: l’area **Management** (reparti + lettura staff + toggle stato + inviti) è in gran parte funzionante a livello codice/hook. Il **CRUD staff dalla UI** (`StaffManagement`) è uno **stub** non collegato a `useStaff` (già noto in BUG_TRACKER). L’area **Settings** ha UI completa ma **3 delle 4 sezioni** (`CompanyConfiguration` campi estesi, `HACCPSettings`, `NotificationPreferences`) sono **disallineate dallo schema DB reale**; `UserManagement` aggiorna `user_profiles` mentre i permessi runtime usano `company_members`. Documentazione APP_DEFINITION **06_SETTINGS** e **07_MANAGEMENT** **inesistente** (solo checklist in `00_MASTER_INDEX.md`).

---

### 5.2 Matrice verifica

| Feature/Componente | Doc dice (FASE 2) | Codice reale | DB/Schema | Esito |
|--------------------|-------------------|--------------|-----------|-------|
| **SettingsPage** (`/impostazioni`) | Non documentato; admin only | 4 sezioni CollapsibleCard; guard `hasRole(['admin'])` + `ProtectedRoute requiredRole="admin"` (`App.tsx:182-187`, `SettingsPage.tsx:30`) | N/A | ✅ UI + auth OK |
| **CompanyConfiguration** | Company config atteso | CRUD su `companies` con campi custom `phone`, `vat_number`, `business_type`, `established_date`, `license_number` (`CompanyConfiguration.tsx:7-18`, `57-61`) | `companies` ha solo `id,name,address,staff_count,email,created_at,updated_at` (`database.types.ts:166-175`). **RLS remoto**: abilitato; SELECT membri attivi + policy onboarding; UPDATE solo `is_admin(id)` (MCP) | ❌ Salvataggio campi estesi → probabile `PGRST204`; UPDATE campi base OK per admin |
| **HACCPSettings** | HACCP config atteso | Payload flat `temperature_thresholds`, `alert_settings`, `compliance_settings` (`HACCPSettings.tsx:13-40`, `105-123`) | Schema: `configuration_name`, `configuration_type`, `settings` (Json). **RLS remoto**: abilitato; CRUD per qualsiasi `company_members` attivo (non solo admin) — più permissivo della UI Settings (admin only) | ❌ Schema payload incompatibile; RLS non è il blocco principale |
| **NotificationPreferences** | Notifiche attese | Query/insert su `notification_preferences` (`NotificationPreferences.tsx:101-139`) | Tabella **assente** su remoto MCP (`information_schema`: `table_exists = false`) e in `database.types.ts` | ❌ Runtime fallisce (tabella inesistente) — conferma TYPE-001 / BUG_TRACKER |
| **UserManagement** | Gestione utenti attesa | Legge/aggiorna `user_profiles.role` e `staff_id` (`UserManagement.tsx:55-74`, `109-112`) | `user_profiles` RLS: SELECT admin propria company + own profile; **UPDATE solo own profile** (`auth_user_id = auth.uid()`). Nessuna policy admin UPDATE su altri profili (MCP) | ⚠️ Cambio ruolo altri utenti **bloccato da RLS** + permessi reali su `company_members` |
| **Audit log Settings** | Footer: "modifiche registrate nel log di audit" | Nessuna scrittura `user_activity_logs` / `audit_logs` nei componenti settings | `user_activity_logs` esiste ma non integrata qui | ⚠️ Claim UI fuorviante |
| **ManagementPage** (`/gestione`) | UI presente | Admin/responsabile guard (`ManagementPage.tsx:26`, `App.tsx:192-196`); stats da hook | N/A | ✅ |
| **DepartmentManagement** | Reparti gestibili | CRUD completo via `useDepartments` (`DepartmentManagement.tsx:51-76`, `useDepartments.ts:66-180`) | `departments` allineata; **RLS**: SELECT `is_company_member`; INSERT/UPDATE/DELETE `has_management_role` (MCP) — coerente con UI admin/responsabile | ✅ |
| **StaffManagement — lista** | UI presente | Fetch da `useStaff`; filtri reparto; `StaffCard` | `staff` allineata (`database.types.ts:1424-1456`). **RLS**: SELECT `is_company_member(company_id)` (MCP) | ✅ lettura |
| **StaffManagement — create/update/delete** | **CRUD non implementato** (BUG_TRACKER 07-01) | `handleSubmit`/`handleDelete` = `console.log` + TODO (`StaffManagement.tsx:50-64`); hook **ha** mutazioni (`useStaff.ts:100-213`) ma **non collegate** | **RLS remoto OK** per INSERT/UPDATE/DELETE se `has_management_role(company_id)` — allineato a `company_members.role IN ('admin','responsabile')` (`database/policies/rls_policies.sql:81-100`) | ❌ Gap UI↔hook; DB/RLS **non** bloccano il fix |
| **StaffManagement — toggle status** | — | `toggleStaffStatus` collegato (`StaffManagement.tsx:67-71`) | UPDATE su `staff` coperto da policy `Managers can update staff` (MCP) | ✅ |
| **StaffManagement — invito email** | — | `createInviteToken` da `inviteService` (`StaffManagement.tsx:89-95`) | Dipende da auth/invite (A1) | ⚠️ Codice presente; runtime non testato |
| **useStaff role type** | TYPE-001 | `role: 'admin' \| ...` custom vs `role: string` in DB types | `staff.role` è `string` generato | ⚠️ Type-safety parziale |
| **Navigazione bottom bar** | — | Tab Impostazioni (admin), Gestione (admin/responsabile) (`MainLayout.tsx:65-80`) | N/A | ✅ |
| **Onboarding → staff/reparti** | Staff creato in wizard | `onboardingHelpers.ts` insert su `staff`/`departments` (`~1697-1699`) | Allineato a schema `staff` | ✅ percorso alternativo a Management UI |
| **Onboarding → company campi estesi** | — | `onboardingHelpers` tenta `phone`, `vat_number`, ecc. su `companies` (`2535-2542`) | Colonne assenti nello schema base | ❌ Stesso drift di CompanyConfiguration |

---

### 5.3 Bug confermati (nuovi o aggiornati)

> Non modificato `BUG_TRACKER.md` (competenza A8). Proposte ID:

| ID suggerito | Severity | Evidenza | File:Riga |
|--------------|----------|----------|-----------|
| **BUG-007** (conferma esistente implicita) | **HIGH** | StaffManagement non chiama mutazioni `useStaff`; solo `console.log` | `StaffManagement.tsx:50-64` |
| **BUG-008** | **HIGH** | `CompanyConfiguration` invia colonne inesistenti su `companies` | `CompanyConfiguration.tsx:57-61` vs `database.types.ts:166-175` |
| **BUG-009** | **HIGH** | `HACCPSettings` payload non mappa su `haccp_configurations.settings` + mancano `configuration_name`/`configuration_type` | `HACCPSettings.tsx:105-123` vs `database.types.ts:617-627` |
| **BUG-010** | **HIGH** | `NotificationPreferences` query tabella assente nel schema generato | `NotificationPreferences.tsx:101-102`; assente in `database.types.ts` |
| **BUG-011** | **HIGH** | Cambio ruolo in UserManagement aggiorna `user_profiles` ma `hasRole()` legge `company_members.role`; RLS `user_profiles` consente UPDATE solo sul proprio profilo (MCP) | `UserManagement.tsx:109-112` vs `useAuth.ts:375-387` |
| **BUG-012** | **MEDIUM** | Footer Settings promette audit log non implementato nei save handler | `SettingsPage.tsx:133-134` |
| TYPE-001 (esistente) | MEDIUM | Confermati mismatch `CompanyConfiguration`, `HACCPSettings`, `NotificationPreferences` | `BUG_TRACKER.md:101-103` |

---

### 5.4 Documentazione obsoleta

| Path doc | Claim errato | Evidenza | Azione suggerita |
|----------|--------------|----------|------------------|
| `APP_DEFINITION/00_MASTER_INDEX.md` §06_SETTINGS, §07_MANAGEMENT | 11 elementi da documentare | Cartelle `06_SETTINGS/` e `07_MANAGEMENT/` **non esistono** nel repo | Creare conoscenze-definizioni post-fix o marcare `non-verificato` fino a Fase implementativa |
| `CATALOGO...FASE1.md` riga 27616-27617 | "Company config, HACCP, notifiche" come feature attese | 3/4 sezioni Settings rotte a livello schema | Aggiornare FASE 3 → `verificato-rotto` per quelle feature |
| `SettingsPage.tsx` footer | "Tutte le modifiche vengono registrate nel log di audit" | Nessun hook audit nei componenti figli | Rimuovere claim o implementare logging (fase successiva) |
| `UserManagement.tsx:29-37` | Deprecazione `user_profiles` → `company_members` | Codice usa ancora `user_profiles` per ruolo | Allineare a `company_members` o documentare dual-write |

---

### 5.5 Aggiornamenti catalogo (proposta per A8)

| DOC-id / path | Campo | Nuovo `stato_percepito` |
|---------------|-------|-------------------------|
| FASE 2 matrice — Impostazioni | feature row | `verificato-rotto` (Company/HACCP/Notifiche) |
| FASE 2 matrice — Gestione staff/reparti | feature row | `verificato-gap` (reparti OK, staff CRUD UI stub) |
| `00_MASTER_INDEX` §06_SETTINGS | intera sezione | `non-verificato` (docs assenti) |
| `00_MASTER_INDEX` §07_MANAGEMENT | intera sezione | `verificato-gap` (codice parziale, no docs) |

### Append catalogo FASE 3 — sottosezione 3.6 (bozza per A8)

```markdown
### 3.6 — Settings + Management (2026-07-05)
**Agente**: A6
**Esito area**: 🔴

| Feature | Doc (FASE 2) | Verifica codice | Verifica DB | Stato finale |
|---------|--------------|-----------------|-------------|--------------|
| Configurazione azienda (campi base) | ❓ | ✅ name/address/email | ✅ colonne esistono | 🟢 parziale |
| Configurazione azienda (P.IVA, telefono, tipo) | ❓ | ❌ UI presente | ❌ colonne assenti | 🔴 BLOCCATO |
| Impostazioni HACCP | ❓ | ❌ payload flat | ❌ schema Json + metadata | 🔴 BLOCCATO |
| Preferenze notifiche | ❓ | ❌ query tabella | ❌ tabella assente | 🔴 BLOCCATO |
| Gestione utenti/ruoli (Settings) | ❓ | ⚠️ aggiorna tabella sbagliata | ⚠️ dual model profiles/members | 🟡 GAP |
| CRUD reparti (Management) | UI presente | ✅ useDepartments wired | ✅ departments | 🟢 OK |
| CRUD staff (Management UI) | ❌ non implementato | ❌ TODO stub | ✅ schema + RLS `has_management_role` OK (MCP) | 🔴 BLOCCATO UI (non DB) |
| Staff toggle / inviti | — | ✅ toggle; invito codificato | ✅ UPDATE policy managers (MCP) | 🟡 parziale |
```

---

### 5.6 Non verificato / fuori scope

- **Runtime E2E** su salvataggio Company/HACCP/Notifiche (inferito da schema — stesso pattern BUG-005).
- **Esito invito staff** (`createInviteToken`) — dipende da area Auth (A1).
- **Integrazione soglie HACCP** con Conservation/alert system — nessun consumer di `haccp-config` query fuori da Settings/HeaderButtons invalidate.
- Test automatici: **0 test** in `src/features/settings/` e `src/features/management/`.

### Supplemento DB — RLS (MCP `supabase-bhm`, read-only)

Verifica eseguita con `execute_sql` su progetto remoto BHM.

#### `staff` — RLS abilitato (`rls_enabled = true`)

| Policy | Comando | Condizione (semplificata) | Allineamento UI Management |
|--------|---------|---------------------------|----------------------------|
| Members can view staff | SELECT | `is_company_member(company_id)` | Qualsiasi membro attivo può leggere |
| Managers can create staff | INSERT | `has_management_role(company_id)` | Coerente con `/gestione` (admin/responsabile) |
| Managers can update staff | UPDATE | `has_management_role(company_id)` | Copre `toggleStaffStatus`; CRUD futuro OK lato DB |
| Managers can delete staff | DELETE | `has_management_role(company_id)` | Idem |

Helper `has_management_role` / `is_company_member` / `is_admin` leggono **`company_members`** (ruoli `admin`/`responsabile`), non `user_profiles` — coerente con `useAuth.hasRole()`.

**Conclusione staff**: il blocco CRUD è **solo UI** (`StaffManagement` stub). Schema + RLS remoto **pronti** per collegare `useStaff` create/update/delete.

#### Altre tabelle citate nel report (sintesi MCP)

| Tabella | RLS | Note operative per A6 |
|---------|-----|------------------------|
| `companies` | ✅ | UPDATE solo admin (`is_admin`); INSERT onboarding per utenti autenticati |
| `departments` | ✅ | Stesso pattern staff (member read / manager write) |
| `haccp_configurations` | ✅ | Qualsiasi membro company può CRUD — **più largo** del guard UI Settings (solo admin) |
| `user_profiles` | ✅ | Admin può **vedere** profili company; **UPDATE solo proprio** profilo — rafforza BUG-011 |
| `notification_preferences` | — | Tabella **inesistente** su remoto (`table_exists = false`) |

---

## Dettaglio tecnico per Owner

### Dove sono nell’app

| Percorso UI | Componente principale | Cosa fa |
|-------------|----------------------|---------|
| `/impostazioni` | `SettingsPage.tsx` | Hub impostazioni (solo admin): azienda, utenti, HACCP, notifiche |
| `/gestione` | `ManagementPage.tsx` | Hub gestione (admin/responsabile): reparti + staff |

### Storage / dati

| Componente | Tabella Supabase | Cosa contiene (reale) |
|------------|------------------|------------------------|
| `CompanyConfiguration` | `companies` | **DB**: nome, indirizzo, email, staff_count. **UI chiede anche**: telefono, P.IVA, tipo attività, data costituzione, n. licenza → **non esistono nel DB** |
| `HACCPSettings` | `haccp_configurations` | **DB**: nome config, tipo, `settings` JSON, flag attivo. **UI tratta** soglie temperatura e alert come colonne top-level → **incompatibile** |
| `NotificationPreferences` | `notification_preferences` | **Tabella non presente** nello schema generato |
| `UserManagement` | `user_profiles` + join `staff` | Profili utente legacy; ruoli effettivi in `company_members` |
| `DepartmentManagement` | `departments` | Nome reparto, `is_active`, `company_id` — **allineato** |
| `StaffManagement` / `useStaff` | `staff` | Nome, ruolo, categoria, email, certificazione HACCP (JSON), assegnazioni reparto, stato |

### Seed verifica (checklist piano)

| # | Verifica | Esito |
|---|----------|-------|
| 1 | CompanyConfiguration legge/scrive `companies` | ⚠️ Parziale: solo campi base in DB |
| 2 | HACCPSettings vs schema `haccp_configurations` | ❌ Mismatch strutturale |
| 3 | NotificationPreferences vs DB | ❌ Tabella assente su remoto (MCP conferma) |
| 4 | StaffManagement CRUD stub | ❌ Confermato (TODO 52-63); RLS staff **non** è causa |
| 5 | DepartmentManagement CRUD | ✅ Implementato; RLS departments OK (MCP) |
| 6 | BUG_TRACKER allineamento | ✅ 3 TODO Management confermati; TYPE-001 confermato |
| 7 | RLS `staff` (supplemento) | ✅ 4 policy attive; allineate a `database/policies/rls_policies.sql:81-100` |

---

**Fine report A6** · Prossimo step: consolidatore **A8** per merge in catalogo FASE 3 e `BUG_TRACKER.md`

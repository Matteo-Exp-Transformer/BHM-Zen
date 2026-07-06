# MAPPA — 🎬 Regia · setup + controllo + dossier (titolare)
**Data:** 2026-07-06 · **Fonte verità:** codice + snapshot DB live A1/A4/A6 (05-07) · **Report Fase 3 base:** A1, A4, A6 (+ A7 export)

> ⚠️ **Accesso DB**: schema live = **snapshot del 2026-07-05** (token MCP di sessione non raggiunge
> `hjteuounjwkadmsbsmdm`). Schema target: [`MAPPA_Fondamenta_DB-tipi.md`](./MAPPA_Fondamenta_DB-tipi.md).

---

## 1. Dove vive nel prodotto nuovo
- **Casa/lente (§12):** 🎬 **Regia** — la cabina del **titolare**: ① imposta (onboarding/setup), ③ controlla (dashboard), ④ dimostra (**dossier**/export). Ci vivono staff, ruoli, parametri HACCP.
- **Ruoli coinvolti:** **titolare/admin** (tutto) · **responsabile** (gestione staff/reparti, non impostazioni azienda).
- **Punto del loop §9.1:** copre ①③④ (l'unica lente che li tocca tutti e tre); ② vive nelle altre lenti.

> **Confine**: i **reparti** (departments) sono impostati qui ma **abitati** in Reparti (A2). I **profili di
> conservazione / soglie** si impostano qui ma le soglie normative vivono in `src/compliance/haccp-rules.ts` (§14.3).

---

## 2. Flusso utente (as-is → to-be)

### ① Imposto — onboarding/setup (A1)
| Passo | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|---------------|--------------------|
| Wizard 7 step (azienda, reparti, staff, conservazione, inventario…) | ✅ funziona; salva `companies` + `company_members` (RLS onboarding/signup **applicate live**) | Riuso; onboarding **obbligatorio** (vincolo rilancio) |
| Completamento onboarding | ⚠️ marcato **solo in `localStorage`** (`onboarding-completed`), **non** su `companies` | colonna DB `onboarding_completed` → stato server-side |
| Campo "numero licenza" | ❌ in UI ma **colonna assente** su `companies` | rimuovere il campo **o** aggiungere la colonna (decisione) |
| Campi azienda estesi (P.IVA, telefono, tipo) | ❌ `onboardingHelpers` tenta di scriverli ma le colonne non esistono | allineare schema/UI (vedi Settings sotto) |

### ③ Controllo — dashboard (A4)
| Passo | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|---------------|--------------------|
| Apre `/dashboard` | 🔴 monta **`HomePage`** (4 numeri, Quick Actions **morte**), **non** `DashboardPage` | montare la dashboard vera **o** decidere una home semplice per scelta |
| Dashboard ricca (KPI, grafici, trend) | ⚠️ `DashboardPage` **esiste ma orphan** (non nel router); contiene dati **fabbricati** (`turnover_rate:85`, task split 60/30/10) | collegare + sostituire i dati finti con reali |
| Pulsanti header pericolosi | 🔴 "Cancella e Ricomincia" + "Riapri Onboarding" **sempre visibili** (non gated DEV) — blocker pre-prod | gate DEV o rimozione |

### ④ Dimostro — dossier/export (A7)
| Passo | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|---------------|--------------------|
| Genera report ispezione HACCP (PDF) | ⚠️ `HACCPReportGenerator` esiste (584 righe) ma interroga **colonne obsolete** (`license_number`, `temperature_min/max`, `tasks.title`) | riscrivere query contro schema corretto |
| Sezioni "azioni correttive" e "formazione staff" | ⚠️ **stub vuoti** (TODO) | implementare — sono parti legalmente rilevanti del dossier |

### Staff & ruoli (A6)
| Passo | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|---------------|--------------------|
| CRUD reparti | ✅ `useDepartments` completo; RLS OK | Riuso |
| CRUD staff dalla UI | 🔴 `StaffManagement` = **`console.log` stub**; gli hook `useStaff` **esistono** ma non collegati; DB+RLS **pronti** | collegare UI↔hook (nessun blocco DB) |
| Cambio ruolo utente | ⚠️ `UserManagement` scrive `user_profiles.role`, ma i permessi runtime leggono `company_members.role`; RLS blocca UPDATE su profili altrui | scrivere su `company_members`; allineare modello ruoli |

---

## 3. Flusso dati (verità = codice + snapshot DB live)

### Tabelle / RPC toccate — stato LIVE

| Tabella | Stato live | Nota |
|---------|-----------|------|
| `companies` | ✅ base (`name, address, email, staff_count`) · ❌ `phone, vat_number, license_number, business_type, established_date` | RLS: UPDATE solo `is_admin`; INSERT onboarding OK |
| `company_members` | ✅ (ruolo effettivo) · RLS signup `WITH CHECK (true)` | **fonte di verità dei ruoli** (`useAuth.hasRole`) |
| `user_profiles` | ✅ · RLS: UPDATE **solo proprio** profilo | usata (erroneamente) da UserManagement per i ruoli |
| `staff` | ✅ allineata · RLS `has_management_role` per write | CRUD UI non collegato |
| `departments` | ✅ allineata · RLS member-read/manager-write | CRUD OK |
| `haccp_configurations` | ✅ (`configuration_name, configuration_type, settings: Json`) · RLS: **qualsiasi membro** CRUD (più largo del guard UI admin) | UI invia payload **flat** incompatibile |
| `notification_preferences` | ❌ **tabella assente** | UI la interroga → runtime fallisce |
| `csrf_tokens` | ✅ (8 col., 0 righe) | Edge Function non popola la tabella; CSRF non validato al login |
| `user_activity_logs` | ✅ esiste | Settings promette audit log ma **non** ci scrive |

### Hook / service — riuso o no

| Path | Ruolo | Verdetto |
|------|-------|----------|
| `OnboardingWizard.tsx` + `onboarding-steps/` (7) + `onboardingHelpers.ts` | wizard setup | ♻️ Riuso · ✍️ completamento su DB, togliere campi fantasma |
| `useAuth.ts` | sessione, multi-company, `hasRole/hasPermission` (legge `company_members`) | ♻️ Riuso (core) |
| `authClient.ts` / `useCsrfToken.ts` / `RememberMeService.ts` | login/CSRF/remember | ✍️ wiring Remember Me al login; CSRF enforcement o rimozione; unificare schema password |
| `DashboardPage.tsx` + `useDashboardData.ts` + widget | dashboard ricca (orphan) | ♻️/✍️ collegare + rimuovere dati fabbricati |
| `HomePage.tsx` | home attuale (Quick Actions morte) | ✍️ collegare azioni o sostituire con DashboardPage |
| `useDepartments.ts` | CRUD reparti | ♻️ Riuso |
| `useStaff.ts` (mutazioni presenti) | CRUD staff | ♻️ Riuso hook · ✍️ collegare `StaffManagement` |
| `CompanyConfiguration/HACCPSettings/NotificationPreferences.tsx` | settings | ✍️ riallineare a schema (o tagliare notifiche) |
| `UserManagement.tsx` | ruoli | ✍️ scrivere su `company_members` |
| `HACCPReportGenerator.ts` / `ExcelExporter.ts` / `EmailScheduler.ts` | dossier/export | ✍️ query obsolete + stub |
| `HeaderButtons.tsx` (reset/onboarding sempre visibili) | header | 🗑️/✍️ gate DEV |
| `services/dashboard/MultiTenantDashboard.ts` | multi-azienda | 🗑️ dead code (zero import UI) |

### Ingresso → destinazione
```
ONBOARDING: OnboardingWizard → onboardingHelpers.createCompanyFromOnboarding
   → insert companies + upsert company_members(admin)  [RLS onboarding OK]
   → tenta phone/vat/license → colonne assenti (silenzioso/errore)
   → completamento marcato in localStorage (NON su companies)
CONTROLLO: /dashboard → HomePage (reale ma minimale) | DashboardPage orphan (dati parte finti)
DOSSIER: useExportManager → HACCPReportGenerator → query companies/conservation_points/tasks (colonne obsolete)
STAFF: StaffManagement.handleSubmit → console.log (NON chiama useStaff.create)  ⚠️
RUOLI: UserManagement → update user_profiles.role  (ma hasRole legge company_members) ⚠️
```

---

## 4. Schema target audit-grade (delta vs live)

| Campo/tabella | Live oggi | Target (audit-grade §3) | Migration/gap |
|---------------|-----------|--------------------------|---------------|
| `companies.onboarding_completed` | assente (solo localStorage) | stato completamento **su DB** | migration + logica |
| `companies` estesi (P.IVA, licenza, telefono…) | assenti | se richiesti per il **dossier** legale → colonne vere | migration companies |
| ruoli utente | doppio modello (`user_profiles.role` vs `company_members.role`) | **una** fonte (`company_members`) | refactor UserManagement |
| `haccp_configurations` | UI payload flat ≠ schema `settings: Json` | struttura concordata; **soglie in `haccp-rules.ts`** non in UI libera | allineamento + §14.3 |
| `notification_preferences` | tabella assente | creare **o** rimuovere la feature | decisione owner |
| Audit log Settings | promesso, non scritto | scrittura reale su `user_activity_logs` per ogni modifica sensibile (chi-cosa-quando) | wiring audit |
| Export/dossier | query colonne obsolete + sezioni stub | dossier completo e veritiero contro schema corretto | riscrittura `HACCPReportGenerator` |

> ⚠️ Soglie/parametri HACCP normativi → `src/compliance/haccp-rules.ts` (§14.3). La sezione "HACCP Settings"
> della UI va **ripensata** alla luce della fonte-regole in codice (possibile sovrapposizione — vedi §6).

---

## 5. Verdetto riuso
- ♻️ **Riuso:** `OnboardingWizard`+step+`onboardingHelpers`, `useAuth` (core ruoli/multi-company), `useDepartments`, `useStaff` (hook), `DashboardPage`+widget (da collegare), guardie route (`ProtectedRoute`/`OnboardingGuard`).
- ✍️ **Riscrivo:** wiring `StaffManagement`↔`useStaff`; `UserManagement`→`company_members`; Settings 3 sezioni vs schema; `HACCPReportGenerator` query+stub; completamento onboarding su DB; collegare/scremare Quick Actions; unificare schema password + wiring Remember Me + decidere CSRF.
- 🗑️ **Butto (dead code):** `MultiTenantDashboard.ts` (e altri servizi B.10, vedi Fondamenta); pulsanti header "Cancella e Ricomincia"/"Riapri Onboarding" fuori da DEV; campo licenza fantasma; route `/sign-up` pubblica (se resta solo-invito).
- ✅ **DECISO** ([`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md)): (dec.4) companies = **solo P.IVA + ragione sociale, no licenza** · (dec.2) `/dashboard` = **dashboard ricca, dati reali** · (dec.5) notifiche = **solo alert in-app, taglio `notification_preferences`** · (dec.6) HACCP Settings = **sola lettura** (regole in `haccp-rules.ts`) · (dec.9) **3 ruoli** attivi + inviti · (default) `/sign-up` **chiusa**, ruoli da **`company_members`**, Staff CRUD **collegato**.
- ❓ **Dipende da owner (residuo):** forma esatta ragione sociale vs `name`; se telefono/tipo attività servono come opzionali nel dossier.

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ **Ufficiale-HACCP:** la Regia è dove si **dimostra** la conformità → il **dossier/export** è l'artefatto che un controllo guarda: oggi ha query sbagliate e **sezioni legali vuote** (azioni correttive, formazione). Il **modello ruoli doppio** e l'**audit log promesso-ma-assente** minano la tracciabilità "chi ha cambiato cosa". Priorità audit alta nonostante A4/A6 siano P1/P2 per l'utente.
- 👨‍🍳 **Ristoratore:** l'onboarding è il primo contatto: deve essere **veloce e sensato** (niente campi che non servono, come la licenza fantasma). La dashboard deve dire "va tutto bene / c'è un problema" senza numeri finti. Il titolare vuole **generare il dossier con un tap** quando arriva il controllo — è il valore percepito più alto.

## 7. Non verificato / rimandato
- **Schema live NON ri-verificato in sessione** (token MCP): stati da snapshot 05-07.
- **Runtime Vercel** login/redirect post-fix 1.8 (A1): non testato.
- **Runtime export PDF/Excel** (A7): mai E2E; probabile fallimento silenzioso.
- **CompanySwitcher** multi-azienda (A4): non analizzato in profondità.
- **Docs `06_SETTINGS`/`07_MANAGEMENT`/`02_DASHBOARD`**: **inesistenti** (buco documentale confermato) → da creare post-fix, non marcare.
- **Quanto multi-utente serve in beta**: domanda di prodotto → masterplan §8 (non decisa qui).

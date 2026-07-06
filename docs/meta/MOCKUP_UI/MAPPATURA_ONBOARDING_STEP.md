# Mappatura Onboarding — cosa chiediamo in ogni step (fonte legacy)

> **Stato**: 🟢 riferimento · **Creato**: 2026-07-05 · **Track A (UI)**
> **Scopo**: capire *cosa chiedere all'utente* e *come si scrive in DB* **prima** di ridisegnare la UI onboarding.
> **Fonte**: codice legacy — non inventare campi. Se la UI nuova cambia qualcosa, si parte **da qui**.

## Riferimenti codice (verificato)

| Cosa | File |
|------|------|
| Tipi dati onboarding | [`src/types/onboarding.ts`](../../../../src/types/onboarding.ts) |
| Wizard (7 step, ordine) | [`src/components/OnboardingWizard.tsx`](../../../../src/components/OnboardingWizard.tsx) |
| Step-component | [`src/components/onboarding-steps/`](../../../../src/components/onboarding-steps/) |
| Profili conservazione | [`src/utils/conservationProfiles.ts`](../../../../src/utils/conservationProfiles.ts) |
| Costanti conservazione (range, temp default) | [`src/utils/conservationConstants.ts`](../../../../src/utils/conservationConstants.ts) |
| Ruoli / categorie / cert HACCP staff | [`src/utils/haccpRules.ts`](../../../../src/utils/haccpRules.ts) |
| Scrittura DB | [`src/utils/onboardingHelpers.ts`](../../../../src/utils/onboardingHelpers.ts) → `completeOnboarding` (riga 2066) |

**Ordine wizard** (`TOTAL_STEPS = 7`): Anagrafica → Reparti → Staff → Conservazione → Attività → Inventario → Calendario.

**Ordine scrittura DB** (`completeOnboarding`): `companies` → `departments` → `staff` (+ `company_members`, `invite_tokens`)
→ `conservation_points` → `maintenance_tasks` → `tasks` → `product_categories` → `products` → `company_calendar_settings`.

Legenda: **\*** = obbligatorio · _derivato_ = calcolato dall'app, non digitato.

---

## Step 1 · Anagrafica azienda → `companies`

`BusinessInfoStep.tsx` · tipo `BusinessInfoData`

| Campo | Obbl. | Controllo | Validazione |
|-------|:---:|-----------|-------------|
| `name` | ✅ | text | ≥ 2 caratteri |
| `address` | ✅ | textarea | non vuoto |
| `business_type` | — | select | ristorante · bar · pizzeria · trattoria · osteria · enoteca · birreria · altro |
| `established_date` | — | date | — |
| `phone` | — | tel | regex `^[+]?[0-9\s\-()]+$` |
| `email` | — | email | regex email standard |
| `vat_number` | — | text | `IT` + 11 cifre (es. `IT12345678901`) |
| `license_number` | — | text | — |

**Valido se**: `name` (≥2) e `address` presenti e nessun errore di formato.

---

## Step 2 · Reparti → `departments`

`DepartmentsStep.tsx` · tipo `DepartmentSummary` · lista CRUD (aggiungi/modifica/elimina)

| Campo | Obbl. | Controllo | Validazione |
|-------|:---:|-----------|-------------|
| `name` | ✅ | text | ≥ 2 caratteri, **univoco** (case-insensitive) |
| `description` | — | text | — |
| `is_active` | — | checkbox | default `true` |

**Valido se**: ≥ 1 reparto e ogni nome ≥2 e senza duplicati.
**Prefill**: 7 reparti campione (Cucina, Bancone, Sala, Magazzino, Lavaggio, Deoor/Esterno, Plonge).

---

## Step 3 · Staff → `staff` (+ `company_members`, `invite_tokens`)

`StaffStep.tsx` · tipo `StaffMember` / form `StaffStepFormData` · lista CRUD

**Regola primo membro** = l'utente loggato (admin): email **precompilata read-only**, ruolo **forzato `admin`**,
**non eliminabile**, **nessuna email di invito**. Ogni membro successivo → invito email automatico all'indirizzo inserito.

| Campo | Obbl. | Controllo | Note |
|-------|:---:|-----------|------|
| `name` | ✅ | text | — |
| `surname` | ✅ | text | `fullName` = name + surname |
| `email` | ✅ (primo) | email | primo membro: read-only (dall'account) |
| `phone` | — | tel | — |
| `role` | ✅ | select | admin · responsabile · dipendente · collaboratore (primo = admin fisso) |
| `categories` | ✅ | multi-select | Amministratore · Cuochi · Banconisti · Camerieri · Addetto Pulizie · Magazziniere · Social & Media Manager · Altro |
| `department_assignments` | — | multi-checkbox | + scorciatoia «Tutti i reparti» |
| `haccpExpiry` | ✅ | date | scadenza certificazione HACCP |
| `notes` | — | textarea | — |

**Cert. HACCP richiesta** per categorie: Cuochi, Banconisti, Camerieri, Addetto Pulizie, Magazziniere
(`HACCP_CERT_REQUIRED_CATEGORIES`). Alert scadenza a 3 e 1 mesi. Pannello riepilogo (registrati / richiedono cert / valide / in scadenza / scadute).
**Valido se**: ≥ 1 membro e tutti validi.

---

## Step 4 · Punti di conservazione → `conservation_points` ⭐

`ConservationStep.tsx` · tipo `ConservationPoint` / form `ConservationStepFormData` · lista CRUD

> ⭐ **Il concetto «profilo punto di conservazione» che mancava nel mockup v1 è QUI.**
> La temperatura **non si digita mai**: è _derivata_. Per i frigo la decide il **profilo**.

| Campo | Obbl. | Controllo | Note |
|-------|:---:|-----------|------|
| `name` | ✅ | text | — |
| `departmentId` | ✅ | select | reparti attivi dallo Step 2 |
| `pointType` | ✅ | 4 bottoni | Frigorifero · Congelatore · Ambiente · Abbattitore |
| `targetTemperature` | _derivato_ | read-only | **mai digitata** — vedi sotto |
| `applianceCategory` | ✅ (solo Frigo) | select | vertical_fridge_with_freezer · vertical_fridge_1_door · vertical_fridge_2_doors · base_refrigerated |
| `profileId` | ✅ (solo Frigo) | select | 5 profili (sotto) — **decide temp + categorie** |
| `productCategories` | ✅ | multi | solo categorie compatibili con la temperatura |
| `isBlastChiller` | _derivato_ | — | `true` se `pointType === 'blast'` |

**Range/temperatura per tipo** (`conservationConstants.ts`):

| Tipo | Range mostrato | Temp default |
|------|----------------|:---:|
| Frigorifero | `1°C – 8°C` (ottimale 4) | 4 |
| Congelatore | `-25°C – -18°C` (ottimale -20) | -18 |
| Ambiente | *nessun range* (non monitorabile) | 20 |
| Abbattitore | *nessun range* | -30 |

**5 profili frigo** (`conservationProfiles.ts`) — il profilo decide `recommendedSetPointsC.fridge`, le categorie
auto-assegnate (`allowedCategoryIds`), le note HACCP e l'immagine elettrodomestico:

| Profilo | Temp consigliata | Sintesi categorie |
|---------|:---:|-------------------|
| Massima capienza | **2°C** | tutte (compreso pesce) |
| Carne + generico | **3°C** | carni crude + generico |
| Verdure + generico | **4°C** | verdure + generico |
| Pesce + generico | **1°C** | pesce crudo + generico |
| Bibite e Bevande alcoliche | **4°C** | solo bevande (categorie bloccate, auto-compilate) |

Flusso Frigo: scegli `applianceCategory` → scegli `profileId` → l'app mostra temp consigliata (read-only),
elenca le categorie auto-assegnate, le note HACCP e l'immagine dell'elettrodomestico.
**Valido se**: ≥ 1 punto e tutti validi. **Prefill**: 7 punti (Frigo A, Freezer A/B, Abbattitore, Frigo 1/2/3).

---

## Step 5 · Attività & manutenzioni → `maintenance_tasks` + `tasks`

`TasksStep.tsx` · tipi `ConservationMaintenancePlan` + `GenericTask`

### A. Manutenzioni per punto di conservazione (obbligatorie) → `maintenance_tasks`
Il **set richiesto dipende dal tipo** del punto:

| Tipo punto | Manutenzioni obbligatorie |
|------------|----------------------------|
| Abbattitore | Sanificazione (1) |
| Ambiente | Sanificazione + Controllo scadenze (2) |
| Frigo / Freezer | Rilevamento temperatura + Sanificazione + Sbrinamento + Controllo scadenze (4) |

Per ogni manutenzione: `frequenza`* (annuale · mensile · settimanale · giornaliera · custom) ·
`assegnatoARuolo`* · `assegnatoACategoria` · `assegnatoADipendenteSpecifico` (opz.) ·
`giorniCustom`* (se frequenza = custom) · `note`.

### B. Attività generiche (≥ 1 obbligatoria) → `tasks`
`name`* · `frequenza`* · `assegnatoARuolo`* · `assegnatoACategoria` · `departmentId`* ·
`assegnatoADipendenteSpecifico` (opz.) · `giorniCustom` (se custom) · `note`.

**Valido se**: **tutte** le manutenzioni richieste (per ogni punto) sono assegnate con frequenza+ruolo
(+giorni se custom) **e** esiste ≥ 1 attività generica.

---

## Step 6 · Inventario → `product_categories` + `products`

`InventoryStep.tsx` · 2 tab (Categorie · Prodotti)

### Categorie prodotti → `product_categories`
`name`* · `color` (color picker) · `description` · `conservationRules.minTemp`* ·
`conservationRules.maxTemp`* (> min) · `conservationRules.maxStorageDays` · `conservationRules.requiresBlastChilling`.

### Prodotti (≥ 1 obbligatorio) → `products`
`name`* · `sku` · `barcode` · `categoryId`* · `departmentId`* · `conservationPointId`* ·
`purchaseDate`* · `expiryDate`* · `quantity`* · `unit`* (da `UNIT_OPTIONS`) ·
`allergens` (Glutine · Latte · Uova · Soia · Frutta a guscio · Arachidi · Pesce · Crostacei) ·
`labelPhotoUrl` · `notes`.
Compliance calcolata su range categoria + temperatura del punto di conservazione.
**Valido se**: ≥ 1 prodotto.

---

## Step 7 · Calendario & orari → `company_calendar_settings`

`CalendarConfigStep.tsx` · tipo `CalendarConfigInput`

| Campo | Controllo | Note |
|-------|-----------|------|
| `fiscal_year_start` / `fiscal_year_end` | date | anno lavorativo |
| `open_weekdays` | 7 toggle | giorni di apertura settimanale |
| `closure_dates` | date singola **o** periodo (dal/al → espanso) | chip rimovibili |
| `business_hours` | per ogni giorno aperto: fino a **2 fasce** open/close | — |

**Derivato**: contatore giorni lavorativi = totali − chiusure settimanali − chiusure programmate (+ % apertura).
**Valido se**: anno fiscale, giorni, chiusure e orari senza errori di validazione.

---

## Note per la UI nuova (Fase 2)

- **Temperatura conservazione**: sempre _read-only_/derivata. Per i frigo il **profilo** è il perno (temp + categorie + note HACCP).
- **Obbligatorietà**: Reparti ≥1, Staff ≥1, Conservazione ≥1, Attività (manutenzioni complete + ≥1 generica), Inventario ≥1 prodotto.
- **Dipendenze tra step**: Staff usa Reparti · Conservazione usa Reparti · Attività usa Conservazione+Staff+Reparti ·
  Inventario usa Categorie+Reparti+Conservazione. → l'ordine non è arbitrario, la navigazione libera deve rispettare le dipendenze.
- **Primo membro staff = utente loggato** (admin, email bloccata, non eliminabile): la UI onboarding deve rifletterlo.

---

**Ultimo aggiornamento**: 2026-07-05 · Fase 1 completata (mappa 7 step verificata sul codice legacy).

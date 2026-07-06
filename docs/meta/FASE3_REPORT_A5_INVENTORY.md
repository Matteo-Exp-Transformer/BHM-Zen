# Report FASE 3 — Area A5 Inventory + Shopping

**Data**: 2026-07-05  
**Agente**: A5  
**Modalità**: read-only  
**Priorità area**: P2  
**Supplemento DB live**: 2026-07-05 · MCP `supabase-bhm` · progetto `hjteuounjwkadmsbsmdm`

---

## Supplemento DB live (MCP supabase-bhm)

Verifica read-only eseguita con `execute_sql` su DB remoto BHM.

### RPC shopping list

| RPC | Presente su DB live |
|-----|---------------------|
| `create_shopping_list_with_items` | ❌ **Assente** |
| `get_shopping_lists_with_stats` | ❌ **Assente** |
| `toggle_shopping_list_item` | ❌ **Assente** |
| `complete_shopping_list` | ❌ **Assente** |

Query: `pg_proc` schema `public`, filtro `proname IN (...)` → risultato **vuoto**. Nessuna funzione con nome `%shopping%` in `public`.

**Impatto**: flusso principale liste spesa (`shoppingListService.ts`) **bloccato** su DB live — stesso pattern di BUG-005 (codice presente, artefatto DB mancante).

### Schema `products` (live — 20 colonne)

Colonne presenti e usate da `AddProductModal` / `useProducts`:

| Colonna | Tipo live | AddProductModal |
|---------|-----------|-----------------|
| `name` | varchar NOT NULL | ✅ |
| `category_id` | uuid NULL | ✅ FK → `product_categories` |
| `department_id` | uuid NULL | ✅ FK → `departments` (form invia stringhe — BUG-007) |
| `conservation_point_id` | uuid NULL | ✅ FK → `conservation_points` |
| `barcode`, `sku`, `supplier_name` | varchar NULL | ✅ |
| `purchase_date`, `expiry_date` | date NULL | ✅ |
| `quantity` | numeric NULL | ✅ |
| `unit` | varchar NULL | ✅ |
| `allergens` | text[] default `{}` | ✅ |
| `label_photo_url`, `notes` | text NULL | ✅ |
| `status` | varchar default `active` | ✅ (non in form; default DB) |
| `compliance_status` | varchar NULL | — (non in form) |
| `company_id`, `id`, `created_at`, `updated_at` | — | gestiti da hook |

Colonne **assenti** su DB live (codice le usa altrove):

| Colonna | Usata da |
|---------|----------|
| `expired_at` | `useExpiryTracking.markAsExpired` (BUG-010) |
| `previous_product_id`, `reinsertion_count`, `archived_at` | `useExpiredProducts.reinsertExpiredProduct` (BUG-009) |

Constraint `products_status_check`: solo `active`, `expired`, `consumed`, `waste` — **no** `archived`.

FK confermate: `products_department_id_fkey` → `departments(id)`.

### Schema `product_categories` (live — 5 colonne)

| Colonna live | AddProductModal |
|--------------|-----------------|
| `id`, `company_id`, `name`, `created_at`, `updated_at` | ✅ sufficienti per select categorie nel modal prodotto |

Colonne da migration 010 (`description`, `temperature_requirements`, `default_expiry_days`, `allergen_info`) **assenti** su DB live — rilevanti per `AddCategoryModal`, non per il dropdown di `AddProductModal`.

### Tabelle shopping (live)

`shopping_lists` e `shopping_list_items` **presenti** con colonne attese (`status`, `is_checked`, `is_completed`, …). CRUD diretto possibile; flusso app via RPC **no**.

---

## 5.1 Executive summary

| Metrica | Valore |
|---------|--------|
| Elementi verificati | 22 |
| Allineati doc↔codice | 4 |
| Gap critici | 3 |
| Gap medi/bassi | 8 |
| Non verificato (runtime E2E) | 2 |

**Esito area**: 🔴 **Parzialmente bloccato su DB live** — CRUD prodotti/categorie base allineato allo schema live, ma **liste spesa non funzionano** (RPC assenti), reparto hardcoded rompe FK, filtri UI non applicati, operazioni scadenze/reinsert usano colonne assenti. *(Prima stima 🟡 basata solo su file repo; rivista post-MCP.)*

**Dove vive nell'app (semplice)**:
- **Inventario** → pagina `/inventario` (`InventoryPage.tsx`): prodotti, categorie, scadenze, card per creare liste spesa.
- **Liste spesa** → `/liste-spesa` e `/liste-spesa/:id`: elenco e dettaglio liste create dall'inventario.
- **Onboarding** → step 6 del wizard (`InventoryStep.tsx`): raccolta categorie/prodotti in memoria locale, salvati a fine onboarding (non è la stessa pagina Inventario).

**Storage / dati**:
- Tabella **`products`**: ogni prodotto (nome, categoria, reparto, punto conservazione, scadenza, allergeni, stato).
- Tabella **`product_categories`**: categorie HACCP per azienda.
- Tabelle **`shopping_lists`** + **`shopping_list_items`**: liste spesa e righe prodotto.
- RPC Supabase (nel repo): `create_shopping_list_with_items`, `get_shopping_lists_with_stats`, `toggle_shopping_list_item`, `complete_shopping_list` — **MCP live: tutte assenti** su `hjteuounjwkadmsbsmdm` (2026-07-05).

---

## 5.2 Matrice verifica

| Feature/Componente | Doc dice (FASE 2) | Codice reale | DB/Schema | Esito |
|--------------------|-------------------|--------------|-----------|-------|
| **CRUD prodotti** | CRUD base atteso, non documentato in APP_DEFINITION | `useProducts.ts`: select/insert/update/delete su `products` con join categorie/reparti/punti; `InventoryPage` + `AddProductModal` + `ProductCard` | MCP live: 20 colonne; campi `AddProductModal` presenti; FK `department_id` → `departments` | ✅ CRUD implementato (insert con reparto selezionato → ❌ BUG-007) |
| **CRUD categorie** | Idem | `useCategories.ts`: CRUD su `product_categories`; delete con guard se prodotti collegati | MCP live: solo `id, company_id, name, created_at, updated_at` — sufficiente per dropdown prodotto; campi estesi `AddCategoryModal` assenti | ✅ CRUD nome base OK; ⚠️ campi HACCP categoria assenti su live |
| **Ricerca / filtri prodotti** | Non documentato | UI passa `query`, `category_id`, `status` a `useProducts` ma **`queryFn` carica tutti i prodotti senza filtrare** (`useProducts.ts:79-96`) | N/A | ❌ Filtri UI non funzionanti |
| **AddProductModal — reparto** | BUG_TRACKER: TODO `useDepartments` | Select con valori fissi `"cucina"`, `"bancone"`, … (`AddProductModal.tsx:300-305`); `CreateShoppingListModalV2` usa correttamente `useDepartments` | MCP live: `department_id uuid` FK `products_department_id_fkey` → `departments(id)` | ❌ Confermato: stringhe letterali invalidano insert |
| **Tracciamento scadenze** | Non documentato | `useExpiryTracking.ts`: query prodotti in scadenza; `markAsExpired` scrive `expired_at` | MCP live: colonna `expired_at` **assente** | ❌ `markAsExpired` fallisce su DB live (BUG-010 confermato) |
| **Prodotti scaduti — reinserimento** | Non documentato | `useExpiredProducts.reinsertExpiredProduct` inserisce con `previous_product_id`, `reinsertion_count`; archivia con `status: 'archived'`, `archived_at` (`useExpiredProducts.ts:203-232`) | MCP live: colonne assenti; CHECK status senza `archived` | ❌ Reinserimento non funzionante su DB live (BUG-009 confermato) |
| **Statistiche spreco (trend/costi)** | BUG_TRACKER TODO trend + monthly cost | Valori stub: `waste_trend: 'stable'`, `monthly_waste_cost: []` (`useExpiredProducts.ts:167-168`) | N/A | ⚠️ Feature non implementata (tech debt) |
| **Liste spesa — creazione da Inventario** | Zero doc Conoscenze_congelate | `ShoppingListCard` → `CreateShoppingListModalV2` → `shoppingListService.createShoppingList` → RPC `create_shopping_list_with_items` | MCP live: RPC **assente**; tabelle `shopping_lists` / `shopping_list_items` presenti | 🔴 **BLOCCATO** su DB live (BUG-012 confermato) |
| **Liste spesa — pagine dedicate** | Non documentato | `ShoppingListsPage`, `ShoppingListDetailPage`; list via RPC `get_shopping_lists_with_stats`; check via `toggle_shopping_list_item`; complete via `complete_shopping_list` | MCP live: tutte e 4 RPC **assenti**; schema tabelle OK | 🔴 Elenco/creazione/check/complete via RPC **non funzionanti**; lettura diretta singola lista possibile se dati esistono |
| **Doppio stack shopping list** | Non documentato | **Legacy**: `inventory/hooks/useShoppingLists.ts` (query dirette); **Attivo**: `shopping/hooks/useShoppingList.ts` + RPC | MCP: tabelle OK, RPC assenti — legacy può leggere liste; pagine `/liste-spesa` no | ⚠️ Dashboard (legacy) vs pagine liste (RPC) — comportamento diverso su live |
| **Codice morto inventory shopping** | — | `ShoppingListManager.tsx`, `inventory/components/ShoppingListCard.tsx`, `CreateListModal.tsx` — **nessun import** fuori da `ShoppingListManager` (non montato in app) | — | ⚠️ Dead code / confusione manutenzione |
| **TransferProductModal** | Non documentato | Implementato con `useProducts.transferProduct` ma **non referenziato** in altre pagine | Logica update `conservation_point_id` + activity log OK in codice | ⚠️ Feature pronta ma non esposta in UI |
| **Onboarding inventario** | Spec onboarding parziale | `InventoryStep.tsx` (~1100 righe): categorie/prodotti in stato locale wizard | Persistenza via `onboardingHelpers` (fuori scope dettaglio A5) | ✅ Step presente; allineamento post-onboarding **non-verificato** |
| **Dashboard KPI inventario/spesa** | Buco documentale Dashboard | `useDashboardData` aggrega `useProducts`, `useExpiryTracking`, legacy `useShoppingLists` | Dipende da query sopra | ⚠️ KPI shopping da stack legacy |
| **TYPE-001 useShoppingLists mismatch** | BUG_TRACKER tech debt | Interfaccia legacy `ShoppingListItem.shopping_list_id` vs tipi generati — stack legacy separato da `types/shopping.ts` | — | ⚠️ Confermato pattern dual-stack |
| **Test E2E / unit inventory** | Archive 2025 | Nessun test in `src/features/inventory/` o `Production/Test/` per area | — | non-verificato runtime |

---

## 5.3 Bug confermati (nuovi o aggiornati)

> **Nota**: non modificato `BUG_TRACKER.md` (competenza A8). Proposte ID per consolidamento.

| ID suggerito | Severity | Descrizione | Evidenza | File:Riga |
|--------------|----------|-------------|----------|-----------|
| **BUG-007** | **HIGH** | Select reparto in `AddProductModal` usa stringhe letterali (`"cucina"`, …) invece di UUID da `departments`; viola FK `products_department_id_fkey` | TODO + MCP live FK confermata | `AddProductModal.tsx:300-305` |
| **BUG-008** | **MEDIUM** | Filtri ricerca/categoria/solo-scaduti in Inventario non applicati: hook accetta `searchParams` ma query Supabase non filtra | UI `InventoryPage.tsx:56-61` vs query senza `.eq`/filter | `useProducts.ts:79-96` |
| **BUG-009** | **HIGH** | Reinserimento prodotti scaduti usa colonne/stato non presenti su DB live (`previous_product_id`, `reinsertion_count`, `archived_at`, status `archived`) | MCP `information_schema.columns` + CHECK status | `useExpiredProducts.ts:203-232` |
| **BUG-010** | **MEDIUM** | `markAsExpired` scrive colonna `expired_at` assente su DB live | MCP: colonna non in `products` | `useExpiryTracking.ts:195-200` |
| **BUG-011** | **MEDIUM** | Doppia implementazione shopping list: dashboard e codice legacy vs pagine `/liste-spesa` con service+RPC — rischio dati/metriche divergenti | Due hook omonimi in path diversi | `inventory/hooks/useShoppingLists.ts` vs `shopping/hooks/useShoppingList.ts`; `useDashboardData.ts:9` |
| **BUG-012** | **CRITICAL** | **Confermato MCP live**: RPC liste spesa assenti su DB remoto — create/list/check/complete falliscono | MCP `pg_proc` → 0 righe per le 4 RPC; SQL in repo `database/rls/shopping_lists_policies.sql`, `007_shopping_lists_verification.sql` | `shoppingListService.ts:31-40`, `74-80`, `251-274` |

**TODO BUG_TRACKER già presenti — confermati in codice**:
- `useExpiredProducts.ts:167-168` — trend e costi mensili non implementati
- `AddProductModal.tsx:306` — departments hook mancante

---

## 5.4 Documentazione obsoleta

| Path doc | Claim errato / gap | Evidenza | Azione suggerita |
|----------|-------------------|----------|------------------|
| FASE 2 catalogo riga 27614 — Inventario | "CRUD prodotti/categorie (codice base)" senza caveat reparto/filtri | Codice mostra gap BUG-007/008 | Aggiornare matrice FASE 3 |
| FASE 2 catalogo riga 27615 — Liste spesa | "Feature presente nel codice" — troppo vago | Flusso reale: inventario → RPC → pagine dedicate; dual stack | Creare `05_INVENTORY/conoscenze-definizioni/` |
| `Production/Archive/.../InventoryStep/*` (2025-10) | Mappatura onboarding storica | `InventoryStep.tsx` evoluto; non riflette pagina `/inventario` attuale | Marcare 📌 storico |
| `Info/Agent_Reports/.../AGENT_3_TEST_REPORT` (2025-01) | RPC shopping "esistente" | MCP live 2026-07-05: **4 RPC assenti** | Obsoleto — contraddice DB attuale |

**APP_DEFINITION `05_INVENTORY`**: cartella **assente** (confermato grep su `Production/Conoscenze_congelate/APP_DEFINITION/`).

---

## 5.5 Aggiornamenti catalogo (`stato_percepito`)

Proposta append sezione **FASE 3 — 3.5 Inventory + Shopping** (per A8):

| Riferimento | Campo | Nuovo `stato_percepito` |
|-------------|-------|-------------------------|
| FASE 2 matrice — Inventario CRUD | verifica codice | `verificato-ok` (CRUD base) |
| FASE 2 matrice — Inventario filtri/reparto | verifica codice | `verificato-rotto` (BUG-007, BUG-008) |
| FASE 2 matrice — Inventario scadenze/reinsert | verifica codice+schema MCP | `verificato-rotto` (BUG-009, BUG-010 confermati live) |
| FASE 2 matrice — Liste spesa | verifica codice+schema MCP | `verificato-rotto` (BUG-012 CRITICAL — RPC assenti) |
| DOC-0320/0321 InventoryStep Archive | utilità | `verificato-gap` (storico onboarding) |
| `05_INVENTORY` (mancante) | esistenza | `non-verificato` → **da creare** |

---

## 5.6 Non verificato / fuori scope

- **Runtime E2E**: nessun test eseguito (solo analisi codice + MCP schema).
- **Persistenza onboarding → tabella `products`**: flusso in `onboardingHelpers.ts` / `inventoryUtils.ts` — citato ma non tracciato riga-per-riga in questo report.
- **RLS policies** shopping: non verificate via MCP (solo esistenza tabelle e RPC).
- **Export PDF liste spesa**: codice presente (`exportToPDF.ts`); non testato.
- **Controverifica file-per-file** `Production/Archive/` inventory (~20+ doc): campionati; non inventario completo.

### Verificato via MCP (2026-07-05) — non più in sospeso

| Voce | Esito MCP |
|------|-----------|
| RPC shopping (4 funzioni) | ❌ Tutte assenti |
| Schema `products` vs `AddProductModal` | ✅ Colonne form presenti; FK `department_id` confermata |
| Colonne scadenze/reinsert (`expired_at`, …) | ❌ Assenti su live |
| Schema `product_categories` | ✅ 5 colonne base; estensioni migration 010 assenti |
| Tabelle `shopping_lists` / `shopping_list_items` | ✅ Presenti |

---

## Appendice — Mappa file area (riferimento rapido)

### Inventory (`src/features/inventory/`)
| File | Ruolo |
|------|-------|
| `InventoryPage.tsx` | Pagina principale `/inventario` |
| `hooks/useProducts.ts` | CRUD prodotti Supabase |
| `hooks/useCategories.ts` | CRUD categorie |
| `hooks/useExpiryTracking.ts` | Alert scadenza + mark expired |
| `hooks/useExpiredProducts.ts` | Gestione scaduti + waste stats stub |
| `hooks/useShoppingLists.ts` | **Legacy** shopping (usato solo da dashboard) |
| `components/AddProductModal.tsx` | Form prodotto (gap reparto) |
| `components/ShoppingListManager.tsx` | **Dead code** |

### Shopping (`src/features/shopping/`)
| File | Ruolo |
|------|-------|
| `pages/ShoppingListsPage.tsx` | Elenco `/liste-spesa` |
| `pages/ShoppingListDetailPage.tsx` | Dettaglio lista |
| `components/ShoppingListCard.tsx` | Card collassabile in Inventario |
| `components/CreateShoppingListModalV2.tsx` | Modal creazione (attivo) |
| `hooks/useShoppingList.ts` | Hook + mutations via service |
| `services/shoppingListService.ts` | RPC + query Supabase |

### Routing (`App.tsx`)
- `/inventario` → `InventoryPage`
- `/liste-spesa` → `ShoppingListsPage`
- `/liste-spesa/:listId` → `ShoppingListDetailPage`

---

## Seed verifica A5 — esito checklist piano

| # | Seed | Esito |
|---|------|-------|
| 1 | CRUD prodotti/categorie | ✅ Codice completo |
| 2 | AddProductModal departments | ❌ Hardcoded, TODO confermato |
| 3 | Liste spesa | 🔴 RPC assenti su DB live — flusso principale bloccato (BUG-012) |
| 4 | BUG_TRACKER TODO inventory | ✅ Confermati + gap aggiuntivi BUG-007–012 |
| 5 | Documentazione 05_INVENTORY | ❌ Assente |

---

**Fine report A5** · Supplemento MCP 2026-07-05 · Prossimo step: consolidatore **A8** merge in catalogo FASE 3 + `BUG_TRACKER.md`

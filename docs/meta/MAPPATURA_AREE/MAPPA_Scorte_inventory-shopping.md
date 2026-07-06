# MAPPA — 📦 Scorte · Inventory + Shopping (prodotti, scadenze, liste spesa)
**Data:** 2026-07-06 · **Fonte verità:** codice + snapshot DB live A5 (05-07) · **Report Fase 3 base:** A5

> ⚠️ **Accesso DB**: schema live = **snapshot A5 del 2026-07-05** (token MCP di sessione non raggiunge
> `hjteuounjwkadmsbsmdm`). Schema target: [`MAPPA_Fondamenta_DB-tipi.md`](./MAPPA_Fondamenta_DB-tipi.md).

---

## 1. Dove vive nel prodotto nuovo
- **Casa/lente (§12):** 📦 **Scorte** (Stock) — inventario prodotti → scadenze → **lista spesa** (primo flusso automatizzabile §9.4).
- **Ruoli coinvolti:** **dipendente** (aggiunge prodotti, spunta liste) · **titolare/responsabile** (vede inventario, scadenze, costi spreco).
- **Punto del loop §9.1:** ② **faccio** (registro prodotti, genero/spunto liste); i **prodotti in scadenza** compaiono anche in **Oggi** (doppia lente §12.1).

> **Confine**: le scadenze prodotto generano eventi nella lente **Oggi** (A3, fonte `productExpiry`).
> Il **reparto** e il **punto di conservazione** di un prodotto agganciano la lente **Reparti** (A2).

---

## 1-bis. ⭐ Modello inventario riformulato (owner 2026-07-06) — vincola il port

Questa è la **logica di prodotto decisa** (non solo l'as-is del codice). Vincola Fable.

1. **Inventario = mansione ricorrente assegnabile** (nuovo tipo di mansione, accanto alle manutenzioni).
   L'**admin assegna "Inventario"** a un responsabile/dipendente → l'assegnatario fa il **giro dei punti
   di conservazione** del **reparto/frigo a cui è assegnato** e **conta le rimanenze**. Genera **reminder**
   (come una manutenzione) e tiene il **catalogo aggiornato**. Vive quindi anche nella lente **Oggi** (mansione del giorno).
2. **Ingrediente-level: «dovrei avere N» (par/scorta) vs rimanenza attuale (M)**. Quando `M < par` →
   l'ingrediente è **sotto scorta** e confluisce nei **suggerimenti** della spesa.
3. **Scadenza catturata all'INSERIMENTO del prodotto**, non nel giro d'inventario. Nel giro la scadenza è
   solo un **check di conferma** (non ridigitata). Dato mostrato = **ultima scadenza disponibile** (unità/lotto
   **più longevo**, = "ho scorta buona fino al …"); **ma** un'unità che scade **a breve** deve **emergere come
   alert** (anche in **Oggi**) → doppia lente §12.1 (disponibilità-acquisto vs sicurezza-HACCP).
4. **A inventario ben fatto la spesa è già ~compilata** (dai sotto-scorta), **ma resta libera**: l'utente
   crea liste **diverse/personalizzate**, aggiunge/toglie voci. **NIENTE barra di avanzamento né
   "completamento"** (logica pericolosa: la spesa varia; non deve dare sensazione di "incompleta").
5. **Pezzo non ancora in catalogo → chiedi la scadenza** *(annotato owner 2026-07-06, da implementare)*:
   se durante il giro/aggiunta compare un'unità che l'app **non conosceva**, è di fatto un **inserimento di
   prodotto nuovo** → l'app **chiede la data di scadenza** (coerente col punto 3: la scadenza si prende
   all'inserimento). Nel giro di conferma su ciò che già esiste, invece, non si ridigita.
6. **[UI, annotato owner 2026-07-06]** cliccando il **nome della categoria** la sezione si **chiude/apre**
   (accordion) per alleggerire la vista con molti ingredienti. *(Non ancora nel mockup — da applicare.)*

> Mockup di riferimento: `MOCKUP_UI/07_SCORTE.html` (v2, artifact `e1e1a5d2`). Vedi anche `DECISIONI_OWNER_BETA` dec.12.

---

## 2. Flusso utente (as-is → to-be)

| Passo | Cosa fa l'utente | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|------------------|---------------|--------------------|
| Aggiunge prodotto | nome, categoria, reparto, scadenza, allergeni | ⚠️ CRUD ok, ma **reparto = stringhe hardcoded** (`"cucina"`…) che **violano la FK** → insert a rischio (BUG-007) | reparto da `useDepartments` (UUID reali) |
| Cerca/filtra prodotti | per nome, categoria, solo scaduti | 🔴 filtri **non applicati**: l'hook riceve i parametri ma la query carica **tutto** (BUG-008) | applicare i filtri nella query |
| Vede prodotti in scadenza | alert + marca scaduto | 🔴 `markAsExpired` scrive `expired_at` — **colonna assente** live (BUG-010) | migration colonne scadenza |
| Reinserisce un prodotto scaduto | ricompra lo stesso articolo | 🔴 usa `previous_product_id`, `reinsertion_count`, status `archived` — **assenti** live (BUG-009) | migration + CHECK status |
| **Crea lista spesa** dall'inventario | seleziona mancanti → lista | 🔴 **BLOCCATO — BUG-012 CRITICAL**: `create_shopping_list_with_items` **RPC assente** live | deploy 4 RPC shopping (migration 007) |
| Apre pagine liste spesa | elenco, dettaglio, spunta, completa | 🔴 tutte via RPC assenti (`get_shopping_lists_with_stats`, `toggle_shopping_list_item`, `complete_shopping_list`) | idem — sblocco con le RPC |
| Vede liste in dashboard | KPI liste | ⚠️ funziona via **stack legacy** (query dirette), divergente dalle pagine RPC (BUG-011) | unificare su un solo stack |

---

## 3. Flusso dati (verità = codice + snapshot DB live)

### Tabelle / RPC toccate — stato LIVE (snapshot A5 05-07)

| Tabella / RPC | Stato live | Nota |
|---------------|-----------|------|
| `products` | ✅ 20 col. base (nome, `category_id`, `department_id` FK, `conservation_point_id`, scadenze, `allergens[]`, `status`) | ❌ `expired_at`, `previous_product_id`, `reinsertion_count`, `archived_at`; CHECK status senza `archived` |
| `product_categories` | ✅ 5 col. base (sufficiente per dropdown) | ❌ colonne estese migration 010 (allergeni, expiry default) → `AddCategoryModal` |
| `shopping_lists` / `shopping_list_items` | ✅ tabelle presenti (`status`, `is_checked`, `is_completed`) | CRUD diretto possibile; flusso app via RPC no |
| RPC `create_shopping_list_with_items` | ❌ assente | **BUG-012** |
| RPC `get_shopping_lists_with_stats` | ❌ assente | |
| RPC `toggle_shopping_list_item` | ❌ assente | |
| RPC `complete_shopping_list` | ❌ assente | |
| FK `products_department_id_fkey` → `departments(id)` | ✅ confermata | causa del BUG-007 (stringhe ≠ UUID) |

### Hook / service — riuso o no

| Path | Ruolo | Verdetto |
|------|-------|----------|
| `inventory/hooks/useProducts.ts` | CRUD prodotti + join | ♻️ Riuso · ✍️ applicare filtri (BUG-008), reparto→UUID (BUG-007) |
| `inventory/hooks/useCategories.ts` | CRUD categorie | ♻️ Riuso (base) |
| `inventory/hooks/useExpiryTracking.ts` | alert scadenza + `markAsExpired` | ✍️ dipende da colonne assenti (BUG-010) |
| `inventory/hooks/useExpiredProducts.ts` | scaduti + reinserimento + waste stats | ✍️ colonne assenti (BUG-009); trend/costi = **stub** |
| `shopping/hooks/useShoppingList.ts` + `services/shoppingListService.ts` | stack **attivo** via RPC | ♻️ Riuso · dipende da deploy RPC |
| `inventory/hooks/useShoppingLists.ts` (legacy) | stack **legacy** (query dirette, usato da dashboard) | ✍️/🗑️ unificare con lo stack RPC (BUG-011) |
| `AddProductModal.tsx` | form prodotto (reparto hardcoded) | ✍️ collegare `useDepartments` |
| `ShoppingListManager.tsx`, `inventory/components/ShoppingListCard.tsx`, `CreateListModal.tsx` | non montati / senza import | 🗑️ dead code |
| `TransferProductModal.tsx` | trasferimento prodotto (pronto, non esposto) | ❓ esporre in UI o rimuovere |

### Ingresso → destinazione
```
AGGIUNGI PRODOTTO: AddProductModal → useProducts.create
   → insert products {name, category_id, department_id(⚠️ stringa hardcoded), conservation_point_id, expiry_date, allergens[]}
   → [BUG-007: department_id non-UUID viola FK]
CREA LISTA: CreateShoppingListModalV2 → shoppingListService.createShoppingList
   → rpc('create_shopping_list_with_items', …)   [BUG-012: RPC assente ⇒ fallisce]
SPUNTA/COMPLETA: useShoppingList → rpc(toggle_shopping_list_item | complete_shopping_list)  [assenti]
DASHBOARD KPI: useDashboardData → useShoppingLists (LEGACY, query dirette)  ⇒ divergenza (BUG-011)
```

---

## 4. Schema target audit-grade (delta vs live)

| Campo/tabella | Live oggi | Target (audit-grade §3) | Migration/gap |
|---------------|-----------|--------------------------|---------------|
| RPC shopping (×4) | ❌ assenti | presenti + RLS policies | Migration **007** + `shopping_lists_policies.sql` (P0) |
| `products.expired_at` | ❌ assente | tracciare quando un prodotto è scaduto (prova gestione scadenze) | migration colonne scadenza |
| `products` reinserimento (`previous_product_id`, `reinsertion_count`, `archived_at`, status `archived`) | ❌ assenti | ciclo scadenza→riordino tracciato | migration + CHECK status |
| `product_categories` estese (migration 010) | ❌ assenti | allergeni/expiry default se servono | migration 010 |
| `department_id` prodotto | FK ok ma UI manda stringhe | sempre UUID valido | fix codice (non DB) |
| dual-stack shopping | 2 implementazioni (legacy vs RPC) | **una** fonte per liste e KPI | consolidamento codice |
| `products.par_level`/scorta minima ("dovrei avere N") | ❌ assente | soglia per-ingrediente che alimenta i suggerimenti spesa (dec.12) | migration products |
| **conteggio rimanenze** (giro d'inventario) | ❌ nessuna traccia | storicizzare i conteggi per data/utente (audit + reminder freschezza) — es. `stock_counts` o campo `counted_at`/`counted_by` | migration nuova (design) |
| **tipo mansione "Inventario"** | ❌ solo manutenzioni | nuovo tipo di task ricorrente assegnabile (accanto a manutenzione) → genera reminder in Oggi (dec.12) | schema tasks + generatore ricorrenze |
| **scadenza per lotto/unità** | scadenza flat sul prodotto | catturata all'inserimento; "ultima scadenza" = max dei lotti; unità prossima = alert | valutare granularità lotto vs flat |

> ⚠️ Regole HACCP su allergeni/scadenze normative → `src/compliance/haccp-rules.ts` (§14.3). Qui solo struttura.

---

## 5. Verdetto riuso
- ♻️ **Riuso:** `useProducts`, `useCategories`, `useExpiryTracking`, `useExpiredProducts` (logica), stack shopping **attivo** (`useShoppingList` + `shoppingListService`), `CreateShoppingListModalV2`, pagine `/liste-spesa`.
- ✍️ **Riscrivo:** reparto in `AddProductModal` → `useDepartments` (BUG-007); applicare filtri in `useProducts` (BUG-008); deploy 4 RPC shopping (BUG-012); colonne scadenza/reinsert (BUG-009/010); unificare dual-stack shopping (BUG-011); implementare trend/costi spreco (stub).
- 🗑️ **Butto (dead code):** `ShoppingListManager.tsx`, `inventory/components/ShoppingListCard.tsx`, `CreateListModal.tsx` (non montati); valutare stack legacy `inventory/hooks/useShoppingLists.ts` dopo unificazione.
- ✅ **DECISO** ([`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md)): (dec.3) **liste spesa in beta** → deploy 4 RPC + unifica stack · (dec.10) **ciclo scadenze completo** → `expired_at`, reinserimento (`previous_product_id`, `reinsertion_count`, `archived_at`, status `archived`) + storico.
- ❓ **Dipende da owner (residuo):** `TransferProductModal` — esporre o tagliare? · allergeni a livello prodotto, categoria o entrambi? · profondità storico riordini.

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ **Ufficiale-HACCP:** la gestione **scadenze e allergeni** è materia di controllo → `expired_at` e il ciclo di reinserimento servono a **dimostrare** che i prodotti scaduti sono stati tolti; oggi quelle colonne non esistono. Gli **allergeni** (`allergens[]` c'è sul prodotto) vanno esposti nel dossier. La lista spesa è meno "audit" e più operativa.
- 👨‍🍳 **Ristoratore:** il valore vero è **"cosa mi manca → lista della spesa" con un tap** (§9.4 primo automatizzabile) — ma è proprio il flusso **bloccato** (RPC assenti). L'inventario deve essere **veloce** da aggiornare (scan barcode? il campo c'è). Le scadenze devono **avvisare al momento giusto**, non generare rumore.

## 7. Non verificato / rimandato
- **Schema live NON ri-verificato in sessione** (token MCP): stati da snapshot A5 05-07.
- **RLS policies shopping**: non verificate via MCP (solo esistenza tabelle e assenza RPC).
- **Persistenza onboarding → `products`** (`InventoryStep` → `onboardingHelpers`): non tracciata riga-per-riga.
- **Export PDF liste spesa** (`exportToPDF.ts`): non testato.
- **Docs `05_INVENTORY`**: **inesistenti** → da creare post-fix.
- **Runtime E2E** inventory/shopping: nessun test eseguito.

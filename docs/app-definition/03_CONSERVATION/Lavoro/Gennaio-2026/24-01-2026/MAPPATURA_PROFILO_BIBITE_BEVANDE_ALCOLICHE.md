# Mappatura modifiche: profilo HACCP "Bibite e Bevande alcoliche"

## Obiettivo
Aggiungere un nuovo profilo HACCP **"Bibite e Bevande alcoliche"** nei form:
- **Conservation page**: modal "Nuovo Punto di Conservazione" (AddPointModal)
- **Onboarding**: form "Aggiungi punto di conservazione" (ConservationStep)

Il profilo avrà **5 categorie prodotti auto-assegnate**, disponibili **solo per questo profilo** e **senza range di temperatura di conservazione**.

---

## 1. Categorie prodotti (solo per questo profilo)

| ID interno (code)     | Nome visualizzato    |
|-----------------------|----------------------|
| `beverages_fruit_veg` | Frutta / Verdure     |
| `beverages_water`    | Acqua                |
| `beverages_juice`     | Succhi               |
| `beverages_carbonated`| Bibite gassate       |
| `beverages_alcoholic` | Bevande Alcoliche    |

- Nessun range temperatura: le categorie non hanno vincolo min/max (o si usa `storage_type: 'fridge'` con range molto ampio / opzionale).
- Visibilità: queste 5 categorie devono comparire **solo** quando è selezionato il profilo "Bibite e Bevande alcoliche"; negli altri profili non devono essere selezionabili.

---

## 2. File e modifiche previste

### 2.1 `src/utils/conservationProfiles.ts`

- **ConservationProfileId**: aggiungere  
  `'bibite_bevande_alcoliche'` (o `'beverages_alcoholic'`) al type.
- **CATEGORY_ID_TO_DB_NAME**: aggiungere le 5 voci:
  - `beverages_fruit_veg` → `'Frutta / Verdure'`
  - `beverages_water` → `'Acqua'`
  - `beverages_juice` → `'Succhi'`
  - `beverages_carbonated` → `'Bibite gassate'`
  - `beverages_alcoholic` → `'Bevande Alcoliche'`
- **CONSERVATION_PROFILES**: per **ogni** `ApplianceCategory`  
  (`vertical_fridge_with_freezer`, `vertical_fridge_1_door`, `vertical_fridge_2_doors`, `base_refrigerated`) aggiungere un nuovo profilo:
  - `profileId`: `'bibite_bevande_alcoliche'`
  - `name`: `'Bibite e Bevande alcoliche'`
  - `applianceType`: come gli altri (es. "Frigorifero verticale con Freezer", ecc.)
  - `recommendedSetPointsC`: es. `{ fridge: 4 }` (o `{ fridge: 4, freezer: -18 }` per vertical_fridge_with_freezer)
  - `allowedCategoryIds`: `['beverages_fruit_veg', 'beverages_water', 'beverages_juice', 'beverages_carbonated', 'beverages_alcoholic']`
  - `compartmentFill`: riempire i compartment esistenti del template con queste 5 categorie (es. porta + ripiani; nessuna logica crudo/cotto).
  - `haccpNotes`: es. una nota tipo "Categorie senza range di temperatura obbligatorio; adatto a cella bevande / bar."
- **PROFILE_LABELS**: aggiungere  
  `bibite_bevande_alcoliche: 'Bibite e Bevande alcoliche'`.

Opzionale: esportare una costante  
`BEVERAGES_PROFILE_ONLY_CATEGORY_IDS = ['beverages_fruit_veg', 'beverages_water', 'beverages_juice', 'beverages_carbonated', 'beverages_alcoholic']`  
per usarla nei form quando si filtra “solo per questo profilo”.

---

### 2.2 `src/utils/defaultCategories.ts` (solo se le categorie devono esistere in DB)

- Aggiungere **5 voci** a `DEFAULT_CATEGORIES` con i **nomi** uguali a quelli in `CATEGORY_ID_TO_DB_NAME` (Frutta / Verdure, Acqua, Succhi, Bibite gassate, Bevande Alcoliche).
- Per “senza range”: o **omettere** `temperature_requirements` (e gestire il caso nel codice che costruisce `allCategories` in AddPointModal) oppure usare ad es. `storage_type: 'fridge'` con `min_temp: 0`, `max_temp: 25` e documentare che non c’è vincolo stretto.
- Necessario **solo se** le categorie devono essere presenti in `product_categories` (es. per inventario/report). Se il backend accetta solo nomi in `product_categories` del punto e non fa FK su `product_categories`, si può evitare e usare solo i nomi da `conservationProfiles`.

---

### 2.3 `src/features/conservation/components/AddPointModal.tsx` (pagina Conservazione)

- I profili vengono da `getProfilesForAppliance(formData.applianceCategory)` e la select profilo è già generica: il nuovo profilo comparirà automaticamente una volta aggiunto in `conservationProfiles.ts`.
- Le “Categorie prodotti (auto-assegnate)” sono già lette da `selectedProfile.allowedCategoryIds` e mappate con `mapCategoryIdsToDbNames`: nessuna modifica se i 5 ID sono in `CATEGORY_ID_TO_DB_NAME` e in `allowedCategoryIds`.
- **Compatibilità categorie**: oggi per `pointType === 'fridge'` la sezione “Categorie prodotti” multi-select è **nascosta** (solo box auto-assegnate dal profilo). Quindi non serve filtrare le categorie nel multi-select per questo profilo; l’unica cosa che conta è che il profilo sia definito in `conservationProfiles.ts` con le 5 categorie.
- **Verifica**: dopo le modifiche in `conservationProfiles.ts`, in AddPointModal con tipo Frigorifero, scegliendo categoria elettrodomestico e profilo "Bibite e Bevande alcoliche" devono comparire le 5 categorie nel box “Categorie prodotti (auto-assegnate)” e in salvataggio `product_categories` devono andare i 5 nomi (da `mapCategoryIdsToDbNames`).

Nessuna modifica obbligatoria in AddPointModal se non si vogliono testi/note specifiche per questo profilo.

---

### 2.4 `src/components/onboarding-steps/ConservationStep.tsx` (onboarding)

- La select **Profilo HACCP** usa `getProfilesForAppliance(formData.applianceCategory)` e `getProfileById`/`mapCategoryIdsToDbNames`: aggiungendo il profilo in `conservationProfiles.ts`, "Bibite e Bevande alcoliche" comparirà in elenco e le 5 categorie saranno mostrate come auto-assegnate.
- **Categorie compatibili**: `compatibleCategories` è calcolato con `getCompatibleCategories(calculatedTemperature, formData.pointType)` che usa la lista **onboarding** `CONSERVATION_CATEGORIES` in `conservationUtils.ts` (non `DEFAULT_CATEGORIES`). Per avere le 5 categorie **solo per questo profilo** in onboarding:
  - **Opzione A**: aggiungere in `conservationUtils.ts` le 5 voci a `CONSERVATION_CATEGORIES` con `range: { min: null, max: null }` e `compatibleTypes: ['fridge']`; poi in ConservationStep, nel `useMemo` di `compatibleCategories`, se `formData.profileId === 'bibite_bevande_alcoliche'` restituire solo le 5 categorie “bibite/bevande”, altrimenti (se c’è un altro profilo selezionato) escludere quelle 5 dall’elenco compatibile.
  - **Opzione B**: lasciare che in onboarding per i frigoriferi le categorie siano solo quelle auto-assegnate dal profilo (come in AddPointModal) e non mostrare il multi-select “Categorie prodotti” quando è selezionato un profilo; in quel caso basta che il profilo sia in `conservationProfiles` e che i dati salvati usino `allowedCategoryIds` → nomi.

Se l’onboarding oggi per `pointType === 'fridge'` mostra sia profilo + categorie auto-assegnate sia un multi-select “Categorie prodotti *” sotto, allora serve **Opzione A** (aggiungere le 5 a `CONSERVATION_CATEGORIES` e filtrare per `profileId === 'bibite_bevande_alcoliche'`).

---

### 2.5 `src/utils/onboarding/conservationUtils.ts`

- Aggiungere le **5 categorie** a `CONSERVATION_CATEGORIES` con:
  - `id`: `beverages_fruit_veg`, `beverages_water`, `beverages_juice`, `beverages_carbonated`, `beverages_alcoholic`
  - `label`: come in tabella sopra (Frutta / Verdure, Acqua, Succhi, Bibite gassate, Bevande Alcoliche)
  - `range`: `{ min: null, max: null }` (nessun range)
  - `compatibleTypes`: `['fridge']` (solo frigorifero)
  - `incompatible`: `[]` o non presente
- In **ConservationStep**, nel calcolo di `compatibleCategories`:
  - se `formData.pointType === 'fridge'` e `formData.profileId === 'bibite_bevande_alcoliche'` → usare solo le 5 categorie sopra;
  - se `formData.pointType === 'fridge'` e un **altro** profilo è selezionato → escludere queste 5 da `getCompatibleCategories(...)`;
  - altrimenti lasciare il comportamento attuale.

Esportare una costante (es. `BEVERAGES_PROFILE_CATEGORY_IDS`) in `conservationUtils` o importarla da `conservationProfiles` per il filtro in ConservationStep.

---

### 2.6 `src/config/applianceImages.ts`

- Nessuna modifica **obbligatoria**: il nuovo profilo userà l’immagine base della categoria elettrodomestico se non esiste `PROFILE_IMAGE_PATHS['...:bibite_bevande_alcoliche']`.
- Opzionale: aggiungere in futuro una immagine dedicata per il profilo "Bibite e Bevande alcoliche" nelle varie categorie elettrodomestico.

---

### 2.7 Validazione e altri punti

- **Validazione temperatura**: le categorie senza range non devono essere validate contro un range; `getCompatibleCategoriesByPointType` e logiche simili già considerano “senza temperature_requirements” come sempre compatibili. Verificare che le 5 nuove categorie non entrino in conflitto con validazioni esistenti (inventoryUtils, conservationUtils).
- **Note HACCP**: per il nuovo profilo si può mostrare comunque “Temperatura consigliata: 4°C” (o il valore in `recommendedSetPointsC.fridge`) come indicazione per il frigorifero; le “categorie senza range” riguardano solo le categorie prodotto, non il setpoint del punto.
- **Test**: aggiornare `conservationProfiles.test.ts` (e eventuali test su ConservationStep/AddPointModal) per includere il nuovo `profileId` e le 5 categorie.

---

## 3. Riepilogo ordine implementazione suggerito

1. **conservationProfiles.ts**: type, CATEGORY_ID_TO_DB_NAME, nuovo profilo per tutti e 4 gli appliance, PROFILE_LABELS, eventuale costante BEVERAGES_PROFILE_ONLY_CATEGORY_IDS.
2. **conservationUtils.ts**: aggiungere le 5 voci a CONSERVATION_CATEGORIES; eventuale costante per ID categorie “solo profilo bibite”.
3. **ConservationStep.tsx**: filtrare `compatibleCategories` in base a `profileId === 'bibite_bevande_alcoliche'` (solo le 5) o escludere le 5 per gli altri profili.
4. **defaultCategories.ts** (opzionale): aggiungere le 5 categorie solo se servono in DB; in AddPointModal gestire `temperature_requirements` opzionale se si omettono.
5. **AddPointModal**: nessuna modifica strettamente necessaria; verificare in UI che profilo e categorie auto-assegnate funzionino.
6. **applianceImages**: solo se si aggiunge un’immagine dedicata al profilo.
7. **Test**: aggiornare test esistenti e aggiungere un caso per il profilo "Bibite e Bevande alcoliche".

---

## 4. Domande aperte (da chiarire con te)

1. **Nome ID profilo**: preferisci `bibite_bevande_alcoliche` (italiano) o `beverages_alcoholic` (inglese) per `ConservationProfileId`? Il resto del codebase usa inglese per gli ID (es. `meat_generic`, `vegetables_generic`).
2. **Categorie nel DB**: le 5 categorie devono esistere nella tabella `product_categories` (creata con `createDefaultCategories`) per inventario/report, o ti basta salvare solo i nomi nell’array `product_categories` del punto di conservazione senza FK?
3. **Onboarding**: quando in onboarding l’utente seleziona "Bibite e Bevande alcoliche", le 5 categorie devono essere **solo** in sola lettura (box auto-assegnate) come in Conservazione, oppure deve esserci anche la possibilità di selezionare/deselezionare qualcosa nel multi-select "Categorie prodotti *"? In altre parole: il multi-select in onboarding per i frigoriferi con profilo deve mostrare solo le 5 per questo profilo o solo le categorie del profilo (read-only)?
4. **Temperatura consigliata**: per il frigorifero con questo profilo va bene mostrare in nota HACCP “Temperatura consigliata: 4°C” (o altro valore)? O preferisci nascondere del tutto il riferimento alla temperatura per questo profilo?
5. **Immagine profilo**: vuoi già predisporre il path per un’immagine dedicata "Bibite e Bevande alcoliche" in `applianceImages.ts` (anche senza file) o va bene usare l’immagine base dell’elettrodomestico?

Dopo le tue risposte si può procedere con le modifiche puntuali nei file.

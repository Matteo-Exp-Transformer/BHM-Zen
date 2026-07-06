# Mappatura modifiche: profilo HACCP "Bibite e Bevande alcoliche"

## Obiettivo
Aggiungere un nuovo profilo HACCP **"Bibite e Bevande alcoliche"** nei form:
- **Conservation page**: modal "Nuovo Punto di Conservazione" (AddPointModal)
- **Onboarding**: form "Aggiungi punto di conservazione" (ConservationStep)

Il profilo ha **5 categorie prodotti auto-assegnate**, disponibili **solo per questo profilo** e **senza range di temperatura di conservazione**.

---

## Scelte adottate (risposte utente)

1. **ID profilo**: inglese → `beverages_alcoholic`
2. **Categorie nel DB**: solo nomi nell’array `product_categories` del punto (nessuna voce in `product_categories` / `DEFAULT_CATEGORIES`)
3. **Onboarding**: solo box "Categorie prodotti (auto-assegnate)" per questo profilo
4. **Temperatura consigliata**: 4°C mostrata nelle note HACCP
5. **Immagine**: immagine base dell’elettrodomestico (nessuna immagine dedicata al profilo)

---

## Categorie prodotti (solo per questo profilo)

| ID interno (code)      | Nome visualizzato    |
|------------------------|----------------------|
| `beverages_fruit_veg`  | Frutta / Verdure     |
| `beverages_water`      | Acqua                |
| `beverages_juice`      | Succhi               |
| `beverages_carbonated` | Bibite gassate       |
| `beverages_alcoholic`  | Bevande Alcoliche    |

- Nessun range temperatura: le categorie non hanno vincolo min/max.
- Visibilità: le 5 categorie compaiono **solo** quando è selezionato il profilo "Bibite e Bevande alcoliche"; negli altri profili frigorifero non sono selezionabili.

---

## File modificati (implementazione)

### 1. `src/utils/conservationProfiles.ts`
- **ConservationProfileId**: aggiunto `'beverages_alcoholic'`
- **CATEGORY_ID_TO_DB_NAME**: aggiunte le 5 voci (beverages_fruit_veg → Frutta / Verdure, ecc.)
- **CONSERVATION_PROFILES**: per ogni `ApplianceCategory` aggiunto il profilo "Bibite e Bevande alcoliche" con:
  - `profileId`: `'beverages_alcoholic'`
  - `name`: `'Bibite e Bevande alcoliche'`
  - `recommendedSetPointsC`: `{ fridge: 4 }` (e `freezer: -18` per vertical_fridge_with_freezer)
  - `allowedCategoryIds`: le 5 categorie sopra
  - `compartmentFill`: distribuzione sulle porte/ripiani frigo (freezer vuoto per vertical_fridge_with_freezer)
  - `haccpNotes`: "Categorie senza range di temperatura obbligatorio; adatto a cella bevande / bar." e "Temperatura consigliata: 4°C."
- **BEVERAGES_PROFILE_CATEGORY_IDS**: costante esportata con i 5 ID per filtri nei form
- **PROFILE_LABELS**: `beverages_alcoholic: 'Bibite e Bevande alcoliche'`

### 2. `src/utils/defaultCategories.ts`
- **Nessuna modifica**: le categorie non sono create in DB; si usano solo i nomi nell’array `product_categories` del punto.

### 3. `src/utils/onboarding/conservationUtils.ts`
- **CONSERVATION_CATEGORIES**: aggiunte le 5 voci con `range: { min: null, max: null }` e `compatibleTypes: ['fridge']` per onboarding (filtro compatibili e pre-compilazione).

### 4. `src/components/onboarding-steps/ConservationStep.tsx`
- Import di **BEVERAGES_PROFILE_CATEGORY_IDS**
- **compatibleCategories**: se `profileId === 'beverages_alcoholic'` → solo le 5 categorie; se altro profilo frigorifero → esclusione delle 5 dall’elenco compatibile
- **useEffect**: quando `profileId === 'beverages_alcoholic'` e `selectedProfile` è valorizzato, pre-compilazione di `productCategories` con `selectedProfile.allowedCategoryIds` (solo box auto-assegnate)

### 5. `src/features/conservation/components/AddPointModal.tsx`
- **Nessuna modifica**: il profilo e le categorie auto-assegnate derivano da `conservationProfiles.ts`; per frigoriferi è già mostrato solo il box "Categorie prodotti (auto-assegnate)".

### 6. `src/config/applianceImages.ts`
- **Nessuna modifica**: uso dell’immagine base dell’elettrodomestico.

### 7. `src/utils/__tests__/conservationProfiles.test.ts`
- Test **getProfilesForAppliance**: atteso 5 profili (incluso `beverages_alcoholic`) per `vertical_fridge_with_freezer`
- Nuovo test **getProfileById** per `beverages_alcoholic` (nome, temperatura 4°C, `allowedCategoryIds` con le 5 categorie)

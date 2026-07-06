# Report: profilo HACCP "Bibite e Bevande alcoliche"

**Data**: 29-01-2026  
**Obiettivo**: aggiungere il profilo HACCP "Bibite e Bevande alcoliche" con 5 categorie prodotti auto-assegnate (solo per questo profilo, senza range temperatura) nei form Conservazione e Onboarding.

---

## 1. Lavoro svolto

### 1.1 Profilo e categorie

- **Profilo**: nome "Bibite e Bevande alcoliche", ID `beverages_alcoholic` (inglese).
- **Categorie** (solo per questo profilo, nessun range temperatura):
  - Frutta / Verdure (`beverages_fruit_veg`)
  - Acqua (`beverages_water`)
  - Succhi (`beverages_juice`)
  - Bibite gassate (`beverages_carbonated`)
  - Bevande Alcoliche (`beverages_alcoholic`)

### 1.2 File modificati

| File | Modifiche |
|------|-----------|
| `src/utils/conservationProfiles.ts` | Aggiunto type `beverages_alcoholic`; 5 voci in `CATEGORY_ID_TO_DB_NAME`; nuovo profilo per tutte e 4 le categorie elettrodomestico (vertical_fridge_with_freezer, vertical_fridge_1_door, vertical_fridge_2_doors, base_refrigerated); costante `BEVERAGES_PROFILE_CATEGORY_IDS`; voce in `PROFILE_LABELS`. |
| `src/utils/onboarding/conservationUtils.ts` | Aggiunte 5 voci a `CONSERVATION_CATEGORIES` con `range: { min: null, max: null }` e `compatibleTypes: ['fridge']`. |
| `src/components/onboarding-steps/ConservationStep.tsx` | Import `BEVERAGES_PROFILE_CATEGORY_IDS`; filtro `compatibleCategories` per profilo (solo le 5 se `beverages_alcoholic`, escluse le 5 per gli altri profili frigorifero); `useEffect` che pre-compila `productCategories` con le 5 categorie quando è selezionato il profilo "Bibite e Bevande alcoliche". |
| `src/utils/__tests__/conservationProfiles.test.ts` | Test aggiornato: 5 profili per `vertical_fridge_with_freezer`; nuovo test per `getProfileById('beverages_alcoholic', ...)` (nome, fridge 4°C, `allowedCategoryIds` con le 5 categorie). |

### 1.3 File non modificati (per scelta)

- **defaultCategories.ts**: le categorie non sono inserite in DB; si usano solo i nomi nell’array `product_categories` del punto.
- **AddPointModal.tsx**: profilo e categorie auto-assegnate già gestiti da `conservationProfiles.ts`; per frigoriferi è mostrato solo il box "Categorie prodotti (auto-assegnate)".
- **applianceImages.ts**: nessuna immagine dedicata al profilo; si usa l’immagine base dell’elettrodomestico.

---

## 2. Comportamento atteso

### 2.1 Pagina Conservazione (Nuovo Punto di Conservazione)

- Tipo punto: **Frigorifero** → compaiono Categoria elettrodomestico e Profilo HACCP.
- In "Profilo HACCP" è presente **"Bibite e Bevande alcoliche"**.
- Selezionando questo profilo:
  - Nel box "Categorie prodotti (auto-assegnate)" compaiono le 5 categorie (Frutta / Verdure, Acqua, Succhi, Bibite gassate, Bevande Alcoliche).
  - Nelle note HACCP: "Categorie senza range di temperatura obbligatorio; adatto a cella bevande / bar." e "Temperatura consigliata: 4°C."
  - Alla salvataggio, `product_categories` del punto contiene i 5 **nomi** (da `mapCategoryIdsToDbNames`).
- Immagine: quella base della categoria elettrodomestico scelta.

### 2.2 Onboarding (Aggiungi punto di conservazione)

- Tipo punto: **Frigorifero** → Categoria elettrodomestico e Profilo HACCP.
- In "Profilo HACCP" è presente **"Bibite e Bevande alcoliche"**.
- Selezionando questo profilo:
  - Box "Categorie prodotti (auto-assegnate)" con le 5 categorie.
  - Le 5 categorie sono pre-compilate in `productCategories` (solo box; multi-select "Categorie prodotti *" per frigorifero con profilo mostra solo le 5 quando profilo = beverages_alcoholic, altrimenti le esclude).
- Se si seleziona un **altro** profilo frigorifero, le 5 categorie "bibite/bevande" non compaiono nell’elenco compatibile.

---

## 3. Test

- **conservationProfiles.test.ts**: eseguito e aggiornato (5 profili per vertical_fridge_with_freezer, test dedicato a `beverages_alcoholic`).
- Verifica manuale consigliata: flusso Conservazione e Onboarding con profilo "Bibite e Bevande alcoliche" e salvataggio punto.

---

## 4. Riferimenti

- Mappatura dettagliata: `MAPPATURA_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md` (stessa cartella).
- Mappatura originale (24-01-2026): `../24-01-2026/MAPPATURA_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md`.

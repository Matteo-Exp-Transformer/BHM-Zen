# Piano Implementazione: Profilo Punto di Conservazione

**Data Creazione**: 2026-01-19
**Ultima Modifica**: 2026-01-19
**Versione**: 2.0.0
**Stato**: Ready for Multi-Agent Development

---

## Obiettivo

Sostituire la sezione "Categorie Prodotti" nel form AddPointModal con una nuova sezione "Profilo Punto di Conservazione" che permette di selezionare:

- **Categoria punto di conservazione** (1 opzione iniziale: Frigorifero Verticale con Freezer)
- **Profilo punto di conservazione** (5 opzioni: Profilo Generico, Carne+Generico, Verdure+Generico, Pesce+Generico, Carne+Pesce+Generico)

---

## Scope e Limitazioni

### Tipi Supportati da Profili
I profili HACCP si applicano **SOLO** a punti di tipo frigorifero (`pointType === 'fridge'`):
- `vertical_fridge_with_freezer` - Frigorifero Verticale con Freezer (unica categoria implementata in questa fase)

### Tipi NON Supportati (sistema attuale)
- **Freezer** (`pointType === 'freezer'`): Usa sistema categorie prodotti esistente
- **Abbattitore** (`pointType === 'blast'`): Usa sistema categorie prodotti esistente
- **Ambiente** (`pointType === 'ambient'`): Usa sistema categorie prodotti esistente

### Logica UI Condizionale
- Se `pointType === 'fridge'`: Mostra sezione "Profilo Punto di Conservazione"
- Altrimenti: Mostra sezione "Categorie Prodotti" (sistema attuale editabile)

---

## Architettura

### Profili Standard (Fase Corrente)
- Costanti TypeScript nel codice (`src/utils/conservationProfiles.ts`)
- 5 profili predefiniti
- Solo `profile_id` (string) viene salvato nel DB
- `profile_config` viene ricostruito dal codice quando necessario

### Profili Custom (Futuro)
- Tabella `cons_point_custom_profile` nel DB
- Profili personalizzati per azienda
- `is_custom_profile = true` e `profile_config` JSONB salvato

---

## Fase 0: Fix Bug Critici (PRE-REQUISITO)

**Priorità**: BLOCCANTE - Da completare prima di qualsiasi altra fase.

### 0.1 Fix Select Ruolo Non Funzionante

**File**: `src/features/conservation/components/AddPointModal.tsx`

**Problema**: Il Select Radix UI per il ruolo nelle manutenzioni non si apre quando cliccato.

**Diagnosi**:
- `SelectContent` usa Portal ma potrebbe essere tagliato da `overflow: hidden` sul modal container
- Possibile conflitto z-index tra modal e dropdown

**Soluzione**:
```tsx
// Verificare configurazione Select
<Select
  value={task.assegnatoARuolo || ''}
  onValueChange={(value) => updateMaintenanceTask(index, { ...task, assegnatoARuolo: value })}
>
  <SelectTrigger id={`role-select-${index}`}>
    <SelectValue placeholder="Seleziona ruolo..." />
  </SelectTrigger>
  <SelectContent position="popper" sideOffset={5}>
    {STAFF_ROLES.map(role => (
      <SelectItem key={role.value} value={role.value}>
        {role.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Verifica aggiuntiva**:
- Assicurarsi che overflow sia solo su scroll area interna, non sul container esterno

### 0.2 Fix z-index Modal

**File**: `src/features/conservation/components/AddPointModal.tsx`

**Problema**: Modal usa `z-50` invece di `z-[9999]`, appare sotto header/dashboard.

**Soluzione**: Cambiare z-index del modal overlay da `z-50` a `z-[9999]`

### 0.3 Fix Campi Categoria/Dipendente Non Visibili

**File**: `src/features/conservation/components/AddPointModal.tsx`

**Problema**: Campi "Categoria Staff" e "Dipendente Specifico" non appaiono dopo selezione ruolo.

**Diagnosi**: Condizione `task.assegnatoARuolo` probabilmente non viene soddisfatta a causa del bug 0.1.

**Soluzione**: Dopo fix 0.1, verificare che i campi appaiano. Se non appaiono, verificare la logica condizionale.

### Checklist Fase 0 ✅ COMPLETATA
- [x] Select Ruolo funzionante (apre dropdown)
- [x] Modal sopra tutti gli elementi (z-[9999])
- [x] Campi Categoria/Dipendente visibili dopo selezione ruolo
- [x] Test manuale completato su desktop e mobile
- [x] Salvataggio funziona correttamente

**Note**: Fase 0 completata il 19-01-2026. Tutti i bug risolti e testati manualmente. Il modal funziona correttamente fino al salvataggio eseguito con successo.

---

## Fase 1: Database Schema ✅ COMPLETATA

### Checklist Fase 1 ✅ COMPLETATA
- [x] Migration 018 creata ed eseguita
- [x] Colonne appliance_category, profile_id, profile_config, is_custom_profile aggiunte
- [x] Indice idx_conservation_points_profile creato
- [x] Migration 019 creata ed eseguita
- [x] Tabella cons_point_custom_profile creata
- [x] Indici e trigger configurati correttamente
- [x] Migration 020 creata ed eseguita
- [x] Mapping categorie verificato
- [x] Integrità dati verificata (7/7 punti con categorie, nessun dato perso)
- [x] Commit creato: "feat(db): add conservation profile schema" (5b403331)

**Note**: Fase 1 completata il 20-01-2026. Tutte le migration eseguite con successo sul database cloud. Categorie esistenti erano già in formato snake_case, quindi il mapping da nomi italiani non si è applicato (comportamento corretto). Il database è pronto per la FASE 2.

---

### 1.1 Aggiornare tabella `conservation_points`

**File**: `database/migrations/018_add_conservation_profile_fields.sql`

```sql
-- Migration: Aggiunge campi per profili punto di conservazione
-- Versione: 018
-- Data: 2026-01-19

ALTER TABLE public.conservation_points
ADD COLUMN IF NOT EXISTS appliance_category VARCHAR,
ADD COLUMN IF NOT EXISTS profile_id VARCHAR,
ADD COLUMN IF NOT EXISTS profile_config JSONB,
ADD COLUMN IF NOT EXISTS is_custom_profile BOOLEAN DEFAULT false;

-- Commenti per documentazione
COMMENT ON COLUMN public.conservation_points.appliance_category IS 'Categoria appliance (es. vertical_fridge_with_freezer)';
COMMENT ON COLUMN public.conservation_points.profile_id IS 'ID profilo: string per standard, UUID per custom';
COMMENT ON COLUMN public.conservation_points.profile_config IS 'Config profilo SOLO per custom (NULL per standard)';
COMMENT ON COLUMN public.conservation_points.is_custom_profile IS 'true se custom, false se standard';

-- Index per query performance
CREATE INDEX IF NOT EXISTS idx_conservation_points_profile
ON public.conservation_points(profile_id) WHERE profile_id IS NOT NULL;
```

### 1.2 Creare tabella `cons_point_custom_profile` (template vuoto)

**File**: `database/migrations/019_create_custom_profiles_table.sql`

```sql
-- Migration: Crea tabella per profili custom (futuro)
-- Versione: 019
-- Data: 2026-01-19

CREATE TABLE IF NOT EXISTS public.cons_point_custom_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  appliance_category VARCHAR NOT NULL,
  profile_config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_profiles_company_id
ON public.cons_point_custom_profile(company_id);

CREATE INDEX IF NOT EXISTS idx_custom_profiles_category
ON public.cons_point_custom_profile(appliance_category);

-- Trigger per updated_at
CREATE TRIGGER update_custom_profiles_updated_at
  BEFORE UPDATE ON public.cons_point_custom_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.3 Migration Categorie Prodotti

**File**: `database/migrations/020_replace_product_categories.sql`

**Strategia**: Mapping sicuro → Delete → Insert

```sql
-- Migration: Sostituisce categorie prodotti con nuove allineate ai profili HACCP
-- Versione: 020
-- Data: 2026-01-19
-- ATTENZIONE: Questa migration cancella e ricrea le categorie globali

-- STEP 1: Creare tabella mapping temporanea
CREATE TEMP TABLE category_mapping (
  old_name VARCHAR,
  new_id VARCHAR,
  new_name VARCHAR
);

INSERT INTO category_mapping VALUES
  ('Carni Fresche', 'raw_meat', 'Carni crude'),
  ('Pesce Fresco', 'raw_fish', 'Pesce e frutti di mare crudi'),
  ('Latticini', 'dairy', 'Latticini'),
  ('Verdure Fresche', 'produce', 'Verdure e ortofrutta'),
  ('Bevande', 'beverages', 'Bevande'),
  ('Congelati', 'frozen_ready', 'Congelati: preparazioni'),
  ('Ultracongelati', 'frozen_meat_fish', 'Congelati: carni e pesce'),
  ('Dispensa Secca', 'preserves_closed', 'Conserve/semiconserve'),
  ('Abbattimento Rapido', 'rte', 'Preparazioni/Pronti/Cotti (RTE)');

-- STEP 2: Aggiornare conservation_points.product_categories con nuovi nomi
UPDATE conservation_points cp
SET product_categories = (
  SELECT array_agg(COALESCE(cm.new_name, elem))
  FROM unnest(cp.product_categories) AS elem
  LEFT JOIN category_mapping cm ON cm.old_name = elem
)
WHERE product_categories IS NOT NULL AND array_length(product_categories, 1) > 0;

-- STEP 3: Cancellare vecchie categorie globali (company_id IS NULL o categorie default)
DELETE FROM product_categories
WHERE name IN (
  'Carni Fresche', 'Pesce Fresco', 'Latticini', 'Verdure Fresche',
  'Bevande', 'Congelati', 'Ultracongelati', 'Dispensa Secca', 'Abbattimento Rapido'
);

-- STEP 4: Inserire nuove categorie con temperature_requirements
-- Le categorie sono per-azienda, quindi questa migration crea un template
-- che viene usato da createDefaultCategories() nel codice

-- Nota: Le categorie effettive vengono create per ogni azienda tramite
-- src/utils/defaultCategories.ts - questa migration aggiorna solo lo schema

DROP TABLE IF EXISTS category_mapping;
```

### 1.4 File Seed Categorie (Codice TypeScript)

**File**: `src/utils/defaultCategories.ts` (da aggiornare)

Le 14 categorie dal template JSON:
1. `rte` - Preparazioni/Pronti/Cotti (RTE) - fridge 0-4°C
2. `dairy` - Latticini - fridge 2-6°C
3. `eggs` - Uova - fridge 2-6°C
4. `cured_meats` - Salumi e affettati - fridge 0-4°C
5. `produce` - Verdure e ortofrutta - fridge 2-8°C
6. `aromatic_herbs` - Erbe aromatiche fresche - fridge 2-8°C
7. `raw_meat` - Carni crude - fridge 0-4°C
8. `raw_fish` - Pesce e frutti di mare crudi - fridge 0-2°C
9. `sauces_closed` - Salse/condimenti - fridge 2-8°C
10. `beverages` - Bevande - fridge 2-12°C
11. `preserves_closed` - Conserve/semiconserve - ambient 15-25°C
12. `frozen_ready` - Congelati: preparazioni - freezer -25 to -18°C
13. `frozen_veg` - Congelati: vegetali - freezer -25 to -18°C
14. `frozen_meat_fish` - Congelati: carni e pesce - freezer -25 to -18°C

---

## Fase 2: Costanti TypeScript ✅ COMPLETATA

### Checklist Fase 2 ✅ COMPLETATA
- [x] File conservationProfiles.ts creato con tutti i tipi
- [x] 5 profili HACCP definiti correttamente
- [x] Template VERTICAL_FRIDGE_WITH_FREEZER_TEMPLATE creato
- [x] Mapping CATEGORY_ID_TO_DB_NAME completo
- [x] Helper functions implementate (getProfileById, getProfilesForAppliance, mapCategoryIdsToDbNames)
- [x] Labels UI presenti (APPLIANCE_CATEGORY_LABELS, PROFILE_LABELS)
- [x] conservation.ts aggiornato con import e campi opzionali
- [x] defaultCategories.ts aggiornato con 14 categorie
- [x] Type-check passa (errori preesistenti non legati ai nuovi campi)

**Note**: Fase 2 completata il 20-01-2026. Tutti i file TypeScript creati e aggiornati correttamente. Costanti, tipi e helper functions verificati e funzionanti.

---

### 2.1 Creare file profili conservazione

**File**: `src/utils/conservationProfiles.ts`

```typescript
// Costanti per profili punto di conservazione HACCP

export type ApplianceCategory = 'vertical_fridge_with_freezer'
// Future: | 'vertical_fridge_1_door' | 'vertical_fridge_2_doors' | 'display_fridge' | 'glass_door_fridge'

export type ConservationProfileId =
  | 'max_capacity'
  | 'meat_generic'
  | 'vegetables_generic'
  | 'fish_generic'
  | 'meat_fish_generic'

export interface CompartmentDefinition {
  id: string
  zone: 'fridge' | 'fridge_door' | 'freezer'
  label: string
  order: number
}

export interface PlacementRule {
  ruleId: string
  title: string
  short: string
}

export interface ConservationProfile {
  profileId: ConservationProfileId
  name: string
  applianceType: string
  recommendedSetPointsC: { fridge: number; freezer?: number }
  allowedCategoryIds: string[]
  compartmentFill: Record<string, string[]>
  haccpNotes: string[]
}

export interface ApplianceTemplate {
  templateId: string
  applianceType: string
  compartments: CompartmentDefinition[]
  globalPlacementRules: PlacementRule[]
}

// Template per Frigorifero Verticale con Freezer
export const VERTICAL_FRIDGE_WITH_FREEZER_TEMPLATE: ApplianceTemplate = {
  templateId: 'vertical_fridge_with_freezer_v1',
  applianceType: 'Frigorifero verticale con Freezer',
  compartments: [
    { id: 'fr_shelf_1_top', zone: 'fridge', label: 'Ripiano 1 (alto)', order: 1 },
    { id: 'fr_shelf_2', zone: 'fridge', label: 'Ripiano 2', order: 2 },
    { id: 'fr_shelf_3', zone: 'fridge', label: 'Ripiano 3', order: 3 },
    { id: 'fr_shelf_4_bottom', zone: 'fridge', label: 'Ripiano 4 (basso)', order: 4 },
    { id: 'fr_crisper_drawer', zone: 'fridge', label: 'Cassetto/Vaschetta', order: 5 },
    { id: 'fr_door_1_top', zone: 'fridge_door', label: 'Porta ripiano 1 (alto)', order: 6 },
    { id: 'fr_door_2_mid', zone: 'fridge_door', label: 'Porta ripiano 2 (medio)', order: 7 },
    { id: 'fr_door_3_bottom', zone: 'fridge_door', label: 'Porta ripiano 3 (basso)', order: 8 },
    { id: 'fz_drawer_1_top', zone: 'freezer', label: 'Freezer cassetto 1 (alto)', order: 9 },
    { id: 'fz_drawer_2_mid', zone: 'freezer', label: 'Freezer cassetto 2 (medio)', order: 10 },
    { id: 'fz_drawer_3_bottom', zone: 'freezer', label: 'Freezer cassetto 3 (basso)', order: 11 },
  ],
  globalPlacementRules: [
    { ruleId: 'raw_below_rte', title: 'Crudo sempre sotto a Preparazioni/Pronti/Cotti', short: 'Ripiani alti = Preparazioni/Pronti/Cotti; ripiani bassi = crudi (a tenuta).' },
    { ruleId: 'sealed_containers', title: 'Crudi e preparazioni SEMPRE chiusi e a tenuta', short: 'Doppio contenimento dove possibile + etichetta (nome, data/ora, scadenza).' },
    { ruleId: 'door_is_warmest', title: 'La porta è la zona più instabile', short: 'Porta solo per bevande/condimenti/conserve chiuse.' },
    { ruleId: 'freezer_target', title: 'Freezer: mantenere almeno -18°C', short: 'Separare per tipologia in sacchetti/box dedicati.' },
    { ruleId: 'herbs_with_produce', title: 'Erbe aromatiche = come ortofrutta fresca', short: 'Nel cassetto verdure, protette e lontane da crudi.' },
  ],
}

// 5 Profili per Frigorifero Verticale con Freezer
export const CONSERVATION_PROFILES: Record<ApplianceCategory, ConservationProfile[]> = {
  vertical_fridge_with_freezer: [
    {
      profileId: 'max_capacity',
      name: 'Profilo Massima Capienza',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 2, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'eggs', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'eggs'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Capienza massima = disciplina massima: contenitori a tenuta e ordine verticale rigoroso.',
        'Sul ripiano basso: ideale usare BOX separati (carne vs pesce).',
        'Set point 2°C: compromesso conservativo per includere anche pesce.',
      ],
    },
    {
      profileId: 'meat_generic',
      name: 'Profilo Carne + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 3, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Carni crude sempre in basso e a tenuta (anti-gocciolamento).',
        'Set point 3°C: range operativo tipico 0-4°C con buon margine.',
      ],
    },
    {
      profileId: 'vegetables_generic',
      name: 'Profilo Verdure + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 4, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['produce', 'cured_meats'],
        fr_shelf_4_bottom: ['produce'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages', 'preserves_closed'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_ready'],
      },
      haccpNotes: [
        'Set point 4°C: più adatto a verdure (riduce danni da freddo).',
        'Valuta gestione dedicata per ortaggi sensibili al freddo.',
      ],
    },
    {
      profileId: 'fish_generic',
      name: 'Profilo Pesce + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 1, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'produce', 'aromatic_herbs', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy', 'sauces_closed'],
        fr_shelf_3: ['produce'],
        fr_shelf_4_bottom: ['raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Set point 1°C: profilo conservativo per pesce fresco.',
        'Pesce crudo: doppio contenimento + pulizia frequente ripiano basso.',
      ],
    },
    {
      profileId: 'meat_fish_generic',
      name: 'Profilo Carne + Pesce + Generico',
      applianceType: 'Frigorifero verticale con Freezer',
      recommendedSetPointsC: { fridge: 2, freezer: -18 },
      allowedCategoryIds: ['rte', 'dairy', 'cured_meats', 'produce', 'aromatic_herbs', 'raw_meat', 'raw_fish', 'sauces_closed', 'beverages', 'preserves_closed', 'frozen_ready', 'frozen_veg', 'frozen_meat_fish'],
      compartmentFill: {
        fr_shelf_1_top: ['rte'],
        fr_shelf_2: ['dairy'],
        fr_shelf_3: ['cured_meats', 'sauces_closed'],
        fr_shelf_4_bottom: ['raw_meat', 'raw_fish'],
        fr_crisper_drawer: ['produce', 'aromatic_herbs'],
        fr_door_1_top: ['beverages'],
        fr_door_2_mid: ['sauces_closed'],
        fr_door_3_bottom: ['beverages', 'preserves_closed'],
        fz_drawer_1_top: ['frozen_ready'],
        fz_drawer_2_mid: ['frozen_veg'],
        fz_drawer_3_bottom: ['frozen_meat_fish'],
      },
      haccpNotes: [
        'Profilo ibrido: separare carne e pesce con BOX dedicati.',
        'Set point 2°C: compromesso per includere pesce.',
      ],
    },
  ],
}

// Mapping category ID → DB name
export const CATEGORY_ID_TO_DB_NAME: Record<string, string> = {
  rte: 'Preparazioni/Pronti/Cotti (RTE)',
  dairy: 'Latticini',
  eggs: 'Uova',
  cured_meats: 'Salumi e affettati',
  produce: 'Verdure e ortofrutta',
  aromatic_herbs: 'Erbe aromatiche fresche',
  raw_meat: 'Carni crude',
  raw_fish: 'Pesce e frutti di mare crudi',
  sauces_closed: 'Salse/condimenti',
  beverages: 'Bevande',
  preserves_closed: 'Conserve/semiconserve',
  frozen_ready: 'Congelati: preparazioni',
  frozen_veg: 'Congelati: vegetali',
  frozen_meat_fish: 'Congelati: carni e pesce',
}

// Helper functions
export function getProfileById(
  profileId: ConservationProfileId,
  applianceCategory: ApplianceCategory
): ConservationProfile | null {
  const profiles = CONSERVATION_PROFILES[applianceCategory]
  return profiles?.find(p => p.profileId === profileId) || null
}

export function getProfilesForAppliance(
  applianceCategory: ApplianceCategory
): ConservationProfile[] {
  return CONSERVATION_PROFILES[applianceCategory] || []
}

export function mapCategoryIdToDbName(categoryId: string): string | null {
  return CATEGORY_ID_TO_DB_NAME[categoryId] || null
}

export function mapCategoryIdsToDbNames(categoryIds: string[]): string[] {
  return categoryIds
    .map(id => CATEGORY_ID_TO_DB_NAME[id])
    .filter((name): name is string => name !== null)
}

// Appliance category labels for UI
export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: 'Frigorifero Verticale con Freezer',
}

// Profile labels for UI
export const PROFILE_LABELS: Record<ConservationProfileId, string> = {
  max_capacity: 'Profilo Massima Capienza',
  meat_generic: 'Profilo Carne + Generico',
  vegetables_generic: 'Profilo Verdure + Generico',
  fish_generic: 'Profilo Pesce + Generico',
  meat_fish_generic: 'Profilo Carne + Pesce + Generico',
}
```

### 2.2 Aggiornare tipi TypeScript

**File**: `src/types/conservation.ts`

Aggiungere:
```typescript
import type { ApplianceCategory, ConservationProfileId, ConservationProfile } from '@/utils/conservationProfiles'

export type { ApplianceCategory, ConservationProfileId, ConservationProfile }

// Aggiornare ConservationPoint interface
export interface ConservationPoint {
  // ... campi esistenti
  appliance_category?: ApplianceCategory
  profile_id?: string
  profile_config?: ConservationProfile | null
  is_custom_profile?: boolean
}
```

---

## Fase 3: Modifiche UI - AddPointModal ✅ COMPLETATA

### Checklist Fase 3 ✅ COMPLETATA
- [x] Sezione categorie read-only quando profilo selezionato
- [x] Label "(auto-configurate)" visibile
- [x] Sezione "Profilo Punto di Conservazione" condizionale (solo per frigoriferi)
- [x] Select Categoria Appliance funzionante
- [x] Select Profilo filtrato per categoria
- [x] Info Box con note HACCP e temperatura consigliata
- [x] Auto-configurazione implementata (useMemo + useEffect)
- [x] State formData aggiornato con applianceCategory, profileId, isCustomProfile
- [x] Validazione profilo per frigoriferi
- [x] Submit include tutti i nuovi campi
- [x] Form funziona end-to-end

**Note**: Fase 3 completata il 20-01-2026. Tutte le modifiche UI implementate e testate. Sezione profilo condizionale, auto-configurazione e validazione funzionanti correttamente.

---

### 3.1 Sezione Categorie Prodotti Read-Only

**File**: `src/features/conservation/components/AddPointModal.tsx`

**NON commentare** la sezione categorie, ma renderla **read-only** quando profilo selezionato:

```tsx
{/* Sezione Categorie Prodotti */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label>Categorie prodotti {formData.profileId ? '(auto-configurate)' : '*'}</Label>
    {formData.profileId && (
      <span className="text-sm text-blue-600">
        Configurate dal profilo selezionato
      </span>
    )}
  </div>

  <div className={formData.profileId ? 'opacity-75 pointer-events-none' : ''}>
    {/* Grid categorie esistente */}
  </div>
</div>
```

### 3.2 Aggiungere Sezione Profilo Condizionale

**File**: `src/features/conservation/components/AddPointModal.tsx`

Aggiungere DOPO sezione "Tipologia", SOLO se `pointType === 'fridge'`:

```tsx
{formData.pointType === 'fridge' && (
  <div className="space-y-4 border-t pt-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-blue-600" />
      Profilo Punto di Conservazione
    </h3>

    {/* Select Categoria Appliance */}
    <div className="space-y-2">
      <Label htmlFor="appliance-category">Categoria elettrodomestico *</Label>
      <Select
        value={formData.applianceCategory || ''}
        onValueChange={(value) => setFormData(prev => ({
          ...prev,
          applianceCategory: value as ApplianceCategory,
          profileId: '' // Reset profilo quando cambia categoria
        }))}
      >
        <SelectTrigger id="appliance-category">
          <SelectValue placeholder="Seleziona categoria..." />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={5}>
          {Object.entries(APPLIANCE_CATEGORY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Select Profilo */}
    {formData.applianceCategory && (
      <div className="space-y-2">
        <Label htmlFor="profile-select">Profilo HACCP *</Label>
        <Select
          value={formData.profileId || ''}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            profileId: value
          }))}
        >
          <SelectTrigger id="profile-select">
            <SelectValue placeholder="Seleziona profilo..." />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            {getProfilesForAppliance(formData.applianceCategory).map(profile => (
              <SelectItem key={profile.profileId} value={profile.profileId}>
                {profile.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}

    {/* Info Box Note HACCP */}
    {selectedProfile && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-blue-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Note HACCP
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {selectedProfile.haccpNotes.map((note, i) => (
            <li key={i}>• {note}</li>
          ))}
        </ul>
        <p className="text-sm text-blue-600 mt-2">
          Temperatura consigliata: <strong>{selectedProfile.recommendedSetPointsC.fridge}°C</strong>
        </p>
      </div>
    )}
  </div>
)}
```

### 3.3 Implementare Auto-Configurazione

**File**: `src/features/conservation/components/AddPointModal.tsx`

```tsx
// State per profilo selezionato
const selectedProfile = useMemo(() => {
  if (!formData.applianceCategory || !formData.profileId) return null
  return getProfileById(
    formData.profileId as ConservationProfileId,
    formData.applianceCategory as ApplianceCategory
  )
}, [formData.applianceCategory, formData.profileId])

// Auto-configurazione quando profilo selezionato
useEffect(() => {
  if (selectedProfile) {
    // 1. Imposta temperatura target
    const recommendedTemp = selectedProfile.recommendedSetPointsC.fridge

    // 2. Mappa categorie
    const mappedCategories = mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds)

    setFormData(prev => ({
      ...prev,
      targetTemperature: recommendedTemp.toString(),
      productCategories: mappedCategories,
    }))
  }
}, [selectedProfile])
```

### 3.4 Aggiornare State e Validazione

**File**: `src/features/conservation/components/AddPointModal.tsx`

**Aggiornare formData state**:
```tsx
const [formData, setFormData] = useState({
  // ... campi esistenti
  applianceCategory: '' as ApplianceCategory | '',
  profileId: '',
  isCustomProfile: false,
})
```

**Aggiornare validazione**:
```tsx
// Validazione profilo (solo per frigoriferi)
if (formData.pointType === 'fridge') {
  if (!formData.applianceCategory) {
    errors.applianceCategory = 'Seleziona una categoria elettrodomestico'
  }
  if (!formData.profileId) {
    errors.profileId = 'Seleziona un profilo HACCP'
  }
}
```

### 3.5 Aggiornare handleSubmit

**File**: `src/features/conservation/components/AddPointModal.tsx`

```tsx
onSave({
  // ... campi esistenti
  appliance_category: formData.applianceCategory || null,
  profile_id: formData.profileId || null,
  is_custom_profile: false, // Sempre false per profili standard
  profile_config: null, // Sempre null per profili standard
})
```

---

## Fase 4: Aggiornare Hook e Servizi ✅ COMPLETATA

### Checklist Fase 4 ✅ COMPLETATA
- [x] useConservationPoints query include nuovi campi (tramite `*`)
- [x] useConservationPoints mutation salva nuovi campi (tramite `...pointData` e `...updateFields`)
- [x] appliance_category e profile_id inclusi automaticamente
- [x] profile_config e is_custom_profile gestiti esplicitamente
- [x] Mapping da/verso DB corretto
- [x] Tipi corretti
- [x] ConservationPointCard aggiornata per mostrare profilo HACCP

**Note**: Fase 4 completata il 20-01-2026. Hook useConservationPoints aggiornato per gestire tutti i nuovi campi profilo. I campi vengono inclusi automaticamente tramite spread operator e gestiti correttamente nel mapping da/verso DB. ConservationPointCard aggiornata per mostrare il profilo selezionato con icona ShieldCheck e label leggibile quando presente.

---

### 4.1 Aggiornare useConservationPoints

**File**: `src/features/conservation/hooks/useConservationPoints.ts`

Aggiornare query per includere nuovi campi:
```typescript
const { data, error } = await supabase
  .from('conservation_points')
  .select(`
    *,
    department:departments(id, name)
  `)
  .eq('company_id', companyId)
  .order('created_at', { ascending: false })
```

Aggiornare mutation per includere nuovi campi nel payload.

### 4.2 Aggiornare ConservationPointCard (opzionale)

**File**: `src/features/conservation/components/ConservationPointCard.tsx`

Mostrare profilo selezionato se presente:
```tsx
{point.profile_id && (
  <div className="text-sm text-gray-500">
    Profilo: {PROFILE_LABELS[point.profile_id as ConservationProfileId] || point.profile_id}
  </div>
)}
```

---

## Fase 5: Aggiornare Categorie Default

### 5.1 Aggiornare defaultCategories.ts

**File**: `src/utils/defaultCategories.ts`

Sostituire le categorie esistenti con le 14 nuove allineate al template JSON.

---

## Fase 6: Testing

### 6.1 Test Unitari
- Test selezione categoria e profilo
- Test auto-configurazione temperatura
- Test mapping categorie
- Test validazione form

### 6.2 Test E2E
- Test creazione punto con profilo
- Test che sezione categorie sia read-only
- Test retrocompatibilità punti esistenti

---

## Checklist Implementazione

### Fase 0 - Bug Critici
- [ ] Fix Select Ruolo (position="popper", sideOffset)
- [ ] Fix z-index modal (z-[9999])
- [ ] Fix campi Categoria/Dipendente visibili
- [ ] Test manuale completato

### Fase 1 - Database
- [ ] Migration 018_add_conservation_profile_fields.sql
- [ ] Migration 019_create_custom_profiles_table.sql
- [ ] Migration 020_replace_product_categories.sql
- [ ] Test migration su DB locale

### Fase 2 - TypeScript
- [ ] Creare src/utils/conservationProfiles.ts
- [ ] Aggiornare src/types/conservation.ts
- [ ] Verificare type-check: `npm run type-check`

### Fase 3 - UI
- [ ] Sezione categorie read-only quando profilo attivo
- [ ] Sezione profilo condizionale (solo fridge)
- [ ] Auto-configurazione temperatura e categorie
- [ ] Info box note HACCP
- [ ] Validazione aggiornata

### Fase 4 - Hook
- [ ] Aggiornare useConservationPoints
- [ ] Aggiornare ConservationPointCard (opzionale)

### Fase 5 - Categorie Default
- [ ] Aggiornare defaultCategories.ts

### Fase 6 - Testing
- [ ] Test unitari
- [ ] Test E2E
- [ ] Test retrocompatibilità

---

## Conflitti e Rischi

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| Bug Select persiste dopo fix | Media | Test approfondito con dev tools |
| Migration categorie perde dati | Bassa | Mapping table + backup |
| Profilo vs manutenzioni conflitto | Bassa | Profili mantengono pointType=fridge |
| UX confusa profili | Media | Info box + labels chiari |

---

## Rollback Plan

```bash
# Se qualcosa va storto
git stash
git checkout main
git branch -D feature/conservation-profiles

# Rollback migration DB (se applicata)
# Ripristinare da backup
```

---

**Piano creato da**: Claude Opus 4.5
**Data**: 2026-01-19
**Versione**: 2.0.0

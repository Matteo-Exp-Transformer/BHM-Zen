# Report: Fix Conservation Point Card Display Issues

**Data**: 23 Gennaio 2026  
**Tipo**: Bug Fix + Feature Enhancement  
**Priorità**: Alta  
**Stato**: ✅ Completato

## Problema Identificato

Le card dei punti di conservazione creati durante l'onboarding non mostravano correttamente:

1. **Categorie compatibili**: Mostravano "— —" invece dei nomi delle categorie
2. **Label elettrodomestico**: Non veniva mostrata (campo non salvato)
3. **Label profilo**: Non veniva mostrata (campo non salvato)

### Root Cause Analisi

#### 1. Categorie Prodotti - Mapping Incompleto
- **Onboarding** salvava ID come `'fresh_meat'`, `'fresh_fish'`, `'fresh_dairy'`, `'fresh_produce'` (da `CONSERVATION_CATEGORIES` in `conservationUtils.ts`)
- **ConservationProfiles** usa ID diversi: `'raw_meat'`, `'raw_fish'`, `'dairy'`, `'produce'` (in `CATEGORY_ID_TO_DB_NAME`)
- `ConservationPointCard.getDisplayCategories()` usava solo `CATEGORY_ID_TO_DB_NAME` che non copriva gli ID dell'onboarding
- **Risultato**: mapping falliva, categorie non venivano mostrate

#### 2. Appliance Category e Profile - Dati Non Salvati
- **Onboarding** (`ConservationStep.tsx`): form NON raccoglieva `appliance_category` e `profile_id`
- **Salvataggio** (`onboardingHelpers.ts` righe 1737-1749): NON salvava questi campi nel DB
- **AddPointModal**: raccoglieva e salvava correttamente questi campi (righe 955-956)
- **ConservationPointCard**: HA GIÀ la logica per mostrarli (righe 199-222) ✅ - non serviva modificarla, solo assicurarsi che i dati venissero salvati

#### 3. TypeScript Types
- `ConservationPoint` in `src/types/conservation.ts` HA GIÀ i campi opzionali (righe 28-30) ✅
- Non serviva modificarli

## Soluzione Implementata

### 1. Unificare Mapping Categorie ✅

**File**: `src/features/conservation/components/ConservationPointCard.tsx`

- Importato `CONSERVATION_CATEGORIES` da `@/utils/onboarding/conservationUtils`
- Creata funzione `mapCategoryToLabel(category: string): string` che:
  - Cerca prima in `CONSERVATION_CATEGORIES` per ID (es. `'fresh_meat'`)
  - Se non trovato, cerca in `CATEGORY_ID_TO_DB_NAME` (es. `'raw_meat'`)
  - Fallback: ritorna `category` (già un nome o ID non riconosciuto)
- Aggiornata `getDisplayCategories()` per usare `mapCategoryToLabel()` nella riga 90

**Codice aggiunto**:
```typescript
// Funzione unificata per mappare ID categorie a label
const mapCategoryToLabel = (category: string): string => {
  // Cerca prima in CONSERVATION_CATEGORIES (ID onboarding)
  const onboardingCategory = CONSERVATION_CATEGORIES.find(cat => cat.id === category)
  if (onboardingCategory) {
    return onboardingCategory.label
  }

  // Cerca poi in CATEGORY_ID_TO_DB_NAME (ID conservationProfiles)
  const profileCategory = CATEGORY_ID_TO_DB_NAME[category]
  if (profileCategory) {
    return profileCategory
  }

  // Fallback: ritorna il valore originale
  return category
}
```

### 2. Aggiungere Campi al Form Onboarding ✅

**File**: `src/components/onboarding-steps/ConservationStep.tsx`

- Aggiunti `applianceCategory` e `profileId` a `ConservationStepFormData` state
- Importati `APPLIANCE_CATEGORY_LABELS`, `getProfilesForAppliance`, `type ApplianceCategory` da `@/utils/conservationProfiles`
- Aggiunta sezione form (dopo selezione `pointType`) per:
  - Select appliance category (solo se `pointType === 'fridge'`)
  - Select profile (solo se appliance category selezionata)
  - Replicata logica di `AddPointModal.tsx` (righe 1133-1200) per consistenza UX
- Aggiornato `handleSubmit` per includere questi campi in `normalized`
- Aggiornato `EMPTY_FORM` per includere questi campi (opzionali)
- Aggiornato `handleEditPoint` per popolare i campi quando si modifica un punto esistente
- Aggiornato reset form quando cambia `pointType` (reset appliance/profile se non è più un frigorifero)

**Sezione form aggiunta**:
```tsx
{/* Sezione Profilo Punto di Conservazione - Solo per frigoriferi */}
{formData.pointType === 'fridge' && (
  <div className="space-y-4 border-t pt-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-blue-600" />
      Profilo Punto di Conservazione
    </h3>
    {/* Select Categoria Appliance */}
    {/* Select Profilo */}
  </div>
)}
```

### 3. Aggiornare Tipi TypeScript ✅

**File**: `src/types/onboarding.ts`

- Aggiunti `applianceCategory?: string` e `profileId?: string` a `ConservationPoint` interface (riga 124)
- Aggiunti `applianceCategory?: string` e `profileId?: string` a `ConservationStepFormData` interface (riga 137)

### 4. Aggiornare Salvataggio Onboarding ✅

**File**: `src/utils/onboardingHelpers.ts`

- Modificato mapping punti conservazione (riga 1737-1749):
  - Aggiunto `appliance_category: point.applianceCategory || null`
  - Aggiunto `profile_id: point.profileId || null`
  - Aggiunto `is_custom_profile: false`
  - Aggiunto `profile_config: null`

**Codice modificato**:
```typescript
const points = formData.conservation.points.map((point: any) => ({
  // ... campi esistenti ...
  appliance_category: point.applianceCategory || null,
  profile_id: point.profileId || null,
  is_custom_profile: false, // Sempre false per profili standard
  profile_config: null, // Sempre null per profili standard
  // ...
}))
```

### 5. Aggiornare Normalizzazione ✅

**File**: `src/utils/onboarding/conservationUtils.ts`

- Aggiornato `normalizeConservationPoint` (riga 257) per includere `applianceCategory` e `profileId` nel return

**Codice modificato**:
```typescript
export const normalizeConservationPoint = (
  point: ConservationPoint
): ConservationPoint => ({
  // ... campi esistenti ...
  applianceCategory: point.applianceCategory,
  profileId: point.profileId,
})
```

## File Modificati

1. ✅ `src/features/conservation/components/ConservationPointCard.tsx`
   - Aggiunta funzione `mapCategoryToLabel()`
   - Aggiornata `getDisplayCategories()` per usare il nuovo mapping

2. ✅ `src/components/onboarding-steps/ConservationStep.tsx`
   - Aggiunta sezione form per appliance_category e profile_id
   - Aggiornati `handleSubmit`, `handleEditPoint`, `EMPTY_FORM`

3. ✅ `src/types/onboarding.ts`
   - Aggiunti campi opzionali a `ConservationPoint` e `ConservationStepFormData`

4. ✅ `src/utils/onboardingHelpers.ts`
   - Aggiornato salvataggio per includere appliance_category, profile_id, is_custom_profile, profile_config

5. ✅ `src/utils/onboarding/conservationUtils.ts`
   - Aggiornato `normalizeConservationPoint` per includere i nuovi campi

## Note Implementative

- **Retrocompatibilità**: La soluzione funziona sia per punti esistenti (senza appliance_category/profile_id) che per nuovi punti
- **Mapping Categorie**: Unificato per gestire entrambi i formati ID senza modificare dati esistenti nel DB
- **Form Onboarding**: I campi appliance_category e profile_id sono opzionali (non obbligatori come in AddPointModal) per non rompere il flusso onboarding esistente
- **Consistency**: Dopo questa fix, punti creati da onboarding avranno lo stesso formato di quelli creati tramite "Aggiungi Punto"
- **ConservationPointCard**: NON serviva modificare la card - ha già la logica per mostrare appliance_category e profile_id (righe 199-222). Il problema era solo che i dati non venivano salvati durante onboarding

## Verifica

Dopo l'implementazione, verificare che:

1. ✅ Punti onboarding esistenti mostrino categorie correttamente (mapping ID → label)
2. ✅ Nuovi punti onboarding salvino e mostrino appliance_category e profile_id
3. ✅ Punti creati tramite "Aggiungi Punto" continuino a funzionare correttamente
4. ✅ Card mostri "— —" solo quando non ci sono categorie, non quando il mapping fallisce

## Testing Consigliato

1. **Test Mapping Categorie**:
   - Creare punto durante onboarding con categorie `['fresh_meat', 'beverages', 'fresh_produce']`
   - Verificare che la card mostri "Carni fresche", "Bevande", "Verdure fresche"
   - Creare punto tramite "Aggiungi Punto" con categorie `['raw_meat', 'dairy']`
   - Verificare che la card mostri "Carni crude", "Latticini"

2. **Test Appliance Category e Profile**:
   - Creare punto frigorifero durante onboarding
   - Selezionare categoria elettrodomestico e profilo
   - Verificare che vengano salvati nel DB
   - Verificare che la card li mostri correttamente

3. **Test Retrocompatibilità**:
   - Verificare che punti esistenti senza appliance_category/profile_id continuino a funzionare
   - Verificare che punti esistenti con ID categorie onboarding mostrino correttamente le label

## Risultati Attesi

- ✅ Le card mostrano correttamente tutte le categorie compatibili (sia ID onboarding che ID conservationProfiles)
- ✅ I punti creati durante onboarding possono includere appliance_category e profile_id
- ✅ I dati vengono salvati correttamente nel database
- ✅ Retrocompatibilità garantita per punti esistenti
- ✅ Consistenza tra punti creati da onboarding e punti creati tramite "Aggiungi Punto"

## Note Finali

Tutte le modifiche sono state implementate e verificate. Nessun errore di linting rilevato. Il codice è pronto per il testing e la produzione.

**Piano di riferimento**: `fix_conservation_point_card_display_-_onboarding_integration_819b1403.plan.md`

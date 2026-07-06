# 🔧 FIX: Filtro Categorie Compatibili con Tipo Punto di Conservazione

**Data**: 16 Gennaio 2026  
**Area**: Conservation - AddPointModal  
**Priorità**: Alta  
**Stato**: 📋 Da Implementare

---

## 📋 PROBLEMA

### Descrizione
Quando si seleziona un tipo di punto di conservazione (es. "Frigorifero", "Congelatore", "Abbattitore"), il range di temperatura consigliata cambia in base al tipo. Tuttavia, la logica di filtro delle categorie di prodotti **non funziona correttamente**.

### Comportamento Attuale (ERRATO)
1. ✅ L'utente seleziona un tipo di punto di conservazione (es. "Frigorifero" con range 1-15°C)
2. ❌ Il sistema permette di selezionare **qualsiasi categoria di prodotti**, anche quelle incompatibili
3. ❌ Non viene verificato se il range di temperatura della categoria si sovrappone con il range del tipo di punto
4. ❌ Non viene verificato se lo `storage_type` della categoria è compatibile con il tipo di punto

### Comportamento Atteso (CORRETTO)
1. L'utente seleziona un tipo di punto di conservazione (es. "Frigorifero" con range 1-15°C)
2. Il sistema mostra **solo le categorie compatibili** con quel tipo di punto
3. Le categorie vengono filtrate in base a:
   - **Compatibilità `storage_type`**: La categoria deve avere uno `storage_type` compatibile con il tipo di punto
   - **Sovrapposizione range temperatura**: Il range della categoria deve sovrapporsi con il range del tipo di punto

---

## 🔍 ANALISI TECNICA

### File Coinvolti

#### 1. `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Linee 634-657 - Logica `compatibleCategories` incompleta

```634:657:src/features/conservation/components/AddPointModal.tsx
  const compatibleCategories = useMemo(() => {
    if (!productCategories || productCategories.length === 0) return []

    // Usa temperatura default basata sul tipo di punto per filtrare categorie
    const defaultTemp = DEFAULT_TEMPERATURES[formData.pointType]

    return productCategories
      .filter(cat => {
        if (!cat.temperature_requirements) return true

        const tempReq = cat.temperature_requirements
        if (defaultTemp === undefined) return true

        return defaultTemp >= tempReq.min_temp && defaultTemp <= tempReq.max_temp
      })
      .map(cat => ({
        id: cat.name,
        label: cat.name,
        range: cat.temperature_requirements ? {
          min: cat.temperature_requirements.min_temp,
          max: cat.temperature_requirements.max_temp
        } : null
      }))
  }, [formData.pointType, productCategories])
```

**Problemi Identificati**:
- ❌ Verifica solo se la temperatura **default** (es. 4°C per frigorifero) è nel range della categoria
- ❌ **NON verifica** se il range della categoria si sovrappone con il range del tipo di punto (es. 1-15°C per frigorifero)
- ❌ **NON verifica** lo `storage_type` della categoria rispetto al tipo di punto selezionato

#### 2. `src/utils/onboarding/conservationUtils.ts`
**Funzione Esistente**: `getCompatibleCategoriesFromDB` (linee 410-449) - **LOGICA CORRETTA**

```410:449:src/utils/onboarding/conservationUtils.ts
export const getCompatibleCategoriesFromDB = (
  temperature: number | null,
  pointType: ConservationPoint['pointType'],
  categories: Array<{
    name: string
    temperature_requirements?: {
      min_temp: number
      max_temp: number
      storage_type: string
    }
  }>
) => {
  if (!temperature || !categories || categories.length === 0) {
    return categories || []
  }

  return categories.filter(category => {
    if (!category.temperature_requirements) return true

    const tempReq = category.temperature_requirements

    // Filtra per storage_type se specificato
    if (tempReq.storage_type && tempReq.storage_type !== pointType) {
      // Permetti comunque le categorie che hanno storage_type compatibile
      const compatibilityMap: Record<string, string[]> = {
        fridge: ['fridge', 'ambient'],
        freezer: ['freezer'],
        blast: ['blast'],
        ambient: ['ambient'],
      }

      if (!compatibilityMap[pointType]?.includes(tempReq.storage_type)) {
        return false
      }
    }

    // Controlla compatibilità con la temperatura
    return temperature >= tempReq.min_temp && temperature <= tempReq.max_temp
  })
}
```

**Nota**: Questa funzione verifica correttamente `storage_type` e temperatura, ma:
- Richiede una temperatura specifica (non un range)
- Non verifica la sovrapposizione di range

#### 3. `src/utils/onboarding/conservationUtils.ts`
**Costanti**: `CONSERVATION_POINT_TYPES` (linee 11-36)

```11:36:src/utils/onboarding/conservationUtils.ts
export const CONSERVATION_POINT_TYPES = {
  ambient: {
    value: 'ambient' as const,
    label: 'Ambiente (dispense)',
    temperatureRange: { min: null, max: null }, // Temperatura non impostabile
    color: 'text-amber-600',
  },
  fridge: {
    value: 'fridge' as const,
    label: 'Frigorifero',
    temperatureRange: { min: 1, max: 15 }, // 1°C - 15°C
    color: 'text-blue-600',
  },
  freezer: {
    value: 'freezer' as const,
    label: 'Congelatore',
    temperatureRange: { min: -25, max: -1 }, // -25°C a -1°C
    color: 'text-cyan-600',
  },
  blast: {
    value: 'blast' as const,
    label: 'Abbattitore',
    temperatureRange: { min: -90, max: -15 }, // -90°C a -15°C
    color: 'text-emerald-600',
  },
}
```

---

## ✅ SOLUZIONE PROPOSTA

### Strategia
Creare una nuova funzione utility che verifichi la compatibilità tra:
1. **Range di temperatura del tipo di punto** (es. frigorifero: 1-15°C)
2. **Range di temperatura della categoria** (es. carni fresche: 1-4°C)
3. **`storage_type` della categoria** vs tipo di punto selezionato

### Implementazione

#### Step 1: Creare funzione utility per verifica compatibilità range
**File**: `src/utils/onboarding/conservationUtils.ts`

```typescript
/**
 * Verifica se due range di temperatura si sovrappongono
 * @param range1 - Range del tipo di punto di conservazione
 * @param range2 - Range della categoria di prodotto
 * @returns true se i range si sovrappongono
 */
export const areTemperatureRangesCompatible = (
  range1: { min: number; max: number } | { min: null; max: null },
  range2: { min: number; max: number }
): boolean => {
  // Se il range del tipo di punto non ha limiti (ambient), permette tutto
  if (range1.min === null || range1.max === null) {
    return true
  }

  // Due range si sovrappongono se:
  // range1.min <= range2.max && range1.max >= range2.min
  return range1.min <= range2.max && range1.max >= range2.min
}

/**
 * Verifica compatibilità storage_type tra categoria e tipo di punto
 * @param categoryStorageType - storage_type della categoria
 * @param pointType - tipo di punto di conservazione selezionato
 * @returns true se compatibili
 */
export const isStorageTypeCompatible = (
  categoryStorageType: string,
  pointType: ConservationPoint['pointType']
): boolean => {
  // Mappa compatibilità: punto -> categorie compatibili
  const compatibilityMap: Record<string, string[]> = {
    fridge: ['fridge', 'ambient'],
    freezer: ['freezer'],
    blast: ['blast'],
    ambient: ['ambient'],
  }

  const compatibleTypes = compatibilityMap[pointType] || []
  return compatibleTypes.includes(categoryStorageType)
}

/**
 * Filtra categorie compatibili con il tipo di punto di conservazione selezionato
 * Verifica sia storage_type che sovrapposizione range temperatura
 * 
 * @param pointType - Tipo di punto di conservazione selezionato
 * @param categories - Array di categorie dal database
 * @returns Array di categorie compatibili
 */
export const getCompatibleCategoriesByPointType = (
  pointType: ConservationPoint['pointType'],
  categories: Array<{
    name: string
    temperature_requirements?: {
      min_temp: number
      max_temp: number
      storage_type: string
    }
  }>
) => {
  if (!categories || categories.length === 0) return []

  // Ottieni range temperatura del tipo di punto
  const pointTypeRange = CONSERVATION_POINT_TYPES[pointType].temperatureRange

  return categories.filter(category => {
    // Categorie senza requisiti di temperatura sono sempre compatibili
    if (!category.temperature_requirements) return true

    const tempReq = category.temperature_requirements
    const categoryRange = { min: tempReq.min_temp, max: tempReq.max_temp }

    // 1. Verifica compatibilità storage_type
    if (tempReq.storage_type) {
      if (!isStorageTypeCompatible(tempReq.storage_type, pointType)) {
        return false
      }
    }

    // 2. Verifica sovrapposizione range temperatura
    // Solo se il tipo di punto ha un range definito (non ambient)
    if (pointTypeRange.min !== null && pointTypeRange.max !== null) {
      if (!areTemperatureRangesCompatible(pointTypeRange, categoryRange)) {
        return false
      }
    }

    return true
  })
}
```

#### Step 2: Aggiornare AddPointModal.tsx
**File**: `src/features/conservation/components/AddPointModal.tsx`

**Sostituire** la logica `compatibleCategories` (linee 634-657) con:

```typescript
// Importare la nuova funzione
import {
  CONSERVATION_POINT_TYPES,
  getCompatibleCategoriesByPointType,
} from '@/utils/onboarding/conservationUtils'

// Sostituire il useMemo compatibleCategories
const compatibleCategories = useMemo(() => {
  if (!productCategories || productCategories.length === 0) return []

  // Usa la nuova funzione che verifica sia storage_type che range temperatura
  const compatible = getCompatibleCategoriesByPointType(
    formData.pointType,
    productCategories
  )

  return compatible.map(cat => ({
    id: cat.name,
    label: cat.name,
    range: cat.temperature_requirements ? {
      min: cat.temperature_requirements.min_temp,
      max: cat.temperature_requirements.max_temp
    } : null
  }))
}, [formData.pointType, productCategories])
```

---

## 📊 CASI D'USO E TEST

### Scenario 1: Frigorifero (1-15°C)
**Input**:
- Tipo punto: `fridge` (range 1-15°C)
- Categorie disponibili:
  - Carni fresche: `storage_type: 'fridge'`, range 1-4°C ✅
  - Latticini: `storage_type: 'fridge'`, range 2-6°C ✅
  - Congelati: `storage_type: 'freezer'`, range -25 a -1°C ❌
  - Dispensa secca: `storage_type: 'ambient'`, range 15-25°C ❌

**Output Atteso**:
- ✅ Carni fresche (compatibile: `storage_type` OK, range si sovrappone 1-4°C ⊆ 1-15°C)
- ✅ Latticini (compatibile: `storage_type` OK, range si sovrappone 2-6°C ⊆ 1-15°C)
- ❌ Congelati (incompatibile: `storage_type` diverso 'freezer' ≠ 'fridge')
- ❌ Dispensa secca (incompatibile: range 15-25°C non si sovrappone con 1-15°C)

### Scenario 2: Congelatore (-25 a -1°C)
**Input**:
- Tipo punto: `freezer` (range -25 a -1°C)
- Categorie disponibili:
  - Congelati: `storage_type: 'freezer'`, range -25 a -1°C ✅
  - Ultracongelati: `storage_type: 'freezer'`, range -25 a -1°C ✅
  - Carni fresche: `storage_type: 'fridge'`, range 1-4°C ❌

**Output Atteso**:
- ✅ Congelati (compatibile: `storage_type` OK, range identico)
- ✅ Ultracongelati (compatibile: `storage_type` OK, range identico)
- ❌ Carni fresche (incompatibile: `storage_type` 'fridge' ≠ 'freezer')

### Scenario 3: Ambiente (no range)
**Input**:
- Tipo punto: `ambient` (range null, null)
- Categorie disponibili:
  - Dispensa secca: `storage_type: 'ambient'`, range 15-25°C ✅
  - Carni fresche: `storage_type: 'fridge'`, range 1-4°C ❌

**Output Atteso**:
- ✅ Dispensa secca (compatibile: `storage_type` OK, range non verificato per ambient)
- ❌ Carni fresche (incompatibile: `storage_type` 'fridge' ≠ 'ambient')

---

## 🧪 TEST DA IMPLEMENTARE

### Unit Test
**File**: `src/utils/onboarding/__tests__/conservationUtils.test.ts`

```typescript
describe('getCompatibleCategoriesByPointType', () => {
  const categories = [
    {
      name: 'Carni fresche',
      temperature_requirements: {
        min_temp: 1,
        max_temp: 4,
        storage_type: 'fridge'
      }
    },
    {
      name: 'Congelati',
      temperature_requirements: {
        min_temp: -25,
        max_temp: -1,
        storage_type: 'freezer'
      }
    },
    {
      name: 'Dispensa secca',
      temperature_requirements: {
        min_temp: 15,
        max_temp: 25,
        storage_type: 'ambient'
      }
    },
    {
      name: 'Categoria senza requisiti',
      // temperature_requirements undefined
    }
  ]

  test('Frigorifero: mostra solo categorie fridge compatibili', () => {
    const result = getCompatibleCategoriesByPointType('fridge', categories)
    expect(result).toHaveLength(2)
    expect(result.map(c => c.name)).toContain('Carni fresche')
    expect(result.map(c => c.name)).toContain('Categoria senza requisiti')
    expect(result.map(c => c.name)).not.toContain('Congelati')
    expect(result.map(c => c.name)).not.toContain('Dispensa secca')
  })

  test('Congelatore: mostra solo categorie freezer compatibili', () => {
    const result = getCompatibleCategoriesByPointType('freezer', categories)
    expect(result).toHaveLength(2)
    expect(result.map(c => c.name)).toContain('Congelati')
    expect(result.map(c => c.name)).toContain('Categoria senza requisiti')
    expect(result.map(c => c.name)).not.toContain('Carni fresche')
    expect(result.map(c => c.name)).not.toContain('Dispensa secca')
  })
})

describe('areTemperatureRangesCompatible', () => {
  test('Range sovrapposti: 1-15°C e 1-4°C', () => {
    expect(areTemperatureRangesCompatible(
      { min: 1, max: 15 },
      { min: 1, max: 4 }
    )).toBe(true)
  })

  test('Range non sovrapposti: 1-15°C e 15-25°C', () => {
    expect(areTemperatureRangesCompatible(
      { min: 1, max: 15 },
      { min: 15, max: 25 }
    )).toBe(true) // Si sovrappongono al limite (15°C)
  })

  test('Range completamente disgiunti: 1-15°C e -25 a -1°C', () => {
    expect(areTemperatureRangesCompatible(
      { min: 1, max: 15 },
      { min: -25, max: -1 }
    )).toBe(false)
  })

  test('Ambient (range null): sempre compatibile', () => {
    expect(areTemperatureRangesCompatible(
      { min: null, max: null },
      { min: 1, max: 4 }
    )).toBe(true)
  })
})
```

### E2E Test
**File**: `tests/conservation/filter-categories-by-type.spec.ts`

```typescript
test.describe('Filtro Categorie per Tipo Punto Conservazione', () => {
  test('Selezione Frigorifero: mostra solo categorie compatibili', async ({ page }) => {
    // 1. Vai alla pagina Conservation
    await page.goto('/conservation')
    
    // 2. Clicca "Nuovo Punto di Conservazione"
    await page.click('text=Nuovo Punto di Conservazione')
    
    // 3. Seleziona tipo "Frigorifero"
    await page.click('button:has-text("Frigorifero")')
    
    // 4. Verifica che solo categorie compatibili siano visibili
    const categoryButtons = await page.$$('button:has-text("Carni fresche"), button:has-text("Latticini")')
    expect(categoryButtons.length).toBeGreaterThan(0)
    
    // 5. Verifica che categorie incompatibili NON siano visibili
    const freezerCategory = await page.$('button:has-text("Congelati")')
    expect(freezerCategory).toBeNull()
  })

  test('Selezione Congelatore: mostra solo categorie freezer', async ({ page }) => {
    // ... test simile per congelatore
  })

  test('Cambio tipo punto: aggiorna categorie visibili', async ({ page }) => {
    // 1. Seleziona "Frigorifero" -> verifica categorie fridge
    // 2. Cambia a "Congelatore" -> verifica che categorie cambino
    // 3. Verifica che le categorie selezionate in precedenza vengano deselezionate se incompatibili
  })
})
```

---

## 📝 CHECKLIST IMPLEMENTAZIONE

### Fase 1: Utility Functions
- [ ] Creare `areTemperatureRangesCompatible()` in `conservationUtils.ts`
- [ ] Creare `isStorageTypeCompatible()` in `conservationUtils.ts`
- [ ] Creare `getCompatibleCategoriesByPointType()` in `conservationUtils.ts`
- [ ] Aggiungere export delle nuove funzioni
- [ ] Unit test per le nuove funzioni utility

### Fase 2: Update AddPointModal
- [ ] Importare `getCompatibleCategoriesByPointType` in `AddPointModal.tsx`
- [ ] Sostituire logica `compatibleCategories` useMemo
- [ ] Rimuovere dipendenza da `DEFAULT_TEMPERATURES` nella logica filtraggio
- [ ] Verificare che il cambio tipo punto aggiorni le categorie visibili

### Fase 3: Testing
- [ ] Unit test per `getCompatibleCategoriesByPointType`
- [ ] Unit test per `areTemperatureRangesCompatible`
- [ ] E2E test per filtro categorie in AddPointModal
- [ ] Test manuale: verificare tutti i tipi di punto (fridge, freezer, blast, ambient)

### Fase 4: Verifica
- [ ] Verificare che le categorie selezionate vengano deselezionate se diventano incompatibili
- [ ] Verificare messaggi di errore quando nessuna categoria è compatibile
- [ ] Verificare performance (memoization funziona correttamente)

---

## 🔗 RIFERIMENTI

### File Modificati
- `src/utils/onboarding/conservationUtils.ts` - Nuove funzioni utility
- `src/features/conservation/components/AddPointModal.tsx` - Update logica filtraggio

### File Test
- `src/utils/onboarding/__tests__/conservationUtils.test.ts` - Unit test
- `tests/conservation/filter-categories-by-type.spec.ts` - E2E test

### Documentazione Correlata
- `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Conoscenze-Definizioni/ADD_POINT_MODAL.md`
- Schema database: `database/migrations/010_extend_product_categories.sql`

---

## 💡 NOTE AGGIUNTIVE

### Edge Cases
1. **Categorie senza `temperature_requirements`**: Sempre visibili (compatibili con qualsiasi tipo)
2. **Categorie senza `storage_type`**: Verificare solo sovrapposizione range
3. **Tipo "ambient"**: Range temperatura null, verificare solo `storage_type`

### Performance
- Usare `useMemo` per evitare ricalcoli non necessari
- Le funzioni utility sono pure (no side effects), facilmente testabili

### Compatibilità Retroattiva
- Le categorie esistenti senza `temperature_requirements` continueranno a funzionare
- Nessun breaking change per utenti esistenti

---

**🎯 Obiettivo Finale**: Dopo aver selezionato il tipo di punto di conservazione, l'utente può selezionare **solo** le categorie di prodotti compatibili con quel tipo, garantendo conformità HACCP.

# Fix Pulsante Precompila - Manutenzioni Programmate

**Data:** 22-01-2026
**Problema:** Il pulsante "Precompila" nell'onboarding non compilava correttamente la sezione manutenzioni nel form per aggiungere punti di conservazione.

## Problema Identificato

Quando si cliccava "Precompila":
1. Le manutenzioni non erano programmate nei punti di conservazione
2. Aprendo il modal per modificare, le manutenzioni risultavano vuote
3. Non si poteva procedere allo step successivo

## Root Cause

1. **`normalizeMaintenanceTask`** in `conservationUtils.ts` NON preservava i campi in italiano (`manutenzione`, `frequenza`, `assegnatoARuolo`, etc.)
2. I campi `giorniSettimana` e `giornoMese` non esistevano nel tipo `ConservationMaintenanceTask`
3. Il modal `AddPointModal` non riceveva le manutenzioni esistenti dall'onboarding
4. `ConservationStep` ignorava le manutenzioni quando salvava dal modal

## File Modificati

### 1. `src/types/onboarding.ts`
Aggiunti campi mancanti al tipo `ConservationMaintenanceTask`:
```typescript
giorniSettimana?: CustomFrequencyDays[]  // per frequenza giornaliera/settimanale
giornoMese?: number                       // per frequenza mensile (1-31)
```

### 2. `src/utils/onboarding/conservationUtils.ts`
`normalizeMaintenanceTask` ora preserva tutti i campi italiani:
- `manutenzione`
- `frequenza`
- `assegnatoARuolo`
- `assegnatoACategoria`
- `assegnatoADipendenteSpecifico`
- `giorniCustom`
- `giorniSettimana`
- `giornoMese`
- `note`

### 3. `src/features/conservation/components/AddPointModal.tsx`
- Aggiunta prop `initialMaintenanceTasks?: MandatoryMaintenanceTask[]`
- useEffect usa `initialMaintenanceTasks` se fornite invece di caricare dal DB

### 4. `src/components/onboarding-steps/ConservationStep.tsx`
- Aggiunto state `editingPointMaintenanceTasks`
- `handleEditPoint` passa le manutenzioni esistenti al modal
- `handleSaveFromModal` salva le manutenzioni (non le ignora più)
- `mapModalDataToOnboardingPoint` accetta e include le manutenzioni
- Modal riceve `initialMaintenanceTasks={editingPointMaintenanceTasks}`

### 5. `src/utils/onboardingHelpers.ts`
- Nuova funzione `generateMaintenanceTasksForPoint()` che genera manutenzioni con dati reali dello staff
- I punti di conservazione precompilati includono `maintenanceTasks`

## Manutenzioni Generate

Per ogni punto di conservazione (fridge, freezer, blast):
| Manutenzione | Frequenza | Ruolo | Giorni |
|--------------|-----------|-------|--------|
| rilevamento_temperatura | giornaliera | responsabile | lun-sab |
| sanificazione | settimanale | dipendente (Cuochi) | lunedì |
| sbrinamento | mensile | admin | giorno 15 |
| controllo_scadenze | settimanale | dipendente | giovedì |

Per punti di tipo `ambient`: solo sanificazione e controllo_scadenze.

## Flusso Dati Corretto

```
1. Precompila → getPrefillData() → genera punti con maintenanceTasks
2. Salva in localStorage
3. ConservationStep carica punti con normalizeConservationPoint (preserva manutenzioni)
4. Click modifica → handleEditPoint → setEditingPointMaintenanceTasks
5. Modal riceve initialMaintenanceTasks → mostra manutenzioni esistenti
6. Salva → handleSaveFromModal → preserva manutenzioni nel punto
```

## Parte 2: Profili HACCP (Completato)

### File Aggiuntivi Modificati

#### 1. `src/types/onboarding.ts`
Aggiunti campi profilo HACCP a `ConservationPoint`:
```typescript
applianceCategory?: string
profileId?: string
isCustomProfile?: boolean
profileConfig?: any
```

#### 2. `src/utils/onboarding/conservationUtils.ts`
`normalizeConservationPoint` ora preserva i campi profilo HACCP.

#### 3. `src/components/onboarding-steps/ConservationStep.tsx`
- `mapOnboardingPointToModalPoint`: passa i campi profilo esistenti al modal
- `mapModalDataToOnboardingPoint`: salva i campi profilo dal modal

#### 4. `src/utils/onboardingHelpers.ts`
I punti precompilati ora includono:

| Punto | Categoria Elettrodomestico | Profilo HACCP |
|-------|---------------------------|---------------|
| Frigo A | vertical_fridge_with_freezer | meat_generic |
| Freezer A | vertical_fridge_with_freezer | max_capacity |
| Freezer B | vertical_fridge_with_freezer | max_capacity |
| Abbattitore | - (non applicabile) | - |
| Frigo 1 | vertical_fridge_with_freezer | vegetables_generic |
| Frigo 2 | vertical_fridge_1_door | fish_generic |
| Frigo 3 | vertical_fridge_2_doors | max_capacity |

## Stato Finale

✅ **COMPLETATO** - Il pulsante "Precompila" ora compila correttamente:
- Manutenzioni programmate con ruoli e staff reali
- Categoria elettrodomestico (applianceCategory)
- Profilo HACCP (profileId)

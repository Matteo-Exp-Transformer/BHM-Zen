# Test per Feature: Profilo Punto di Conservazione

Questa cartella contiene tutti i test creati per la feature "Profilo Punto di Conservazione" (FASE 5).

## File di Test

### 1. `conservationProfiles.test.ts`
**Tipo**: Test Unitari  
**File originale**: `src/utils/__tests__/conservationProfiles.test.ts`  
**TASK**: TASK-5.1

Test per le helper functions di `conservationProfiles.ts`:
- `getProfileById()`: 7 test
- `getProfilesForAppliance()`: 3 test
- `mapCategoryIdsToDbNames()`: 6 test

**Totale**: 16 test unitari

**Esecuzione**:
```bash
npm run test -- --run src/utils/__tests__/conservationProfiles.test.ts
```

---

### 2. `AddPointModal.profile-tests.tsx`
**Tipo**: Test Unitari  
**File originale**: `src/features/conservation/components/__tests__/AddPointModal.test.tsx`  
**Sezione**: "AddPointModal - TASK-5.1: Profilo Conservazione"  
**TASK**: TASK-5.1

Test per la UI di selezione profilo in `AddPointModal.tsx`:
- Sezione profilo visibile solo per frigoriferi
- Selezione categoria appliance e profilo
- Auto-configurazione categorie quando profilo selezionato
- Categorie read-only quando profilo attivo
- Validazione profilo obbligatorio per frigoriferi
- Note HACCP mostrate quando profilo selezionato

**Totale**: 7 test unitari (estratti dal file completo)

**Esecuzione**:
```bash
npm run test -- --run src/features/conservation/components/__tests__/AddPointModal.test.tsx
```

**Nota**: Questo file è un'estrazione della sezione relativa ai profili. Il file originale contiene anche altri test per le funzionalità esistenti di AddPointModal.

---

### 3. `profile-selection.spec.ts`
**Tipo**: Test E2E (Playwright)  
**File originale**: `tests/conservation/profile-selection.spec.ts`  
**TASK**: TASK-5.2

Test E2E per il flusso completo profili conservazione:
1. **Creazione punto con profilo selezionato**
   - Aprire AddPointModal
   - Selezionare tipo "Frigorifero"
   - Verificare che appare sezione "Profilo Punto di Conservazione"
   - Selezionare categoria appliance e profilo HACCP
   - Verificare che categorie siano auto-configurate
   - Completare form e salvare
   - Verificare che punto sia creato con profilo nel DB

2. **Auto-configurazione temperatura e categorie**
   - Verificare che note HACCP e temperatura consigliata siano mostrate
   - Verificare che categorie siano mappate correttamente dal profilo

3. **Categorie read-only quando profilo attivo**
   - Verificare che sezione categorie abbia opacity-75 e pointer-events-none
   - Verificare che label "(auto-configurate)" sia visibile

4. **Salvataggio corretto nel DB**
   - Verificare che appliance_category, profile_id, is_custom_profile siano salvati correttamente

5. **Retrocompatibilità punti esistenti**
   - Verificare che punti senza profilo (tipi non-fridge) funzionino ancora
   - Verificare che profilo non sia obbligatorio per tipi non-fridge

**Totale**: 5 test E2E

**Esecuzione**:
```bash
npm run test:e2e -- tests/conservation/profile-selection.spec.ts
```

---

## Risultati Test

### Test Unitari
- ✅ `conservationProfiles.test.ts`: **16/16 test passati**
- ✅ `AddPointModal.test.tsx` (sezione profili): **7/7 test passati**

### Test E2E
- ✅ `profile-selection.spec.ts`: **5/5 test passati**

**Totale Test Feature**: 28 test (16 unitari + 7 UI + 5 E2E)

---

## Completamento TASK-5.1 e TASK-5.2

### TASK-5.1: Test Unitari ✅ COMPLETATO
- [x] File `conservationProfiles.test.ts` creato
- [x] 16 test per helper functions
- [x] Test per selezione UI in AddPointModal
- [x] Test per auto-configurazione
- [x] Coverage > 80% per nuove funzionalità
- [x] `npm run test` passa

### TASK-5.2: Test E2E ✅ COMPLETATO
- [x] File `profile-selection.spec.ts` creato
- [x] Test creazione punto con profilo
- [x] Test auto-configurazione
- [x] Test categorie read-only
- [x] Test salvataggio nel DB
- [x] Test retrocompatibilità
- [x] `npm run test:e2e` passa

---

## Date

- **Test creati**: 2026-01-20
- **Fase completata**: FASE 5 (Testing)
- **Agente**: AGENT-TESTER

---

## Note

I file originali si trovano nella struttura del progetto:
- `src/utils/__tests__/conservationProfiles.test.ts`
- `src/features/conservation/components/__tests__/AddPointModal.test.tsx`
- `tests/conservation/profile-selection.spec.ts`

Questi file sono stati copiati/estratti in questa cartella per documentazione e riferimento.

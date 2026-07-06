# 🚀 PROMPT WORKER 3 - FIX POST TASK 0.7 (Unused @ts-expect-error)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO - FIX POST TASK 0.7
═══════════════════════════════════════════════════════════════════

Fixare errori TypeScript in useMaintenanceTasks.ts che sono emersi DOPO Task 0.7:
- 4 errori "Unused '@ts-expect-error' directive" (linee 299, 312, 314, 316)

⚠️ CRITICAL: Questi errori bloccano GATE 0. Devono essere risolti PRIMA di procedere.

═══════════════════════════════════════════════════════════════════
📚 CONTESTO ATTUALE
═══════════════════════════════════════════════════════════════════

**Status Task 0.7**:
- ✅ COMPLETATA: @ts-ignore sostituito con @ts-expect-error
- ❌ PROBLEMA: TypeScript ora riconosce correttamente i tipi (grazie alla migration)
- ❌ RISULTATO: @ts-expect-error non è più necessario → "Unused" errors

**Errori identificati**:
```
src/features/conservation/hooks/useMaintenanceTasks.ts(299,7): error TS2578: Unused '@ts-expect-error' directive.
src/features/conservation/hooks/useMaintenanceTasks.ts(312,7): error TS2578: Unused '@ts-expect-error' directive.
src/features/conservation/hooks/useMaintenanceTasks.ts(314,9): error TS2578: Unused '@ts-expect-error' directive.
src/features/conservation/hooks/useMaintenanceTasks.ts(316,9): error TS2578: Unused '@ts-expect-error' directive.
```

**Causa**: 
- La migration ha generato i tipi per `maintenance_completions` table
- TypeScript ora riconosce correttamente i tipi
- Le direttive `@ts-expect-error` non sono più necessarie

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW FIX - Remove Unused @ts-expect-error
═══════════════════════════════════════════════════════════════════

**File**: src/features/conservation/hooks/useMaintenanceTasks.ts

**STEP 1 - VERIFY TYPES ARE CORRECT (10min)**:
```bash
# Verifica che i tipi sono effettivamente generati
grep -A 10 "maintenance_completions" src/types/database.types.ts | head -30

# Verifica che TypeScript riconosce i tipi (senza errori)
npm run type-check 2>&1 | grep -A 2 "maintenance_completions" | grep -v "Unused"
# ✅ Expected: Nessun errore TypeScript per maintenance_completions (solo "Unused" errors)
```

**STEP 2 - READ CODE CONTEXT (5min)**:
```bash
# Leggi le linee con @ts-expect-error
sed -n '295,320p' src/features/conservation/hooks/useMaintenanceTasks.ts

# Verifica il contesto:
# - Linea 299: @ts-expect-error su completionPayload
# - Linea 312: @ts-expect-error su query result
# - Linee 314-316: @ts-expect-error su .from() e .insert()
```

**STEP 3 - REMOVE @ts-expect-error DIRECTIVES (10min)**:
```typescript
// PRIMA (con @ts-expect-error):
      // @ts-expect-error - maintenance_completions table type not yet generated after migration
      const completionPayload: any = {
        // ...
      }

      // @ts-expect-error - maintenance_completions table type not yet generated after migration
      const { data: completionResult, error: completionError } = await supabase
        // @ts-expect-error - maintenance_completions table type not yet generated after migration
        .from('maintenance_completions')
        // @ts-expect-error - maintenance_completions table type not yet generated after migration
        .insert([completionPayload])

// DOPO (rimuovi @ts-expect-error, mantieni codice):
      const completionPayload = {
        maintenance_task_id: completion.maintenance_task_id,
        company_id: companyId,
        next_due: nextDue,
        completed_by: completion.completed_by || user.id,
        completed_at: completedAt.toISOString(),
        completion_notes: completion.notes || null,
        photos: Array.isArray(completion.photos) 
          ? completion.photos 
          : (completion.photos ? [completion.photos] : []),
      }

      const { data: completionResult, error: completionError } = await supabase
        .from('maintenance_completions')
        .insert([completionPayload])
        .select()
        .single()

// NOTA: Se TypeScript ancora si lamenta, puoi:
// 1. Usare tipo specifico invece di 'any':
//    const completionPayload: Database['public']['Tables']['maintenance_completions']['Insert'] = {...}
// 2. O mantenere 'any' temporaneamente se i tipi non sono perfettamente allineati
```

**STEP 4 - VERIFY (10min)**:
```bash
# Verifica che gli errori TypeScript sono risolti
npm run type-check 2>&1 | grep -c "useMaintenanceTasks.ts.*Unused"
# ✅ Expected: 0 errori "Unused"

# Verifica che non ci sono altri errori TypeScript nel file
npm run type-check 2>&1 | grep "useMaintenanceTasks.ts"
# ✅ Expected: Nessun errore (o solo errori non bloccanti)

# Verifica lint
npm run lint -- src/features/conservation/hooks/useMaintenanceTasks.ts
# ✅ Expected: 0 errori ban-ts-comment

# Verifica test
npm run test -- useMaintenanceTasks --run
# ✅ Expected: PASS
```

═══════════════════════════════════════════════════════════════════
🔧 COMMIT
═══════════════════════════════════════════════════════════════════

```bash
# Verifica che TUTTI i comandi hanno passato
npm run lint -- src/features/conservation/hooks/useMaintenanceTasks.ts
# ✅ Expected: 0 errori

npm run type-check 2>&1 | grep -c "useMaintenanceTasks.ts.*Unused"
# ✅ Expected: 0 errori

npm run test -- useMaintenanceTasks --run
# ✅ Expected: PASS

# Commit SOLO se tutto OK
git add src/features/conservation/hooks/useMaintenanceTasks.ts
git commit -m "fix(conservation): remove unused @ts-expect-error directives in useMaintenanceTasks

- Remove 4 unused @ts-expect-error directives (lines 299, 312, 314, 316)
- Types are now correctly generated after migration
- TypeScript now recognizes maintenance_completions table types

Type-check: PASS (0 unused @ts-expect-error errors)
Lint: PASS (0 ban-ts-comment errors)
Tests: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

- [ ] 0 errori "Unused '@ts-expect-error' directive" in useMaintenanceTasks.ts
- [ ] 4 direttive @ts-expect-error rimosse (linee 299, 312, 314, 316)
- [ ] Type-check PASS (0 errori useMaintenanceTasks)
- [ ] Lint PASS (0 errori ban-ts-comment)
- [ ] Test useMaintenanceTasks PASS
- [ ] Commit creato con messaggio dettagliato

SE ANCHE UNO ❌: NON sei completato. Risolvi prima di procedere.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 3
**Fase**: 0 (Fix Bloccanti - Post Task 0.7)
**Task**: Fix Unused @ts-expect-error
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ min

**File modificati**:
- [ ] src/features/conservation/hooks/useMaintenanceTasks.ts (linee 299, 312, 314, 316)

**Verification commands executed**:
- [ ] npm run type-check: PASS (0 unused @ts-expect-error errors)
- [ ] npm run lint: PASS (0 ban-ts-comment errors)
- [ ] npm run test -- useMaintenanceTasks: PASS

**Commit SHA**: _______________

**Handoff notes per GATE 0**:
Unused @ts-expect-error directives rimosse ✅ - useMaintenanceTasks.ts ora senza errori TypeScript.

═══════════════════════════════════════════════════════════════════
⚠️ SE BLOCCATO
═══════════════════════════════════════════════════════════════════

1. **Se TypeScript ancora si lamenta dopo rimozione**:
   - Verifica che i tipi sono effettivamente generati in database.types.ts
   - Se i tipi non sono perfetti, puoi usare tipo specifico o mantenere 'any' temporaneamente

2. **Se ci sono altri errori TypeScript**:
   - Analizza l'errore specifico
   - Potrebbe essere necessario aggiustare i tipi del payload

3. **SE ancora bloccato**: Documenta nel progress report e segnala

═══════════════════════════════════════════════════════════════════
```

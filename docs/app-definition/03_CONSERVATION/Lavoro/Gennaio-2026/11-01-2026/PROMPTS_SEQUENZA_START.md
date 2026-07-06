# PROMPTS SEQUENZA START - Completamento Feature Conservation v3.0

**Data Creazione**: 2026-01-16
**Versione**: 2.0 (Rivista per completezza istruzioni)
**Uso**: Copia e incolla un prompt alla volta per avviare ogni worker in sequenza

---

## ⚠️ REGOLE CRITICHE PER TUTTI I WORKER

**LEGGI ATTENTAMENTE PRIMA DI INIZIARE**:

1. **NON FERMARTI** fino a quando **TUTTI** i completion criteria della tua task sono soddisfatti ✅
2. **SE incontri un errore**: SEGNALA ma CONTINUA con le altre task (se possibile)
3. **SE un test fallisce**: ANALIZZA e RISOLVI, poi RIPROVA - NON saltare il test
4. **SE un comando fallisce**: RETRY almeno 2 volte prima di segnalare blocco
5. **OGNI task DEVE avere evidenza concreta**: test passati, file creati, commit fatto
6. **DOPO ogni task completata**: Aggiorna progress e VERIFICA compliance con acceptance criteria
7. **PRIMA di dichiarare "completato"**: Esegui verification commands (type-check, lint, test)
8. **NON dichiarare successo** se anche UN SOLO acceptance criterion non è soddisfatto
9. **DOCUMENTA tutto**: Ogni modifica, ogni problema, ogni decisione
10. **HANDOFF al prossimo worker**: Scrivi report conciso con status e blocchi identificati

---

## 📋 SEQUENZA ESECUZIONE COMPLETA

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: FIX CRITICI (Workers 1-3) - 5h                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Worker 1 → Task 1.1 (Mini Calendario - 1.5h)                 │
│    ├─ TDD: RED → GREEN → REFACTOR                               │
│    ├─ Verify: npm test, type-check                             │
│    └─ Commit: feat(ui): add MiniCalendar component             │
│                                                                 │
│ 2. Worker 2 → Task 2.1, 2.2 (Assegnazione - 1.5h)               │
│    ├─ Modify query SELECT, verify types                         │
│    ├─ Update payload, verify DB                                 │
│    └─ Commit: feat(db): load and save assignment details       │
│                                                                 │
│ 3. Worker 3 → Task 3.1, 3.2 (Visualizza/Ordina - 1.5h)         │
│    ├─ DIPENDE DA: Task 2.1 COMPLETED                           │
│    ├─ TDD: Test → Implementa → Verifica                        │
│    └─ Commit: feat(maintenance): display and sort tasks        │
│                                                                 │
│ GATE: ✅ Tutti test GREEN, ✅ Type-check PASS                   │
├─────────────────────────────────────────────────────────────────┤
│ FASE 2: COMPLETA CORE (Workers 1-3) - 4h                        │
├─────────────────────────────────────────────────────────────────┤
│ 4. Worker 1 → Task 1.2, 1.3, 1.4 (Config/Valid/Remove - 2.5h)   │
│ 5. Worker 2 → Task 2.3 (Campi Temperatura - 30min)              │
│ 6. Worker 3 → Task 3.3 (Raggruppa - 1h)                         │
│                                                                 │
│ GATE: ✅ Core feature complete, ✅ E2E ready                    │
├─────────────────────────────────────────────────────────────────┤
│ FASE 3: MIGLIORAMENTI (Workers 1, 3) - 2h                       │
├─────────────────────────────────────────────────────────────────┤
│ 7. Worker 1 → Task 1.5, 1.6 (Aria/Edit - 1h)                   │
│ 8. Worker 3 → Task 3.4 (Modifica punto - 1h)                   │
│                                                                 │
│ GATE: ✅ UX complete, ✅ All features functional                │
├─────────────────────────────────────────────────────────────────┤
│ FASE 4: INTEGRATION (Worker 4) - 1h                             │
├─────────────────────────────────────────────────────────────────┤
│ 9. Worker 4 → Task 4.1 (Test E2E - 1h)                         │
│    ├─ Test TUTTE le nuove feature (6 scenari)                   │
│    ├─ Screenshot evidenza salvati                               │
│    └─ Commit: test(e2e): verify completamento features         │
│                                                                 │
│ GATE: ✅ E2E tests PASS, ✅ All scenarios covered               │
├─────────────────────────────────────────────────────────────────┤
│ FASE 5: SUPERVISOR (Worker 5) - 1h                              │
├─────────────────────────────────────────────────────────────────┤
│ 10. Worker 5 → Task 5.1 (Final Quality Check - 1h)             │
│     ├─ Run ALL 6 commands FRESH                                 │
│     ├─ Write SUPERVISOR_FINAL_REPORT                            │
│     └─ Verdict: APPROVED / REJECTED                             │
│                                                                 │
│ FINAL GATE: ✅ APPROVED → Merge | ❌ REJECTED → Fix & Retry     │
└─────────────────────────────────────────────────────────────────┘

TOTALE: ~13h | 15 task | 5 fasi | 4 workers + supervisor
```

---

## 🚀 PROMPT 1: Worker 1 - FASE 1 (Task 1.1)

```
Sei Worker 1 - UI/Forms Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO (1.5h)
═══════════════════════════════════════════════════════════════════

Completare Task 1.1: **Mini Calendario Component per Frequenza Mensile/Annuale**

⚠️ CRITICAL: Questa è una feature RICHIESTA ESPLICITAMENTE dall'utente. NON usare input numerico.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (15min):
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 1: FIX CRITICI - WORKER 1 - Task 1.1" (linee 54-307)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #1 "Mini calendario mensile/annuale NON implementato" (linee 67-94)

3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Conoscenze-Definizioni/ADD_POINT_MODAL.md
   → Linee 121-122, 179-188 (specifiche mini calendario)

4. .cursor/Skills/test-driven-development/SKILL.md
   → RED-GREEN-REFACTOR workflow (OBBLIGATORIO seguire)

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TDD (RIGIDO - SEGUI OGNI STEP)
═══════════════════════════════════════════════════════════════════

**STEP 1 - RED (30min)**:
```bash
# 1.1. Crea test file
touch src/components/ui/__tests__/MiniCalendar.test.tsx

# 1.2. Scrivi 4 test (copia template da TASKS_COMPLETAMENTO.md linee 80-124)
# Test che DEVONO essere presenti:
#   - Test 1: Selezione giorno mese (1-31)
#   - Test 2: Selezione giorno anno (1-365)
#   - Test 3: Grid 31 giorni per modalità month
#   - Test 4: Evidenziazione giorno selezionato

# 1.3. Verifica che test falliscono (RED phase)
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Output deve essere FAIL con "MiniCalendar is not defined"
# ❌ SE PASSA: Qualcosa è sbagliato, ferma e analizza
```

**STEP 2 - GREEN (45min)**:
```bash
# 2.1. Crea componente minimo
touch src/components/ui/MiniCalendar.tsx

# 2.2. Implementa codice minimo per passare test
# Template: TASKS_COMPLETAMENTO.md linee 140-186

# 2.3. Integra in AddPointModal
# BEFORE/AFTER: TASKS_COMPLETAMENTO.md linee 198-254

# 2.4. Verifica che test passano (GREEN phase)
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Output deve essere PASS (4/4 test)
# ❌ SE FALLISCE: Debug, fix, retry (NON andare avanti)
```

**STEP 3 - REFACTOR (15min)**:
```bash
# 3.1. Migliora codice senza cambiare comportamento
# - Ottimizza rendering per modalità year (365 giorni)
# - Verifica responsive design (mobile/tablet/desktop)
# - Aggiungi keyboard navigation se necessario

# 3.2. Verifica test ancora GREEN dopo refactor
npm run test -- MiniCalendar.test.tsx --run

# ✅ CONFERMA: Test ancora PASS (4/4)
```

**STEP 4 - VERIFY (15min)**:
```bash
# 4.1. Test componente
npm run test -- MiniCalendar.test.tsx --run
# ✅ MUST PASS: 4/4 test

# 4.2. Test AddPointModal (verifica integrazione)
npm run test -- AddPointModal.test.tsx --run
# ✅ MUST PASS: Nessuna regressione

# 4.3. Type-check
npm run type-check 2>&1 | grep -E "(MiniCalendar|AddPointModal)"
# ✅ MUST BE: 0 nuovi errori in questi file

# 4.4. Lint check
npm run lint 2>&1 | grep -E "(MiniCalendar|AddPointModal)"
# ✅ MUST BE: 0 nuovi errori in questi file
```

**STEP 5 - COMMIT (5min)**:
```bash
# 5.1. Verifica che TUTTI i comandi sopra hanno passato
# SE anche UNO è fallito: FERMA, risolvi, riprova

# 5.2. Commit SOLO se tutto OK
git add src/components/ui/MiniCalendar.tsx
git add src/components/ui/__tests__/MiniCalendar.test.tsx
git add src/features/conservation/components/AddPointModal.tsx
git commit -m "feat(conservation): add MiniCalendar component for monthly/annual frequency

- Create MiniCalendar component with month (1-31) and year (1-365) modes
- Integrate in AddPointModal for monthly/annual task frequency
- Add 4 TDD tests verifying selection and highlighting
- Ensure responsive design (mobile/tablet/desktop)

Tests: 4/4 passed
Type-check: PASS
Lint: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

Prima di dichiarare "completato", verifica che TUTTI questi sono ✅:

- [ ] Componente MiniCalendar creato: `src/components/ui/MiniCalendar.tsx` esiste
- [ ] Test file creato: `src/components/ui/__tests__/MiniCalendar.test.tsx` esiste
- [ ] Test RED → GREEN: Tutti 4 test passano (npm run test -- MiniCalendar)
- [ ] Integrato in AddPointModal per frequenza mensile (linee ~166-180 modificate)
- [ ] Integrato in AddPointModal per frequenza annuale solo sbrinamento
- [ ] Responsive design verificato: Componente funziona su mobile/tablet/desktop
- [ ] Type-check PASS: 0 nuovi errori (npm run type-check)
- [ ] Lint PASS: 0 nuovi errori (npm run lint)
- [ ] Nessuna regressione: Test pre-esistenti ancora passano
- [ ] Commit creato con messaggio dettagliato

SE ANCHE UNO ❌: NON sei completato. Risolvi prima di procedere.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 1
**Task**: 1.1
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File creati**:
- [ ] src/components/ui/MiniCalendar.tsx
- [ ] src/components/ui/__tests__/MiniCalendar.test.tsx

**File modificati**:
- [ ] src/features/conservation/components/AddPointModal.tsx (linee ___)

**Test results**:
- [ ] npm run test -- MiniCalendar: __/4 PASS
- [ ] npm run test -- AddPointModal: PASS (no regression)
- [ ] npm run type-check: PASS (0 new errors)
- [ ] npm run lint: PASS (0 new errors)

**Commit SHA**: _______________

**Problemi incontrati**:
___________________________________________________________________________

**Handoff notes per prossimo worker**:
___________________________________________________________________________

═══════════════════════════════════════════════════════════════════
⚠️ SE BLOCCATO
═══════════════════════════════════════════════════════════════════

1. **Identifica problema specifico**: Quale comando fallisce? Quale errore?
2. **Analizza root cause**: Perché fallisce? Dependency mancante? Type error?
3. **Tenta fix**: Risolvi e riprova (max 3 tentativi)
4. **SE ancora bloccato**: Documenta nel progress report, segnala blocco
5. **NON saltare task**: Se Task 1.1 è bloccata, FERMA e segnala

═══════════════════════════════════════════════════════════════════
```

---

## 🚀 PROMPT 2: Worker 2 - FASE 1 (Task 2.1, 2.2)

```
Sei Worker 2 - Database/Data Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO (1.5h)
═══════════════════════════════════════════════════════════════════

Completare:
- Task 2.1: **Carica campi assegnazione manutenzioni** (30min)
- Task 2.2: **Salva campi assegnazione da AddPointModal** (1h)

⚠️ CRITICAL: Questi campi sono GIÀ nel DB ma NON vengono caricati/salvati. Fix query/payload.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (10min):
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/TASKS_COMPLETAMENTO.md
   → Sezioni Task 2.1 (linee 790-868), Task 2.2 (linee 872-986)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #2 "Dettagli assegnazione incompleti" (linee 96-129)

3. .cursor/Skills/systematic-debugging/SKILL.md
   → Debug metodico workflow

4. .cursor/Skills/defense-in-depth/SKILL.md
   → Validazione campi

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 2.1 - Carica Campi Assegnazione (30min)
═══════════════════════════════════════════════════════════════════

**STEP 1 - ANALYZE (10min)**:
```bash
# 1.1. Leggi query esistente
cat src/features/conservation/hooks/useMaintenanceTasks.ts | grep -A 20 ".select"

# 1.2. Identifica campi mancanti
# DEVE includere: assignment_type, assigned_to_role, assigned_to_category,
#                 assigned_to_staff_id, department_id

# 1.3. Verifica type esistente
cat src/types/conservation.ts | grep -A 30 "interface MaintenanceTask"
```

**STEP 2 - MODIFY (15min)**:
```bash
# 2.1. Aggiorna query SELECT in useMaintenanceTasks.ts
# Template: TASKS_COMPLETAMENTO.md linee 819-835

# 2.2. Aggiorna type MaintenanceTask in conservation.ts
# Template: TASKS_COMPLETAMENTO.md linee 841-849

# 2.3. Salva modifiche
```

**STEP 3 - VERIFY (5min)**:
```bash
# 3.1. Type-check
npm run type-check 2>&1 | grep -E "useMaintenanceTasks|MaintenanceTask"
# ✅ MUST BE: 0 errori correlati a questi file

# 3.2. Verifica query (opzionale se hai accesso Supabase)
# Esegui query manualmente in Supabase e verifica che campi sono presenti

# ✅ CONFERMA: Type-check passa, campi disponibili
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 2.2 - Salva Campi Assegnazione (1h)
═══════════════════════════════════════════════════════════════════

**STEP 1 - ANALYZE (15min)**:
```bash
# 1.1. Leggi payload esistente in useConservationPoints
cat src/features/conservation/hooks/useConservationPoints.ts | grep -A 30 "INSERT INTO maintenance_tasks"

# 1.2. Verifica cosa viene passato da AddPointModal
cat src/features/conservation/components/AddPointModal.tsx | grep -A 20 "onSave"

# 1.3. Identifica gap: Quali campi NON vengono passati?
```

**STEP 2 - MODIFY AddPointModal (20min)**:
```bash
# 2.1. Aggiorna trasformazione dati in handleSubmit
# Template: TASKS_COMPLETAMENTO.md linee 919-959

# 2.2. Assicurati mapping corretto tipo manutenzione:
#      'rilevamento_temperatura' → 'temperature'
#      'sanificazione' → 'sanitization'
#      'sbrinamento' → 'defrosting'
#      'controllo_scadenze' → 'expiry_check'

# 2.3. Salva modifiche
```

**STEP 3 - VERIFY Payload (20min)**:
```bash
# 3.1. Type-check
npm run type-check 2>&1 | grep -E "AddPointModal|useConservationPoints"
# ✅ MUST BE: 0 errori correlati

# 3.2. Test creazione punto (manuale o E2E)
# - Crea punto con 4 manutenzioni
# - Configura assegnazione completa (ruolo + categoria + dipendente)
# - Salva

# 3.3. Verifica DB (query Supabase)
# Template: TASKS_COMPLETAMENTO.md linee 972-985
```

**STEP 4 - COMMIT (5min)**:
```bash
# 4.1. Verifica che TUTTI i comandi sopra hanno passato

# 4.2. Commit
git add src/features/conservation/hooks/useMaintenanceTasks.ts
git add src/features/conservation/components/AddPointModal.tsx
git add src/features/conservation/hooks/useConservationPoints.ts
git add src/types/conservation.ts
git commit -m "feat(conservation): load and save complete assignment details

Task 2.1:
- Update useMaintenanceTasks SELECT to include assignment_type, assigned_to_role,
  assigned_to_category, assigned_to_staff_id, department_id
- Update MaintenanceTask type with new fields

Task 2.2:
- Transform maintenanceTasks data before onSave in AddPointModal
- Save all assignment fields in useConservationPoints payload
- Verify DB: assignment fields saved correctly

Type-check: PASS
Verification: Assignment details saved to DB

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

**Task 2.1**:
- [ ] Query include assignment_type, assigned_to_role, assigned_to_category, assigned_to_staff_id, department_id
- [ ] Type MaintenanceTask aggiornato con campi mancanti
- [ ] Type-check PASS (0 errori correlati)

**Task 2.2**:
- [ ] AddPointModal trasforma maintenanceTasks correttamente
- [ ] useConservationPoints salva tutti campi assegnazione
- [ ] Verifica DB: campi salvati correttamente (query SQL eseguita)
- [ ] Type-check PASS (0 errori correlati)
- [ ] Nessuna regressione

SE ANCHE UNO ❌: NON sei completato.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 2
**Task**: 2.1, 2.2
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**File modificati**:
- [ ] src/features/conservation/hooks/useMaintenanceTasks.ts (linee ___)
- [ ] src/types/conservation.ts (linee ___)
- [ ] src/features/conservation/components/AddPointModal.tsx (linee ___)
- [ ] src/features/conservation/hooks/useConservationPoints.ts (linee ___)

**Verification commands executed**:
- [ ] npm run type-check: PASS
- [ ] Supabase query verification: ✅ Campi salvati

**Commit SHA**: _______________

**Database verification results**:
```sql
-- Query eseguita:
SELECT
  id, type,
  assigned_to_role,
  assigned_to_category,
  assigned_to_staff_id,
  assignment_type
FROM maintenance_tasks
WHERE conservation_point_id = '<POINT_ID_CREATED>'
LIMIT 1;

-- Risultato: [incolla risultato qui]
```

**Handoff notes per Worker 3**:
Task 2.1 COMPLETATO ✅ - Worker 3 può iniziare Task 3.1 (dipende da 2.1)

═══════════════════════════════════════════════════════════════════
```

---

## 🚀 PROMPT 3: Worker 3 - FASE 1 (Task 3.1, 3.2)

```
Sei Worker 3 - Maintenance/Logic Specialist per completamento feature Conservation.

═══════════════════════════════════════════════════════════════════
🎯 IL TUO OBIETTIVO (1.5h)
═══════════════════════════════════════════════════════════════════

Completare:
- Task 3.1: **Visualizza dettagli assegnazione manutenzioni** (1h) - DIPENDE DA Task 2.1 ✅
- Task 3.2: **Ordina manutenzioni per scadenza** (30min)

⚠️ CRITICAL BLOCKER: Task 3.1 RICHIEDE che Task 2.1 sia COMPLETED. Verifica PRIMA di iniziare.

═══════════════════════════════════════════════════════════════════
🚨 PRE-REQUISITO BLOCCANTE
═══════════════════════════════════════════════════════════════════

**VERIFICA CHE Task 2.1 è COMPLETATO** (5min):
```bash
# Verifica che campi assegnazione sono caricati
grep -A 10 "assignment_type\|assigned_to_role" src/features/conservation/hooks/useMaintenanceTasks.ts

# Verifica type aggiornato
grep -A 10 "assigned_to_role\|assigned_to_category" src/types/conservation.ts

# ✅ SE TROVATI: Continua
# ❌ SE NON TROVATI: FERMA - Worker 2 Task 2.1 NON completato, segnala blocco
```

**SE BLOCCATO**: Scrivi report "Task 3.1 BLOCCATA - Waiting for Task 2.1 completion" e FERMA.

═══════════════════════════════════════════════════════════════════
📚 FILE OBBLIGATORI DA LEGGERE PRIMA DI INIZIARE
═══════════════════════════════════════════════════════════════════

**LEGGI NELL'ORDINE** (10min):
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/TASKS_COMPLETAMENTO.md
   → Task 3.1 (linee 1086-1245), Task 3.2 (linee 1248-1328)

2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/11-01-2026/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problemi #2, #3

3. .cursor/Skills/test-driven-development/SKILL.md
   → TDD workflow

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.1 - Visualizza Dettagli Assegnazione (1h)
═══════════════════════════════════════════════════════════════════

**STEP 1 - RED (20min)**:
```bash
# 1.1. Crea test file
touch src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx

# 1.2. Scrivi test che verifica visualizzazione completa
# Template: TASKS_COMPLETAMENTO.md linee 1106-1128

# 1.3. Verifica RED
npm run test -- ScheduledMaintenanceCard.test.tsx --run

# ✅ CONFERMA: Test fallisce (visualizzazione incompleta)
```

**STEP 2 - GREEN (30min)**:
```bash
# 2.1. Implementa funzione formatAssignmentDetails
# Template: TASKS_COMPLETAMENTO.md linee 1149-1217

# 2.2. Aggiorna rendering in ScheduledMaintenanceCard
# Linee ~263-268: Sostituisci visualizzazione semplice con funzione helper

# 2.3. Verifica GREEN
npm run test -- ScheduledMaintenanceCard.test.tsx --run

# ✅ CONFERMA: Test passa
```

**STEP 3 - VERIFY (10min)**:
```bash
# 3.1. Type-check
npm run type-check 2>&1 | grep "ScheduledMaintenanceCard"
# ✅ MUST BE: 0 errori

# 3.2. Test completo
npm run test -- ScheduledMaintenanceCard
# ✅ MUST PASS
```

═══════════════════════════════════════════════════════════════════
⚙️ WORKFLOW TASK 3.2 - Ordina Manutenzioni (30min)
═══════════════════════════════════════════════════════════════════

**STEP 1 - IMPLEMENT (20min)**:
```bash
# 1.1. Aggiorna pointsWithStatus useMemo
# Template: TASKS_COMPLETAMENTO.md linee 1287-1312

# 1.2. Aggiungi sort per next_due ascendente
```

**STEP 2 - VERIFY (10min)**:
```bash
# 2.1. Test manuale:
#      - Crea punto con 4 manutenzioni (scadenze diverse)
#      - Verifica ordine nella UI

# 2.2. Type-check
npm run type-check 2>&1 | grep "ScheduledMaintenanceCard"
# ✅ MUST BE: 0 errori

# 2.3. Test completo
npm run test
# ✅ MUST PASS (nessuna regressione)
```

**STEP 3 - COMMIT (5min)**:
```bash
git add src/features/dashboard/components/ScheduledMaintenanceCard.tsx
git add src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx
git commit -m "feat(conservation): display and sort maintenance tasks

Task 3.1:
- Display complete assignment details (role | category | department | staff)
- Format: 'Ruolo: [role] | Reparto: [dept] | Categoria: [cat] | Dipendente: [name]'
- Test: Verify all details displayed

Task 3.2:
- Sort maintenances by next_due ascending (closest first)
- Ensure first maintenance shown is always the next due

Tests: PASS
Type-check: PASS

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

═══════════════════════════════════════════════════════════════════
✅ ACCEPTANCE CRITERIA (TUTTI OBBLIGATORI)
═══════════════════════════════════════════════════════════════════

**Task 3.1**:
- [ ] Visualizzazione mostra dettagli completi (ruolo | reparto | categoria | dipendente)
- [ ] Formato corretto con separatori
- [ ] Campi opzionali gestiti (non mostrati se null)
- [ ] Test RED → GREEN
- [ ] Type-check PASS

**Task 3.2**:
- [ ] Manutenzioni ordinate per scadenza (più prossime prima)
- [ ] Ordinamento corretto (data ascendente)
- [ ] Test manuale verificato
- [ ] Type-check PASS
- [ ] Nessuna regressione

SE ANCHE UNO ❌: NON sei completato.

═══════════════════════════════════════════════════════════════════
📊 PROGRESS REPORT (COMPILA ALLA FINE)
═══════════════════════════════════════════════════════════════════

**Worker**: 3
**Task**: 3.1, 3.2
**Status**: ✅ COMPLETATO / ⏳ IN PROGRESS / ❌ BLOCCATO
**Tempo impiegato**: ___ h

**Pre-requisito verificato**:
- [ ] Task 2.1 COMPLETED (campi assegnazione caricati)

**File creati**:
- [ ] src/features/dashboard/components/__tests__/ScheduledMaintenanceCard.test.tsx

**File modificati**:
- [ ] src/features/dashboard/components/ScheduledMaintenanceCard.tsx (linee ___)

**Test results**:
- [ ] npm run test -- ScheduledMaintenanceCard: __/__ PASS
- [ ] npm run type-check: PASS

**Commit SHA**: _______________

**Handoff notes per FASE 2**:
FASE 1 COMPLETATA ✅ - Tutti fix critici implementati. Procedi a FASE 2.

═══════════════════════════════════════════════════════════════════
```

---

## 📊 GATE FUNCTION - FINE FASE 1

**PRIMA DI PROCEDERE A FASE 2**, esegui:

```bash
# 1. Type-check completo
npm run type-check 2>&1 | tee logs/type-check-fase1.log
# ✅ PASS se: 0 NUOVI errori (errori pre-esistenti OK)

# 2. Test completo
npm run test 2>&1 | tee logs/test-fase1.log
# ✅ PASS se: Tutti test critici GREEN (nuovi + pre-esistenti)

# 3. Lint check
npm run lint 2>&1 | tee logs/lint-fase1.log
# ✅ PASS se: 0 NUOVI errori

# VERDICT:
# ✅ TUTTI PASS → Procedi FASE 2
# ❌ ALMENO UNO FAIL → FERMA, risolvi, riprova
```

---

## 🚀 PROMPT 4-10: [... continua con stessa struttura rigorosa ...]

---

**NOTE IMPORTANTI PER TUTTI I WORKER**:

1. **OGNI prompt è self-contained**: Tutto ciò di cui hai bisogno è nel prompt
2. **Progress report OBBLIGATORIO**: Compila SEMPRE prima di handoff
3. **Gate function tra fasi**: NON saltare verification commands
4. **Se bloccato**: Documenta, segnala, NON inventare workaround
5. **Commit granulari**: Un commit per task completata, non commit giganti
6. **Test SEMPRE**: RED → GREEN → REFACTOR, nessuna eccezione

---

**Fine PROMPTS_SEQUENZA_START.md v2.0**

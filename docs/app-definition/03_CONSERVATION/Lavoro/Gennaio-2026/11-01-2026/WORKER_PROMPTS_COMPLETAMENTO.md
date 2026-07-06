# WORKER_PROMPTS - Completamento Feature Conservation v3.0

**Data Creazione**: 2026-01-16  
**Versione**: 3.0.0  
**Motivo Aggiornamento**: Prompts per completamento feature e fix identificati  
**Fonte**: `STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md`

---

## 🎯 OVERVIEW SISTEMA

### Workflow Multi-Agent (5 Fasi Sequenziali)

```
FASE 1: FIX CRITICI → FASE 2: COMPLETA CORE → FASE 3: MIGLIORAMENTI → FASE 4: INTEGRATION → FASE 5: SUPERVISOR
(Workers 1-3)        (Workers 1-3)            (Workers 1, 3)          (Worker 4)          (Worker 5)
```

**Principio Chiave**: **Completamento sistematico**. Ogni fase completa prima della successiva.

### Workers Attivi

| ID | Nome | Ruolo | Trigger |
|----|------|-------|---------|
| 1 | UI/Forms Specialist | Fix UI e componenti | FASE 1/2/3 |
| 2 | Database/Data Specialist | Query e salvataggio dati | FASE 1/2 |
| 3 | Maintenance/Logic Specialist | Logica manutenzioni e visualizzazione | FASE 1/2/3 |
| 4 | Integration Specialist | Test E2E nuove feature | Dopo FASE 3 COMPLETED |
| 5 | Supervisor | Final verification & sign-off | Dopo FASE 4 COMPLETED |

---

## MAPPATURA SKILLS PER WORKER

| Worker | Skills da Leggere (.cursor/Skills/) |
|--------|-------------------------------------|
| Worker 1 (UI/Forms) | test-driven-development, systematic-debugging, Tailwind-CSS-design |
| Worker 2 (Database/Data) | systematic-debugging, root-cause-tracing, defense-in-depth |
| Worker 3 (Maintenance/Logic) | test-driven-development, systematic-debugging |
| Worker 4 (Integration) | test-driven-development, condition-based-waiting |
| Worker 5 (Supervisor) | verification-before-completion, testing-skills-with-subagents, executing-plans |

---

## 📋 PROMPTS PRONTI PER AGENTI

I seguenti prompt possono essere copiati e usati direttamente per avviare ogni worker.

---

## WORKER 1: UI/Forms Specialist 🎨

### FASE 1 - PROMPT COMPLETO

```
Sei Worker 1, responsabile delle modifiche UI per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico
3. Tailwind-CSS-design/SKILL.md - Pattern CSS per componenti

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 1: FIX CRITICI - WORKER 1"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #1 (Mini calendario)

## IL TUO OBIETTIVO
Completare Task 1.1: Mini Calendario Component per Frequenza Mensile/Annuale

## PREREQUISITO CRITICO
⚠️ NON iniziare se:
- Analisi non completata (STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md non presente)
- Fase precedente non completata

Aspetta che tutti i prerequisiti siano soddisfatti.

## LE TUE TASK
- Task 1.1: Mini Calendario Component (1.5h, CRITICAL)

## WORKFLOW TDD (PER OGNI TASK)
1. RED: Scrivi test che fallisce
   - Testa comportamento desiderato
   - Verifica che fallisce per ragione giusta
   - Comando: npm run test -- MiniCalendar.test.tsx --run

2. GREEN: Implementa minimal fix
   - Codice minimo per passare test
   - NO over-engineering
   - File: src/components/ui/MiniCalendar.tsx

3. REFACTOR: Cleanup
   - Migliora codice senza cambiare comportamento
   - Mantieni test verdi

4. VERIFY: Nessuna regressione
   - npm run test (tutti devono passare)
   - npm run type-check (0 nuovi errori)

5. COMMIT: Solo se tutto OK
   - git commit -m "feat(conservation): add MiniCalendar component for monthly/annual frequency"

## TASK 1.1: MINI CALENDARIO COMPONENT

**Problema**: Frequenza mensile/annuale usa input numerico invece di vero mini calendario (requisito specifico utente)

**File da Creare**:
- src/components/ui/MiniCalendar.tsx (nuovo componente)
- src/components/ui/__tests__/MiniCalendar.test.tsx (nuovo test)

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (linee frequenza manutenzioni ~166-180)
- src/components/onboarding-steps/TasksStep.tsx (allineare con stesso componente)

**Pattern Riferimento**: Verificare se esistono componenti calendario in src/components/ui/

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.1

## REGOLE CRITICHE
- TDD rigoroso: RED → GREEN → REFACTOR
- Test devono passare PRIMA di commit
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione
- Responsive design mobile/tablet/desktop

## COMPLETION CRITERIA
- [ ] Componente MiniCalendar creato e funzionante
- [ ] Test RED → GREEN (4/4 test passati)
- [ ] Integrato in AddPointModal per frequenza mensile
- [ ] Integrato in AddPointModal per frequenza annuale (solo sbrinamento)
- [ ] Responsive design verificato
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni (test pre-esistenti passano)

Aggiorna progress quando completo.
```

---

### FASE 2 - PROMPT COMPLETO

```
Sei Worker 1, responsabile delle modifiche UI per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico
3. Tailwind-CSS-design/SKILL.md - Pattern CSS per componenti

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 2: COMPLETA FEATURE CORE - WORKER 1"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problemi #4, #7, #9 (Config giorni, Validazione, Rimuovi custom)

## IL TUO OBIETTIVO
Completare Task 1.2, 1.3, 1.4: Configurazione giorni settimana, Validazione specifica, Rimuovi custom

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 1 non COMPLETED
- Test critici non GREEN
- Type-check non PASS

Aspetta che FASE 1 sia completata al 100%.

## LE TUE TASK
- Task 1.2: Configurazione giorni settimana (1h, HIGH)
- Task 1.3: Validazione manutenzioni specifica (1h, HIGH)
- Task 1.4: Rimuovi frequenza "custom" (30min, MEDIUM)

## WORKFLOW TDD (PER OGNI TASK)
1. RED: Scrivi test che fallisce
2. GREEN: Implementa minimal fix
3. REFACTOR: Cleanup
4. VERIFY: Nessuna regressione
5. COMMIT: Solo se tutto OK

## TASK 1.2: CONFIGURAZIONE GIORNI SETTIMANA

**Problema**: Frequenza giornaliera/settimanale non ha configurazione giorni settimana

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (frequenza manutenzioni)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.2

## TASK 1.3: VALIDAZIONE MANUTENZIONI SPECIFICA

**Problema**: Errore generico invece di errore specifico per manutenzione incompleta

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (validazione, linee ~544-588)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.3

## TASK 1.4: RIMUOVI FREQUENZA "CUSTOM"

**Problema**: Opzione "custom" ancora presente nel select frequenze

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (select frequenza, linee ~166-180)
- src/components/onboarding-steps/TasksStep.tsx (allineare)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.4

## REGOLE CRITICHE
- TDD rigoroso: RED → GREEN → REFACTOR
- Test devono passare PRIMA di commit
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 1.2 completato (checkbox giorni settimana) + test GREEN
- [ ] Task 1.3 completato (validazione specifica) + test GREEN
- [ ] Task 1.4 completato (custom rimosso) + test GREEN
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni (test pre-esistenti passano)

Aggiorna progress quando completo.
```

---

### FASE 3 - PROMPT COMPLETO

```
Sei Worker 1, responsabile delle modifiche UI per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 3: MIGLIORAMENTI - WORKER 1"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problemi #10, #6 (Aria-label, Modifica lettura)

## IL TUO OBIETTIVO
Completare Task 1.5, 1.6: Aria-label, Modifica lettura temperatura

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 2 non COMPLETED
- Test core non GREEN

Aspetta che FASE 2 sia completata al 100%.

## LE TUE TASK
- Task 1.5: Aggiungi aria-label a pulsanti icona (30min, MEDIUM)
- Task 1.6: Modifica lettura temperatura (30min, MEDIUM)

## WORKFLOW TDD (PER OGNI TASK)
1. RED: Scrivi test che fallisce
2. GREEN: Implementa minimal fix
3. REFACTOR: Cleanup
4. VERIFY: Nessuna regressione
5. COMMIT: Solo se tutto OK

## TASK 1.5: AGGIUNGI ARIA-LABEL

**Problema**: Pulsanti icona (edit/delete) non hanno aria-label descrittivi

**File da Modificare**:
- src/features/conservation/components/ConservationPointCard.tsx (aria-label)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.5

## TASK 1.6: MODIFICA LETTURA TEMPERATURA

**Problema**: Handler handleEditReading esiste ma non implementato (mostra solo alert)

**File da Modificare**:
- src/features/conservation/ConservationPage.tsx (handleEditReading, linee ~320-327)
- src/features/conservation/components/AddTemperatureModal.tsx (modalità edit, se necessario)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 1.6

## REGOLE CRITICHE
- TDD rigoroso: RED → GREEN → REFACTOR
- Test devono passare PRIMA di commit
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 1.5 completato (aria-label) + test GREEN
- [ ] Task 1.6 completato (modifica lettura) + test GREEN
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

## WORKER 2: Database/Data Specialist 💾

### FASE 1 - PROMPT COMPLETO

```
Sei Worker 2, responsabile di query database e salvataggio dati per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. systematic-debugging/SKILL.md - Debugging metodico
2. root-cause-tracing/SKILL.md - Tracciamento campi mancanti
3. defense-in-depth/SKILL.md - Validazione campi

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 1: FIX CRITICI - WORKER 2"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #2 (Dettagli assegnazione)

## IL TUO OBIETTIVO
Completare Task 2.1, 2.2: Carica campi assegnazione, Salva campi assegnazione

## PREREQUISITO CRITICO
⚠️ NON iniziare se:
- Analisi non completata
- Fase precedente non completata

Aspetta che tutti i prerequisiti siano soddisfatti.

## LE TUE TASK
- Task 2.1: Carica campi assegnazione manutenzioni (30min, CRITICAL)
- Task 2.2: Salva campi assegnazione da AddPointModal (1h, CRITICAL)

## WORKFLOW PER OGNI TASK
1. ANALYZE: Leggi query/codice esistente
2. MODIFY: Aggiorna query/payload
3. VERIFY: Test query/type-check
4. COMMIT: Solo se tutto OK

## TASK 2.1: CARICA CAMPI ASSEGNAZIONE

**Problema**: Hook useMaintenanceTasks non carica campi assegnazione (assignment_type, assigned_to_role, assigned_to_category, assigned_to_staff_id, department_id)

**File da Modificare**:
- src/features/conservation/hooks/useMaintenanceTasks.ts (query SELECT, linee ~100-132)

**Comando Verifica**:
```bash
npm run type-check
# Verifica che type MaintenanceTask include tutti i campi
```

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 2.1

## TASK 2.2: SALVA CAMPI ASSEGNAZIONE

**Problema**: Hook useConservationPoints salva solo assigned_to generico invece di campi specifici

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (trasformazione dati prima di onSave)
- src/features/conservation/hooks/useConservationPoints.ts (verificare payload, linee ~101-117)

**Comando Verifica DB**:
```sql
SELECT 
  id,
  type,
  assigned_to_role,
  assigned_to_category,
  assigned_to_staff_id,
  assignment_type
FROM maintenance_tasks
WHERE conservation_point_id = '<point_id>'
LIMIT 1;
```

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 2.2

## REGOLE CRITICHE
- Verifica query esistente PRIMA di modificare
- Type-check DEVE passare (0 nuovi errori)
- Verifica DB dopo modifiche
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 2.1 completato (query include campi) + type-check PASS
- [ ] Task 2.2 completato (payload salva campi) + test GREEN
- [ ] Verifica DB: campi salvati correttamente
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

### FASE 2 - PROMPT COMPLETO

```
Sei Worker 2, responsabile di query database e salvataggio dati per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - Test salvataggio
2. defense-in-depth/SKILL.md - Validazione campi

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 2: COMPLETA FEATURE CORE - WORKER 2"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #6 (Campi temperatura non salvati)

## IL TUO OBIETTIVO
Completare Task 2.3: Salva campi form temperatura (metodo, note, foto)

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 1 non COMPLETED
- Test critici non GREEN

Aspetta che FASE 1 sia completata al 100%.

## LE TUE TASK
- Task 2.3: Salva campi form temperatura (metodo, note, foto) (30min, HIGH)

## WORKFLOW
1. ANALYZE: Verifica migration 015 (campi già presenti nel DB)
2. MODIFY: Aggiorna form e hook per salvare campi
3. VERIFY: Test salvataggio + verifica DB
4. COMMIT: Solo se tutto OK

## TASK 2.3: SALVA CAMPI FORM TEMPERATURA

**Problema**: Migration 015 aggiunge campi (method, notes, photo_evidence, recorded_by) ma non vengono salvati dal form

**File da Modificare**:
- src/features/conservation/components/AddTemperatureModal.tsx (handleSubmit, linee ~134-165)
- src/features/conservation/hooks/useTemperatureReadings.ts (payload, linee ~58-102)

**Comando Verifica DB**:
```sql
SELECT method, notes, photo_evidence, recorded_by
FROM temperature_readings
ORDER BY created_at DESC
LIMIT 1;
```

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 2.3

## REGOLE CRITICHE
- Migration 015 già applicata (campi esistono nel DB)
- Type-check DEVE passare
- Verifica DB dopo modifiche
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 2.3 completato (form salva campi) + test GREEN
- [ ] Verifica DB: campi salvati correttamente
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

## WORKER 3: Maintenance/Logic Specialist 🔧

### FASE 1 - PROMPT COMPLETO

```
Sei Worker 3, responsabile della logica manutenzioni e visualizzazione per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 1: FIX CRITICI - WORKER 3"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problemi #2, #3 (Dettagli assegnazione, Ordinamento)

## IL TUO OBIETTIVO
Completare Task 3.1, 3.2: Visualizza dettagli assegnazione, Ordina manutenzioni per scadenza

## PREREQUISITO CRITICO
⚠️ NON iniziare se:
- Task 2.1 non COMPLETED (campi non caricati)
- Fase precedente non completata

Aspetta che Task 2.1 sia completata PRIMA di Task 3.1.

## LE TUE TASK
- Task 3.1: Visualizza dettagli assegnazione manutenzioni (1h, CRITICAL) - DIPENDE DA Task 2.1
- Task 3.2: Ordina manutenzioni per scadenza (30min, CRITICAL)

## WORKFLOW TDD (PER OGNI TASK)
1. RED: Scrivi test che fallisce
2. GREEN: Implementa minimal fix
3. REFACTOR: Cleanup
4. VERIFY: Nessuna regressione
5. COMMIT: Solo se tutto OK

## TASK 3.1: VISUALIZZA DETTAGLI ASSEGNAZIONE

**Problema**: ScheduledMaintenanceCard mostra solo stringa generica invece di ruolo + categoria + reparto + dipendente

**File da Modificare**:
- src/features/dashboard/components/ScheduledMaintenanceCard.tsx (visualizzazione assegnazione, linee ~263-268)

**BLOCKER**: Task 2.1 DEVE essere completato PRIMA (campi devono essere caricati)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 3.1

## TASK 3.2: ORDINA MANUTENZIONI PER SCADENZA

**Problema**: Manutenzioni mostrate nell'ordine caricamento invece di ordinate per next_due ascendente

**File da Modificare**:
- src/features/dashboard/components/ScheduledMaintenanceCard.tsx (ordinamento array, linee ~125-142)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 3.2

## REGOLE CRITICHE
- Task 3.1 DIPENDE da Task 2.1 (ordine: Task 2.1 → Task 3.1)
- TDD rigoroso per Task 3.1
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 3.1 completato (visualizzazione completa) + test GREEN
- [ ] Task 3.2 completato (ordinamento) + test GREEN
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

### FASE 2 - PROMPT COMPLETO

```
Sei Worker 3, responsabile della logica manutenzioni e visualizzazione per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 2: COMPLETA FEATURE CORE - WORKER 3"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #5 (Raggruppamento manutenzioni)

## IL TUO OBIETTIVO
Completare Task 3.3: Raggruppa manutenzioni per tipo con solo prima visibile

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 1 non COMPLETED
- Test critici non GREEN

Aspetta che FASE 1 sia completata al 100%.

## LE TUE TASK
- Task 3.3: Raggruppa manutenzioni per tipo con solo prima visibile (1h, HIGH)

## WORKFLOW TDD
1. RED: Scrivi test che fallisce
2. GREEN: Implementa minimal fix
3. REFACTOR: Cleanup
4. VERIFY: Nessuna regressione
5. COMMIT: Solo se tutto OK

## TASK 3.3: RAGGRUPPA MANUTENZIONI PER TIPO

**Problema**: Tutte le manutenzioni mostrate, non raggruppate per tipo con solo prima visibile

**File da Modificare**:
- src/features/dashboard/components/ScheduledMaintenanceCard.tsx (raggruppamento, linee ~220-280)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 3.3

## REGOLE CRITICHE
- TDD rigoroso: RED → GREEN → REFACTOR
- Test devono passare PRIMA di commit
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 3.3 completato (raggruppamento) + test GREEN
- [ ] Solo prima manutenzione per tipo visibile
- [ ] Espansione mostra prossime 2 per tipo
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

### FASE 3 - PROMPT COMPLETO

```
Sei Worker 3, responsabile della logica manutenzioni e visualizzazione per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - TDD workflow (RED-GREEN-REFACTOR)
2. systematic-debugging/SKILL.md - Debugging metodico

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 3: MIGLIORAMENTI - WORKER 3"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Problema #8 (Modifica punto con manutenzioni)

## IL TUO OBIETTIVO
Completare Task 3.4: Modifica punto con manutenzioni

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 2 non COMPLETED
- Test core non GREEN

Aspetta che FASE 2 sia completata al 100%.

## LE TUE TASK
- Task 3.4: Modifica punto con manutenzioni (1h, MEDIUM)

## WORKFLOW TDD
1. RED: Scrivi test che fallisce
2. GREEN: Implementa minimal fix
3. REFACTOR: Cleanup
4. VERIFY: Nessuna regressione
5. COMMIT: Solo se tutto OK

## TASK 3.4: MODIFICA PUNTO CON MANUTENZIONI

**Problema**: Manutenzioni non vengono caricate/modificate in modalità edit

**File da Modificare**:
- src/features/conservation/components/AddPointModal.tsx (caricamento manutenzioni in edit)
- src/features/conservation/hooks/useMaintenanceTasks.ts (query per punto, se necessario)

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 3.4

## REGOLE CRITICHE
- TDD rigoroso: RED → GREEN → REFACTOR
- Test devono passare PRIMA di commit
- Type-check DEVE passare (0 nuovi errori)
- Nessuna regressione

## COMPLETION CRITERIA
- [ ] Task 3.4 completato (modifica manutenzioni) + test GREEN
- [ ] Manutenzioni caricate in modalità edit
- [ ] Form precompilato con manutenzioni esistenti
- [ ] npm run test → ALL PASS
- [ ] npm run type-check → 0 nuovi errori
- [ ] NO regressioni

Aggiorna progress quando completo.
```

---

## WORKER 4: Integration & Testing Specialist 🧪

### FASE 4 - PROMPT COMPLETO

```
Sei Worker 4, responsabile di test E2E e performance per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
Prima di iniziare, LEGGI queste skills nella cartella .cursor/Skills/:
1. test-driven-development/SKILL.md - Scrittura test
2. condition-based-waiting/SKILL.md - Attese condizionali (no timeout fissi)

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 4: INTEGRATION (Worker 4)"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Riepilogo feature implementate

## IL TUO OBIETTIVO
Testare tutte le nuove feature implementate con test E2E completi.

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 3 non COMPLETED
- Test unit non GREEN

Aspetta che FASE 3 sia completata al 100%.

## LE TUE TASK
- Task 4.1: Test E2E nuove feature (1h, HIGH)

## TASK 4.1: TEST E2E NUOVE FEATURE

**Focus**: Testare tutte le nuove feature implementate

**File da Creare**:
- tests/conservation/completamento-feature-e2e.spec.ts (nuovo file)

**Scenari da Testare**:
1. Mini Calendario Mensile/Annuale
2. Dettagli Assegnazione Completi
3. Ordinamento Manutenzioni
4. Configurazione Giorni Settimana
5. Raggruppamento Manutenzioni per Tipo
6. Salvataggio Campi Temperatura

**Implementation Dettagliata**: Vedi TASKS_COMPLETAMENTO.md - Task 4.1

## REGOLE CRITICHE
- NO timeout fissi → usa condition-based-waiting
- Screenshot ad ogni step importante
- Database verification dopo ogni test
- Cleanup automatico (afterEach)
- Tempo esecuzione E2E < 15s

## COMPLETION CRITERIA
- [ ] Test E2E passa per tutte le nuove feature
- [ ] Screenshot salvati (10+)
- [ ] Database verification dopo ogni test
- [ ] Tempo esecuzione < 15s
- [ ] Cleanup automatico

Aggiorna progress quando completo.
```

---

## WORKER 5: Supervisor 👔

### FASE 5 - PROMPT COMPLETO

```
Sei il Supervisor, responsabile del final quality gate per il completamento feature Conservation.

## SKILLS OBBLIGATORIE
1. verification-before-completion/SKILL.md - GATE FUNCTION protocol
2. testing-skills-with-subagents/SKILL.md
3. executing-plans/SKILL.md

## FILE DA LEGGERE
1. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/PLAN_COMPLETAMENTO_FEATURE.md
2. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/TASKS_COMPLETAMENTO.md
   → Sezione "FASE 5: FINAL VERIFICATION (Worker 5)"
3. Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/STATO_IMPLEMENTAZIONE_vs_DEFINIZIONI.md
   → Riepilogo completo feature

## IL TUO OBIETTIVO
Garantire che TUTTO funziona prima del merge.

## PREREQUISITO CRITICO - BLOCKER ASSOLUTO
⚠️ NON iniziare se:
- FASE 4 non COMPLETED
- E2E tests non PASS

Aspetta che FASE 4 sia completata al 100%.

## GATE FUNCTION - CHECKLIST
Esegui TUTTI i comandi FRESH (no cache):

```bash
# 1. TypeScript
npm run type-check 2>&1 | tee logs/type-check-completamento.log
# ✅ PASS se: 0 errors (o solo pre-esistenti documentati)

# 2. Lint
npm run lint 2>&1 | tee logs/lint-completamento.log
# ✅ PASS se: 0 errors

# 3. Build
npm run build 2>&1 | tee logs/build-completamento.log
# ✅ PASS se: SUCCESS

# 4. Unit Tests
npm run test 2>&1 | tee logs/test-completamento.log
# ✅ PASS se: ALL PASS

# 5. E2E Tests
npm run test:e2e -- conservation 2>&1 | tee logs/e2e-completamento.log
# ✅ PASS se: ALL PASS

# 6. Database Integrity
node scripts/verify-conservation-db.js 2>&1 | tee logs/db-check-completamento.log
# ✅ PASS se: 0 orphans, migrations applied
```

## DELIVERABLE
File: Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/SUPERVISOR_FINAL_REPORT_COMPLETAMENTO_[DATA].md

Template completo in TASKS_COMPLETAMENTO.md - Task 5.1.

## VERDICT FINALE
Dopo aver eseguito TUTTI i comandi:

### ✅ APPROVED - Ready for Merge
**Condizioni**:
- Tutti comandi passano
- No nuovi errori
- Tutte le feature implementate
- E2E confermano funzionalità

**Merge Instructions**: [fornire step dettagliati]

### ❌ REJECTED - Fix Required
**Condizioni**:
- Almeno UN comando fallisce
- Nuovi errori introdotti
- Regressioni rilevate

**Action Items**:
- Lista problemi bloccanti
- Worker responsabile per fix
- Fase a cui tornare
- ETA fix

## REGOLE CRITICHE
- Comandi FRESH (no cache)
- Output completo salvato in log files
- Verdict chiaro e motivato
- Se REJECTED: action items specifici

## COMPLETION CRITERIA
- [ ] Tutti 6 comandi eseguiti FRESH
- [ ] Output salvato in file log
- [ ] Verdict: APPROVED / REJECTED
- [ ] Se REJECTED: action items dettagliati
- [ ] Se APPROVED: merge instructions

Scrivi SUPERVISOR_FINAL_REPORT_COMPLETAMENTO.md con verdict.
```

---

## 📋 SUMMARY HANDOFF BETWEEN WORKERS

```
FASE 1: FIX CRITICI
  │
  ├─> Worker 1: Mini Calendario Component
  ├─> Worker 2: Carica/Salva campi assegnazione
  └─> Worker 3: Visualizza dettagli + Ordina manutenzioni
  │
  ▼ IF ALL COMPLETED
FASE 2: COMPLETA CORE
  │
  ├─> Worker 1: Config giorni settimana + Validazione + Rimuovi custom
  ├─> Worker 2: Salva campi temperatura
  └─> Worker 3: Raggruppa manutenzioni per tipo
  │
  ▼ IF ALL COMPLETED
FASE 3: MIGLIORAMENTI
  │
  ├─> Worker 1: Aria-label + Modifica lettura
  └─> Worker 3: Modifica punto con manutenzioni
  │
  ▼ IF ALL COMPLETED
FASE 4: INTEGRATION
  │
  └─> Worker 4: Test E2E nuove feature
  │
  ▼ IF E2E PASS
FASE 5: SUPERVISOR
  │
  └─> Worker 5: Final Quality Check
  │
  ▼ VERDICT
  │
  ├─> ✅ APPROVED → MERGE
  └─> ❌ REJECTED → Fix & Retry
```

**Principio**: Ogni fase BLOCCATA dalla precedente. NO parallelismo tra fasi.

---

**Fine WORKER_PROMPTS_COMPLETAMENTO.md v3.0**

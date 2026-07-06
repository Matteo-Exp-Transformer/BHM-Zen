# Session 19-01-2026: Profilo Punto di Conservazione

## Contenuto Cartella

| File | Descrizione |
|------|-------------|
| `PLAN.md` | Piano implementazione completo v2.0.0 |
| `TASKS.md` | Breakdown task per sistema multi-agent |
| `AGENT_ASSIGNMENTS.md` | Assegnazioni specifiche per ogni agente |
| `TEMPLATE_JSON.json` | Template JSON profili HACCP (riferimento) |
| `README.md` | Questo file |

## Quick Start per Agenti

### AGENT-1 (UI/Frontend)
1. Leggi `AGENT_ASSIGNMENTS.md` sezione "AGENT-1"
2. Inizia da Batch 1 (Bug Critici) - BLOCCANTE
3. Poi procedi con Batch 2-4

### AGENT-2 (Database)
1. Leggi `AGENT_ASSIGNMENTS.md` sezione "AGENT-2"
2. Crea migration in ordine: 018 → 019 → 020
3. Testa ogni migration prima di procedere

### AGENT-3 (TypeScript/Logic)
1. Leggi `AGENT_ASSIGNMENTS.md` sezione "AGENT-3"
2. Inizia da TASK-2.1 (conservationProfiles.ts) - può iniziare in parallelo
3. Poi procedi con TASK-2.2, 2.3, 4.1

### AGENT-TESTER (QA)
1. Leggi `AGENT_ASSIGNMENTS.md` sezione "AGENT-TESTER"
2. TASK-0.4 dopo completamento Fase 0
3. TASK-5.1, 5.2 dopo completamento Fase 3

## Ordine Esecuzione

```
Wave 1 (Parallelo):
├── AGENT-1: Bug Fix (0.1, 0.2, 0.3)
├── AGENT-2: Migration 018
└── AGENT-3: conservationProfiles.ts

Wave 2 (Dopo Wave 1):
├── AGENT-TESTER: Test Bug Fix
├── AGENT-2: Migration 019, 020
└── AGENT-3: conservation.ts, defaultCategories.ts

Wave 3 (Dopo Wave 2):
├── AGENT-1: UI Profilo (3.1-3.4)
└── AGENT-3: useConservationPoints

Wave 4 (Finale):
├── AGENT-1: Card (opzionale)
└── AGENT-TESTER: Test unitari e E2E
```

## Dipendenze Critiche

- **Fase 0 DEVE completare prima di Fase 3**
- **TASK-2.1 DEVE completare prima di TASK-3.2**
- **TASK-1.1 DEVE completare prima di TASK-4.1**

## Riferimenti

- Documentazione completa: `ADD_POINT_MODAL.md` in `Conoscenze-Definizioni/`
- Bug Tracker: `/BUG_TRACKER.md`
- Schema DB: `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`

---

**Creato**: 2026-01-19
**Versione**: 2.0.0

# Sessione di Lavoro 15-01-2026
## Conservation Feature - Bug Fix Session (Multi-Agent)

---

## ARCHITETTURA MULTI-AGENTE

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPERVISOR (Tu)                          │
└─────────────────────────────────────────────────────────────┘
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   AGENTE 1    │     │   AGENTE 2    │     │   AGENTE 3    │
│  Agent-UI-Fix │     │Agent-Hooks-Fix│     │Agent-Feature  │
│  Task: C1, M1 │     │  Task: A1, A2 │     │  Task: M2, M3 │
└───────────────┘     └───────────────┘     └───────────────┘
```

---

## CONTENUTO CARTELLA

| File | Descrizione |
|------|-------------|
| **TASK.md** | Lista task con priorità, agente assegnato e acceptance criteria |
| **PLAN.md** | Piano tecnico dettagliato con soluzioni implementative |
| **WORKER_PROMPT.md** | Prompt per ogni agente con istruzioni step-by-step |
| **EXECUTION_LOG.md** | Template log da compilare durante esecuzione |

---

## CONTESTO

Questa sessione di lavoro si basa sull'analisi del 14-01-2026 documentata in:
- `../14-01-2026/CONFRONTO_REQUISITI_VS_IMPLEMENTAZIONE.md`
- `../14-01-2026/SUPERVISOR_FINAL_APPROVAL.md` (43/43 test PASS)

### Problemi Identificati

| ID | Problema | Priorità |
|----|----------|----------|
| C1 | Select Ruolo non si apre in AddPointModal | CRITICO |
| A1 | Manutenzione completata rimane visibile | ALTO |
| A2 | Visualizzazione assegnazione incompleta | ALTO |
| M1 | Temperatura target senza valore default | MEDIO |
| M2 | Giorni default frequenza errati | MEDIO |
| M3 | Modifica lettura mostra solo alert | MEDIO |

---

## ISTRUZIONI PER IL WORKER

1. **Leggi** `TASK.md` per capire cosa fare
2. **Leggi** `PLAN.md` per capire come farlo
3. **Esegui** seguendo `WORKER_PROMPT.md` passo per passo
4. **Documenta** tutto in `EXECUTION_LOG.md`

---

## PREREQUISITI

- Build deve passare prima di iniziare
- Test devono passare prima di iniziare
- Branch dedicato consigliato: `fix/conservation-bugs-20260115`

---

## VERIFICA COMPLETAMENTO

Dopo l'esecuzione, verificare:

```bash
npm run build           # DEVE PASSARE
npm run type-check      # DEVE PASSARE
npm run lint            # DEVE PASSARE
npm run test            # DEVE PASSARE
```

---

**Creato da**: Claude Opus 4.5
**Data**: 2026-01-15

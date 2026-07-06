# Sessione di Lavoro - 12 Gennaio 2026

## 📋 Riassunto Strategico

**Obiettivo**: Consolidamento prompts finali per fix critici e completamento Conservation v3.0.

**Contesto**: Sessione dedicata alla creazione di prompts consolidati e finali per il workflow multi-agente. Include tutti i miglioramenti integrati dalle sessioni precedenti, con workflow completo da FASE 0 a FASE 5.

**Risultati Chiave**:
- ✅ Prompts finali consolidati con tutte le modifiche
- ✅ Workflow completo 0-5 con 13 prompts
- ✅ 10 regole critiche obbligatorie per tutti i worker
- ✅ Sequenza esecuzione completa documentata
- ✅ Gate functions per ogni fase

**Status**: ✅ Prompts finali completati - Pronto per esecuzione

---

## 📑 Indice File

| File | Descrizione | Tipo |
|------|-------------|------|
| **WORKER_PROMPTS_FINAL.md** | Prompts finali consolidati per tutti i workers (FASE 0-5) con 10 regole critiche | Istruzioni |

---

## 🎯 Obiettivi della Sessione

1. **Consolidare tutti i prompts** in un unico file finale
2. **Integrare miglioramenti** dalle sessioni precedenti
3. **Definire 10 regole critiche** obbligatorie per tutti i worker
4. **Documentare sequenza esecuzione** completa

---

## 🔑 Punti Chiave

### 10 Regole Critiche (Obbligatorie)
1. NON FERMARTI fino a quando TUTTI i completion criteria sono soddisfatti
2. SE incontri un errore: SEGNALA ma CONTINUA con le altre task
3. SE un test fallisce: ANALIZZA e RISOLVI, poi RIPROVA
4. OGNI task DEVE avere evidenza concreta
5. DOPO ogni task: Aggiorna progress e VERIFICA compliance
6. PRIMA di dichiarare "completato": Esegui verification commands
7. NON dichiarare successo se anche UN SOLO acceptance criterion non è soddisfatto
8. DOCUMENTA tutto
9. HANDOFF al prossimo worker con report conciso
10. SE NON SEGUI QUESTE REGOLE: Il lavoro sarà REJECTED

### Workflow Completo
- **FASE 0**: Fix Bloccanti (Priority 1-2) - 4-6h
- **FASE 1**: Fix Critici (Workers 1-3) - 5h
- **FASE 2**: Completa Core (Workers 1-3) - 4h
- **FASE 3**: Miglioramenti (Workers 1, 3) - 2h
- **FASE 4**: Integration (Worker 4) - 1h
- **FASE 5**: Final Verification (Worker 5) - 1h
- **TOTALE**: 17-19h | 23 task | 6 fasi (0-5) | 5 workers

### Prompts Disponibili
- **PROMPT 1-3**: FASE 0 (Fix Bloccanti)
- **PROMPT 4-6**: FASE 1 (Fix Critici)
- **PROMPT 7-9**: FASE 2 (Completa Core)
- **PROMPT 10-11**: FASE 3 (Miglioramenti)
- **PROMPT 12**: FASE 4 (Integration)
- **PROMPT 13**: FASE 5 (Supervisor)

---

## 📚 Riferimenti

- **Piano Consolidato**: `C:\Users\matte.MIO\.cursor\plans\fix_critici_e_completamento_conservation_-_piano_consolidato_FINAL.md`
- **Master Index**: `../00_MASTER_INDEX_CONSERVATION.md`
- **Piano Precedente**: `../11-01-2026/PLAN_COMPLETAMENTO_FEATURE.md`

---

**Data**: 12 Gennaio 2026  
**Versione**: FINAL (Con tutti i miglioramenti integrati)  
**Status**: ✅ Prompts finali completati

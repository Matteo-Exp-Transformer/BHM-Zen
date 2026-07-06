# TASK LIST - Conservation Feature Fix
## Data: 2026-01-15
## Priorità: CRITICO → ALTO → MEDIO
## Versione: 2.0 - Multi-Agent

---

## ASSEGNAZIONE AGENTI

| Agente | Nome | Skill | Task Assegnate |
|--------|------|-------|----------------|
| **AGENTE 1** | Agent-UI-Fix | Radix UI, z-index, CSS, Forms | C1, M1 |
| **AGENTE 2** | Agent-Hooks-Fix | React Query, Supabase, Mutations | A1, A2 |
| **AGENTE 3** | Agent-Feature-Dev | React State, Custom Hooks, Modals | M2, M3 |

---

## TASK CRITICHE (Bloccanti)

### TASK-C1: Fix Select Ruolo in AddPointModal
**Agente**: AGENTE 1 (Agent-UI-Fix)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Il Select Radix UI per selezionare il ruolo nelle manutenzioni non si apre quando cliccato
**Causa Probabile**:
- z-index del SelectContent inferiore al modal
- overflow:hidden sul container che taglia il Portal
- evento stopPropagation mancante o eccessivo

**Acceptance Criteria**:
- [ ] Click su "Seleziona ruolo..." apre dropdown con opzioni
- [ ] Selezione ruolo aggiorna lo state correttamente
- [ ] Dropdown si chiude dopo selezione
- [ ] Funziona su desktop E mobile

---

## TASK ALTE (Impattano UX)

### TASK-A1: Fix Manutenzione Completata Rimane Visibile
**Agente**: AGENTE 2 (Agent-Hooks-Fix)
**File**: `src/features/conservation/hooks/useMaintenanceTasks.ts`
**Problema**: Dopo click "Completa", la manutenzione rimane nella lista invece di sparire e mostrare la prossima
**Causa**: Query cache non invalidata correttamente dopo mutation

**Acceptance Criteria**:
- [ ] Dopo completamento, manutenzione scompare dalla lista
- [ ] Prossima manutenzione dello stesso tipo appare
- [ ] Statistiche si aggiornano
- [ ] Nessun refresh manuale necessario

### TASK-A2: Fix Visualizzazione Assegnazione Completa
**Agente**: AGENTE 2 (Agent-Hooks-Fix)
**File**: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`
**Problema**: Mostra solo "Assegnato a: responsabile" invece di ruolo+categoria+reparto+dipendente
**Causa**: I campi `assigned_to_role`, `assigned_to_category`, `assigned_user` non vengono popolati dalla query DB

**Acceptance Criteria**:
- [ ] Visualizza ruolo assegnato (es. "Responsabile")
- [ ] Visualizza categoria se presente (es. "Cucina")
- [ ] Visualizza reparto del punto
- [ ] Visualizza nome dipendente se assegnato specificamente

---

## TASK MEDIE (Miglioramenti UX)

### TASK-M1: Temperatura Target con Valore Default
**Agente**: AGENTE 1 (Agent-UI-Fix)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Campo temperatura vuoto invece di mostrare valore consigliato per tipo
**Soluzione**: Impostare default quando tipo cambia (fridge=4°C, freezer=-18°C, blast=-30°C, ambient=20°C)

**Acceptance Criteria**:
- [ ] Selezione "Frigorifero" → temperatura default 4°C
- [ ] Selezione "Congelatore" → temperatura default -18°C
- [ ] Selezione "Abbattitore" → temperatura default -30°C
- [ ] Selezione "Ambiente" → temperatura default 20°C
- [ ] Utente può modificare il valore

### TASK-M2: Giorni Default Frequenza Giornaliera
**Agente**: AGENTE 3 (Agent-Feature-Dev)
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Tutti i giorni Lun-Dom selezionati invece dei soli giorni apertura da onboarding
**Soluzione**: Caricare `open_weekdays` da `company_calendar_settings` e usarli come default

**Acceptance Criteria**:
- [ ] Carica giorni apertura da calendar settings
- [ ] Default solo giorni apertura (non tutti i 7)
- [ ] Fallback a tutti i giorni se settings non configurati

### TASK-M3: Modifica Lettura Temperatura
**Agente**: AGENTE 3 (Agent-Feature-Dev)
**File**: `src/features/conservation/ConservationPage.tsx`
**Problema**: Click "Modifica" mostra alert "Funzionalità in arrivo" invece di modal
**Soluzione**: Implementare modal modifica o riutilizzare AddTemperatureModal in modalità edit

**Acceptance Criteria**:
- [ ] Click "Modifica" apre modal con dati lettura pre-compilati
- [ ] Utente può modificare temperatura, metodo, note
- [ ] Salvataggio aggiorna lettura esistente
- [ ] Lista si aggiorna dopo modifica

---

## TASK BASSE (Nice-to-have)

### TASK-B1: MiniCalendar Annuale per Sbrinamento
**File**: `src/features/conservation/components/AddPointModal.tsx`
**Problema**: Frequenza annuale mostra lista 1-365 invece di mini calendario
**Soluzione**: Usare MiniCalendar con mode="year" per selezione giorno anno

### TASK-B2: Paginazione Letture Temperature
**File**: `src/features/conservation/ConservationPage.tsx`
**Problema**: Con migliaia di letture, performance degrada
**Soluzione**: Implementare paginazione con limit/offset o infinite scroll

---

## ORDINE ESECUZIONE CONSIGLIATO

1. **TASK-C1** (Select Ruolo) - Blocca creazione punti
2. **TASK-A1** (Manutenzione completata) - Confonde utenti
3. **TASK-A2** (Assegnazione) - Info mancante importante
4. **TASK-M1** (Temperatura default) - UX miglioramento
5. **TASK-M2** (Giorni default) - UX miglioramento
6. **TASK-M3** (Modifica lettura) - Feature incompleta

---

## STIMA EFFORT

| Task | Agente | Complessità | File Coinvolti |
|------|--------|-------------|----------------|
| TASK-C1 | AGENTE 1 | Media | AddPointModal.tsx, Select.tsx |
| TASK-M1 | AGENTE 1 | Bassa | AddPointModal.tsx |
| TASK-A1 | AGENTE 2 | Bassa | useMaintenanceTasks.ts |
| TASK-A2 | AGENTE 2 | Bassa | useMaintenanceTasks.ts (query) |
| TASK-M2 | AGENTE 3 | Media | AddPointModal.tsx, useCalendarSettings.ts |
| TASK-M3 | AGENTE 3 | Media | ConservationPage.tsx, AddTemperatureModal.tsx |

---

## DIPENDENZE TRA AGENTI

```
AGENTE 1 (C1) ────┐
                  ├──► AGENTE 3 (M2) modifica AddPointModal.tsx
AGENTE 1 (M1) ────┘

AGENTE 2 (A1, A2) ────► Indipendente (file diversi)

AGENTE 3 (M3) ────► Indipendente (file diversi)
```

**NOTA**: AGENTE 1 e AGENTE 3 modificano entrambi `AddPointModal.tsx`.
Eseguire AGENTE 1 PRIMA di AGENTE 3 per evitare conflitti.

---

**Totale Task**: 6 principali
**Agenti Coinvolti**: 3
**Priorità Critica**: 1 (Agente 1)
**Priorità Alta**: 2 (Agente 2)
**Priorità Media**: 3 (Agente 1 + Agente 3)

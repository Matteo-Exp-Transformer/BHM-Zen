# Report Lavoro – 4 Febbraio 2026

**Data**: 04-02-2026  
**Ambito**: Conservation – Manutenzioni programmate e check-up card  
**Stato**: ✅ Completato

---

## 1. Obiettivi

1. **Manutenzioni programmate**: mostrare per tutte le 4 tipologie (inclusi Controllo Scadenze e Sbrinamento) la “prossima per data” e il link “Mostra altre X manutenzioni [tipo]”.
2. **Conteggio manutenzioni**: mostrare il numero di **tipologie** configurate (max 4), non il numero totale di eventi/task.
3. **Rilevamento temperatura vs task**: dopo aver rilevato una temperatura per un punto, non mostrare più il task “Rilevamento Temperature” come arretrato o “di oggi da completare” su quella card.

---

## 2. Implementazione

### 2.1 ScheduledMaintenanceCard – Conteggio e ordine tipologie

**File**: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`

- **Conteggio per tipologia**  
  Sostituito `point.maintenances.length` con:
  `new Set(point.maintenances.map(m => m.type)).size`  
  In etichetta si mostra quindi “X manutenzioni” con X = numero di tipologie (1–4), non il numero di task.

- **Ordine fisso delle 4 tipologie**  
  Introdotto array:
  `MAINTENANCE_TYPE_ORDER = ['temperature', 'sanitization', 'defrosting', 'expiry_check']`  
  Il dettaglio manutenzioni viene renderizzato in questo ordine, così **Controllo Scadenze** e **Sbrinamento** compaiono sempre e con lo stesso criterio delle altre.

- **“Mostra altre” per ogni tipo**  
  La logica “prima manutenzione visibile + link Mostra altre X manutenzioni [tipo]” vale per **tutte** le tipologie (Rilevamento Temperature, Sanificazione, Sbrinamento, Controllo Scadenze). Per ogni tipo la prima riga è la prossima per data (next_due più vicino).

### 2.2 pointCheckup – Lettura temperatura = soddisfacimento task “Rilevamento Temperature”

**File**: `src/features/conservation/utils/pointCheckup.ts`

- **Helper**  
  `isTemperatureTaskSatisfiedByReading(task)`: per task di tipo `temperature`, restituisce `true` se esiste `point.last_temperature_reading` e la data di `recorded_at` è **uguale o successiva** al giorno di `task.next_due`.

- **Task “di oggi” (todayPending)**  
  Se il task è `temperature` e c’è una lettura **oggi** per quel punto, il task non viene incluso in “da completare oggi”.

- **Task arretrati (overdueTasks)**  
  Se il task è `temperature` e `isTemperatureTaskSatisfiedByReading(task)` è `true`, il task non viene incluso negli arretrati.

Risultato: dopo “Rileva Temperatura” per un punto, il badge e i box della card di quel punto non mostrano più “Controllo temperatura” come arretrato o da completare oggi (per la scadenza coperta dalla lettura).

### 2.3 ScheduledMaintenanceCard – Pallino verde quando nessuna da completare oggi

**File**: `src/features/dashboard/components/ScheduledMaintenanceCard.tsx`

- **Logica pallino (stato giornaliero)**  
  Il pallino è ora allineato alle **scadenze giornaliere**:
  - **Rosso**: almeno una manutenzione in ritardo (scadenza prima di oggi).
  - **Giallo**: almeno una manutenzione da completare **oggi** (scadenza nella giornata corrente).
  - **Verde**: nessuna in ritardo e nessuna da completare oggi (tutto allineato; le manutenzioni di domani o oltre non fanno andare in giallo).

Prima il giallo era “in scadenza questa settimana”; ora il giallo è solo “da completare oggi”, così quando non c’è nulla da fare oggi il pallino è verde.

### 2.4 Completamento automatico task “Rilevamento Temperature” su lettura

**File**: `src/features/conservation/hooks/useTemperatureReadings.ts`

- **Trigger**: salvataggio di una lettura temperatura tramite il pulsante “Rileva Temperatura” (stesso flusso di `createReading`).
- **Azione**: per il `conservation_point_id` della lettura si cercano le task di tipo `temperature` con `next_due <= recorded_at` e stato non completato/skipped; per ognuna si inserisce un record in `maintenance_completions` (come “Completa Manutenzione” nel modal Attività).
- **Effetto**: il trigger DB su `maintenance_completions` aggiorna `next_due`, `last_completed` e `status` sulla task; la task risulta completata in Conservazione e in Attività/calendario.
- **Invalidazioni**: dopo l’insert delle completion si invalidano `maintenance-tasks`, `maintenance-tasks-critical`, `calendar-events`, `macro-category-events`, `maintenance-completions` e si invia `calendar-refresh`.

Piano dettagliato: `PIANO_completamento_temperatura_su_lettura.md`.

### 2.5 Box "Ultima lettura" – colore solo da conformità temperatura (04-02-2026)

**File**: `src/features/conservation/components/ConservationPointCard.tsx`

- **Problema**: il box "Ultima lettura" usava `statusColors` (stato complessivo: normal/warning/critical), quindi poteva essere giallo per manutenzioni in attenzione anche con temperatura conforme.
- **Comportamento richiesto**: il box deve essere **verde** se la temperatura è conforme (entro setpoint ±1°C), **rosso (critico)** se fuori range; le manutenzioni non devono influire sul colore di questo box.
- **Implementazione**:
  - Aggiunta variabile `temperatureBadgeColors = checkup.temperature.inRange ? CONSERVATION_COLORS.normal : CONSERVATION_COLORS.critical`.
  - Il contenitore e il testo del valore in °C del box "Ultima lettura" usano `temperatureBadgeColors` invece di `statusColors`.

---

## 3. File modificati

| File | Modifiche |
|------|-----------|
| `src/features/dashboard/components/ScheduledMaintenanceCard.tsx` | `MAINTENANCE_TYPE_ORDER`, conteggio per tipologia, iterazione in ordine fisso; letture temperatura + filtro task temperatura soddisfatti; `calculateWeeklyStatus` a logica giornaliera (verde = nulla da completare oggi) |
| `src/features/conservation/utils/pointCheckup.ts` | `isTemperatureTaskSatisfiedByReading`, filtri su `todayPending` e `overdueTasks` per tipo `temperature` |
| `src/features/conservation/hooks/useTemperatureReadings.ts` | Dopo `createReading`: ricerca task temperatura per punto con `next_due <= recorded_at`, insert in `maintenance_completions`, invalidazioni e `calendar-refresh` |
| `src/features/conservation/components/ConservationPointCard.tsx` | Box "Ultima lettura": colore da sola conformità temperatura (`temperatureBadgeColors` da `checkup.temperature.inRange`), non da stato complessivo |

---

## 4. Riepilogo funzionalità

- **Manutenzioni programmate**: conteggio = numero di tipologie (max 4); ordine sempre: Rilevamento Temperature → Sanificazione → Sbrinamento → Controllo Scadenze; “Mostra altre” disponibile per tutti i tipi quando ci sono più task.
- **Pallino stato**: verde se non c’è nulla da completare oggi (allineato alle scadenze giornaliere); giallo solo se c’è almeno una manutenzione da completare oggi; rosso se c’è almeno una in ritardo.
- **Card Conservation**: rilevamento temperatura considerato come soddisfacimento del task “Rilevamento Temperature” per la data di scadenza (o dopo), quindi niente “controllo temperatura arretrato” quando è stata registrata una lettura in tempo.
- **Completamento automatico**: salvare una lettura con “Rileva Temperatura” completa automaticamente le task “Rilevamento Temperature” per quel punto (insert in `maintenance_completions`), visibile in Conservazione e in Attività/calendario.
- **Box "Ultima lettura"**: colore (verde/rosso) basato solo sulla conformità della temperatura (setpoint ±1°C); non più influenzato da manutenzioni in attenzione (giallo rimosso per questo box).

---

**Fine report**

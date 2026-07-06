# 📋 GenericTaskForm - Definizione Completa

> **Componente**: `src/features/calendar/components/GenericTaskForm.tsx`  
> **Scopo**: Form per creare attività generiche (mansioni ricorrenti) nel calendario  
> **Data Definizione**: 2026-01-07

---

## 🎯 SCOPO E UTILITÀ

### Scopo Business
Le "Attività Generiche" sono **template che generano eventi ricorrenti** nel calendario in base alla frequenza configurata. Una volta creata, l'attività genera automaticamente eventi nel calendario per tutto l'anno lavorativo (configurato durante onboarding con giorni di apertura e chiusura).

### Casi d'Uso Principali
1. **Pulizie ricorrenti**: "Pulizia cucina" settimanale ogni lunedì
2. **Controlli periodici**: "Controllo fornelli" mensile il giorno 15
3. **Manutenzioni**: "Manutenzione frigorifero" annuale
4. **Attività giornaliere**: "Controllo temperatura" ogni giorno lavorativo
5. **Attività personalizzate**: "Riunione team" ogni martedì e giovedì

### Integrazione con Calendario
- Gli eventi vengono generati **dinamicamente** quando vengono visualizzati nel calendario (non salvati come record separati)
- Se un'attività ha frequenza "settimanale" con giorni custom (es. lunedì e mercoledì), vengono generati **2 eventi a settimana**
- Le mansioni si ripetono per tutto l'anno lavorativo (configurazione calendario eseguita durante onboarding)

---

## 📝 COMPORTAMENTO E LOGICA

### 1. Validazione e Campi Obbligatori

#### Campi Obbligatori
- **Nome attività** (`name`): Obbligatorio, non può essere vuoto
- **Frequenza** (`frequenza`): Obbligatorio, deve essere selezionata
- **Ruolo** (`assegnatoARuolo`): Obbligatorio, deve essere selezionato
- **Reparto** (`departmentId`): Obbligatorio, può essere "all" (tutti i reparti) o un reparto specifico

#### Validazioni Specifiche

**Q4.1 - Time Management:**
- Se `completionType = 'timeRange'` → `timeRange` deve essere presente con `startTime` e `endTime`
- Se `completionType = 'startTime'` → `completionStartTime` deve essere presente
- Se `completionType = 'endTime'` → `completionEndTime` deve essere presente

**Q4.2 - Dipendente Specifico:**
- Se selezionato, deve esistere in `filteredStaffByCategory` (validato nella lista filtrata per coerenza con i filtri)

**Q4.3 - Note:**
- Limite massimo: **2000 caratteri** (D)
- Mostra contatore caratteri: `{note.length}/2000`

**Q4.4 - Giorni:**
- **Custom**: Almeno un giorno deve essere selezionato
- **Settimanale/Giornaliera**: Almeno un giorno deve essere selezionato (Q4.4.1 - A)
- **Mensile**: Giorno del mese deve essere tra 1-31 (Q4.4.2)

**Q4.5 - Reparto:**
- "all" è valido (significa tutti i reparti)
- Se reparto specifico, deve esistere in `departmentOptions` (solo reparti attivi)

**Q6 - Nomi Duplicati:**
- **Blocca** se stesso nome + stesso reparto + stessa frequenza (C)
- Mostra errore: "Esiste già un'attività con questo nome per questo reparto e frequenza"

### 2. Filtri a Cascata (Ruolo → Categoria → Dipendente)

**Q3.1 - Reset Automatico:**
Quando si cambia il **Ruolo**:
- ✅ Categoria viene resettata a "all"
- ✅ Dipendente specifico viene resettato
- ✅ Reparto **NON** viene resettato (può rimanere lo stesso)

Quando si cambia la **Categoria**:
- ✅ Dipendente specifico viene resettato

**Q11 - Selezione a Cascata:**
- I dipendenti mostrati sono sempre filtrati per ruolo → categoria → reparto
- Non è possibile selezionare un dipendente che non appartiene ai filtri selezionati (selezione a cascata)

### 3. Gestione Orario Attività (Time Management)

**Q2.1 - Rimuovere timeRange quando completionType = 'none':**
- Quando l'utente seleziona "Orario di Apertura" (completionType: 'none'), `timeRange` viene **rimosso automaticamente**

**Q2.2 - Rimuovere timeRange quando si passa a 'startTime'/'endTime':**
- Quando si passa da "Fascia Oraria" a "Orario di Inizio" o "Orario Fine", `timeRange` viene **rimosso automaticamente**

**Q2.3 - Orari Notturni:**
- **Permessi**: Gli orari notturni sono supportati (es. 22:00-06:00)
- La funzione `isOvernightTime` calcola se `endTime <= startTime`
- Se notturno, mostra badge: "🌙 Orario notturno (fine giorno dopo)"

**Input Orario Unico (Q3):**
- Usa componente `TimeRangeInput` invece di due `TimeInput` separati
- Permette di digitare direttamente: "09:00-17:00" o selezionare con click
- Un solo click nella casella per impostare orario

### 4. Selezione Giorni e Frequenze

**Q3.2 - Giorni per Settimanale/Giornaliera:**
- Per frequenza "settimanale" o "giornaliera", è **obbligatorio** selezionare almeno un giorno della settimana
- Mostra checkbox per tutti i 7 giorni
- Permette selezione di qualsiasi combinazione, anche tutti i 7 giorni (Q13)

**Q4.4.2 - Mini Calendario per Mensile:**
- Per frequenza "mensile", mostra **mini calendario** con tutti i giorni del mese
- Il calendario mostra:
  - Giorni aperti (bianchi, cliccabili) secondo configurazione calendario
  - Giorni chiusi (grigi, non cliccabili) secondo configurazione calendario
  - Giorno selezionato evidenziato in blu
- Usa `calendarSettings` per mostrare:
  - `open_weekdays`: Giorni della settimana aperti
  - `closure_dates`: Date di chiusura
- Validazione: Giorno deve essere tra 1-31
- **Utente deve poter confermare inserimento attività anche se azienda è chiusa** (warning informativo ma permette submit)

**Q13 - Frequenza Custom - Tutti i 7 giorni:**
- **Permettere** selezione di tutti i 7 giorni (non suggerire "Giornaliera")
- L'utente può scegliere qualsiasi combinazione di giorni

### 5. Reset Form dopo Submit

**Q5 - Reset Completo:**
- Dopo ogni creazione, **tutti i campi tornano vuoti** (A)
- Reset include: nome, frequenza, ruolo, categoria, dipendente, reparto, note, giorniCustom, giornoMese

### 6. Conflitti e Warning

**Q7 - Stesso Dipendente con Frequenza Diversa:**
- **Warning** (non blocca): "Questo dipendente ha già questa attività assegnata con una frequenza diversa" (B)
- Mostra toast warning ma permette submit
- Specifica che ha attività già assegnata ma con frequenza diversa

**Q8 - Conflitti Temporali:**
- **Permettere** attività parallele (stesso dipendente + stessa fascia oraria) (A)
- Non mostra warning o errore

**Q9 - Dipendente Rimosso/Disattivato:**
- **Warning all'eliminazione** dipendente (C):
  - Se attività assegnata solo a lui come dipendente specifico → "Una mansione andrà riassegnata"
  - Se attività assegnata a reparto/ruolo/categoria a cui apparteneva → "La mansione rimarrà ma senza dipendenti assegnati (solo se nessun altro dipendente soddisfa i criteri)"

**Q10 - Reparto Disattivato:**
- **Warning** che permette riassegnazione di reparto alla mansione rimasta senza reparto (C)

**Q12 - Reparto Inattivo nella Selezione:**
- **Non deve essere visibile** un reparto disattivato nella lista
- `departmentOptions` viene già filtrato per mostrare solo `is_active = true`

---

## 🔧 GESTIONE CONFLITTI

### Conflitti di Nome (Q6)
- **Comportamento**: Blocca submit se stesso nome + stesso reparto + stessa frequenza
- **Errore**: "Esiste già un'attività con questo nome per questo reparto e frequenza"
- **Validazione**: Confronta `name.toLowerCase().trim()`, `departmentId`, e `frequency` mappata

### Conflitti di Assegnazione (Q7)
- **Comportamento**: Warning (non blocca) se stesso dipendente + stesso nome + frequenza diversa
- **Warning**: "Questo dipendente ha già questa attività assegnata con una frequenza diversa"
- **Toast**: Mostra toast warning ma permette submit

### Conflitti Temporali (Q8)
- **Comportamento**: Permettere (attività parallele sono normali)
- **Nessun warning**: Stesso dipendente + stessa fascia oraria è permesso

### Conflitti di Dipendente (Q9)
- **Comportamento**: Warning all'eliminazione dipendente
- **Caso 1**: Attività assegnata solo a lui → "Una mansione andrà riassegnata"
- **Caso 2**: Attività assegnata a reparto/ruolo/categoria → "La mansione rimarrà ma senza dipendenti assegnati (solo se nessun altro dipendente soddisfa i criteri)"

### Conflitti di Reparto (Q10, Q12)
- **Q10**: Warning quando reparto disattivato → permette riassegnazione
- **Q12**: Reparti disattivati non sono visibili nella selezione (solo `is_active = true`)

---

## 📊 STRUTTURA DATI

### GenericTaskFormData
```typescript
interface GenericTaskFormData {
  name: string
  frequenza: MaintenanceFrequency // 'annuale' | 'mensile' | 'settimanale' | 'giornaliera' | 'custom'
  assegnatoARuolo: StaffRole // 'admin' | 'responsabile' | 'dipendente' | 'collaboratore' | 'all'
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[] // Per custom, settimanale, giornaliera
  giornoMese?: number // Per frequenza mensile (1-31)
  departmentId: string // "all" o ID reparto specifico
  note?: string // Max 2000 caratteri
  
  timeManagement?: {
    timeRange?: {
      startTime: string // HH:MM
      endTime: string   // HH:MM
      isOvernight: boolean
    }
    completionType?: 'timeRange' | 'startTime' | 'endTime' | 'none'
    completionStartTime?: string // HH:MM
    completionEndTime?: string   // HH:MM
  }
}
```

### Props
```typescript
interface GenericTaskFormProps {
  staffOptions: Array<{ id: string; label: string; role: string; categories: string[] }>
  departmentOptions?: Array<{ id: string; name: string }> // Solo reparti attivi
  existingTasks?: GenericTask[] // Per validazione nomi duplicati
  calendarSettings?: CompanyCalendarSettings | null // Per mini calendario mensile
  onSubmit: (data: GenericTaskFormData) => void
  onCancel: () => void
  isLoading?: boolean
}
```

---

## 🎨 COMPONENTI UI UTILIZZATI

### Componenti Custom
- **`TimeRangeInput`**: Input unico per fascia oraria (formato: "09:00-17:00")
  - Permette digitazione diretta o selezione con click
  - Bottoni per incrementare/decrementare ore
  
- **`MonthDayPicker`**: Mini calendario per selezione giorno mese
  - Mostra tutti i giorni del mese
  - Evidenzia giorni aperti/chiusi secondo configurazione calendario
  - Permette selezione anche di giorni chiusi (utente deve confermare)

### Componenti Standard
- `Input`, `Select`, `Textarea`, `Button`, `Label`
- `TimeInput` (per orari singoli: startTime, endTime)

---

## 🔄 FLUSSO DI FUNZIONAMENTO

### 1. Inizializzazione
- Form parte con valori di default:
  - `frequenza: 'settimanale'`
  - `assegnatoARuolo: 'dipendente'`
  - `assegnatoACategoria: 'all'`
  - Altri campi vuoti

### 2. Selezione Frequenza
- **Settimanale/Giornaliera**: Mostra selezione giorni settimana (obbligatorio)
- **Mensile**: Mostra mini calendario per selezione giorno mese (obbligatorio)
- **Custom**: Mostra selezione giorni settimana (obbligatorio)
- **Annuale**: Nessuna selezione giorni

### 3. Selezione Ruolo → Categoria → Dipendente
- **Ruolo**: Filtra categorie disponibili
- **Categoria**: Filtra dipendenti disponibili
- **Dipendente**: Opzionale, mostra solo dipendenti filtrati

### 4. Selezione Reparto
- Mostra solo reparti attivi (`is_active = true`)
- Opzione "Tutti" disponibile (diventa `null` nel database)

### 5. Time Management (Opzionale)
- Sezione collassabile
- Opzioni:
  - **Orario di Apertura** (default): Usa orari azienda
  - **Fascia Oraria**: Input unico "09:00-17:00"
  - **Orario di Inizio**: Da quando può essere completata
  - **Orario Fine**: Entro quando può essere completata

### 6. Validazione e Submit
- Validazione completa di tutti i campi
- Controllo nomi duplicati (stesso nome + reparto + frequenza)
- Warning per stesso dipendente con frequenza diversa
- Se valido → `onSubmit(formData)`
- Reset completo form dopo submit

---

## 🗄️ INTEGRAZIONE DATABASE

### Mapping Frequenza IT → EN
```typescript
'giornaliera' → 'daily'
'settimanale' → 'weekly'
'mensile' → 'monthly'
'annuale' → 'annually'
'custom' → 'custom'
```

### Mapping Reparto
- `departmentId = 'all'` → `department_id = null` (visibile a tutti i reparti)
- `departmentId = '<id>'` → `department_id = '<id>'` (reparto specifico)

### Mapping Ruolo
- `assegnatoARuolo = 'all'` → `assigned_to_role = 'all'` (tutti i ruoli)
- Altri valori mappati direttamente

### Time Management
- Struttura salvata come JSON in campo `time_management`
- `isOvernight` calcolato automaticamente se `endTime <= startTime`

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### ✅ Completato
- [x] Validazione completa (Q4.1-Q4.5)
- [x] Reset form completo dopo submit (Q5)
- [x] Blocco nomi duplicati (Q6)
- [x] Warning stesso dipendente frequenza diversa (Q7)
- [x] Permettere conflitti temporali (Q8)
- [x] Gestione dipendente rimosso (Q9)
- [x] Gestione reparto disattivato (Q10, Q12)
- [x] Selezione a cascata (Q11)
- [x] Permettere tutti i 7 giorni custom (Q13)
- [x] Rimozione timeRange quando completionType = 'none' (Q2.1)
- [x] Rimozione timeRange quando si passa a startTime/endTime (Q2.2)
- [x] Supporto orari notturni (Q2.3)
- [x] Input orario unico (Q3)
- [x] Reset categoria/dipendente quando cambia ruolo (Q3.1)
- [x] Selezione giorni per settimanale/giornaliera (Q3.2)
- [x] Mini calendario per mensile (Q4.4.2)

### 🔄 Da Implementare (Future)
- [ ] Warning all'eliminazione dipendente (Q9) - da implementare in componente gestione dipendenti
- [ ] Warning quando reparto disattivato (Q10) - da implementare in componente gestione reparti

---

## 🧪 TESTING

### Test da Eseguire
1. **Validazione Nome Duplicato**: Crea attività con stesso nome + reparto + frequenza → deve bloccare
2. **Warning Dipendente**: Assegna stessa attività a stesso dipendente con frequenza diversa → deve mostrare warning
3. **Reset Form**: Dopo submit, tutti i campi devono essere vuoti
4. **Selezione Giorni**: Verifica che settimanale/giornaliera richieda almeno un giorno
5. **Mini Calendario**: Verifica che mensile mostri giorni aperti/chiusi correttamente
6. **Time Management**: Verifica rimozione timeRange quando si cambia completionType
7. **Orari Notturni**: Verifica che 22:00-06:00 sia riconosciuto come notturno
8. **Input Orario Unico**: Verifica che si possa digitare "09:00-17:00" direttamente

---

## 📚 RIFERIMENTI

- **File Componente**: `src/features/calendar/components/GenericTaskForm.tsx`
- **Hook Utilizzato**: `src/features/calendar/hooks/useGenericTasks.ts`
- **Componenti UI**: 
  - `src/components/ui/TimeRangeInput.tsx`
  - `src/components/ui/MonthDayPicker.tsx`
- **Utilizzo**: `src/features/calendar/CalendarPage.tsx`
- **Documentazione Time Management**: `docs/TIME_MANAGEMENT_IMPLEMENTATION.md`

---

**Ultimo Aggiornamento**: 2026-01-07  
**Versione**: 1.0.0


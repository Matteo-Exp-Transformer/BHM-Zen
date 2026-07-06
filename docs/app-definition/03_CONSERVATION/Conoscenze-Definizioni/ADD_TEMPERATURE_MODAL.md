> **Stato Fase 3** (2026-07-06): `verificato-rotto` · Fonte: [`FASE3_REPORT_A2`](../../META/FASE3_REPORT_A2_CONSERVATION.md) §5.5  
> **Motivo**: claim «Campi Salvati» + migration 015 OK — insert fallisce su DB live (BUG-005; colonne `method`/`notes`/`photo_evidence`/`recorded_by` assenti).  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# ADD_TEMPERATURE_MODAL - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16
**Ultima Modifica**: 2026-02-05
**Versione**: 2.2.0
**File Componente**: `src/features/conservation/components/AddTemperatureModal.tsx`
**Tipo**: Modale / Form

**Nuove Features (v2.2.0 - 05-02-2026)**:
- ✅ **Tolleranza Unica ±1°C**: Setpoint ±1°C per tutti i tipi (dentro = conforme, fuori = critico). Fonte: `correctiveActions.ts` TOLERANCE_C = 1.0
- ✅ **Campi Salvati**: `method`, `notes`, `photo_evidence`, `recorded_by` salvati in `temperature_readings` (migration 015)
- ✅ **Chiusura modal**: Comportamento atteso: chiusura con X, Annulla, overlay e dopo salvataggio riuscito. Il modal resta aperto durante loading e in caso di errore (utente può riprovare).

**Features (v2.1.0 - 04-02-2026)**:
- ✅ **Chiusura modal**: Pulsante X, pulsante "Annulla" e click sull'area scura (overlay) chiamano `onClose`. Il click sul contenuto (pannello bianco) non chiude il modal (`stopPropagation`).
- ✅ **Accessibilità**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="temperature-modal-title"` sul contenitore; titolo con `id="temperature-modal-title"`.

**Features (v2.0.0)**:
- ✅ **`recorded_by` salvato**: Il campo user.id viene salvato in DB per ogni lettura
- ✅ **Metodo registrazione salvato**: 'manual' | 'digital_thermometer' | 'automatic_sensor'
- ✅ **Nome utente visibile**: Letture mostrano chi ha registrato (risolto in lista)

---

## 🎯 SCOPO

### Scopo Business
Il modal `AddTemperatureModal` permette all'utente di registrare una nuova lettura di temperatura per un punto di conservazione. Rappresenta il form principale per registrare temperature rilevate durante i controlli HACCP.

Questo modal risolve il bisogno di:
- **Registrare** temperature rilevate per un punto di conservazione specifico
- **Visualizzare** informazioni punto (temperatura target, range tolleranza, tipo)
- **Verificare** in anteprima lo stato calcolato (Conforme/Attenzione/Critico) prima di salvare
- **Specificare** metodo di rilevazione (manuale, termometro digitale, sensore automatico)
- **Aggiungere** note aggiuntive e foto evidenza per audit HACCP
- **Garantire** che tutti i campi obbligatori siano compilati correttamente
- **Salvare chi registra** (v2.0.0): `recorded_by` = user.id viene salvato automaticamente

### Scopo Tecnico
Il modal è un componente React che:

- **Gestisce** un form completo per registrazione temperatura
- **Calcola** automaticamente lo stato (compliant/warning/critical) in base a temperatura vs setpoint e tolleranza
- **Mostra** in anteprima lo stato calcolato prima del salvataggio
- **Valida** input utente lato client prima del salvataggio
- **Resetta** il form quando viene aperto con un nuovo punto
- **Salva** `recorded_by` (user.id) e `method` (metodo registrazione) nel DB (v2.0.0)

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
Il modal viene mostrato quando:

- L'utente seleziona un punto di conservazione dal dropdown "Registra temperatura..." nella sezione "Letture Temperature"
- L'utente ha i permessi per registrare temperature (tutti i membri azienda possono registrare)

**Condizioni di accesso:**
- L'utente deve essere autenticato
- L'utente deve avere un `company_id` valido (gestito tramite `useAuth()`)
- Deve essere fornito un `conservationPoint` valido (punto di conservazione selezionato)

**Ruoli utente:**
- **Tutti i membri** possono registrare temperature (RLS policy)
- Non sono necessari permessi specifici per la registrazione

### Casi d'Uso Principali

1. **Registrazione lettura conforme**
   - **Scenario**: Un dipendente ha controllato la temperatura del "Frigo 2" (setpoint 3°C) e ha rilevato 3.5°C (dentro range ±1°C)
   - **Azione**: Seleziona "Frigo 2" dal dropdown, inserisce 3.5°C, sistema mostra "Stato: Conforme", seleziona metodo "Termometro Digitale", salva
   - **Risultato**: Lettura registrata con stato "Conforme", visualizzata nella lista letture

2. **Registrazione lettura critica con foto**
   - **Scenario**: Un responsabile HACCP ha rilevato temperatura critica (5°C) su un frigorifero (setpoint 3°C, differenza 2°C > tolleranza ±1°C)
   - **Azione**: Seleziona punto, inserisce 5°C, sistema mostra "Stato: Critico" con messaggio "Temperatura fuori range - Azione richiesta", seleziona metodo, aggiunge note "Frigo spento durante la notte", inserisce URL foto del termometro, salva
   - **Risultato**: Lettura registrata con stato "Critico", visualizzata nella lista con badge rosso, alert HACCP visibile

3. **Registrazione rapida senza note**
   - **Scenario**: Un dipendente deve registrare rapidamente una temperatura durante controllo routine
   - **Azione**: Seleziona punto, inserisce temperatura, lascia note e foto vuote, salva rapidamente
   - **Risultato**: Lettura registrata con solo campi obbligatori (temperatura, metodo), note e foto opzionali

4. **Verifica anteprima stato prima di salvare**
   - **Scenario**: Un dipendente inserisce una temperatura e vuole verificare lo stato prima di salvare
   - **Azione**: Inserisce temperatura, vede in tempo reale lo stato calcolato (Conforme/Attenzione/Critico) nella preview, decide se salvare o correggere
   - **Risultato**: Utente può correggere temperatura se lo stato non è conforme, prevenendo registrazioni errate

### Flusso Utente

**Flusso registrazione nuova temperatura:**
1. Utente naviga alla pagina Conservazione
2. Utente vede la sezione "Letture Temperature" con dropdown "Registra temperatura..." nell'header
3. Utente clicca sul dropdown e seleziona un punto di conservazione (es. "Frigo 2")
4. Modal `AddTemperatureModal` si apre con il punto selezionato
5. Utente vede informazioni punto in blu:
   - Temperatura target (es. "3°C")
   - Range tolleranza (es. "1°C - 5°C")
   - Tipo punto (es. "Frigorifero")
6. Form viene pre-compilato con temperatura target come default
7. Utente modifica temperatura rilevata (es. inserisce "6.0°C")
8. Sistema calcola automaticamente lo stato in tempo reale:
   - Se temperatura dentro range (±2°C) → "Conforme" (verde)
   - Se temperatura fuori range ma non critica (±2-4°C) → "Attenzione" (giallo)
   - Se temperatura fuori range critico (>±4°C) → "Critico" (rosso)
9. Utente vede preview stato con icona e messaggio:
   - Se conforme: "Stato: Conforme" (verde)
   - Se attenzione: "Stato: Attenzione" + "Temperatura fuori dal range ottimale" (giallo)
   - Se critico: "Stato: Critico" + "Temperatura in range critico - Azione richiesta" (rosso)
10. Utente seleziona metodo di rilevazione (radio button):
    - ✍️ Manuale
    - 🌡️ Termometro Digitale (default)
    - 📡 Sensore Automatico
11. Utente può aggiungere note aggiuntive (opzionale, textarea):
    - Es. "Frigo spento durante la notte", "Termometro controllato e calibrato", ecc.
12. Utente può inserire URL foto evidenza (opzionale, input URL):
    - Es. URL foto del termometro con temperatura visibile
    - **NOTA**: Attualmente supporta solo URL, non upload diretto file
13. Utente clicca "Registra", "Annulla", X in alto a destra, oppure sull'area scura (overlay) fuori dal pannello.
14. Se "Registra":
    - Form viene validato (temperatura obbligatoria, metodo obbligatorio)
    - Se valido, `onSave()` viene chiamato con dati lettura (il parent avvia la mutation)
    - **Chiusura solo al successo**: il parent chiude il modal nel callback `onSuccess` della mutation; durante il salvataggio il modal resta aperto (stato loading); in caso di errore il modal resta aperto e l'utente può riprovare
    - Lista letture si aggiorna dopo successo e il modal si chiude
15. Se "Annulla", X o click su overlay:
    - Viene chiamato `onClose()`; il parent esegue chiusura e azzeramento state (incluso `location.state` se presente, per evitare ri-aperture da deep link Attività)
    - Modal si chiude senza salvare; dati form vengono persi (form viene resettato alla prossima apertura)

---

## Chiusura del modal e accessibilità (v2.1.0 - 04-02-2026)

### Comportamento atteso – Chiusura

| Azione utente | Comportamento atteso |
|---------------|----------------------|
| Click su **X** (in alto a destra) | Chiama `onClose()` → parent chiude modal e azzera state. |
| Click su **Annulla** | Chiama `onClose()` → come sopra. |
| Click sull'**area scura (overlay)** fuori dal pannello | Chiama `onClose()` → come sopra. Il contenuto del modal (pannello bianco) ha `onClick={e => e.stopPropagation()}` così il click sul form non chiude il modal. |
| Click su **Registra** (salvataggio) | Il parent non chiude subito: avvia la mutation (create/update). La chiusura avviene **solo in `onSuccess`** della mutation. In caso di errore il modal resta aperto. |

### Ruolo del parent (ConservationPage)

- Il parent passa `onClose={closeTemperatureModal}`. La funzione `closeTemperatureModal`:
  - Imposta `showTemperatureModal = false`, `selectedPointForTemperature = null`, `editingReading = null`
  - Chiama `navigate(location.pathname, { replace: true, state: {} })` per azzerare `location.state` (evita che l’effetto "apertura da Attività" riapra il modal dopo la chiusura).

### Accessibilità

- Contenitore principale: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="temperature-modal-title"`.
- Titolo: `id="temperature-modal-title"` sull’elemento `h2` "Registra Temperatura".

### Bug noto

- In alcune condizioni il modal potrebbe non chiudersi (né con X, né con Annulla, né dopo salvataggio). Lavoro di fix documentato in `Lavoro/04-02-2026/REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md`.

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Modal coperto dalla bottom navigation
- **Quando si verifica**: Il modal viene aperto su mobile/tablet e la bottom navigation (z-50) copre parzialmente il contenuto del modal (anch'esso z-50)
- **Cosa succede**: I pulsanti "Annulla" e "Registra" nella parte bassa del modal sono parzialmente o completamente coperti dalla bottom nav (altezza 64px + safe-area-bottom)
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Il modal ha `z-50` e la bottom nav ha `z-50`, stesso livello di z-index
- **Esempio**: Su mobile con viewport di 880px, il modal con `max-h-[90vh]` (792px) + padding (24px) supera l'altezza disponibile, i pulsanti in basso vengono coperti dalla bottom nav.

**Soluzione proposta**: 
1. Aumentare z-index del modal a `z-[60]` o `z-[100]` per essere sopra la bottom nav
2. Aggiungere padding bottom extra (`pb-20` o `pb-24`) per evitare che il contenuto venga coperto dalla bottom nav
3. Ridurre `max-h-[90vh]` a `max-h-[85vh]` su mobile per lasciare spazio alla bottom nav
4. Usare `safe-area-inset-bottom` per gestire dispositivi con notch/home indicator

#### Conflitto 2: Campi form non salvati nel database
- **Quando si verifica**: Utente compila metodo, note, foto evidenza, ma questi campi non esistono nella tabella `temperature_readings`
- **Cosa succede**: I dati vengono raccolti nel form ma non vengono salvati (commentati come TODO nel codice)
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Solo `temperature`, `conservation_point_id`, `recorded_at` vengono salvati
- **Esempio**: Utente inserisce note "Frigo spento durante la notte" e URL foto, salva, ma questi dati vengono persi.

**Soluzione proposta**: 
1. Aggiornare schema database `temperature_readings` aggiungendo campi:
   - `method`: `'manual' | 'digital_thermometer' | 'automatic_sensor'` (enum o check constraint)
   - `notes`: `text` (nullable)
   - `photo_evidence`: `text` (nullable, URL o path file)
   - `recorded_by`: `uuid` (nullable, FK a `user_profiles`)
   - `status`: `'compliant' | 'warning' | 'critical'` (calcolato, nullable)
   - `target_temperature`: `numeric` (duplicato da conservation_point per storico)
   - `tolerance_range_min`: `numeric` (duplicato per storico)
   - `tolerance_range_max`: `numeric` (duplicato per storico)
2. Aggiornare form per salvare tutti i campi
3. Migrare dati esistenti se necessario

#### Conflitto 3: Reset form non completo
- **Quando si verifica**: Modal viene aperto dopo essere stato chiuso, il form mantiene alcuni valori precedenti
- **Cosa succede**: `method` viene resettato a stringa vuota invece di default 'digital_thermometer'
- **Come viene gestito**: **PARZIALMENTE GESTITO** - `useEffect` resetta form quando modal si apre, ma `method` è resettato a `''` invece di default
- **Esempio**: Utente apre modal, inserisce metodo "Manuale", chiude senza salvare. Apre di nuovo, metodo è vuoto invece di default "Termometro Digitale".

**Soluzione proposta**: 
1. Resettare `method` a `'digital_thermometer'` (default) invece di stringa vuota
2. Validare che `method` non sia vuoto prima di salvare (attualmente non c'è validazione)

#### Conflitto 4: Errore registrazione temperatura - Campo 'conservation_point' invece di 'conservation_point_id'
- **Quando si verifica**: Utente tenta di registrare una nuova temperatura cliccando "Registra" nel modal AddTemperatureModal
- **Cosa succede**: **PROBLEMA RILEVATO (2026-01-16)** - L'app mostra errore: `"Could not find the 'conservation_point' column of 'temperature_readings' in the schema cache"`. L'errore indica che la query Supabase sta tentando di inserire/recuperare il campo `conservation_point` che non esiste nella tabella `temperature_readings`. Il campo corretto è `conservation_point_id`.
- **Come viene gestito**: **ATTUALMENTE ERRORE** - La query usa campo errato

**Dettagli tecnici**:
- Errore completo: `{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'conservation_point' column of 'temperature_readings' in the schema cache"}`
- URL errore: `POST https://tucqgcfrlzmwyfadiodo.supabase.co/rest/v1/temperature_readings?columns=%22conservation_point_id%22%2C%22temperature%22%2C%22recorded_at%22%2C%22method%22%2C%22notes%22%2C%22photo_evidence%22%2C%22recorded_by%22%2C%22company_id%22%2C%22conservation_point%22&select=*`
- Il problema è nella query URL: include `%22conservation_point%22` (campo errato) invece di usare solo `conservation_point_id`
- File probabile: `src/features/conservation/hooks/useTemperatureReadings.ts` (mutation function)

**Soluzione proposta**:
1. Verificare hook `useTemperatureReadings.ts` nella funzione `createReading` o `createReadingMutation`
2. Rimuovere campo `conservation_point` dalla query/payload (è un campo join/virtuale, non esiste nella tabella)
3. Verificare che il payload includa solo `conservation_point_id` (campo corretto)
4. Verificare che eventuali `.select()` non includano `conservation_point` se non necessario per JOIN
5. Se serve join con conservation_points per calcoli, farlo separatamente o usare sintassi JOIN corretta

### Conflitti Multi-Utente

**Registrazione simultanea:**
- **Comportamento attuale**: Non c'è conflitto - ogni lettura è indipendente con timestamp
- **Comportamento corretto**: Le letture vengono create con timestamp, quindi l'ordine è determinato dalla data/ora. L'ultima lettura diventa la `last_temperature_reading` del punto automaticamente.

### Conflitti di Sincronizzazione

**Comportamento offline:**
- **Situazione**: L'app non gestisce attualmente lo stato offline per le letture temperatura
- **Cosa succede**: Se l'utente è offline, le chiamate API falliscono e viene mostrato un errore generico
- **Rischio**: Perdita di dati se l'utente ha registrato temperature senza connessione

**Soluzione proposta**: Implementare sistema di sincronizzazione offline con:
- Queue locale per letture pendenti
- Sync automatico quando la connessione viene ripristinata
- Indicatore visivo dello stato di sincronizzazione

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
Il modal viene generato automaticamente quando:

- L'utente seleziona un punto di conservazione dal dropdown "Registra temperatura..."
- La prop `isOpen` diventa `true`
- Il componente viene renderizzato condizionalmente (`if (!isOpen) return null`)

**Trigger di apertura:**
- Selezione punto dal dropdown nella sezione "Letture Temperature"
- Chiamata `handleAddTemperature(point)` da `ConservationPage`

### Generazione Manuale
Non applicabile - questo è un modal, non un elemento creato dall'utente.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. `isOpen === true` (modal deve essere aperto)
2. `conservationPoint` prop deve essere un oggetto `ConservationPoint` valido
3. Utente deve essere autenticato (gestito a livello parent)

**Condizioni opzionali:**
- `isLoading` prop può essere `true` durante salvataggio (disabilita pulsante "Registra")

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

```typescript
import React, { useState, useEffect } from 'react'
import { TemperatureReading, ConservationPoint, getTemperatureStatus } from '@/types/conservation'
import { X, Thermometer, Camera, AlertTriangle, CheckCircle } from 'lucide-react'

interface AddTemperatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<TemperatureReading, 'id' | 'company_id' | 'created_at'>) => void
  conservationPoint: ConservationPoint
  isLoading?: boolean
}

const RECORDING_METHODS = [
  { value: 'manual', label: 'Manuale', icon: '✍️' },
  { value: 'digital_thermometer', label: 'Termometro Digitale', icon: '🌡️' },
  { value: 'automatic_sensor', label: 'Sensore Automatico', icon: '📡' },
]

export function AddTemperatureModal({ isOpen, onClose, onSave, conservationPoint, isLoading }: AddTemperatureModalProps) {
  // State management
  // Hooks
  // Helper functions
  // Render
}
```

### Props Richieste

| Prop | Tipo | Obbligatoria | Default | Descrizione |
|------|------|--------------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Controlla visibilità modal |
| `onClose` | `() => void` | ✅ | - | Callback chiamato quando modal viene chiuso |
| `onSave` | `(data) => void` | ✅ | - | Callback chiamato quando form viene salvato, riceve dati lettura |
| `conservationPoint` | `ConservationPoint` | ✅ | - | Punto di conservazione per cui registrare temperatura |
| `isLoading` | `boolean` | ❌ | `false` | Stato caricamento durante salvataggio |

### State Management

**State locale (useState):**
- `formData: { temperature: number, method: string, notes: string, photo_evidence: string }` - dati form
- `predictedStatus: 'compliant' | 'warning' | 'critical'` - stato calcolato in tempo reale

**State calcolato (useMemo/useEffect):**
- `toleranceRange: { min: number, max: number }` - range tolleranza calcolato in base a tipo punto
- `statusInfo: { icon, text, color, bg, border }` - informazioni visualizzazione stato

### Hooks Utilizzati

- **`useState`**: Gestisce stato form (`formData`) e stato calcolato (`predictedStatus`)
- **`useEffect`** (2 hook):
  1. Calcola stato in tempo reale quando temperatura cambia (dipendenze: `formData.temperature`, `conservationPoint.setpoint_temp`, `conservationPoint.type`)
  2. Resetta form quando modal si apre (dipendenze: `isOpen`, `conservationPoint.setpoint_temp`)

### Funzioni Principali

#### `getToleranceRange()`
- **Scopo**: Calcola range tolleranza in base al tipo punto di conservazione
- **Parametri**: Nessuno (usa `conservationPoint.type` e `conservationPoint.setpoint_temp`)
- **Ritorna**: `{ min: number, max: number }`
- **Logica**: 
  - `blast` (abbattitore): tolleranza ±5°C
  - `ambient` (ambiente): tolleranza ±3°C
  - `fridge`/`freezer`: tolleranza ±2°C
  - Default: ±2°C

#### `handleSubmit(e: React.FormEvent)`
- **Scopo**: Gestisce salvataggio form quando utente clicca "Registra"
- **Parametri**: `e: React.FormEvent` - evento submit form
- **Ritorna**: void (gestisce side effect)
- **Logica**: 
  1. Previene default submit (`e.preventDefault()`)
  2. Chiama `onSave()` con dati lettura (solo campi che esistono nel DB)
  3. Campi non salvati (method, notes, photo_evidence) vengono omessi (TODO quando schema viene aggiornato)

#### `getStatusInfo()`
- **Scopo**: Ritorna informazioni visualizzazione stato (colori, icone, testo)
- **Parametri**: Nessuno (usa `predictedStatus` state)
- **Ritorna**: `{ icon, text, color, bg, border }` oggetto con classi CSS e componenti React
- **Logica**: 
  - `compliant`: verde (CheckCircle icon, "Conforme" text)
  - `warning`: giallo (AlertTriangle icon, "Attenzione" text)
  - `critical`: rosso (AlertTriangle icon, "Critico" text)

### Validazioni

**Validazioni client-side:**
- **Temperatura rilevata**: 
  - Obbligatoria (`required` HTML5)
  - Tipo number (`type="number"`)
  - Step 0.1 (`step="0.1"` per decimali)
  - Default: temperatura target del punto

- **Metodo di rilevazione**: 
  - **PROBLEMA IDENTIFICATO**: Attualmente non validato - può essere vuoto
  - **Soluzione proposta**: Aggiungere validazione che `method` non sia vuoto prima di salvare
  - Radio button con 3 opzioni: manuale, termometro digitale, sensore automatico

- **Note aggiuntive**: 
  - Opzionale (nessuna validazione)
  - Textarea con 3 righe

- **Foto evidenza**: 
  - Opzionale (nessuna validazione)
  - Input URL (`type="url"`)
  - Placeholder: "https://..."

**Validazioni server-side:**
- RLS policies: controllano che `company_id` corrisponda all'azienda dell'utente
- Foreign key constraints: `conservation_point_id` deve esistere in `conservation_points`
- Not null constraints: `temperature`, `conservation_point_id`, `company_id`, `recorded_at` sono obbligatori
- Check constraints: `temperature` deve essere un number valido (gestito da database)

### Gestione Errori

**Errori di salvataggio:**
- **Quando**: Errore nella creazione lettura (network error, validation error, ecc.)
- **Cosa succede**: Errore viene gestito a livello parent (`ConservationPage`), `toast.error()` mostra messaggio generico
- **UI**: Modal rimane aperto, utente può riprovare o annullare
- **Logging**: Errore loggato in console dall'hook `useTemperatureReadings`

**Soluzione proposta**: Migliorare gestione errori con:
- Messaggi di errore più specifici (es. "Temperatura non valida", "Punto di conservazione non trovato")
- Validazione lato client più robusta (es. range temperatura realistico)
- Retry automatico per errori di rete
- Indicatore visivo dello stato di errore nel modal

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────────────┐
│ Modal Overlay (z-50, bg-black bg-opacity-50)           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Modal Container (max-w-md, max-h-[90vh], centered)  │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Header: "Registra Temperatura" + Nome Punto     │ │ │
│ │ │         + Pulsante Chiudi (X)                    │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Form (p-6, space-y-6)                           │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Info Box Punto (bg-blue-50, border-blue-200)│ │ │ │
│ │ │ │ 🌡️ Informazioni Punto                        │ │ │ │
│ │ │ │   Temperatura target: X°C                     │ │ │ │
│ │ │ │   Range tolleranza: Y°C - Z°C                 │ │ │ │
│ │ │ │   Tipo: [Tipo]                                │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Input Temperatura Rilevata                   │ │ │ │
│ │ │ │ Label: "Temperatura rilevata (°C) *"        │ │ │ │
│ │ │ │ Input: [number, step 0.1, required]          │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Preview Stato (bg-[color]-50, border)        │ │ │ │
│ │ │ │ [Icon] Stato: [Conforme/Attenzione/Critico]  │ │ │ │
│ │ │ │ [Messaggio stato se non conforme]            │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Radio Metodo Rilevazione                     │ │ │ │
│ │ │ │ Label: "Metodo di rilevazione *"            │ │ │ │
│ │ │ │ ○ ✍️ Manuale                                 │ │ │ │
│ │ │ │ ● 🌡️ Termometro Digitale (default)           │ │ │ │
│ │ │ │ ○ 📡 Sensore Automatico                       │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Textarea Note                                │ │ │ │
│ │ │ │ Label: "Note aggiuntive"                    │ │ │ │
│ │ │ │ Textarea: [3 righe, opzionale]               │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Input Foto Evidenza                          │ │ │ │
│ │ │ │ Label: 📷 Foto evidenza (URL)                │ │ │ │
│ │ │ │ Input: [type="url", opzionale]                │ │ │ │
│ │ │ │ Hint: "URL della foto del termometro..."     │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ │                                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Actions (pt-6, border-t, flex justify-end)   │ │ │ │
│ │ │ │ [Annulla] [Registra]                          │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

**Problema identificato:**
- **Mobile**: Il modal è parzialmente coperto dalla bottom navigation (z-index conflict + height issue)
- **Tablet**: Potrebbe avere problemi di visibilità se viewport è piccolo

**Mobile (< 640px):**
- Modal dovrebbe essere: `w-full` (full width) con padding laterale `p-4`
- Max height dovrebbe essere: `max-h-[85vh]` invece di `90vh` per lasciare spazio alla bottom nav
- Padding bottom dovrebbe essere: `pb-20` o `pb-24` per evitare che contenuto venga coperto
- Pulsanti dovrebbero essere: full-width su mobile o stack verticale per facilitare touch
- Input temperatura dovrebbe essere: font-size maggiore per facilitare input su mobile
- Radio buttons dovrebbero essere: touch-friendly (min-height 44px per area touch)

**Tablet (640px - 1024px):**
- Modal dovrebbe essere: `max-w-md` (centrato) con padding laterale
- Max height: `max-h-[85vh]` o `max-h-[90vh]` a seconda di safe-area-bottom
- Pulsanti: affiancati con spacing adeguato

**Desktop (> 1024px):**
- Modal dovrebbe essere: `max-w-md` (centrato) con più spazio laterale
- Max height: `max-h-[90vh]` (funziona bene su desktop)
- Pulsanti: affiancati con spacing ottimizzato

**Soluzione proposta per z-index e responsive:**

```css
/* Modal overlay - aumentare z-index sopra bottom nav */
.modal-overlay {
  z-index: 60; /* o z-[60] in Tailwind, sopra bottom nav z-50 */
}

/* Modal container - aggiungere padding bottom per mobile */
.modal-container {
  max-height: 85vh; /* o max-h-[85vh] su mobile, 90vh su desktop */
  padding-bottom: env(safe-area-inset-bottom, 1rem); /* safe area per dispositivi con notch */
  margin-bottom: 5rem; /* spazio per bottom nav (h-16 = 64px + safe-area) */
}

/* Su mobile, aggiungere padding bottom extra */
@media (max-width: 640px) {
  .modal-container {
    padding-bottom: calc(env(safe-area-inset-bottom, 1rem) + 6rem); /* extra per bottom nav */
  }
}
```

### Styling

**Colori principali:**
- Modal overlay: `bg-black bg-opacity-50` (semi-trasparente nero)
- Modal container: `bg-white` con `rounded-lg` e `shadow-sm`
- Header: `border-b border-gray-200`
- Info box punto: `bg-blue-50 border-blue-200 text-blue-900`
- Stati:
  - Conforme: `bg-green-50 border-green-200 text-green-900`
  - Attenzione: `bg-yellow-50 border-yellow-200 text-yellow-900`
  - Critico: `bg-red-50 border-red-200 text-red-900`
- Input: `border-gray-300 focus:ring-2 focus:ring-blue-500`
- Pulsante Annulla: `border-gray-300 text-gray-600 hover:bg-gray-50`
- Pulsante Registra: `bg-blue-600 text-white hover:bg-blue-700`

**Spaziature:**
- Modal container: `p-4` (padding overlay), `p-6` (padding interno form)
- Form: `space-y-6` (24px verticale tra sezioni)
- Info box: `p-4` (16px padding interno)
- Input: `px-3 py-2` (12px horizontal, 8px vertical)
- Textarea: `px-3 py-2` con `rows={3}`
- Actions: `pt-6 border-t` (24px padding top, border top)

**Tipografia:**
- Titolo modal: `text-xl font-semibold` (20px, semi-bold)
- Sottotitolo (nome punto): `text-sm text-gray-600` (14px, grigio)
- Label input: `text-sm font-medium text-gray-700` (14px, medium, grigio scuro)
- Input temperatura: `text-base` (16px, facilita input mobile)
- Preview stato: `font-medium` (medium weight)
- Pulsanti: `text-sm` (14px)

**Effetti hover/focus:**
- Pulsante chiudi: `hover:bg-gray-100 rounded-lg transition-colors`
- Input: `focus:outline-none focus:ring-2 focus:ring-blue-500`
- Radio buttons: `focus:ring-blue-500`
- Pulsante Annulla: `hover:bg-gray-50 transition-colors`
- Pulsante Registra: `hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`

### Accessibilità

**ARIA labels utilizzati:**
- **PROBLEMA IDENTIFICATO**: Attualmente non ci sono ARIA labels espliciti
- Modal overlay: dovrebbe avere `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Form: dovrebbe avere `aria-label` o `aria-labelledby` collegato al titolo
- Input temperatura: dovrebbe avere `aria-required="true"`, `aria-describedby` per helper text
- Radio buttons: dovrebbero essere raggruppati con `fieldset` e `legend`
- Preview stato: dovrebbe avere `role="status"` e `aria-live="polite"` per aggiornamenti

**Keyboard navigation:**
- Modal overlay: `Escape` per chiudere (attualmente non implementato nel modal, gestito a livello parent)
- Input: navigabile con Tab, attivabile con Enter
- Radio buttons: navigabili con Tab, attivabili con Arrow keys
- Pulsanti: focusabile con Tab, attivabili con Enter/Space

**Screen reader support:**
- Titolo modal: dovrebbe essere collegato a `aria-labelledby` sull'overlay
- Preview stato: dovrebbe annunciare cambiamenti quando temperatura viene modificata
- Errori validazione: dovrebbero essere annunciati quando form viene sottoposto

**Contrasto colori:**
- Testo su background: minimo 4.5:1 (WCAG AA)
- Stati colorati (verde/giallo/rosso): rispettano i contrasti minimi
- Focus indicators: visibili con contrasto sufficiente (`focus:ring-2 focus:ring-blue-500`)

**Miglioramenti proposti:**
- Aggiungere `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"` all'overlay
- Aggiungere `fieldset` e `legend` per gruppo radio buttons metodo
- Aggiungere `aria-describedby` per input con helper text
- Aggiungere `aria-live="polite"` e `role="status"` per preview stato
- Aggiungere gestione `Escape` key per chiudere modal
- Aggiungere focus trap (focus solo dentro modal quando aperto)
- Aggiungere focus restoration (ripristina focus a elemento che ha aperto modal quando viene chiuso)

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**: 
   - Il componente viene renderizzato quando `isOpen === true`
   - `useEffect` resetta il form quando modal si apre:
     - `temperature`: impostata a `conservationPoint.setpoint_temp` (default)
     - `method`: resettato a `''` (PROBLEMA: dovrebbe essere `'digital_thermometer'`)
     - `notes`: resettato a `''`
     - `photo_evidence`: resettato a `''`

2. **Calcolo stato iniziale**:
   - `useEffect` calcola stato iniziale basato su temperatura default (setpoint)
   - Stato iniziale è sempre "Conforme" (temperatura = setpoint, differenza = 0)

3. **Interazione utente - Modifica temperatura**:
   - Utente modifica input temperatura
   - `onChange` aggiorna `formData.temperature`
   - `useEffect` viene triggerato (dipendenze: `formData.temperature`, `conservationPoint.setpoint_temp`, `conservationPoint.type`)
   - Stato viene ricalcolato in tempo reale:
     - Differenza = `Math.abs(temperature - setpoint_temp)`
     - Tolleranza varia per tipo: blast=5, ambient=3, altri=2
     - Se differenza <= tolleranza → "compliant"
     - Se differenza > tolleranza && <= tolleranza+2 → "warning"
     - Se differenza > tolleranza+2 → "critical"
   - Preview stato viene aggiornato automaticamente con nuovo colore, icona, messaggio

4. **Interazione utente - Selezione metodo**:
   - Utente clicca radio button metodo
   - `onChange` aggiorna `formData.method`
   - **NOTA**: Non c'è validazione che metodo non sia vuoto

5. **Interazione utente - Aggiunta note/foto**:
   - Utente può aggiungere note (textarea) e foto evidenza (URL input)
   - Dati vengono salvati in state ma **non vengono salvati nel database** (TODO)

6. **Interazione utente - Submit form**:
   - Utente clicca "Registra" o preme Enter
   - `handleSubmit` viene chiamato
   - `e.preventDefault()` previene default submit
   - `onSave()` viene chiamato con solo campi che esistono nel DB:
     - `conservation_point_id`: ID punto selezionato
     - `temperature`: temperatura inserita
     - `recorded_at`: `new Date()` (timestamp corrente)
   - Campi non salvati (method, notes, photo_evidence) vengono omessi

7. **Chiusura modal**:
   - Se salvataggio va a buon fine: `onClose()` viene chiamato dal parent
   - Se utente clicca "Annulla" o X: `onClose()` viene chiamato direttamente
   - Modal si chiude, form viene resettato alla prossima apertura

### Integrazione Database

**Tabelle utilizzate:**

1. **`temperature_readings`**:
   - **Operazioni**: INSERT
   - **Campi salvati** (attualmente):
     - `conservation_point_id`: ID punto (obbligatorio)
     - `temperature`: temperatura rilevata (obbligatorio)
     - `recorded_at`: timestamp registrazione (default: now())
     - `company_id`: ID azienda (iniettato dall'hook, non dal form)
   - **Campi NON salvati** (raccolti nel form ma omessi):
     - `method`: metodo di rilevazione (TODO quando schema viene aggiornato)
     - `notes`: note aggiuntive (TODO)
     - `photo_evidence`: URL foto evidenza (TODO)
     - `status`: stato calcolato (TODO - potrebbe essere calcolato lato server o salvato per storico)
     - `recorded_by`: utente che ha registrato (TODO - campo non esiste)

2. **`conservation_points`** (join per informazioni punto):
   - **Operazioni**: SELECT (solo per visualizzazione, non modificato)
   - **Campi utilizzati**: `id`, `name`, `type`, `setpoint_temp` (per calcolo stato e visualizzazione)

**Operazioni CRUD:**

- **CREATE**: 
  - Inserisce record in `temperature_readings`
  - Auto-aggiorna `last_temperature_reading` del punto di conservazione associato (gestito da trigger database o hook)
  - Auto-calcola stato del punto se necessario (se lettura è fuori range, punto diventa warning/critical)

**Validazioni database:**

- **Not null**: `temperature`, `conservation_point_id`, `company_id`, `recorded_at`
- **Foreign key**: `conservation_point_id` deve esistere in `conservation_points`
- **Check constraints**: Nessuno esplicito (validazione lato client e database per tipo number)

**Trasformazioni applicate:**

1. **Calcolo stato**: 
   - Avviene lato client in tempo reale
   - Non viene salvato nel database (potrebbe essere calcolato lato server o salvato per storico)

2. **Default timestamp**: 
   - `recorded_at` viene impostato a `new Date()` se non fornito
   - Database potrebbe avere default `now()` come fallback

3. **Company ID injection**: 
   - `company_id` viene iniettato dall'hook `useTemperatureReadings`, non dal form
   - Garantisce che lettura appartenga all'azienda dell'utente autenticato

### Integrazione Servizi

**Supabase Client**:
- Utilizzato tramite hook `useTemperatureReadings` (non direttamente nel modal)
- Configurato con URL e anon key da variabili ambiente
- RLS policies applicate automaticamente a tutte le query

**React Query (TanStack Query)**:
- Gestisce cache e sincronizzazione stato-server (a livello hook, non modal)
- Auto-retry per errori di rete
- Cache time: 5 minuti (default)

**Toast Notifications**:
- Utilizzato `react-toastify` per notifiche successo/errore (a livello hook/parent, non modal)
- Messaggi: "Lettura eliminata", "Errore nell'eliminazione della lettura", ecc.

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`ConservationPage`** (parent):
  - **Tipo di interazione**: Componente parent che gestisce apertura/chiusura modal
  - **Uso**: Renderizza `AddTemperatureModal` condizionalmente (`isOpen={showTemperatureModal}`)
  - **Props passate**: `isOpen`, `onClose`, `onSave`, `conservationPoint`, `isLoading`
  - **State gestito**: `showTemperatureModal`, `selectedPointForTemperature`

- **`useTemperatureReadings`** (hook):
  - **Tipo di interazione**: Hook che gestisce operazioni CRUD letture temperatura
  - **Uso**: Chiamato indirettamente tramite `onSave` callback dal parent
  - **Funzioni utilizzate**: `createReading()` (chiamata da parent dopo `onSave`)

### Dipendenze

- **Librerie esterne**:
  - `react` - framework UI
  - `lucide-react` - icone (X, Thermometer, Camera, AlertTriangle, CheckCircle)
  - `@/types/conservation` - tipi TypeScript (`TemperatureReading`, `ConservationPoint`, `getTemperatureStatus`)

- **Servizi**:
  - Nessun servizio chiamato direttamente (tutto gestito tramite parent/hook)

### Eventi Emessi

Il modal non emette eventi custom. Le comunicazioni avvengono tramite:
- **Callback props** al parent (`onSave`, `onClose`)
- **Submit form** che chiama `onSave` con dati lettura

### Eventi Ascoltati

Il modal non ascolta eventi custom. Reagisce a:
- **Props changes** (`isOpen`, `conservationPoint`) - trigger reset form e calcolo stato
- **User input** (modifica temperatura, selezione metodo) - trigger aggiornamento state e calcolo stato

---

## 📊 DATI

### Struttura Dati Input

Il modal riceve dati tramite props:

```typescript
interface AddTemperatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<TemperatureReading, 'id' | 'company_id' | 'created_at'>) => void
  conservationPoint: ConservationPoint  // Input principale
  isLoading?: boolean
}

interface ConservationPoint {
  id: string
  name: string
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  setpoint_temp: number
  // ... altri campi
}
```

### Struttura Dati Output

Il modal emette dati tramite callback `onSave`:

```typescript
interface CreateTemperatureReadingInput {
  conservation_point_id: string
  temperature: number
  recorded_at: Date
  // Campi NON salvati (raccolti nel form ma omessi):
  // method?: string  // TODO quando schema viene aggiornato
  // notes?: string   // TODO
  // photo_evidence?: string  // TODO
  // status?: 'compliant' | 'warning' | 'critical'  // TODO
  // recorded_by?: string  // TODO
}
```

**Dati form raccolti ma NON salvati:**
- `method`: 'manual' | 'digital_thermometer' | 'automatic_sensor'
- `notes`: string (textarea)
- `photo_evidence`: string (URL input)

### Mapping Database

**Campo form → Campo database:**

| Campo Form | Campo Database | Trasformazione | Stato |
|------------|----------------|----------------|-------|
| `temperature` | `temperature_readings.temperature` | Diretto (number) | ✅ Salvato |
| `conservation_point_id` | `temperature_readings.conservation_point_id` | Diretto (string UUID) | ✅ Salvato |
| `recorded_at` | `temperature_readings.recorded_at` | Date → ISO string (default: now()) | ✅ Salvato |
| `method` | `temperature_readings.method` | **NON SALVATO** - campo non esiste nel DB | ❌ TODO |
| `notes` | `temperature_readings.notes` | **NON SALVATO** - campo non esiste nel DB | ❌ TODO |
| `photo_evidence` | `temperature_readings.photo_evidence` | **NON SALVATO** - campo non esiste nel DB | ❌ TODO |
| `predictedStatus` (calcolato) | `temperature_readings.status` | **NON SALVATO** - campo non esiste nel DB | ❌ TODO |
| `conservationPoint.setpoint_temp` | `temperature_readings.target_temperature` | **NON SALVATO** - campo non esiste nel DB | ❌ TODO |

**Validazioni database:**

- **Not null**: `temperature`, `conservation_point_id`, `company_id`, `recorded_at`
- **Foreign key**: `conservation_point_id` deve esistere in `conservation_points`
- **Check constraints**: Nessuno esplicito (validazione lato client e database per tipo number)

**Trasformazioni applicate:**

1. **Calcolo stato**:
   - Avviene lato client in tempo reale con `getTemperatureStatus()`
   - Non viene salvato nel database (potrebbe essere calcolato lato server o salvato per storico)
   - Tolleranza varia per tipo punto: blast=5°C, ambient=3°C, altri=2°C

2. **Default valori**:
   - `temperature`: default `conservationPoint.setpoint_temp` (temperatura target)
   - `method`: default vuoto (PROBLEMA: dovrebbe essere `'digital_thermometer'`)
   - `recorded_at`: default `new Date()` (timestamp corrente)

3. **Calcolo range tolleranza**:
   - `min`: `setpoint_temp - tolerance` (tolleranza varia per tipo)
   - `max`: `setpoint_temp + tolerance` (tolleranza varia per tipo)
   - Utilizzato solo per visualizzazione, non salvato nel database

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per il modal `AddTemperatureModal`:**

- [x] Il modal si apre quando l'utente seleziona un punto dal dropdown "Registra temperatura..."
- [x] Il modal mostra informazioni punto (nome, temperatura target, range tolleranza, tipo)
- [x] Il form viene pre-compilato con temperatura target come default
- [x] L'utente può inserire temperatura rilevata (input number con step 0.1)
- [x] Lo stato viene calcolato automaticamente in tempo reale quando temperatura cambia
- [x] La preview stato mostra colore, icona e messaggio appropriati (Conforme/Attenzione/Critico)
- [x] L'utente può selezionare metodo di rilevazione (radio buttons: Manuale, Termometro Digitale, Sensore Automatico)
- [x] L'utente può aggiungere note aggiuntive (textarea opzionale)
- [x] L'utente può inserire URL foto evidenza (input URL opzionale)
- [x] L'utente può salvare la lettura cliccando "Registra"
- [x] L'utente può annullare cliccando "Annulla" o X
- [x] Click su overlay (area scura) chiude il modal (v2.1.0)
- [x] Accessibilità: role dialog, aria-modal, aria-labelledby (v2.1.0)
- [ ] **DA FIXARE**: Chiusura modal (X/Annulla/overlay/dopo salvataggio) in alcune condizioni non funziona — vedi REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md
- [ ] **DA FIXARE**: Modal coperto dalla bottom navigation su mobile/tablet (z-index conflict)
- [ ] **DA FIXARE**: Modal non completamente visibile su mobile (max-height troppo grande)
- [ ] **DA FIXARE (2026-01-16)**: Errore registrazione temperatura - query usa campo 'conservation_point' invece di 'conservation_point_id'
- [ ] **DA MIGLIORARE**: Responsive design per mobile (pulsanti full-width, input più grandi, touch-friendly)
- [ ] **DA FIXARE**: Metodo di rilevazione resettato a vuoto invece di default 'digital_thermometer'
- [ ] **DA IMPLEMENTARE**: Validazione che metodo non sia vuoto prima di salvare
- [ ] **DA IMPLEMENTARE**: Salvataggio campi method, notes, photo_evidence (quando schema DB viene aggiornato)
- [ ] **DA MIGLIORARE**: Upload foto diretto invece di solo URL
- [x] **PARZIALE**: Accessibilità base (role dialog, aria-modal, aria-labelledby); da completare: keyboard navigation, focus trap, Escape key
- [ ] **DA IMPLEMENTARE**: Gestione Escape key per chiudere modal
- [ ] **DA IMPLEMENTARE**: Focus trap (focus solo dentro modal quando aperto)
- [ ] **DA IMPLEMENTARE**: Focus restoration (ripristina focus a elemento che ha aperto modal)

---

## 🧪 TESTING

### Test da Eseguire

1. **Test apertura/chiusura modal**:
   - Verificare che il modal si apra quando punto viene selezionato dal dropdown (o da deep link Attività con `openTemperatureForPointId`)
   - Verificare che il modal si chiuda cliccando "Annulla", X o sull'area scura (overlay)
   - Verificare che dopo "Registra" il modal si chiuda solo al successo della mutation (resta aperto durante loading e in caso di errore)
   - Verificare che il form venga resettato quando modal si riapre
   - **Bug noto**: in alcune condizioni la chiusura potrebbe non avvenire (vedi report 04-02-2026)

2. **Test pre-compilazione form**:
   - Verificare che temperatura default sia setpoint del punto
   - Verificare che metodo default sia vuoto (PROBLEMA: dovrebbe essere 'digital_thermometer')
   - Verificare che note e foto siano vuote

3. **Test calcolo stato in tempo reale**:
   - Verificare che stato iniziale sia "Conforme" (temperatura = setpoint)
   - Verificare che stato cambi a "Attenzione" quando temperatura è fuori range ±2°C
   - Verificare che stato cambi a "Critico" quando temperatura è fuori range ±4°C
   - Verificare che tolleranza vari correttamente per tipo punto (blast=5, ambient=3, altri=2)

4. **Test preview stato**:
   - Verificare che preview mostri icona, testo e colore corretti per ogni stato
   - Verificare che messaggio stato appaia solo quando non conforme
   - Verificare che colori rispettino WCAG AA contrasto

5. **Test validazione form**:
   - Verificare che temperatura sia obbligatoria (required HTML5)
   - Verificare che metodo possa essere vuoto (PROBLEMA: dovrebbe essere validato)
   - Verificare che note e foto siano opzionali

6. **Test salvataggio**:
   - Verificare che solo campi esistenti nel DB vengano salvati (temperature, conservation_point_id, recorded_at)
   - Verificare che campi non esistenti (method, notes, photo_evidence) vengano omessi
   - Verificare che `onSave` venga chiamato con dati corretti

7. **Test responsive design**:
   - Verificare che modal sia completamente visibile su mobile (< 640px)
   - Verificare che modal non sia coperto dalla bottom navigation (PROBLEMA: attualmente coperto)
   - Verificare che pulsanti siano touch-friendly su mobile (min-height 44px)
   - Verificare che input siano comodi da usare su mobile (font-size adeguato)

8. **Test accessibilità**:
   - Verificare navigazione con tastiera (Tab, Enter, Escape)
   - Verificare screen reader compatibility (ARIA labels, announcements)
   - Verificare contrasto colori (WCAG AA)
   - Verificare focus management (focus trap, focus restoration)

9. **Test z-index e overlay**:
   - Verificare che modal overlay sia sopra bottom navigation (z-index conflict da fixare)
   - Verificare che modal sia centrato correttamente su tutte le dimensioni schermo
   - Verificare che overlay copra interamente viewport

### Scenari di Test

**Scenario 1: Registrazione lettura conforme**
- **Input**: Punto "Frigo 2" (setpoint 3°C, tipo fridge), temperatura 4°C (tolleranza ±2°C)
- **Output atteso**: Stato calcolato "Conforme" (verde), metodo "Termometro Digitale" selezionato, lettura salvata con solo temperature/conservation_point_id/recorded_at

**Scenario 2: Registrazione lettura critica**
- **Input**: Punto "Frigo 2" (setpoint 3°C), temperatura 8°C (differenza 5°C > tolleranza+2)
- **Output atteso**: Stato calcolato "Critico" (rosso), messaggio "Temperatura in range critico - Azione richiesta", lettura salvata

**Scenario 3: Modal coperto da bottom nav su mobile**
- **Input**: Apertura modal su mobile con viewport 880px, bottom nav z-50
- **Output atteso**: **PROBLEMA** - Pulsanti "Annulla" e "Registra" parzialmente coperti dalla bottom nav
- **Fix richiesto**: Aumentare z-index modal a z-60, aggiungere padding bottom, ridurre max-height

**Scenario 4: Reset form incompleto**
- **Input**: Apertura modal, metodo resettato
- **Output atteso**: **PROBLEMA** - Metodo resettato a `''` invece di default 'digital_thermometer'
- **Fix richiesto**: Resettare metodo a 'digital_thermometer' invece di stringa vuota

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/conservation/components/AddTemperatureModal.tsx`
- **Pagina parent**: `src/features/conservation/ConservationPage.tsx`
- **Hook**: `src/features/conservation/hooks/useTemperatureReadings.ts`
- **Tipi**: `src/types/conservation.ts`
- **Layout**: `src/components/layouts/MainLayout.tsx` (bottom navigation)

### Documentazione Correlata
- Template standard: `00_TEMPLATE_STANDARD.md`
- Master Index: `00_MASTER_INDEX.md`
- Documentazione TemperatureReadingsSection: `TEMPERATURE_READINGS_SECTION.md`
- Documentazione ConservationPage: `CONSERVATION_PAGE.md`

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- `useEffect` con dipendenze specifiche per evitare ricalcoli inutili
- Calcolo stato solo quando temperatura o punto cambiano
- Reset form solo quando modal si apre

**Considerazioni performance:**
- **Re-renders**: Componente potrebbe re-renderizzare quando `predictedStatus` cambia. Considerare `useMemo` per `statusInfo` se necessario
- **Calcoli**: Calcolo stato è semplice (sottrazione e confronto), non richiede ottimizzazioni aggiuntive

**Miglioramenti proposti:**
- Usare `useMemo` per `statusInfo` se performance degradano
- Debounce input temperatura se calcolo stato diventa pesante (attualmente non necessario)

### Sicurezza

**Validazioni sicurezza:**
- RLS policies: tutte le query sono filtrate automaticamente per `company_id`
- Input sanitization: gestita da Supabase (prepara statement)
- XSS prevention: React escape automaticamente i valori

**Sanitizzazione input:**
- Temperatura: validata come number, range controllato lato client (attualmente nessun range esplicito)
- URL foto evidenza: validata come URL HTML5 (`type="url"`), ma non viene validato formato corretto
- Note: textarea, limitata solo da maxlength HTML5 (non esplicito)

**Autorizzazioni:**
- Registrazione lettura: tutti i membri azienda (RLS policy)
- Non sono necessari permessi specifici per la registrazione

**Miglioramenti proposti:**
- Validare range temperatura realistico (es. -50°C a 50°C)
- Validare formato URL foto evidenza (regex o libreria URL validation)
- Validare lunghezza massima note (es. 500 caratteri)
- Aggiungere rate limiting per prevenire spam di letture

### Limitazioni

**Limitazioni conosciute:**
1. **Modal coperto da bottom navigation**: z-index conflict e max-height troppo grande su mobile
2. **Campi form non salvati**: method, notes, photo_evidence vengono raccolti ma non salvati (campo non esistono nel DB)
3. **Metodo default vuoto**: Quando form viene resettato, metodo è vuoto invece di default 'digital_thermometer'
4. **Validazione metodo mancante**: Non c'è validazione che metodo non sia vuoto prima di salvare
5. **Upload foto non supportato**: Solo URL supportato, non upload diretto file
6. **Accessibilità limitata**: Mancano ARIA labels, focus trap, gestione Escape key
7. **Responsive design migliorabile**: Pulsanti e input potrebbero essere più touch-friendly su mobile
8. **Safe-area-inset-bottom non gestito**: Su dispositivi con notch/home indicator, il modal potrebbe essere coperto

**Limitazioni tecniche:**
- Schema database limitato: solo 4 campi salvati (id, company_id, conservation_point_id, temperature, recorded_at)
- Calcolo stato lato client: stato viene calcolato solo lato client, non viene salvato per storico
- Nessun audit log: non viene tracciato chi ha registrato la lettura (campo `recorded_by` non esiste)

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Fix z-index e responsive**: Aumentare z-index, aggiungere padding bottom, ridurre max-height su mobile
2. **Fix metodo default**: Resettare metodo a 'digital_thermometer' invece di stringa vuota
3. **Validazione metodo**: Aggiungere validazione che metodo non sia vuoto prima di salvare
4. **Salvataggio campi aggiuntivi**: Aggiornare schema DB e salvare method, notes, photo_evidence, status, recorded_by
5. **Upload foto diretto**: Implementare upload file invece di solo URL
6. **Calcolo stato lato server**: Spostare calcolo stato lato server o salvarlo per storico
7. **Audit log**: Tracciare chi ha registrato la lettura (campo `recorded_by`)

**Miglioramenti tecnici:**
1. **Accessibilità completa**: Aggiungere ARIA labels, focus trap, gestione Escape key, focus restoration
2. **Responsive design ottimizzato**: Pulsanti full-width su mobile, input più grandi, touch-friendly (min-height 44px)
3. **Safe-area-inset support**: Gestire dispositivi con notch/home indicator
4. **Validazione robusta**: Validare range temperatura, formato URL, lunghezza note
5. **Rate limiting**: Prevenire spam di letture

**Miglioramenti UX:**
1. **Anteprima foto**: Mostrare preview foto quando URL viene inserito
2. **Template note**: Suggerire note comuni (es. "Termometro calibrato", "Controllo routine")
3. **Storia letture punto**: Mostrare ultime 3 letture del punto nel modal per contesto
4. **Keyboard shortcuts**: Supporto shortcut (es. Ctrl+Enter per salvare)
5. **Auto-save draft**: Salvare bozza locale se utente chiude modal per errore

---

**Ultimo Aggiornamento**: 2026-01-16  
**Versione**: 1.0.0
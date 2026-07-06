# ADD_POINT_MODAL - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16  
**Ultima Modifica**: 2026-01-16  
**Versione**: 1.0.0  
**File Componente**: `src/features/conservation/components/AddPointModal.tsx`  
**Tipo**: Modale / Form

---

## 🎯 SCOPO

### Scopo Business
Il modal `AddPointModal` permette all'utente di creare o modificare un punto di conservazione con tutte le informazioni necessarie per la conformità HACCP. Rappresenta il form principale per configurare punti di conservazione nel sistema.

Questo modal risolve il bisogno di:
- **Creare** nuovi punti di conservazione con tutti i parametri necessari
- **Modificare** punti esistenti per aggiornare configurazioni
- **Configurare** manutenzioni obbligatorie HACCP per ogni punto
- **Selezionare** categorie prodotti compatibili con la temperatura del punto
- **Garantire** che tutti i campi obbligatori siano compilati correttamente

### Scopo Tecnico
Il modal è un componente React che:

- **Gestisce** un form completo per creazione/modifica punto di conservazione
- **Valida** input utente lato client prima del salvataggio
- **Filtra** categorie prodotti in base alla temperatura target e tipo di punto
- **Genera** automaticamente le manutenzioni obbligatorie in base al tipo di punto
- **Gestisce** stato complesso con multiple sezioni (dati base, categorie, manutenzioni)
- **Auto-riclassifica** il tipo di punto in base alla temperatura impostata
- **Garantisce** usabilità mobile/tablet con layout responsive, dimensioni touch-friendly (min 44px altezza per input/pulsanti) e testo leggibile (font size minimo 16px per input su mobile)
- **Mantiene** modal centrato verticalmente e orizzontalmente e interamente visibile su tutti i dispositivi (max-height 95vh con overflow-y-auto) con scroll interno gestito correttamente
- **Assicura** che pulsanti e caselle di inserimento siano comodi da cliccare su telefono e tablet con dimensioni generose e spacing appropriato

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
Il modal viene mostrato quando:

- L'utente clicca "Aggiungi Punto" nella pagina Conservazione (modalità creazione)
- L'utente clicca icona edit su una `ConservationPointCard` (modalità modifica)
- L'utente ha i permessi per creare/modificare punti (gestito da RLS policies)

**Condizioni di accesso:**
- L'utente deve essere autenticato
- L'utente deve avere ruolo manager/admin (RLS policy)
- Per modalità edit: `point` prop deve essere un oggetto `ConservationPoint` valido
- Per modalità creazione: `point` prop deve essere `null` o `undefined`

**Ruoli utente:**
- **Manager/Admin**: Possono creare e modificare punti (RLS policy)
- **Dipendenti**: Non possono aprire questo modal (gestito a livello UI parent)

### Casi d'Uso Principali

1. **Creazione nuovo punto completo**
   - **Scenario**: Manager vuole aggiungere un nuovo frigorifero alla cucina
   - **Azione**: Clicca "Aggiungi Punto", compila nome "Frigo Test", seleziona reparto "Cucina", sceglie tipologia "Frigorifero", inserisce temperatura 4°C, seleziona categorie ["Carni fresche", "Latticini"], configura 4 manutenzioni obbligatorie
   - **Risultato**: Punto creato con tutte le manutenzioni configurate, visualizzato nella lista

2. **Modifica punto esistente**
   - **Scenario**: Manager vuole modificare la temperatura target di un frigorifero da 2°C a 4°C
   - **Azione**: Clicca edit sulla card, modifica temperatura nel modal, salva
   - **Risultato**: Punto aggiornato, tipo auto-riclassificato se necessario, lista aggiornata

3. **Configurazione manutenzioni obbligatorie**
   - **Scenario**: Manager crea un punto di tipo "Ambiente" che richiede solo 2 manutenzioni (sanificazione, controllo scadenze)
   - **Azione**: Seleziona tipologia "Ambiente", il form mostra automaticamente solo 2 manutenzioni obbligatorie (senza rilevamento temperatura e sbrinamento)
   - **Risultato**: Solo le manutenzioni appropriate vengono configurate e salvate

4. **Selezione categorie prodotti compatibili**
   - **Scenario**: Manager crea un frigorifero con temperatura 2°C
   - **Azione**: Il form filtra automaticamente le categorie compatibili con 2°C (es. "Carni fresche" range 1-4°C, "Latticini" range 2-6°C), manager seleziona categorie appropriate
   - **Risultato**: Solo categorie compatibili vengono associate al punto, utente può selezionare punti compatibili quando inserisce ingredienti nell'inventario

### Flusso Utente

**Flusso creazione nuovo punto:**
1. Utente clicca "Aggiungi Punto" nella pagina Conservazione
2. Modal si apre in modalità creazione (campo `point` è `null`)
3. Form viene inizializzato con valori di default:
   - Nome: vuoto
   - Reparto: vuoto
   - Tipologia: "fridge" (default)
   - Temperatura target: vuoto (mostra placeholder con range consigliato)
   - Categorie prodotti: array vuoto
   - Manutenzioni: 4 obbligatorie generate automaticamente (per tipo "fridge")
4. Utente compila nome (es. "Frigo 1 Cucina")
5. Utente seleziona reparto dal dropdown (es. "Cucina")
6. Utente sceglie tipologia (es. "Frigorifero") - temperatura target si aggiorna automaticamente
7. Utente inserisce temperatura target (es. 4°C) - viene validata in base alla tipologia
8. Categorie prodotti vengono filtrate automaticamente in base alla temperatura
9. Utente seleziona almeno 1 categoria prodotto compatibile
10. Utente configura le 4 manutenzioni obbligatorie (per ogni manutenzione: frequenza, ruolo, categoria opzionale, dipendente opzionale, note)
11. Utente clicca "Crea" o "Salva"
12. Form viene validato (nome, reparto, temperatura, categorie, manutenzioni complete)
13. Se valido, `onSave()` viene chiamato con dati punto + manutenzioni
14. Parent component (`ConservationPage`) gestisce il salvataggio e chiude il modal

**Flusso modifica punto esistente:**
1. Utente clicca icona edit su una `ConservationPointCard`
2. Parent component (`ConservationPage`) imposta `editingPoint` e apre modal (`showAddModal = true`)
3. Modal si apre in modalità modifica (campo `point` è un oggetto `ConservationPoint`)
4. Form viene precompilato con dati del punto esistente:
   - Nome: `point.name`
   - Reparto: `point.department_id`
   - Tipologia: `point.type`
   - Temperatura target: `point.setpoint_temp`
   - Categorie prodotti: `point.product_categories`
   - Manutenzioni: vengono caricate dal database (non gestite attualmente in questo modal - **TODO**)
5. Utente modifica i campi desiderati
6. Utente salva - validazione e salvataggio come in creazione

**Flusso configurazione frequenza manutenzioni (SPECIFICHE UTENTE):**
1. Utente seleziona frequenza per una manutenzione:
   - **Giornaliera**: Checkbox giorni settimana appaiono, **tutte selezionate di default** (Lun-Dom). Utente può deselezionare giorni non desiderati. **Non obbligatorio modificare** (tutte default).
   - **Settimanale**: Checkbox giorni settimana appaiono, **solo lunedì selezionato di default**. Utente può selezionare altri giorni. **Non obbligatorio modificare** (lunedì default).
   - **Mensile**: **Mini calendario vero** (non input numerico) appare per selezionare giorno del mese (1-31). **Obbligatorio selezionare** il giorno. Possibilità di scegliere il giorno del mese visualizzando un mini calendario, con gli stessi settings salvati in database al completamento dell'onboarding.
   - **Annuale**: **Selezionabile solo per manutenzione "sbrinamento"**. **Mini calendario vero** (non input numerico) appare per selezionare giorno dell'anno. **Obbligatorio selezionare** il giorno. Possibilità di scegliere il giorno dell'anno in cui verrà visualizzato lo sbrinamento.
   - **Personalizzata** (custom): **DA RIMUOVERE** dopo che le altre frequenze sono allineate con le specifiche.

2. Utente configura assegnazione:
   - Seleziona **Ruolo** (obbligatorio): Admin, Responsabile, Dipendente, Collaboratore
   - Seleziona **Categoria** (opzionale): Filtra staff per ruolo selezionato
   - Seleziona **Dipendente specifico** (opzionale): Filtra staff per ruolo + categoria (se selezionata)

3. Utente inserisce note opzionali

4. Ripete per tutte le manutenzioni obbligatorie

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Temperatura target vs categorie prodotti selezionate
- **Quando si verifica**: Utente modifica temperatura target dopo aver selezionato categorie prodotti, e la nuova temperatura non è compatibile con alcune categorie selezionate
- **Cosa succede**: **ATTUALMENTE NON GESTITO** - Le categorie rimangono selezionate anche se incompatibili
- **Come viene gestito**: Il filtro `compatibleCategories` si aggiorna quando temperatura cambia, ma le categorie già selezionate non vengono rimosse automaticamente
- **Esempio**: Utente seleziona "Carni fresche" (range 1-4°C) con temperatura 3°C, poi modifica temperatura a 10°C. "Carni fresche" rimane selezionata anche se non compatibile.

**Soluzione proposta**: Quando temperatura cambia e categorie selezionate non sono più compatibili:
- Mostrare warning con lista categorie incompatibili
- Offrire opzione "Rimuovi categorie incompatibili" o "Modifica temperatura"
- Permettere utente di scegliere come procedere

#### Conflitto 2: Modifica tipo punto con categorie prodotti incompatibili
- **Quando si verifica**: Utente cambia tipologia punto (es. da "Frigorifero" a "Ambiente") dopo aver selezionato categorie prodotti, e le categorie non sono compatibili con il nuovo tipo
- **Cosa succede**: **ATTUALMENTE NON GESTITO** - Le categorie rimangono selezionate anche se incompatibili
- **Come viene gestito**: Il filtro `compatibleCategories` considera solo temperatura, non tipo punto
- **Esempio**: Utente seleziona "Carni fresche" per frigorifero, poi cambia tipo a "Ambiente". "Carni fresche" rimane selezionata anche se non compatibile con ambiente.

**Soluzione proposta**: Quando tipo punto cambia, validare categorie selezionate contro compatibilità tipo:
- Se categorie non compatibili, rimuoverle automaticamente o mostrare warning
- Aggiornare filtro categorie per considerare anche tipo punto

#### Conflitto 3: Manutenzioni obbligatorie incomplete
- **Quando si verifica**: Utente salva form senza completare tutte le manutenzioni obbligatorie (frequenza o ruolo mancanti)
- **Cosa succede**: Validazione fallisce e mostra errore generico "Completa tutte le manutenzioni obbligatorie"
- **Come viene gestito**: Validazione blocca salvataggio, ma non indica quale manutenzione è incompleta
- **Esempio**: Utente completa 3 manutenzioni su 4, salva, riceve errore generico.

**Soluzione proposta**: Migliorare validazione per indicare quale manutenzione è incompleta:
- Mostrare errore specifico per ogni manutenzione incompleta
- Evidenziare visivamente le manutenzioni incomplete (bordo rosso, icona errore)
- Scroll automatico alla prima manutenzione incompleta

#### Conflitto 4: Frequenza "custom" non implementata correttamente
- **Quando si verifica**: Utente seleziona frequenza "Personalizzata" (custom) ma le specifiche dicono di rimuoverla
- **Cosa succede**: Opzione "custom" è ancora presente nel select, ma dovrebbe essere rimossa
- **Come viene gestito**: **DA RIMUOVERE** dopo che le altre frequenze sono allineate con le specifiche

**Soluzione proposta**: Rimuovere opzione "custom" dal select frequenze dopo implementazione completa di giornaliera/settimanale/mensile/annuale.

#### Conflitto 5: Mini calendario per mensile/annuale non implementato
- **Quando si verifica**: Utente seleziona frequenza "Mensile" o "Annuale" (solo sbrinamento)
- **Cosa succede**: **ATTUALMENTE NON IMPLEMENTATO** - Dovrebbe apparire un vero mini calendario, ma attualmente non esiste (TasksStep usa input numerico, ma specifica utente richiede vero calendario)
- **Come viene gestito**: **DA IMPLEMENTARE** - Serve componente calendario per selezionare giorno del mese (1-31) o giorno dell'anno (1-365)

**Soluzione proposta**: 
- Implementare componente `MiniCalendar` per selezione giorno mese/anno
- Per mensile: Mostrare mini calendario mensile, utente clicca giorno desiderato (1-31)
- Per annuale: Mostrare mini calendario annuale, utente clicca giorno desiderato (1-365)
- Salvare con settings salvati in database al completamento onboarding (stessi settings di onboarding)

### Conflitti Multi-Utente

**Modifica simultanea punto:**
- **Comportamento attuale**: Se due utenti modificano lo stesso punto contemporaneamente, l'ultimo salvataggio vince
- **Rischio**: Perdita di modifiche se due utenti modificano campi diversi
- **Gestione**: Vedi conflitti gestiti nel parent component (`ConservationPage`) - optimistic locking non implementato

**Creazione punto simultanea:**
- **Comportamento attuale**: Non c'è conflitto - ogni punto è indipendente. Due manager possono creare punti contemporaneamente senza problemi.

### Conflitti di Sincronizzazione

**Comportamento offline:**
- **Situazione**: L'app non gestisce attualmente lo stato offline
- **Cosa succede**: Se l'utente è offline durante il salvataggio, la chiamata API fallisce e viene mostrato un errore generico
- **Rischio**: Perdita di dati se l'utente ha compilato un form complesso senza connessione

**Soluzione proposta**: Implementare sistema di sincronizzazione offline con:
- Salvataggio locale dello stato form in localStorage
- Retry automatico quando connessione ripristinata
- Indicatore visivo dello stato di sincronizzazione

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
Il modal viene generato automaticamente quando:

- `isOpen={true}` prop viene passato dal parent component (`ConservationPage`)
- Utente clicca "Aggiungi Punto" o icona edit su una card

**Trigger di apertura:**
- Click su "Aggiungi Punto" (`handleAddNew()` chiamato nel parent)
- Click su icona edit (`handleEdit(point)` chiamato nel parent)

**Trigger di chiusura:**
- Click su X (icona chiusura)
- Click su "Annulla"
- Click fuori dal modal (backdrop)
- Salvataggio completato con successo

### Generazione Manuale
Non applicabile - il modal viene sempre generato automaticamente dal parent component quando `isOpen={true}`.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. `isOpen: boolean` - controlla visibilità modal (obbligatorio)
2. `onClose: () => void` - callback per chiudere modal (obbligatorio)
3. `onSave: (data, maintenanceTasks) => void` - callback per salvare dati (obbligatorio)

**Condizioni opzionali:**
- `point: ConservationPoint | null` - punto in modifica (null = creazione nuova)
- `isLoading: boolean` - stato caricamento durante salvataggio (default: `false`)

**Condizioni per modalità modifica:**
- `point` deve essere un oggetto `ConservationPoint` valido con tutti i campi necessari
- `point.id` deve esistere per identificare il punto da modificare

**Condizioni per modalità creazione:**
- `point` deve essere `null` o `undefined`
- Form viene inizializzato con valori di default

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

```typescript
import React, { useState, useEffect, useMemo } from 'react'
import { ConservationPoint, ConservationPointType } from '@/types/conservation'
import { X, Thermometer, ShieldCheck, AlertCircle } from 'lucide-react'
import { useDepartments } from '@/features/management/hooks/useDepartments'
import { useStaff } from '@/features/management/hooks/useStaff'
import { useCategories } from '@/features/inventory/hooks/useCategories'
import { Button, Input, Label, Select } from '@/components/ui/...'
import { CONSERVATION_POINT_TYPES, validateTemperatureForType } from '@/utils/onboarding/conservationUtils'
import { STAFF_ROLES, STAFF_CATEGORIES } from '@/utils/haccpRules'

interface AddPointModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data, maintenanceTasks) => void
  point?: ConservationPoint | null
  isLoading?: boolean
}

export function AddPointModal({ isOpen, onClose, onSave, point, isLoading }: AddPointModalProps) {
  // State management
  // Hooks per dati (departments, staff, categories)
  // Calcoli (compatibleCategories, typeInfo)
  // Validazioni
  // Handlers (submit, update)
  // Gestione responsive e mobile
  // Render con layout responsive
}
```

**Note Implementazione Responsive:**
- Modal container deve usare `fixed inset-0 flex items-center justify-center` per centratura perfetta
- Modal content deve avere `max-h-[95vh]` e `overflow-y-auto` per gestire contenuto lungo
- Tutti gli input devono avere `min-h-[44px]` su mobile per touch-friendly
- Font size input deve essere almeno `16px` su mobile per prevenire zoom automatico
- Footer deve essere `sticky bottom-0` con `bg-white` per rimanere sempre visibile
- Su mobile, footer può usare `flex-col` (pulsanti stackati) se larghezza insufficiente

### Props Richieste

| Prop | Tipo | Obbligatoria | Default | Descrizione |
|------|------|--------------|---------|-------------|
| `isOpen` | `boolean` | ✅ | - | Controlla visibilità modal (true = aperto, false = chiuso) |
| `onClose` | `() => void` | ✅ | - | Callback chiamato quando utente chiude modal (click X, Annulla, backdrop) |
| `onSave` | `(data, maintenanceTasks) => void` | ✅ | - | Callback chiamato quando utente salva form con dati punto + manutenzioni |
| `point` | `ConservationPoint \| null` | ❌ | `null` | Punto in modifica (null = creazione nuova) |
| `isLoading` | `boolean` | ❌ | `false` | Stato caricamento durante salvataggio (disabilita pulsanti) |

### State Management

**State locale (useState):**

- `formData: object` - dati form punto:
  ```typescript
  {
    name: string
    departmentId: string
    targetTemperature: string
    pointType: ConservationPointType
    isBlastChiller: boolean
    productCategories: string[]
  }
  ```

- `maintenanceTasks: MandatoryMaintenanceTask[]` - array manutenzioni obbligatorie:
  ```typescript
  interface MandatoryMaintenanceTask {
    manutenzione: 'rilevamento_temperatura' | 'sanificazione' | 'sbrinamento' | 'controllo_scadenze'
    frequenza: MaintenanceFrequency
    assegnatoARuolo: StaffRole
    assegnatoACategoria?: string
    assegnatoADipendenteSpecifico?: string
    giorniCustom?: CustomFrequencyDays[]
    note?: string
  }
  ```

- `validationErrors: Record<string, string>` - errori validazione form (chiave = nome campo, valore = messaggio errore)
- `temperatureError: string | null` - errore validazione temperatura specifico

**State derivato (useMemo):**

- `departmentOptions: Department[]` - reparti filtrati (solo attivi, `is_active !== false`)
- `typeInfo: object` - informazioni tipo punto selezionato (label, icona, range temperatura)
- `compatibleCategories: Category[]` - categorie prodotti filtrate in base a temperatura target

**State esterno (hooks):**

- `departments: Department[]` - lista reparti (da `useDepartments()` hook)
- `staff: Staff[]` - lista personale (da `useStaff()` hook)
- `productCategories: ProductCategory[]` - lista categorie prodotti (da `useCategories()` hook)

### Hooks Utilizzati

- **`useDepartments()`**: 
  - Carica reparti dell'azienda dal database
  - Fornisce lista filtrata per reparti attivi
  - Gestisce cache React Query

- **`useStaff()`**: 
  - Carica personale dell'azienda dal database
  - Fornisce lista personale per dropdown assegnazione manutenzioni
  - Gestisce cache React Query

- **`useCategories()`**: 
  - Carica categorie prodotti dell'azienda dal database
  - Fornisce lista categorie per selezione compatibili con temperatura
  - Gestisce cache React Query

- **`useState`**: 
  - Gestisce stato form (`formData`, `maintenanceTasks`)
  - Gestisce errori validazione (`validationErrors`, `temperatureError`)

- **`useEffect`**: 
  - Sincronizza `maintenanceTasks` quando `formData.pointType` cambia
  - Valida temperatura quando `formData.targetTemperature` cambia
  - Precompila form quando `point` prop cambia (modalità modifica)
  - Resetta form quando modal si chiude

- **`useMemo`**: 
  - Calcola `departmentOptions` (filtra reparti attivi)
  - Calcola `typeInfo` (info tipo punto selezionato)
  - Calcola `compatibleCategories` (filtra categorie per temperatura)

### Funzioni Principali

#### `getRequiredMaintenanceTasks(pointType: ConservationPointType)`
- **Scopo**: Genera array manutenzioni obbligatorie in base al tipo di punto
- **Parametri**: `pointType` - tipo punto ('ambient' | 'fridge' | 'freezer' | 'blast')
- **Ritorna**: `MandatoryMaintenanceTask[]` - array manutenzioni obbligatorie
- **Logica**: 
  - Per tipo "ambient": ritorna 2 manutenzioni (sanificazione, controllo_scadenze)
  - Per altri tipi: ritorna 4 manutenzioni (rilevamento_temperatura, sanificazione, sbrinamento, controllo_scadenze)
  - Ogni manutenzione ha frequenza, ruolo, categoria vuoti (da compilare utente)

#### `validateForm()`
- **Scopo**: Valida tutti i campi del form prima del salvataggio
- **Parametri**: nessuno (usa state locale)
- **Ritorna**: `boolean` - `true` se valido, `false` se errori
- **Logica**: 
  1. Valida nome (obbligatorio, non vuoto)
  2. Valida reparto (obbligatorio, selezionato)
  3. Valida temperatura (obbligatoria per tipo non-ambient, deve essere numero valido)
  4. Valida temperatura in base a tipo (range consigliato)
  5. Valida categorie prodotti (almeno 1 selezionata)
  6. Valida manutenzioni (tutte devono avere frequenza e ruolo compilati)
  7. Valida giorni custom per frequenza "custom" (almeno 1 giorno selezionato)
  8. Salva errori in `validationErrors` state
  9. Ritorna `true` se nessun errore, `false` altrimenti

#### `handleSubmit(e: React.FormEvent)`
- **Scopo**: Gestisce submit form (creazione o modifica punto)
- **Parametri**: `e` - evento form submit
- **Ritorna**: void
- **Logica**: 
  1. Previene default submit (`e.preventDefault()`)
  2. Chiama `validateForm()` - se non valido, ritorna senza salvare
  3. Prepara dati punto:
     - Se tipo "ambient", temperatura = 20°C (default)
     - Altrimenti, temperatura = `Number(formData.targetTemperature)`
  4. Chiama `onSave(data, maintenanceTasks)` con:
     - `data`: oggetto punto (senza id, company_id, timestamp)
     - `maintenanceTasks`: array manutenzioni obbligatorie configurate
  5. Parent component gestisce salvataggio e chiude modal

#### `updateMaintenanceTask(index: number, updatedTask: MandatoryMaintenanceTask)`
- **Scopo**: Aggiorna una manutenzione specifica nell'array
- **Parametri**: 
  - `index` - indice manutenzione nell'array
  - `updatedTask` - manutenzione aggiornata
- **Ritorna**: void
- **Logica**: 
  1. Crea copia array `maintenanceTasks`
  2. Sostituisce elemento all'indice `index` con `updatedTask`
  3. Aggiorna state `setMaintenanceTasks(updated)`

#### `toggleWeekday(day: CustomFrequencyDays)` (interno a MaintenanceTaskForm)
- **Scopo**: Toggle selezione giorno settimana per frequenza custom/giornaliera/settimanale
- **Parametri**: `day` - giorno da toggleare
- **Ritorna**: void
- **Logica**: 
  1. Ottiene giorni attuali da `task.giorniCustom || []`
  2. Se giorno è già presente, lo rimuove
  3. Se giorno non è presente, lo aggiunge
  4. Aggiorna task con nuovo array `giorniCustom`

### Validazioni

**Validazioni client-side:**

1. **Nome punto**:
   - Obbligatorio: `!formData.name.trim()` → errore "Il nome è obbligatorio"
   - Lunghezza: Nessuna validazione esplicita (da aggiungere: max 100 caratteri)

2. **Reparto**:
   - Obbligatorio: `!formData.departmentId` → errore "Seleziona un reparto"
   - Esistenza: Verificato contro `departmentOptions` (solo reparti attivi disponibili)

3. **Temperatura target**:
   - Obbligatoria per tipo non-ambient: `formData.pointType !== 'ambient' && !formData.targetTemperature` → errore "Inserisci una temperatura valida"
   - Deve essere numero valido: `isNaN(Number(formData.targetTemperature))` → errore "Inserisci una temperatura valida"
   - Range consigliato: Validata tramite `validateTemperatureForType(temperature, pointType)`:
     - Se fuori range, mostra errore specifico con range consigliato
     - Se valida, `temperatureError` è `null`

4. **Categorie prodotti**:
   - Almeno 1 selezionata: `formData.productCategories.length === 0` → errore "Seleziona almeno una categoria"
   - Compatibilità temperatura: Filtrate automaticamente tramite `compatibleCategories` useMemo
   - **Problema**: Categorie già selezionate non vengono rimosse se diventano incompatibili quando temperatura cambia

5. **Manutenzioni obbligatorie**:
   - Frequenza obbligatoria: `!task.frequenza` → errore generico "Completa tutte le manutenzioni obbligatorie"
   - Ruolo obbligatorio: `!task.assegnatoARuolo` → errore generico "Completa tutte le manutenzioni obbligatorie"
   - Giorni custom obbligatori per frequenza "custom": `task.frequenza === 'custom' && (!task.giorniCustom || task.giorniCustom.length === 0)` → errore "Seleziona almeno un giorno per frequenze personalizzate"
   - **DA IMPLEMENTARE**: Giorno mese obbligatorio per frequenza "mensile"
   - **DA IMPLEMENTARE**: Giorno anno obbligatorio per frequenza "annuale" (solo sbrinamento)

**Validazioni server-side:**
- RLS policies: controllano che `company_id` corrisponda all'azienda dell'utente
- Foreign key constraints: `department_id` deve esistere in `departments`
- Not null constraints: campi obbligatori come `name`, `department_id`, `type`
- Check constraints: Nessuno esplicito (validazione lato client)

### Gestione Errori

**Errori validazione:**
- **Quando**: Validazione form fallisce (campi obbligatori vuoti, valori invalidi)
- **Cosa succede**: Errori vengono salvati in `validationErrors` state, form non viene salvato
- **UI**: 
  - Messaggi errore vengono mostrati sotto ogni campo con errore
  - Campi con errore hanno bordo rosso (`aria-invalid={true}`)
  - Se errore temperatura specifico, viene mostrato anche `temperatureError`
- **Logging**: Nessun logging esplicito

**Errori salvataggio:**
- **Quando**: Chiamata API fallisce durante salvataggio
- **Cosa succede**: `onSave()` callback nel parent component gestisce l'errore, modal rimane aperto
- **UI**: Toast notification mostra errore generico "Errore nella creazione/modifica del punto di conservazione"
- **Logging**: Errore loggato in console dal parent component

**Errori caricamento dati:**
- **Quando**: Hook `useDepartments()`, `useStaff()`, `useCategories()` falliscono
- **Cosa succede**: Dropdown vengono disabilitati o mostrano messaggio "Nessun dato disponibile"
- **UI**: Warning mostrato se reparti non disponibili: "Nessun reparto disponibile. Crea prima un reparto dalla sezione Gestione."
- **Logging**: Errori loggati in console dagli hook

**Soluzione proposta**: Migliorare gestione errori con:
- Messaggi di errore più specifici (es. "Temperatura 10°C non valida per frigorifero. Range consigliato: 0-8°C")
- Indicazione visiva chiara dei campi con errore
- Scroll automatico al primo campo con errore
- Retry automatico per errori di rete

---

## 🎨 LAYOUT

### Struttura Layout

**Layout Modal Responsive:**

```
┌─────────────────────────────────────────────────────────┐
│ Modal Overlay (backdrop scuro, full screen)              │
│ Flex: items-center justify-center                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Modal Container (responsive width, bg-white, rounded-lg)│ │
│ │ Mobile: w-full (max-w-[95vw])                        │ │
│ │ Tablet: w-full (max-w-[90vw], max-w-3xl)            │ │
│ │ Desktop: max-w-4xl                                   │ │
│ │ Max-height: 95vh (mobile/desktop), 90vh (tablet)   │ │
│ │                                                     │ │
│ │ ┌───────────────────────────────────────────────┐ │ │
│ │ │ Header (sticky top-0, bg-white, z-10)         │ │ │
│ │ │ Mobile: px-4 py-4, text-lg                     │ │ │
│ │ │ Desktop: px-6 py-6, text-xl                    │ │ │
│ │ │ "Nuovo/Modifica Punto Conservazione"   [X]    │ │ │
│ │ └───────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌───────────────────────────────────────────────┐ │ │
│ │ │ Form Content (overflow-y-auto, flex-1)        │ │ │
│ │ │ Mobile: px-4 py-4, max-h-[calc(95vh-200px)]   │ │ │
│ │ │ Desktop: px-6 py-6, max-h-[calc(95vh-250px)]  │ │ │
│ │ │                                                │ │ │
│ │ │ Sezione 1: Dati Base                          │ │ │
│ │ │ Mobile: grid-cols-1 (stack verticale)         │ │ │
│ │ │ Desktop: grid-cols-2 (affiancati)             │ │ │
│ │ │ ┌──────────────┐  ┌──────────────┐           │ │ │
│ │ │ │ Nome *       │  │ Reparto *    │           │ │ │
│ │ │ │ [input 44px] │  │ [select 44px]│           │ │ │
│ │ │ │ Font 16px    │  │ Font 16px    │           │ │ │
│ │ │ └──────────────┘  └──────────────┘           │ │ │
│ │ │                                                │ │ │
│ │ │ ┌──────────────┐  ┌──────────────┐           │ │ │
│ │ │ │ Temp target *│  │ Tipologia    │           │ │ │
│ │ │ │ [input 44px] │  │ [buttons]    │           │ │ │
│ │ │ │ Font 16px    │  │ Touch 44px   │           │ │ │
│ │ │ └──────────────┘  └──────────────┘           │ │ │
│ │ │                                                │ │ │
│ │ │ Sezione 2: Categorie Prodotti                 │ │ │
│ │ │ "Seleziona categorie *" (Font 14px mobile)    │ │ │
│ │ │ Mobile: grid-cols-1 (1 colonna)               │ │ │
│ │ │ Tablet: grid-cols-2 (2 colonne)               │ │ │
│ │ │ Desktop: grid-cols-3 (3 colonne)              │ │ │
│ │ │ [Grid categorie compatibili, touch 44px]      │ │ │
│ │ │                                                │ │ │
│ │ │ Sezione 3: Manutenzioni Obbligatorie          │ │ │
│ │ │ ┌──────────────────────────────────────────┐ │ │ │
│ │ │ │ Manutenzione 1: Rilevamento Temperatura  │ │ │ │
│ │ │ │ Mobile: stack verticale                   │ │ │ │
│ │ │ │ Desktop: grid-cols-2                      │ │ │ │
│ │ │ │ ┌──────────┐ ┌──────────┐                │ │ │ │
│ │ │ │ │Frequenza*│ │Ruolo*    │                │ │ │ │
│ │ │ │ │[select 44px] [select 44px]              │ │ │ │
│ │ │ │ └──────────┘ └──────────┘                │ │ │ │
│ │ │ │ [Categoria 44px] [Dipendente 44px]        │ │ │ │
│ │ │ │ [Note textarea, min-height 80px]          │ │ │ │
│ │ │ │ [Giorni custom, touch 44px]               │ │ │ │
│ │ │ └──────────────────────────────────────────┘ │ │ │ │
│ │ │ ... (4 manutenzioni, spacing 24px verticale) │ │ │
│ │ └───────────────────────────────────────────────┘ │ │ │
│ │                                                     │ │
│ │ ┌───────────────────────────────────────────────┐ │ │
│ │ │ Footer (sticky bottom-0, bg-white, border-t)  │ │ │
│ │ │ Mobile: px-4 py-4, flex-col (stack verticale) │ │ │
│ │ │ Desktop: px-6 py-4, flex-row (affiancati)     │ │ │
│ │ │ [Annulla 44px]  [Salva 44px]                  │ │ │
│ │ │ Touch targets: min 44x44px                    │ │ │
│ │ └───────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Note Layout Responsive:**
- Modal sempre **centrato** con `flex items-center justify-center` su overlay
- Modal ha **max-height** per garantire visibilità completa su tutti i dispositivi
- Contenuto form è **scrollable** se necessario, ma preferibilmente tutto visibile
- Footer è **sticky** in basso per accesso sempre disponibile ai pulsanti
- Su mobile, footer può essere **stack verticale** (pulsanti uno sopra l'altro) se necessario per larghezza

### Responsive Design

**IMPORTANTE - Requisiti Mobile/Tablet:**
Il modal deve essere **centrato, interamente visibile e comodo da usare anche da telefono o tablet**. Deve essere:
- **Centrato**: Modal centrato verticalmente e orizzontalmente sullo schermo
- **Interamente visibile**: Tutto il contenuto deve essere visibile senza dover scrollare eccessivamente
- **Responsive**: Layout che si adatta perfettamente a telefono e tablet
- **Ampio**: Dimensioni generose con pulsanti e caselle di inserimento comode da cliccare (touch-friendly)
- **Testo leggibile**: Font size adeguato per leggibilità su schermi piccoli

**Mobile (< 640px):**
- Modal **full-width** con padding laterale (`p-4`) per garantire visibilità completa
- Modal **centrato verticalmente** con `items-center` e altezza adattiva
- **Max-height 95vh** per garantire che tutto sia visibile senza tagli
- **Overflow-y-auto** sul contenuto form per permettere scroll interno se necessario
- Form a colonna singola (`grid-cols-1`) per massima leggibilità
- Header con titolo su una riga, font size ridotto se necessario per evitare overflow
- **Pulsanti**: Minimo `44px x 44px` (touch target size) con padding generoso (`px-4 py-3`)
- **Input/Select**: Minimo `44px` altezza con padding `py-3` per comodità tocco
- **Font size**: Minimo `16px` per input (previene zoom automatico iOS) e `14px` per label
- Categorie prodotti: grid 1 colonna, bottoni categoria con min `44px` altezza
- Manutenzioni: stackate verticalmente, ogni card manutenzione con spacing generoso
- Footer con pulsanti sticky in basso (`sticky bottom-0`) per accesso sempre visibile

**Tablet (640px - 1024px):**
- Modal **max-width 90vw** con padding standard (`p-6`) per garantire spazio laterale
- Modal **centrato verticalmente e orizzontalmente** con `items-center justify-center`
- **Max-height 90vh** per garantire che tutto sia visibile
- **Overflow-y-auto** sul contenuto form se necessario
- Form a 2 colonne per campi base (`md:grid-cols-2`) quando possibile
- Categorie prodotti: grid 2 colonne (`md:grid-cols-2`) con bottoni categoria ampia
- **Pulsanti**: Mantenere `44px` altezza minima per touch comfort
- **Input/Select**: Altezza `44px` con padding `py-3`
- **Font size**: `16px` input, `14px` label, `15px` body text
- Manutenzioni: layout compatto ma con spacing adeguato tra elementi

**Desktop (> 1024px):**
- Modal **max-width `max-w-4xl`** centrato verticalmente e orizzontalmente
- **Max-height 95vh** per garantire visibilità completa
- Form a 2 colonne ottimizzato
- Categorie prodotti: grid 3 colonne (`lg:grid-cols-3`)
- Manutenzioni: layout spaziato con più spazio tra elementi
- **Pulsanti**: Altezza `40px` (desktop può essere più compatto)
- **Input/Select**: Altezza `40px` con padding `py-2.5`
- **Font size**: `14px` input, `13px` label, `14px` body text

**Considerazioni Touch-Friendly:**
- **Spacing minimo**: Almeno `8px` tra elementi cliccabili per evitare toccate accidentali
- **Hit areas**: Pulsanti e input devono avere area tocco minima `44px x 44px` su mobile
- **Focus states**: Focus visibile chiaramente per navigazione tastiera
- **Scroll behavior**: Scroll fluido e naturale su mobile/tablet
- **Keyboard handling**: Quando tastiera virtuale appare su mobile, modal deve adattarsi (viewport height si riduce)

### Styling

**Colori principali:**
- Modal background: `bg-white` con `rounded-lg` e `shadow-lg`
- Backdrop: `bg-black bg-opacity-50` (semi-trasparente)
- Header: `border-b border-gray-200` con background bianco
- Footer: `border-t border-gray-200` con background bianco sticky

**Colori form:**
- Input focus: `focus:ring-2 focus:ring-blue-500`
- Input error: `border-red-300` con `aria-invalid={true}`
- Button primary: `bg-blue-600 text-white hover:bg-blue-700`
- Button secondary: `border border-gray-300 hover:bg-gray-50`

**Colori manutenzioni:**
- Card manutenzione: `border border-gray-300 rounded-lg bg-white`
- Header manutenzione: `border-b pb-3` con icona + label + badge "Obbligatorio"
- Badge obbligatorio: `bg-red-100 text-red-700`

**Spaziature:**
- **Mobile**: Modal padding `p-4` (16px), sezioni `space-y-4` (16px), campi `gap-3` (12px)
- **Tablet**: Modal padding `p-5` (20px), sezioni `space-y-5` (20px), campi `gap-4` (16px)
- **Desktop**: Modal padding `p-6` (24px), sezioni `space-y-6` (24px), campi `gap-4` (16px)
- **Input padding mobile**: `px-4 py-3` (16px orizzontale, 12px verticale) per touch comfort
- **Input padding desktop**: `px-3 py-2.5` (12px orizzontale, 10px verticale)
- **Pulsanti spacing**: Almeno `8px` tra pulsanti per evitare toccate accidentali su mobile

**Tipografia:**
- **Mobile**: 
  - Titolo modal: `text-lg font-semibold` (18px) per evitare overflow
  - Label form: `text-sm font-medium text-gray-700` (14px)
  - Input text: `text-base` (16px) - **IMPORTANTE**: 16px minimo previene zoom automatico iOS
  - Body text: `text-sm` (14px)
  - Messaggi errore: `text-sm text-red-600` (14px)
- **Tablet**:
  - Titolo modal: `text-xl font-semibold` (20px)
  - Label form: `text-sm font-medium text-gray-700` (14px)
  - Input text: `text-base` (16px)
  - Body text: `text-[15px]` (15px)
  - Messaggi errore: `text-sm text-red-600` (14px)
- **Desktop**:
  - Titolo modal: `text-xl font-semibold` (20px)
  - Label form: `text-sm font-medium text-gray-700` (14px)
  - Input text: `text-sm` (14px)
  - Body text: `text-sm` (14px)
  - Messaggi errore: `text-sm text-red-600` (14px)

**Effetti hover/focus:**
- Input hover: `hover:border-blue-300` (desktop only)
- Input focus: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` (visibile su tutti i dispositivi)
- Button hover: `hover:bg-blue-700 transition-colors` (desktop only)
- Categorie hover: `hover:border-blue-200` (desktop only)
- **Touch feedback**: Su mobile, considerare active states con `active:bg-blue-800` per feedback visivo al tocco

### Accessibilità

**ARIA labels utilizzati:**
- Modal: `role="dialog"` con `aria-labelledby` e `aria-describedby` (da aggiungere)
- Input: `aria-invalid={Boolean(error)}` quando errore presente
- Select: `aria-label` o `aria-labelledby` (da verificare)

**Keyboard navigation:**
- Tab: Naviga tra campi form in ordine logico
- Enter: Submit form (quando focus su input, invia form)
- Escape: Chiude modal (da implementare)
- Focus trap: Focus rimane all'interno modal quando aperto (da implementare)

**Screen reader support:**
- Label associati a input tramite `htmlFor` e `id`
- Messaggi errore associati a input tramite `aria-describedby` (da aggiungere)
- Stato loading comunicato tramite `aria-busy` (da aggiungere)

**Contrasto colori:**
- Testo su background: minimo 4.5:1 (WCAG AA)
- Messaggi errore rosso: verificare contrasto con background bianco
- Button primary blu: verificare contrasto testo bianco su blu

**Miglioramenti proposti:**
- Aggiungere `role="dialog"` al modal container
- Aggiungere `aria-labelledby` e `aria-describedby` al modal
- Implementare focus trap quando modal aperto
- Implementare Escape key handler per chiudere modal
- Aggiungere `aria-describedby` ai messaggi errore
- Aggiungere `aria-busy` durante salvataggio
- **Mobile/Tablet specifici**:
  - Gestire viewport height quando tastiera virtuale appare (usare `vh` unit dinamiche o `window.innerHeight`)
  - Aggiungere `viewport-fit=cover` per dispositivi con notch
  - Testare su dispositivi reali iOS e Android per verificare comportamento tastiera
  - Considerare `position: fixed` con `top`, `left`, `right`, `bottom` invece di flex centering per migliore compatibilità mobile

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**:
   - Modal viene renderizzato quando `isOpen={true}`
   - `useEffect` viene eseguito quando `point` prop o `isOpen` cambia
   - Se `point` è presente (modalità edit), form viene precompilato con dati punto
   - Se `point` è null (modalità creazione), form viene inizializzato con valori di default

2. **Precompilazione form (modalità edit)**:
   - `formData.name` = `point.name`
   - `formData.departmentId` = `point.department_id`
   - `formData.targetTemperature` = `point.setpoint_temp.toString()`
   - `formData.pointType` = `point.type`
   - `formData.isBlastChiller` = `point.is_blast_chiller`
   - `formData.productCategories` = `point.product_categories || []`
   - **TODO**: `maintenanceTasks` dovrebbero essere caricate dal database (attualmente vengono rigenerate)

3. **Calcolo categorie compatibili**:
   - `useMemo` `compatibleCategories` viene ricalcolato quando `formData.targetTemperature` o `formData.pointType` cambiano
   - Filtra `productCategories` in base a `temperature_requirements.min_temp` e `max_temp`
   - Se temperatura non impostata, mostra tutte le categorie
   - **Problema**: Non considera `storage_type` dalla categoria per compatibilità tipo punto

4. **Validazione temperatura real-time**:
   - `useEffect` viene eseguito quando `formData.targetTemperature` o `formData.pointType` cambiano
   - Chiama `validateTemperatureForType(temperature, pointType)`
   - Se temperatura fuori range, `temperatureError` viene popolato con messaggio specifico
   - Se temperatura valida, `temperatureError` è `null`

5. **Aggiornamento manutenzioni obbligatorie**:
   - `useEffect` viene eseguito quando `formData.pointType` cambia
   - Chiama `getRequiredMaintenanceTasks(formData.pointType)`
   - Aggiorna `maintenanceTasks` state con nuove manutenzioni obbligatorie
   - **Nota**: In modalità edit, questo sovrascrive le manutenzioni esistenti (da correggere)

6. **Interazione utente - Selezione frequenza manutenzione**:
   - Utente seleziona frequenza da dropdown (giornaliera, settimanale, mensile, annuale, custom)
   - Per frequenza "giornaliera": Checkbox giorni settimana appaiono, **tutte selezionate di default** (Lun-Dom)
   - Per frequenza "settimanale": Checkbox giorni settimana appaiono, **solo lunedì selezionato di default**
   - Per frequenza "mensile": **Mini calendario vero** (non input numerico) appare - **DA IMPLEMENTARE**
   - Per frequenza "annuale": **Mini calendario vero** (non input numerico) appare, solo per sbrinamento - **DA IMPLEMENTARE**
   - Per frequenza "custom": Checkbox giorni settimana appaiono - **DA RIMUOVERE** dopo allineamento altre frequenze

7. **Interazione utente - Submit form**:
   - Utente clicca "Salva" o "Crea"
   - `handleSubmit(e)` viene chiamato
   - `e.preventDefault()` previene submit default
   - `validateForm()` viene chiamato - se non valido, ritorna senza salvare
   - Dati punto vengono preparati:
     - Se tipo "ambient", temperatura = 20°C (default)
     - Altrimenti, temperatura = `Number(formData.targetTemperature)`
   - `onSave(data, maintenanceTasks)` viene chiamato con dati punto + manutenzioni
   - Parent component gestisce salvataggio (API call) e chiude modal

### Integrazione Database

**Tabelle utilizzate:**

1. **`conservation_points`** (operazione principale):
   - **CREATE**: Inserisce nuovo punto con tutti i campi
   - **UPDATE**: Aggiorna punto esistente per ID
   - **Auto-classificazione**: `type` viene auto-calcolato in base a `setpoint_temp` e `is_blast_chiller` (funzione `classifyConservationPoint()`)

2. **`maintenance_tasks`** (operazione secondaria):
   - **CREATE**: Inserisce manutenzioni obbligatorie associate al punto
   - **Relazione**: `conservation_point_id` foreign key
   - **Nota**: Attualmente la creazione non è atomica con la creazione del punto (se manutenzioni falliscono, punto rimane senza manutenzioni)

3. **`departments`** (lettura sola):
   - **READ**: Carica reparti per dropdown selezione
   - **Filtro**: Solo reparti attivi (`is_active !== false`)

4. **`staff`** (lettura sola):
   - **READ**: Carica personale per dropdown assegnazione manutenzioni
   - **Filtro**: Per ruolo + categoria (quando applicabile)

5. **`product_categories`** (lettura sola):
   - **READ**: Carica categorie prodotti per selezione
   - **Filtro**: Compatibilità temperatura (`min_temp` <= temperatura <= `max_temp`)

**Operazioni CRUD:**

- **CREATE**: 
  - Inserisce record in `conservation_points`
  - Auto-classifica `type` in base a temperatura
  - Inserisce manutenzioni in `maintenance_tasks` (se fornite)
  - **Problema**: Non atomico - se manutenzioni falliscono, punto rimane senza manutenzioni

- **UPDATE**: 
  - Aggiorna record in `conservation_points` per ID
  - Auto-riclassifica `type` se temperatura cambia
  - **Problema**: Manutenzioni non vengono aggiornate (da implementare)

- **READ**: 
  - Carica `departments`, `staff`, `product_categories` tramite hooks
  - Precompila form con dati `point` esistente (modalità edit)

- **DELETE**: 
  - Non gestito in questo modal (gestito a livello parent component)

**Transazioni:**
- **NON implementate** - Creazione punto + manutenzioni non è atomica
- **Problema**: Se inserimento punto va a buon fine ma inserimento manutenzioni fallisce, punto rimane senza manutenzioni

**Soluzione proposta**: Usare transazione esplicita per creazione punto + manutenzioni:
- Iniziare transazione
- Inserire punto
- Inserire manutenzioni
- Commit transazione
- Se errore in qualsiasi punto, rollback transazione

### Integrazione Servizi

**Supabase Client**:
- Utilizzato tramite hooks (`useDepartments`, `useStaff`, `useCategories`)
- Gestisce query e mutazioni automaticamente tramite React Query
- RLS policies applicate automaticamente

**React Query (TanStack Query)**:
- Gestisce cache e sincronizzazione stato-server per departments, staff, categories
- Auto-retry per errori di rete
- Background refetch quando tab torna in focus

**Toast Notifications**:
- Utilizzato dal parent component per notifiche successo/errore
- Messaggi: "Punto creato con successo", "Errore nella creazione", ecc.

### Real-time Updates

**Comportamento attuale**: 
- **NON implementato** - Il modal non si aggiorna automaticamente quando altri utenti modificano dati (departments, staff, categories)
- Aggiornamenti avvengono solo quando modal viene chiuso e riaperto

**Soluzione proposta**: Se vengono implementati real-time updates a livello di hooks, il modal si aggiornerà automaticamente quando departments/staff/categories cambiano.

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`ConservationPage`** (parent component):
  - **Tipo di interazione**: Gestisce apertura/chiusura modal, salvataggio dati
  - **Uso**: Renderizza modal quando `showAddModal={true}`
  - **Props passate**: `isOpen`, `onClose`, `onSave`, `point`, `isLoading`

- **`MaintenanceTaskForm`** (componente interno):
  - **Tipo di interazione**: Form per configurare singola manutenzione obbligatoria
  - **Uso**: Renderizzato in loop per ogni manutenzione obbligatoria
  - **Props passate**: `task`, `index`, `staff`, `staffCategories`, `onUpdate`

- **`Button`, `Input`, `Label`, `Select`** (componenti UI base):
  - **Tipo di interazione**: Componenti riutilizzabili per form
  - **Uso**: Utilizzati per tutti i campi form

### Dipendenze

- **Hooks custom**:
  - `useDepartments()` - gestione reparti
  - `useStaff()` - gestione personale
  - `useCategories()` - gestione categorie prodotti

- **Utilità**:
  - `CONSERVATION_POINT_TYPES` da `@/utils/onboarding/conservationUtils`
  - `validateTemperatureForType()` da `@/utils/onboarding/conservationUtils`
  - `STAFF_ROLES`, `STAFF_CATEGORIES` da `@/utils/haccpRules`

- **Tipi**:
  - `ConservationPoint`, `ConservationPointType` da `@/types/conservation`

- **Librerie**:
  - `react` - framework UI
  - `lucide-react` - icone

### Eventi Emessi

Il modal **non emette eventi custom**. Le comunicazioni avvengono tramite:
- **Callback props** al parent component (`onSave`, `onClose`)
- **Eventi form standard** (submit, change)

### Eventi Ascoltati

Il modal **non ascolta eventi custom**. Reagisce a:
- **Cambio props**: Quando `point` prop cambia, form viene precompilato
- **Cambio `isOpen` prop**: Quando diventa `true`, modal si apre; quando diventa `false`, modal si chiude
- **User interactions**: Input change, select change, submit form

---

## 📊 DATI

### Struttura Dati Input

**Props component:**
```typescript
interface AddPointModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data, maintenanceTasks) => void
  point?: ConservationPoint | null
  isLoading?: boolean
}
```

**Dati caricati tramite hooks:**
```typescript
// Departments
interface Department {
  id: string
  company_id: string
  name: string
  is_active: boolean
  // ...
}

// Staff
interface Staff {
  id: string
  company_id: string
  name: string
  role: StaffRole
  categories: string[]
  // ...
}

// Product Categories
interface ProductCategory {
  id: string
  company_id: string
  name: string
  temperature_requirements?: {
    min_temp: number
    max_temp: number
    storage_type?: ConservationPointType
  }
  // ...
}
```

### Struttura Dati Output

**Dati inviati al parent component (`onSave` callback):**

```typescript
// Data punto (senza id, company_id, timestamp)
interface CreateConservationPointInput {
  name: string
  department_id: string
  setpoint_temp: number
  type: ConservationPointType  // auto-calcolato
  product_categories: string[]
  is_blast_chiller: boolean
}

// Array manutenzioni obbligatorie
interface MandatoryMaintenanceTask {
  manutenzione: 'rilevamento_temperatura' | 'sanificazione' | 'sbrinamento' | 'controllo_scadenze'
  frequenza: 'giornaliera' | 'settimanale' | 'mensile' | 'annuale' | 'custom'
  assegnatoARuolo: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'
  assegnatoACategoria?: string
  assegnatoADipendenteSpecifico?: string
  giorniCustom?: CustomFrequencyDays[]  // ['lunedi', 'martedi', ...]
  giornoMese?: number  // 1-31 per mensile - DA IMPLEMENTARE
  giornoAnno?: number  // 1-365 per annuale - DA IMPLEMENTARE
  note?: string
}
```

### Mapping Database

**Campo form → Campo database:**

| Campo Form | Campo Database | Trasformazione |
|------------|----------------|----------------|
| `formData.name` | `conservation_points.name` | Diretto (string) |
| `formData.departmentId` | `conservation_points.department_id` | Diretto (UUID) |
| `formData.targetTemperature` | `conservation_points.setpoint_temp` | `Number(formData.targetTemperature)` o `20` se tipo ambient |
| `formData.pointType` | `conservation_points.type` | Auto-calcolato in base a temperatura (vedi `classifyConservationPoint()`) |
| `formData.isBlastChiller` | `conservation_points.is_blast_chiller` | Diretto (boolean) |
| `formData.productCategories` | `conservation_points.product_categories` | Array string (JSONB nel database) |
| `maintenanceTasks[].manutenzione` | `maintenance_tasks.type` | Mapping: 'rilevamento_temperatura' → 'temperature', 'sanificazione' → 'sanitization', ecc. |
| `maintenanceTasks[].frequenza` | `maintenance_tasks.frequency` | Mapping: 'giornaliera' → 'daily', 'settimanale' → 'weekly', ecc. |
| `maintenanceTasks[].assegnatoARuolo` | `maintenance_tasks.assigned_to` | Mapping ruolo → staff ID (se dipendente specifico) o ruolo generico |
| `maintenanceTasks[].giorniCustom` | `maintenance_tasks.custom_days` | Array giorni (JSONB nel database) |

**Validazioni database:**

- **Not null**: `name`, `department_id`, `setpoint_temp`, `type`, `company_id`
- **Foreign key**: `department_id` deve esistere in `departments`
- **Check constraints**: Nessuno esplicito (validazione lato client)

**Trasformazioni applicate:**

1. **Auto-classificazione tipo**: 
   ```typescript
   function classifyConservationPoint(setpointTemp: number, isBlastChiller: boolean): ConservationPointType {
     if (isBlastChiller) return 'blast'
     if (setpointTemp <= -15) return 'freezer'
     if (setpointTemp <= 8) return 'fridge'
     if (setpointTemp >= 15) return 'ambient'
     return 'fridge'  // default
   }
   ```

2. **Temperatura default per ambient**:
   - Se tipo è "ambient", temperatura viene impostata a 20°C (non modificabile dall'utente)

3. **Filtraggio categorie compatibili**:
   - Categorie vengono filtrate in base a `temperature_requirements.min_temp` e `max_temp`
   - Se categoria non ha `temperature_requirements`, viene mostrata sempre
   - **Problema**: Non considera `storage_type` per compatibilità tipo punto

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per AddPointModal:**

- [x] Il modal si apre correttamente quando `isOpen={true}`
- [x] Il modal si chiude correttamente quando `isOpen={false}` o utente clicca X/Annulla
- [x] Il form viene precompilato correttamente in modalità edit
- [x] Il form viene inizializzato con valori di default in modalità creazione
- [x] Le manutenzioni obbligatorie vengono generate automaticamente in base al tipo di punto
- [x] La temperatura viene validata in base al tipo di punto
- [x] Le categorie prodotti vengono filtrate in base alla temperatura
- [x] La validazione blocca il salvataggio se campi obbligatori sono vuoti
- [x] Il form salva correttamente i dati punto + manutenzioni
- [ ] **DA IMPLEMENTARE**: Mini calendario vero per frequenza "mensile" (non input numerico)
- [ ] **DA IMPLEMENTARE**: Mini calendario vero per frequenza "annuale" (solo sbrinamento, non input numerico)
- [ ] **DA IMPLEMENTARE**: Giorni default per frequenza "giornaliera" (tutte selezionate)
- [ ] **DA IMPLEMENTARE**: Giorno default per frequenza "settimanale" (solo lunedì)
- [ ] **DA RIMUOVERE**: Opzione "custom" dal select frequenze dopo allineamento
- [ ] **DA MIGLIORARE**: Rimozione automatica categorie incompatibili quando temperatura cambia
- [ ] **DA IMPLEMENTARE**: Aggiornamento manutenzioni in modalità edit (attualmente vengono rigenerate)
- [ ] **DA MIGLIORARE**: Validazione più specifica per indicare quale manutenzione è incompleta
- [x] **REQUISITO UTENTE**: Modal centrato, interamente visibile e comodo da usare anche da telefono o tablet
- [x] **REQUISITO UTENTE**: Modal responsive con pulsanti e caselle di inserimento comode da cliccare
- [x] **REQUISITO UTENTE**: Testo ben leggibile su tutti i dispositivi
- [ ] **DA MIGLIORARE**: Gestione esplicita tastiera virtuale mobile (scroll automatico a input attivo)
- [ ] **DA TESTARE**: Verifica su dispositivi iOS e Android reali per comportamenti browser-specific

---

## 🧪 TESTING

### Test da Eseguire

1. **Test apertura/chiusura modal**:
   - Verificare che modal si apra quando `isOpen={true}`
   - Verificare che modal si chiuda quando `isOpen={false}`
   - Verificare che click su X chiuda modal
   - Verificare che click su "Annulla" chiuda modal
   - Verificare che click su backdrop chiuda modal (se implementato)

2. **Test precompilazione form (modalità edit)**:
   - Verificare che form venga precompilato con dati `point` esistente
   - Verificare che tutti i campi corrispondano ai dati del punto
   - Verificare che manutenzioni vengano caricate correttamente (quando implementato)

3. **Test inizializzazione form (modalità creazione)**:
   - Verificare che form venga inizializzato con valori di default
   - Verificare che manutenzioni obbligatorie vengano generate correttamente in base al tipo

4. **Test validazione**:
   - Verificare che validazione blocchi salvataggio se nome vuoto
   - Verificare che validazione blocchi salvataggio se reparto non selezionato
   - Verificare che validazione blocchi salvataggio se temperatura non valida
   - Verificare che validazione blocchi salvataggio se nessuna categoria selezionata
   - Verificare che validazione blocchi salvataggio se manutenzioni incomplete

5. **Test filtraggio categorie**:
   - Verificare che categorie vengano filtrate in base alla temperatura
   - Verificare che categorie non compatibili non vengano mostrate
   - Verificare che categorie già selezionate vengano rimosse se diventano incompatibili (quando implementato)

6. **Test validazione temperatura**:
   - Verificare che temperatura fuori range mostri errore specifico
   - Verificare che temperatura valida non mostri errore
   - Verificare che temperatura per tipo "ambient" sia impostata a 20°C

7. **Test configurazione manutenzioni**:
   - Verificare che manutenzioni obbligatorie vengano generate in base al tipo
   - Verificare che frequenza "giornaliera" mostri checkbox giorni con tutte selezionate di default (quando implementato)
   - Verificare che frequenza "settimanale" mostri checkbox giorni con solo lunedì selezionato di default (quando implementato)
   - Verificare che frequenza "mensile" mostri mini calendario (quando implementato)
   - Verificare che frequenza "annuale" mostri mini calendario solo per sbrinamento (quando implementato)

8. **Test responsive design e usabilità mobile/tablet**:
   - Verificare che modal sia centrato verticalmente e orizzontalmente su tutti i dispositivi
   - Verificare che modal sia interamente visibile senza tagli su schermi piccoli (max-height 95vh)
   - Verificare che tutto il contenuto sia leggibile e accessibile senza dover scrollare eccessivamente
   - Verificare che pulsanti abbiano dimensioni touch-friendly (min 44px x 44px) su mobile
   - Verificare che input/select abbiano altezza minima 44px su mobile
   - Verificare che font size input sia almeno 16px su mobile (previene zoom automatico iOS)
   - Verificare che testo sia ben leggibile su tutti i dispositivi (contrasto WCAG AA)
   - Verificare che footer sia sticky e sempre visibile anche durante scroll
   - Verificare che modal si adatti correttamente quando tastiera virtuale appare su mobile
   - Verificare che scroll interno funzioni correttamente se contenuto è lungo
   - Verificare su dispositivi reali iOS e Android per comportamenti specifici browser mobile

9. **Test salvataggio**:
   - Verificare che `onSave()` venga chiamato con dati corretti
   - Verificare che tipo punto venga auto-calcolato correttamente
   - Verificare che manutenzioni vengano incluse nel salvataggio

### Scenari di Test

**Scenario 1: Creazione punto completo**
- **Input**: Nome "Frigo Test", Reparto "Cucina", Tipologia "Frigorifero", Temperatura 4°C, Categorie ["Carni fresche", "Latticini"], 4 manutenzioni configurate
- **Output atteso**: `onSave()` chiamato con dati punto (type='fridge' auto-calcolato) + array 4 manutenzioni

**Scenario 2: Validazione temperatura fuori range**
- **Input**: Tipologia "Frigorifero", Temperatura 20°C (fuori range 0-8°C)
- **Output atteso**: Errore validazione mostrato "Temperatura 20°C non valida per frigorifero. Range consigliato: 0-8°C", salvataggio bloccato

**Scenario 3: Frequenza giornaliera con giorni default**
- **Input**: Seleziona frequenza "giornaliera" per una manutenzione
- **Output atteso**: Checkbox giorni settimana appaiono, tutte selezionate di default (Lun-Dom), utente può deselezionare giorni

**Scenario 4: Frequenza settimanale con giorno default**
- **Input**: Seleziona frequenza "settimanale" per una manutenzione
- **Output atteso**: Checkbox giorni settimana appaiono, solo lunedì selezionato di default, utente può selezionare altri giorni

**Scenario 5: Categoria incompatibile quando temperatura cambia**
- **Input**: Seleziona categoria "Carni fresche" (range 1-4°C) con temperatura 3°C, poi modifica temperatura a 10°C
- **Output atteso**: Warning mostrato con categoria incompatibile, opzione "Rimuovi categorie incompatibili" o "Modifica temperatura" (quando implementato)

**Scenario 6: Usabilità mobile - Modal centrato e visibile**
- **Input**: Apre modal su dispositivo mobile (iPhone/Android)
- **Output atteso**: Modal centrato verticalmente e orizzontalmente, interamente visibile senza tagli, tutto il contenuto leggibile senza scroll eccessivo, pulsanti e input comodi da toccare (44px altezza), font size 16px per input (no zoom automatico)

**Scenario 7: Tastiera virtuale su mobile**
- **Input**: Clicca su input in modal su dispositivo mobile, tastiera virtuale appare
- **Output atteso**: Modal si adatta all'altezza viewport ridotta, input attivo rimane visibile sopra tastiera (scroll automatico se necessario), footer rimane accessibile o si adatta dinamicamente

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/conservation/components/AddPointModal.tsx`
- **Componente interno**: `MaintenanceTaskForm` (nested component)
- **Parent Component**: `src/features/conservation/ConservationPage.tsx`
- **Form di riferimento più aggiornato**: `src/components/onboarding-steps/TasksStep.tsx` (da prendere come spunto per implementare frequenze complete)
- **Hook**: `src/features/conservation/hooks/useConservationPoints.ts`
- **Hook**: `src/features/management/hooks/useDepartments.ts`
- **Hook**: `src/features/management/hooks/useStaff.ts`
- **Hook**: `src/features/inventory/hooks/useCategories.ts`
- **Utilità**: `src/utils/onboarding/conservationUtils.ts`
- **Tipi**: `src/types/conservation.ts`

### Documentazione Correlata
- Documentazione ConservationPage: `CONSERVATION_PAGE.md`
- Documentazione ConservationPointCard: `CONSERVATION_POINT_CARD.md`
- Template standard: `00_TEMPLATE_STANDARD.md`

### Note Implementazione

**Riferimento TasksStep.tsx:**
- `TasksStep.tsx` è il form più aggiornato per configurazione manutenzioni
- Deve essere preso come spunto per implementare le frequenze complete in `AddPointModal`
- **Differenze da implementare**:
  - Mini calendario vero per mensile/annuale (TasksStep usa input numerico, ma specifica utente richiede vero calendario)
  - Giorni default per giornaliera (tutte selezionate) e settimanale (solo lunedì)
  - Rimozione opzione "custom" dopo allineamento

**Requisiti Responsive e Mobile/Tablet (SPECIFICHE UTENTE):**
Il modal deve essere **centrato, interamente visibile e comodo da usare anche da telefono o tablet**. Requisiti specifici da implementare nel codice:

1. **Centratura perfetta**:
   - Overlay: `fixed inset-0 flex items-center justify-center`
   - Modal container: Centrato automaticamente con flex
   - Padding responsive su overlay: `p-4` mobile, `p-6` desktop

2. **Visibilità completa su tutti i dispositivi**:
   - Max-height responsive: `max-h-[95vh]` mobile/desktop, `max-h-[90vh]` tablet
   - Width responsive: `w-full max-w-[95vw]` mobile, `w-full max-w-[90vw] sm:max-w-3xl` tablet, `max-w-4xl` desktop
   - Overflow gestito: `overflow-y-auto` sul contenuto form per scroll interno se necessario

3. **Dimensioni touch-friendly**:
   - Input/Select: `min-h-[44px] sm:min-h-[40px]` con padding `py-3 sm:py-2.5`
   - Pulsanti: `min-h-[44px] sm:min-h-[40px]` con padding `px-4 py-3 sm:px-4 sm:py-2.5`
   - Bottoni categoria: `min-h-[44px]` su mobile con padding generoso `p-3`
   - Spacing minimo `8px` (`gap-2`) tra elementi cliccabili

4. **Tipografia responsive e leggibile**:
   - Input font size: `text-base sm:text-sm` (16px mobile per prevenire zoom iOS, 14px desktop)
   - Label font size: `text-sm` (14px sempre)
   - Body font size: `text-sm sm:text-[15px]` (14px mobile, 15px tablet)
   - Titolo modal: `text-lg sm:text-xl` (18px mobile, 20px desktop)

5. **Layout responsive ottimizzato**:
   - Form campi: `grid-cols-1 md:grid-cols-2` (già presente)
   - Categorie: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (già presente)
   - Manutenzioni: Stack verticale mobile, grid desktop se possibile

6. **Footer sticky e responsive**:
   - Footer: `sticky bottom-0 bg-white border-t z-10`
   - Layout responsive: `flex-col gap-3 sm:flex-row sm:gap-3` (stack mobile, affiancati desktop)
   - Padding responsive: `px-4 py-4 sm:px-6 sm:py-4`

7. **Scroll ottimizzato mobile**:
   - Aggiungere CSS: `-webkit-overflow-scrolling: touch` per scroll fluido iOS
   - Scroll automatico a input attivo quando riceve focus su mobile

8. **Gestione tastiera virtuale**:
   - Quando tastiera appare, modal deve adattarsi dinamicamente
   - Input attivo deve rimanere visibile sopra tastiera (scroll automatico)
   - Usare `window.innerHeight` dinamico o hook custom per viewport height ridotta

**Note implementazione codice:**
- Tutti i requisiti responsive devono essere implementati usando classi Tailwind responsive (`sm:`, `md:`, `lg:`)
- Verificare che ogni input/select/pulsante abbia le classi responsive appropriate
- Testare su dispositivi iOS e Android reali per verificare comportamenti browser-specific

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- `useMemo` per calcoli `departmentOptions`, `typeInfo`, `compatibleCategories` (evita ricalcoli inutili)
- `useEffect` con dipendenze specifiche per evitare re-render inutili

**Considerazioni performance:**
- Filtraggio categorie: Ricalcola ogni volta che temperatura cambia (potrebbe essere costoso se molte categorie)
- Manutenzioni: Array viene ricreato quando tipo punto cambia (ok per pochi elementi)

**Miglioramenti proposti:**
- Debounce validazione temperatura per evitare troppi ricalcoli mentre utente digita
- Memoizzare funzioni helper se diventano pesanti

### Sicurezza

**Validazioni sicurezza:**
- Input sanitization: Gestita da Supabase (prepara statement)
- XSS prevention: React escape automaticamente i valori
- RLS policies: Tutte le query sono filtrate automaticamente per `company_id`

**Sanitizzazione input:**
- Nome punto: Validato come stringa non vuota, ma nessuna validazione lunghezza massima
- Temperatura: Validata come numero, range controllato
- Categorie: Array di string, validato lato client (da validare anche lato server contro whitelist)

**Autorizzazioni:**
- Creazione/modifica: Solo manager/admin (RLS policy)
- Visualizzazione reparti/staff/categorie: Tutti i membri azienda (RLS policy)

**Miglioramenti proposti:**
- Validare lunghezza massima nome punto (es. 100 caratteri)
- Validare categorie contro whitelist per prevenire injection
- Sanitizzare note manutenzioni (escape caratteri speciali)

### Limitazioni

**Limitazioni conosciute:**
1. **Modal z-index insufficiente (CRITICO)**: Il modal AddPointModal usa `z-50` invece di `z-[9999]`, quindi appare ancora sotto la dashboard/header. **DA RISOLVERE** - AddTemperatureModal ha già fix applicato (z-[9999]), AddPointModal no.
2. **Temperatura target input manuale invece range predefinito (CRITICO)**: Il campo temperatura target permette inserimento manuale invece di mostrare range predefinito basato sulla tipologia. Quando utente seleziona tipologia, temperatura dovrebbe essere preimpostata con range (es. "4°C" con range 1-8°C per frigorifero). **DA IMPLEMENTARE**
3. **Select ruolo non funzionante (CRITICO)**: Il select "Seleziona ruolo..." nel form manutenzioni (MaintenanceTaskForm) non permette selezione opzioni - non risponde ai click. **DA RISOLVERE** - Blocca completamento form manutenzioni.
4. **Campi Categoria e Dipendente Specifico non visibili (CRITICO)**: I campi "Categoria Staff" e "Dipendente Specifico" sono presenti nel codice (linee 207-265) ma non sono visibili/funzionanti nel form manutenzioni di AddPointModal. Sono presenti invece nel modal onboarding (TasksStep). Condizione `task.assegnatoARuolo` probabilmente non viene soddisfatta a causa del problema #3. **DA RISOLVERE**
5. **Mini calendario per mensile/annuale non implementato**: Attualmente non esiste componente calendario. TasksStep usa input numerico, ma specifica utente richiede vero calendario. **DA IMPLEMENTARE**
6. **Giorni default non implementati correttamente**: Frequenza "giornaliera" dovrebbe avere tutte le checkbox selezionate di default, "settimanale" solo lunedì. **DA IMPLEMENTARE**
7. **Frequenza "custom" ancora presente**: Dovrebbe essere rimossa dopo allineamento altre frequenze. **DA RIMUOVERE**
8. **Categorie incompatibili non rimosse automaticamente**: Quando temperatura cambia, categorie già selezionate non vengono rimosse se diventano incompatibili. **DA MIGLIORARE**
9. **Manutenzioni non aggiornate in modalità edit**: In modalità modifica, le manutenzioni vengono rigenerate invece di caricare quelle esistenti. **DA IMPLEMENTARE**
10. **Transazione non atomica**: Creazione punto + manutenzioni non è atomica. Se manutenzioni falliscono, punto rimane senza manutenzioni. **DA MIGLIORARE**
11. **Validazione manutenzioni non specifica**: Se manutenzioni incomplete, errore generico non indica quale manutenzione è incompleta. **DA MIGLIORARE**
12. **Compatibilità categorie non considera tipo punto**: Filtro categorie considera solo temperatura, non tipo punto (`storage_type`). **DA MIGLIORARE**

**Limitazioni tecniche:**
- Focus trap non implementato: Focus può uscire dal modal quando aperto (da implementare)
- Escape key handler non implementato: Escape non chiude modal (da implementare)
- Scroll automatico a errori non implementato: Se form ha errori, utente deve scrollare manualmente per trovarli
- **Gestione tastiera virtuale mobile**: Attualmente non gestita esplicitamente - quando tastiera appare, viewport height si riduce e potrebbe nascondere input attivo (da migliorare con scroll automatico o adattamento dinamico)
- **Viewport units su mobile**: `vh` unit potrebbe non funzionare correttamente su browser mobile quando tastiera appare (usare `window.innerHeight` o libreria dedicata)
- **Test su dispositivi reali**: Necessario testare su dispositivi iOS e Android reali per verificare comportamenti browser-specific

**Limitazioni responsive e usabilità mobile/tablet:**
1. **Input/Select altezza mobile**: Attualmente input e select non hanno altezza minima esplicita `44px` su mobile. **DA IMPLEMENTARE**: Aggiungere `min-h-[44px]` class su mobile per touch-friendly.
2. **Font size input mobile**: Attualmente font size input potrebbe essere inferiore a 16px su mobile, causando zoom automatico iOS. **DA IMPLEMENTARE**: Assicurarsi che font size input sia almeno `16px` (usare `text-base` invece di `text-sm` su mobile).
3. **Pulsanti touch-friendly**: Attualmente pulsanti hanno padding `px-4 py-2` che potrebbe non raggiungere 44px altezza minima. **DA IMPLEMENTARE**: Aggiungere `min-h-[44px]` su mobile per pulsanti.
4. **Modal width mobile**: Attualmente modal ha `max-w-4xl` che potrebbe essere troppo stretto su mobile con padding. **DA IMPLEMENTARE**: Su mobile, usare `w-full` con padding laterale (`p-4`) invece di max-width.
5. **Footer responsive**: Attualmente footer usa `flex-row` sempre. **DA MIGLIORARE**: Su mobile, considerare `flex-col` (pulsanti stackati) se larghezza insufficiente.
6. **Scroll interno ottimizzato**: Attualmente form ha `overflow-y-auto` ma potrebbe non essere ottimizzato per scroll fluido su mobile. **DA MIGLIORARE**: Assicurarsi che scroll sia fluido e naturale con `-webkit-overflow-scrolling: touch` per iOS.
7. **Padding responsivo**: Attualmente padding è `p-6` sempre. **DA MIGLIORARE**: Su mobile usare `p-4`, tablet `p-5`, desktop `p-6`.
8. **Grid responsive categorie**: Attualmente usa `md:grid-cols-2 lg:grid-cols-3`. **OK** ma verificare che bottoni categoria abbiano min `44px` altezza su mobile.

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Implementare mini calendario**: Componente calendario per selezionare giorno mese (1-31) o giorno anno (1-365) per frequenze mensile/annuale
2. **Implementare giorni default**: Giornaliera con tutte checkbox selezionate, settimanale con solo lunedì
3. **Rimuovere frequenza "custom"**: Dopo allineamento altre frequenze, rimuovere opzione custom
4. **Rimozione automatica categorie incompatibili**: Quando temperatura cambia, rimuovere categorie non più compatibili con warning
5. **Aggiornamento manutenzioni in edit**: Caricare manutenzioni esistenti in modalità modifica invece di rigenerarle
6. **Compatibilità tipo punto per categorie**: Considerare `storage_type` dalla categoria per filtraggio compatibilità

**Miglioramenti tecnici:**
1. **Transazione atomica**: Usare transazione esplicita per creazione punto + manutenzioni
2. **Validazione più specifica**: Indicare quale manutenzione è incompleta nella validazione
3. **Focus trap**: Implementare focus trap quando modal aperto
4. **Escape key handler**: Implementare Escape key per chiudere modal
5. **Scroll automatico a errori**: Scroll automatico al primo campo con errore quando validazione fallisce
6. **Debounce validazione**: Debounce validazione temperatura mentre utente digita

**Miglioramenti UX:**
1. **Skeleton loading**: Mostrare skeleton loading mentre departments/staff/categories caricano
2. **Auto-save draft**: Salvare draft form in localStorage per recuperare dati se modal viene chiuso accidentalmente
3. **Conferma uscita**: Mostrare conferma se utente ha modificato form e chiude modal
4. **Tutorial interattivo**: Guida interattiva per nuovi utenti su come configurare punto completo
5. **Preview punto**: Anteprima card punto prima di salvare (mostra come apparirà nella lista)
6. **Mobile/Tablet UX specifici**:
   - **Gestione tastiera virtuale**: Quando tastiera appare su mobile, modal deve adattarsi (non nascondere input attivo). Usare `window.innerHeight` dinamico o hook `useViewportHeight()` per gestire altezza viewport ridotta quando tastiera appare.
   - **Scroll automatico a input attivo**: Quando input riceve focus, scroll automatico per renderlo visibile sopra tastiera. Implementare `scrollIntoView({ behavior: 'smooth', block: 'center' })` su focus input.
   - **Disabilitare zoom su focus input**: Font-size 16px minimo (`text-base`) per input su mobile previene zoom automatico iOS. Già implementato parzialmente, verificare che sia applicato a tutti gli input.
   - **Backdrop dismissible**: Su mobile, considerare di permettere chiusura modal cliccando backdrop (se non ci sono modifiche non salvate). Aggiungere gestione click backdrop con controllo stato form modificato.
   - **Pulsanti footer sempre visibili**: Footer sticky (`sticky bottom-0`) garantisce accesso a Salva/Annulla sempre visibile anche durante scroll. Già implementato, verificare che funzioni correttamente su mobile con tastiera aperta.
   - **Touch feedback visibile**: Su mobile, aggiungere active states (`active:bg-blue-800`) per feedback visivo quando utente tocca pulsanti/categorie.
   - **Spacing ottimizzato per touch**: Assicurarsi che spacing tra elementi cliccabili sia almeno 8px per evitare toccate accidentali (già presente `gap-2` = 8px, verificare che sia sufficiente).

**Note sulle Categorie Prodotti:**
- **NOTA IMPORTANTE**: Le categorie prodotti attualmente implementate sono placeholder
- Devono essere **approfondite e rese definitive** per coprire:
  - La maggior parte degli ingredienti disponibili
  - Le principali preparazioni da cucina
  - Tutte le categorie HACCP standard per la ristorazione professionale
- La logica di compatibilità temperatura-categoria è implementata e funzionante, ma le categorie stesse devono essere definite meglio con input da esperti HACCP

---

**Ultimo Aggiornamento**: 2026-01-16  
**Versione**: 1.0.0

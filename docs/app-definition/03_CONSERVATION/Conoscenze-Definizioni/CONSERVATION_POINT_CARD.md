> **Stato Fase 3** (2026-07-06): `verificato-ok` · Fonte: [`FASE3_REPORT_A2`](../../META/FASE3_REPORT_A2_CONSERVATION.md) §5.5  
> **Motivo**: check-up card v2.1 allineato a codice verificato in Fase 3.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# CONSERVATION_POINT_CARD - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16
**Ultima Modifica**: 2026-02-04
**Versione**: 2.1.0
**File Componente**: `src/features/conservation/components/ConservationPointCard.tsx`
**Tipo**: Componente

**Nuove Features (v2.1.0 - 04-02-2026)**:
- ✅ **Box "Ultima lettura" – colore solo da temperatura**: Il box "Ultima lettura" usa **solo** la conformità della temperatura (setpoint ±1°C) per il colore: **verde** = temperatura conforme (`checkup.temperature.inRange`), **rosso (critico)** = temperatura fuori range. Lo stato complessivo del punto (manutenzioni in attenzione/arretrate) non influenza il colore di questo box. Variabile `temperatureBadgeColors` derivata da `checkup.temperature.inRange`.

**Nuove Features (v2.0.0 - 01-02-2026)**:
- ✅ **Check-up Centralizzato**: Usa `getPointCheckup()` per calcolo stato basato su temperatura + manutenzioni
- ✅ **Real-time Updates**: Aggiornamento automatico quando utenti completano manutenzioni (via `useConservationRealtime`)
- ✅ **UI Due Box**: Quando entrambi problemi (temperatura + manutenzioni), mostrati in box separati con click handlers
- ✅ **Gravità Arretrati**: Indicatori colorati per task arretrati (rosso >7 giorni, arancione 3-7, giallo 1-3, grigio <1)
- ✅ **Dettagli Espandibili**: Pulsante "Mostra/Nascondi dettagli" per lista manutenzioni arretrate
- ✅ **Focus Handlers**: `onFocusTemperatureCard` per navigazione a sezione temperature

**Features Precedenti (v1.1.0)**:
- ✅ Visualizzazione profilo HACCP quando presente
- ✅ Icona ShieldCheck per profilo
- ✅ Label leggibile del profilo selezionato

---

## 🎯 SCOPO

### Scopo Business
La card `ConservationPointCard` permette all'utente di visualizzare rapidamente le informazioni essenziali di un punto di conservazione in formato compatto. Rappresenta l'elemento visivo principale per consultare lo stato di ogni punto di conservazione nella pagina Conservazione.

Questa card risolve il bisogno di avere una vista rapida e completa di ogni punto, con tutte le informazioni critiche per il monitoraggio HACCP visibili a colpo d'occhio, inclusi i profili HACCP selezionati per i frigoriferi (nuova feature v1.1.0).

### Scopo Tecnico
La card è un componente React riutilizzabile che:

- **Visualizza** informazioni essenziali di un punto di conservazione (nome, reparto, tipo, temperatura target, stato)
- **Calcola stato centralizzato** tramite `getPointCheckup()` considerando temperatura + manutenzioni
- **Mostra** l'ultima lettura di temperatura registrata (se disponibile)
- **Indica** lo stato del punto (Regolare/Attenzione/Critico) con colori distintivi
- **Mostra profilo HACCP** selezionato quando presente (v1.1.0) con icona ShieldCheck e label leggibile
- **Mostra problemi multipli** in box separati quando presenti sia problemi temperatura che manutenzioni (v2.0.0)
- **Espande dettagli manutenzioni** arretrate con indicatori gravità colorati (v2.0.0)
- **Si aggiorna in real-time** quando altri utenti completano manutenzioni (v2.0.0)
- **Permette** azioni rapide (modifica, eliminazione) tramite pulsanti icona
- **Espone** dettagli aggiuntivi tramite sezione collassabile "Mostra dettagli"

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
La card viene utilizzata quando:

- La pagina `ConservationPage` renderizza la lista dei punti di conservazione
- I punti sono organizzati per tipo (Frigoriferi, Freezer, Abbattitori, Ambiente/Dispensa)
- Ogni punto viene visualizzato come una card in una griglia responsive (1 colonna mobile, 2 colonne desktop)

**Contesto di utilizzo:**
- Renderizzato in loop per ogni punto filtrato per tipo
- Presente all'interno di `CollapsibleCard` annidati nella pagina Conservazione
- Ordinato alfabeticamente per nome (`sort((a, b) => a.name.localeCompare(b.name))`)

### Casi d'Uso Principali

1. **Consultazione stato punto**
   - **Scenario**: Un responsabile HACCP vuole verificare rapidamente lo stato di tutti i frigoriferi
   - **Azione**: Guarda la sezione "Frigoriferi" e vede le card con stato colorato (verde = regolare, giallo = attenzione, rosso = critico)
   - **Risultato**: Identifica immediatamente quali punti richiedono attenzione

2. **Verifica ultima lettura temperatura**
   - **Scenario**: Un dipendente vuole verificare quando è stata fatta l'ultima lettura di temperatura
   - **Azione**: Guarda la card del punto e vede la sezione "Ultima lettura" con temperatura e data/ora
   - **Risultato**: Verifica se la lettura è recente o se è necessario effettuarne una nuova

3. **Modifica rapida punto**
   - **Scenario**: Un manager vuole modificare la temperatura target di un frigorifero
   - **Azione**: Clicca l'icona edit (matita) sulla card del punto
   - **Risultato**: Si apre il modal `AddPointModal` in modalità edit con i dati precompilati

4. **Visualizzazione categorie prodotti**
   - **Scenario**: Un responsabile vuole verificare quali categorie di prodotti sono associate a un punto
   - **Azione**: Guarda la card e vede la sezione "Categorie prodotti" con i badge delle categorie
   - **Risultato**: Verifica che il punto sia configurato correttamente per le categorie necessarie

5. **Visualizzazione profilo HACCP (nuova feature v1.1.0)**
   - **Scenario**: Un manager vuole verificare quale profilo HACCP è stato selezionato per un frigorifero
   - **Azione**: Guarda la card del punto frigorifero e vede la sezione profilo con icona ShieldCheck e nome profilo (es. "Profilo Carne + Generico")
   - **Risultato**: Verifica che il punto sia configurato correttamente con il profilo HACCP appropriato

6. **Visualizzazione informazioni complete** (feature futura)
   - **Scenario**: Un utente vuole vedere informazioni dettagliate sul punto (manutenzioni assegnate, ingredienti associati)
   - **Azione**: **DA IMPLEMENTARE** - Clicca su un elemento della card (da definire meglio cosa visualizzare e come)
   - **Risultato**: Viene visualizzata una vista dettagliata con tutte le informazioni complete

### Flusso Utente

**Flusso consultazione:**
1. Utente visualizza la lista di punti nella pagina Conservazione
2. Utente vede le card organizzate per tipo
3. Utente identifica visivamente lo stato di ogni punto tramite colori
4. Utente legge informazioni essenziali (nome, reparto, temperatura, stato)
5. Utente può cliccare "Mostra dettagli" per vedere informazioni aggiuntive

**Flusso modifica:**
1. Utente clicca icona edit (matita) sulla card
2. `onEdit(point)` viene chiamato con il punto selezionato
3. Il parent component (`ConservationPage`) apre il modal `AddPointModal` in modalità edit
4. Utente modifica i dati e salva
5. La card si aggiorna automaticamente con i nuovi dati

**Flusso eliminazione:**
1. Utente clicca icona delete (cestino) sulla card
2. `onDelete(point.id)` viene chiamato
3. Il parent component mostra dialog di conferma
4. Se confermato, il punto viene eliminato e la card viene rimossa dalla lista

**Flusso visualizzazione dettagli:**
1. Utente clicca "Mostra dettagli" sulla card
2. `showDetails` state viene toggleato a `true`
3. Sezione dettagli viene mostrata con:
   - Temperatura ottimale per il tipo
   - Indicatore "Abbattitore attivo" se applicabile
   - Data di creazione del punto

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Stato calcolato vs stato reale
- **Quando si verifica**: Lo stato visualizzato nella card potrebbe non corrispondere allo stato reale se ci sono state modifiche recenti
- **Cosa succede**: ✅ **RISOLTO (v2.0.0)** - Con `useConservationRealtime()` la card si aggiorna automaticamente in real-time
- **Come viene gestito**: Hook `useConservationRealtime` sottoscrive 3 canali Supabase Realtime:
  - `temperature_readings` - invalida cache quando nuove temperature registrate
  - `maintenance_completions` - invalida cache quando manutenzioni completate
  - `maintenance_tasks` - invalida cache quando task modificati/creati
- **Esempio**: Utente A vede "Regolare". Utente B registra temperatura fuori range. Utente A vede aggiornamento automatico entro 1-2 secondi.

#### Conflitto 2: Ultima lettura non sincronizzata
- **Quando si verifica**: ✅ **RISOLTO (v2.0.0)** - Real-time updates mantengono sincronizzazione
- **Cosa succede**: La card si aggiorna automaticamente quando altri utenti registrano temperature
- **Come viene gestito**: Supabase Realtime subscription su `temperature_readings` table con filter `company_id`
- **Esempio**: Utente A vede "4°C alle 10:00". Utente B registra 6°C alle 10:30. Utente A vede "6°C alle 10:30" automaticamente entro 1-2 secondi.

### Conflitti Multi-Utente

**Visualizzazione simultanea:**
- **Comportamento attuale**: Non c'è conflitto - tutti gli utenti possono visualizzare le card contemporaneamente senza problemi
- **Comportamento corretto**: Le card sono read-only dal punto di vista della visualizzazione, quindi non ci sono conflitti

**Modifica simultanea:**
- **Comportamento attuale**: Se due utenti modificano lo stesso punto contemporaneamente, l'ultimo salvataggio vince
- **Rischio**: Perdita di modifiche se due utenti modificano campi diversi
- **Gestione**: Vedi conflitti gestiti nel parent component (`ConservationPage`)

### Conflitti di Sincronizzazione

Non applicabile - la card è un componente di visualizzazione che legge dati dal parent. La sincronizzazione è gestita a livello di pagina.

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
La card viene generata automaticamente quando:

- Il parent component (`ConservationPage`) renderizza la lista dei punti
- Ogni punto viene trasformato in una card tramite `.map()` sull'array `conservationPoints`

**Trigger di rendering:**
- Mount del parent component
- Aggiornamento array `conservationPoints` (dopo create/update/delete)
- Filtraggio punti per tipo (trigger re-render per organizzazione)

### Generazione Manuale
Non applicabile - la card viene sempre generata automaticamente dal parent component.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. `point: ConservationPoint` - oggetto punto valido con tutti i campi necessari
2. `onEdit: (point: ConservationPoint) => void` - callback per modifica
3. `onDelete: (id: string) => void` - callback per eliminazione

**Condizioni opzionali:**
- `point.last_temperature_reading` - se presente, viene visualizzata la sezione "Ultima lettura"
- `point.maintenance_due` - se presente, viene visualizzata la sezione "Prossima manutenzione"
- `point.product_categories` - se presente, vengono visualizzati i badge delle categorie
- `point.profile_id` - se presente, viene visualizzata la sezione profilo HACCP (nuova feature v1.1.0)

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

```typescript
import { useState } from 'react'
import { ConservationPoint, CONSERVATION_COLORS, CONSERVATION_TYPE_COLORS, TEMPERATURE_RANGES, ConservationProfileId } from '@/types/conservation'
import { Thermometer, Calendar, AlertTriangle, CheckCircle, Edit, Trash2, MapPin, ShieldCheck } from 'lucide-react'
import { PROFILE_LABELS } from '@/utils/conservationProfiles'

interface ConservationPointCardProps {
  point: ConservationPoint
  onEdit: (point: ConservationPoint) => void
  onDelete: (id: string) => void
}

export function ConservationPointCard({ point, onEdit, onDelete }: ConservationPointCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  // Calcoli colore in base a tipo e stato
  // Funzioni helper per icona tipo, nome tipo, icona stato, testo stato
  // Render
}
```

### Props Richieste

| Prop | Tipo | Obbligatoria | Default | Descrizione |
|------|------|--------------|---------|-------------|
| `point` | `ConservationPoint` | ✅ | - | Oggetto punto di conservazione completo con tutte le informazioni |
| `onEdit` | `(point: ConservationPoint) => void` | ✅ | - | Callback chiamato quando utente clicca icona edit |
| `onDelete` | `(id: string) => void` | ✅ | - | Callback chiamato quando utente clicca icona delete |

### State Management

**State locale (useState):**
- `showDetails: boolean` - controlla visibilità sezione dettagli aggiuntivi (default: `false`)

**State derivato:**
- `typeColors: object` - colori CSS in base al tipo di punto (calcolato da `CONSERVATION_TYPE_COLORS[point.type]`)
- `statusColors: object` - colori CSS in base allo stato (calcolato da `CONSERVATION_COLORS[point.status]`)
- `tempRange: object` - range temperatura per il tipo (calcolato da `TEMPERATURE_RANGES[point.type]`)

**State esterno (props):**
- `point` - dati punto (gestito dal parent component)
- `onEdit`, `onDelete` - callback gestiti dal parent component

### Hooks Utilizzati

Nessun hook custom utilizzato. Il componente usa solo:
- `useState` di React per gestire `showDetails`
- Funzioni helper per calcolare colori e testi in base ai tipi

### Funzioni Principali

#### `getPointCheckup()` (v2.0.0 - CENTRALIZZATO)
- **Scopo**: Calcola stato completo del punto considerando temperatura + manutenzioni
- **File**: `src/features/conservation/utils/pointCheckup.ts`
- **Parametri**:
  - `point: ConservationPoint` - punto di conservazione con ultima lettura
  - `tasks: MaintenanceTask[]` - array task manutenzione per il punto
- **Ritorna**: `ConservationPointCheckup` - oggetto con:
  - `overallStatus`: 'normal' | 'warning' | 'critical'
  - `temperature`: { inRange, message?, lastReading? }
  - `todayMaintenance`: { allCompleted, total, completed, pending[] }
  - `overdueMaintenance`: { count, tasks[] con daysOverdue e severity }
  - `messages`: { temperature?, maintenance?, priority: 'temperature' | 'maintenance' | 'both' }
  - `nextMaintenanceDue`: { task, daysUntil }
- **Logica**:
  1. Verifica temperatura fuori range (±1°C tolleranza)
  2. Filtra task "oggi" considerando orario (`taskDate <= now`)
  3. Calcola task arretrati con severità (critical >7gg, high 3-7gg, medium 1-3gg, low <1gg)
  4. Determina `overallStatus`: critical (entrambi problemi), warning (uno dei due), normal (tutto ok)
  5. Genera messaggi per UI con priorità (temperature/maintenance/both)
  6. Trova prossima manutenzione futura (solo se oggi completato)

**Esempio output**:
```typescript
{
  overallStatus: 'warning',
  temperature: { inRange: true },
  todayMaintenance: { allCompleted: false, total: 2, completed: 1, pending: [task1] },
  overdueMaintenance: { count: 1, tasks: [{ ...task, daysOverdue: 3, severity: 'high' }] },
  messages: {
    maintenance: '1 arretrato (3 giorni fa), 1 pendente oggi',
    priority: 'maintenance'
  },
  nextMaintenanceDue: { task: futureTask, daysUntil: 5 }
}
```

#### `getTypeIcon()`
- **Scopo**: Ritorna l'emoji/icona appropriata per il tipo di punto
- **Parametri**: nessuno (usa `point.type`)
- **Ritorna**: `string` - emoji corrispondente al tipo
- **Logica**:
  ```typescript
  switch (point.type) {
    case 'ambient': return '🌡️'
    case 'fridge': return '❄️'
    case 'freezer': return '🧊'
    case 'blast': return '⚡'
    default: return '📦'
  }
  ```

#### `getTypeName()`
- **Scopo**: Ritorna il nome italiano del tipo di punto
- **Parametri**: nessuno (usa `point.type`)
- **Ritorna**: `string` - nome tipo in italiano
- **Logica**: 
  ```typescript
  switch (point.type) {
    case 'ambient': return 'Ambiente'
    case 'fridge': return 'Frigorifero'
    case 'freezer': return 'Freezer'
    case 'blast': return 'Abbattitore'
    default: return 'Non definito'
  }
  ```

#### `getStatusIcon()`
- **Scopo**: Ritorna l'icona React (lucide-react) appropriata per lo stato
- **Parametri**: nessuno (usa `point.status`)
- **Ritorna**: `JSX.Element` - icona CheckCircle (verde) per normal, AlertTriangle (giallo/rosso) per warning/critical
- **Logica**: 
  ```typescript
  switch (point.status) {
    case 'normal': return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />
  }
  ```

#### `getStatusText()`
- **Scopo**: Ritorna il testo italiano dello stato
- **Parametri**: nessuno (usa `point.status`)
- **Ritorna**: `string` - testo stato in italiano ("Regolare", "Attenzione", "Critico")
- **Logica**: 
  ```typescript
  switch (point.status) {
    case 'normal': return 'Regolare'
    case 'warning': return 'Attenzione'
    case 'critical': return 'Critico'
  }
  ```

### Validazioni

**Validazioni prop:**
- Nessuna validazione esplicita delle props (TypeScript garantisce i tipi)
- Se `point` è null/undefined, il componente potrebbe crashare (dovrebbe essere gestito dal parent)

**Validazioni rendering condizionale:**
- `point.last_temperature_reading` viene verificato prima di renderizzare la sezione "Ultima lettura"; il colore del box (verde/rosso) è dato da `temperatureBadgeColors` (solo conformità temperatura, v2.1.0)
- `point.maintenance_due` viene verificato prima di renderizzare la sezione "Prossima manutenzione"
- `point.product_categories` viene verificato e la lunghezza controllata prima di renderizzare i badge

**Validazioni valori:**
- Nessuna validazione esplicita di valori (assumiamo che i dati dal database siano validi)
- Se `point.setpoint_temp` è null/undefined, viene mostrato come NaN nel rendering

### Gestione Errori

**Errori di rendering:**
- **Quando**: Valori null/undefined o dati mancanti
- **Cosa succede**: Il componente potrebbe renderizzare valori vuoti o "NaN"
- **UI**: Nessun feedback visivo di errore
- **Logging**: Nessun logging di errori

**Soluzione proposta**: Aggiungere validazione delle props e fallback per valori mancanti:
- Se `point.setpoint_temp` è null, mostrare "Non impostato"
- Se `point.department` è null, mostrare "Reparto non assegnato" (già presente)
- Se `point.product_categories` è vuoto, mostrare "Nessuna categoria" invece di sezione vuota

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────┐
│ Header: Nome + Tipo + Stato + Azioni             │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Icona Tipo] Nome Punto                   │ │
│ │    📍 Reparto    [Badge Tipo]             │ │
│ │    🛡️ Profilo HACCP (se presente)        │ │
│ │                          [Icona Stato] ✏️ 🗑️ │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Info Temperatura e Stato                         │
│ ┌──────────────┐  ┌──────────────┐            │
│ │ 🌡️          │  │ ●            │            │
│ │ Temp target  │  │ Stato        │            │
│ │ 2°C          │  │ Regolare     │            │
│ └──────────────┘  └──────────────┘            │
├─────────────────────────────────────────────────┤
│ Ultima Lettura (condizionale)                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Ultima lettura: 4°C    15/01/2026 10:30    │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Prossima Manutenzione (condizionale)            │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📅 Prossima manutenzione: 20/01/2026       │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Categorie Prodotti (condizionale)                │
│ ┌─────────────────────────────────────────────┐ │
│ │ Categorie prodotti:                         │ │
│ │ [Carni fresche] [Latticini] [Bevande]      │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Dettagli (collassabile)                          │
│ [Mostra dettagli / Nascondi dettagli]           │
│ ┌─────────────────────────────────────────────┐ │
│ │ (Se espanso)                                │ │
│ │ Temperatura ottimale: 0-8°C                 │ │
│ │ ⚡ Abbattitore attivo (se applicabile)      │ │
│ │ Creato il: 10/01/2026 09:00                │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 640px):**
- Card full-width (1 colonna nella griglia)
- Header con elementi stackati verticalmente
- Info temperatura e stato: grid 1 colonna (stackati)
- Pulsanti azione: dimensione ridotta (`w-4 h-4`)
- Categorie prodotti: wrap su più righe

**Tablet (640px - 1024px):**
- Card full-width o 1 colonna (dipende dalla griglia parent)
- Header con layout orizzontale compatto
- Info temperatura e stato: grid 2 colonne (affiancati)

**Desktop (> 1024px):**
- Card in griglia 2 colonne (`lg:grid-cols-2`)
- Layout ottimizzato con più spazio
- Pulsanti azione: dimensione standard (`w-4 h-4`)

### Styling

**Colori principali:**
- Background card: `bg-[type]-50` (dipende dal tipo - sky/indigo/purple/emerald)
- Border: `border-2 border-[type]-300` (dipende dal tipo)
- Hover: `hover:shadow-md transition-all duration-200`

**Colori per tipo:**
- **Frigorifero** (`fridge`): `bg-sky-50`, `border-sky-300`, `text-sky-700`
- **Freezer** (`freezer`): `bg-indigo-50`, `border-indigo-300`, `text-indigo-700`
- **Abbattitore** (`blast`): `bg-purple-50`, `border-purple-300`, `text-purple-700`
- **Ambiente** (`ambient`): `bg-emerald-50`, `border-emerald-300`, `text-emerald-700`

**Colori per stato:**
- **Regolare** (`normal`): `text-green-600`, `bg-green-100`, `border-green-200`
- **Attenzione** (`warning`): `text-yellow-600`, `bg-yellow-100`, `border-yellow-200`
- **Critico** (`critical`): `text-red-600`, `bg-red-100`, `border-red-200`

**Spaziature:**
- Padding card: `p-4` (16px)
- Spazio interno header: `mb-3` (12px)
- Spazio tra sezioni: `mb-3` (12px)
- Gap grid info: `gap-4` (16px)

**Tipografia:**
- Nome punto: `font-semibold` (medium weight)
- Reparto: `text-sm text-gray-600`
- Temperatura target: `font-semibold`
- Stato: `font-semibold`

**Effetti hover/focus:**
- Card hover: `hover:shadow-md transition-all duration-200`
- Pulsanti azione: `hover:text-blue-600` (edit), `hover:text-red-600` (delete)
- Pulsante dettagli: `hover:text-blue-800 transition-colors`

### Accessibilità

**ARIA labels utilizzati:**
- Nessun label ARIA esplicito (da migliorare)
- Icone hanno `aria-hidden="true"` (non accessibili a screen reader)
- Pulsanti edit/delete non hanno `aria-label` descrittivi (da aggiungere)

**Keyboard navigation:**
- Pulsanti edit/delete: focusabili con Tab, attivabili con Enter/Space
- Pulsante "Mostra dettagli": focusabile con Tab, attivabile con Enter/Space
- Nessun elemento non-focusabile che dovrebbe esserlo

**Screen reader support:**
- Testi informativi sono visibili (non solo icone)
- Stato visivo (colori) è accompagnato da testo ("Regolare", "Attenzione", "Critico")
- **Problema**: Icone senza testo alternativo potrebbero non essere accessibili

**Miglioramenti proposti:**
- Aggiungere `aria-label` ai pulsanti edit/delete: "Modifica [nome punto]", "Elimina [nome punto]"
- Aggiungere `aria-label` al pulsante dettagli: "Mostra dettagli per [nome punto]"
- Aggiungere `role="status"` alla sezione stato per screen reader
- Migliorare contrasto colori se necessario per WCAG AA

**Contrasto colori:**
- Colori stato: rispettano contrasto minimo (WCAG AA) con background
- Testo su background tipo: verificare contrasto per ogni tipo

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**: 
   - Il componente riceve `point` come prop dal parent
   - `useState(false)` inizializza `showDetails` a `false`
   - Vengono calcolati `typeColors`, `statusColors`, `tempRange` in base ai valori del punto

2. **Calcolo colori e testi**:
   - `typeColors` viene calcolato da `CONSERVATION_TYPE_COLORS[point.type]` con fallback a `ambient`
   - `statusColors` viene calcolato da `CONSERVATION_COLORS[displayedStatus]` (stato complessivo: normal/warning/critical) con fallback a `normal`; usato per header, box stato, box manutenzioni
   - `temperatureBadgeColors` (v2.1.0): derivato **solo** da `checkup.temperature.inRange` — verde se conforme, rosso se fuori range; usato **solo** per il box "Ultima lettura" (non dalle manutenzioni)
   - `tempRange` viene calcolato da `TEMPERATURE_RANGES[point.type]` con fallback a `ambient`

3. **Rendering condizionale**:
   - Header viene sempre renderizzato con nome, reparto, tipo, stato, azioni
   - Info temperatura e stato vengono sempre renderizzate
   - "Profilo HACCP" viene renderizzato solo se `point.profile_id` esiste (nuova feature v1.1.0)
   - "Ultima lettura" viene renderizzata solo se `point.last_temperature_reading` esiste
   - "Prossima manutenzione" viene renderizzata solo se `point.maintenance_due` esiste
   - "Categorie prodotti" viene renderizzata solo se `point.product_categories` esiste e ha elementi
   - "Dettagli" viene renderizzato solo se `showDetails === true`

4. **Interazione utente - Toggle dettagli**:
   - Utente clicca "Mostra dettagli" / "Nascondi dettagli"
   - `setShowDetails(!showDetails)` viene chiamato
   - Componente re-renderizza con sezione dettagli visibile/nascosta

5. **Interazione utente - Modifica**:
   - Utente clicca icona edit (matita)
   - `onEdit(point)` viene chiamato
   - Il parent component (`ConservationPage`) gestisce l'apertura del modal

6. **Interazione utente - Eliminazione**:
   - Utente clicca icona delete (cestino)
   - `onDelete(point.id)` viene chiamato
   - Il parent component gestisce il dialog di conferma e l'eliminazione

### Integrazione Database

**Dati utilizzati:**
- Il componente **non** accede direttamente al database
- I dati vengono passati come prop `point: ConservationPoint` dal parent component
- Il parent component (`ConservationPage`) carica i dati tramite `useConservationPoints()` hook

**Struttura dati punto:**
```typescript
interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories: string[]
  status: 'normal' | 'warning' | 'critical'
  is_blast_chiller: boolean
  last_temperature_reading?: {
    temperature: number
    recorded_at: Date
  }
  maintenance_due?: Date
  department?: {
    id: string
    name: string
  }
}
```

**Aggiornamenti automatici:**
- Quando il parent component aggiorna `conservationPoints` array, il componente riceve nuovo `point` prop
- React re-renderizza automaticamente con i nuovi dati
- Non c'è bisogno di invalidazione cache o refetch a livello di componente

### Integrazione Servizi

**Nessun servizio diretto utilizzato**. Il componente è puramente presentazionale:
- Non fa chiamate API
- Non gestisce stato globale
- Non gestisce mutazioni
- Tutte le operazioni vengono delegate al parent component tramite callback

### Real-time Updates (v2.0.0)

**Comportamento attuale**:
- ✅ **IMPLEMENTATO** - Il componente si aggiorna automaticamente quando i dati cambiano
- Aggiornamenti via `useConservationRealtime()` hook attivato in `ConservationPage`
- 3 subscriptions Supabase Realtime:
  1. **temperature_readings**: invalida cache `conservation-points` quando nuove letture
  2. **maintenance_completions**: invalida cache `maintenance-tasks-critical` quando completamenti
  3. **maintenance_tasks**: invalida cache quando task creati/modificati

**Flusso real-time**:
1. Utente B completa manutenzione → INSERT in `maintenance_completions`
2. Trigger PostgreSQL aggiorna `maintenance_tasks.next_due` automaticamente
3. Supabase Realtime notifica subscription
4. Hook `useConservationRealtime` chiama `queryClient.invalidateQueries()`
5. React Query ricarica dati automaticamente
6. Componente `ConservationPointCard` riceve nuovi props
7. `getPointCheckup()` ricalcola stato
8. UI si aggiorna entro 1-2 secondi

**Trigger PostgreSQL** (v2.0.0):
- `update_maintenance_task_on_completion`: AFTER INSERT su `maintenance_completions`
- Calcola `next_due` automaticamente basato su `frequency` e `recurrence_config`
- Supporta daily/weekly/monthly/annually con giorni specifici configurati

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`ConservationPage`** (parent component):
  - **Tipo di interazione**: Gestisce rendering, passaggio props, callback handling
  - **Uso**: Renderizza la card in loop per ogni punto
  - **Props passate**: `point`, `onEdit`, `onDelete`

- **`AddPointModal`** (indiretto, tramite parent):
  - **Tipo di interazione**: Viene aperto quando utente clicca edit sulla card
  - **Uso**: Modal per modificare punto esistente
  - **Trigger**: `onEdit(point)` callback dal parent component

### Dipendenze

- **Componenti UI**:
  - `Thermometer`, `Calendar`, `AlertTriangle`, `CheckCircle`, `Edit`, `Trash2`, `MapPin` da `lucide-react` (icone)

- **Tipi**:
  - `ConservationPoint` da `@/types/conservation`
  - `CONSERVATION_COLORS`, `CONSERVATION_TYPE_COLORS`, `TEMPERATURE_RANGES` da `@/types/conservation`

- **React**:
  - `useState` hook standard di React

### Eventi Emessi

Il componente **non emette eventi custom**. Le comunicazioni avvengono tramite:
- **Callback props** al parent component (`onEdit`, `onDelete`)
- **Eventi click standard** sui pulsanti (gestiti tramite `onClick`)

### Eventi Ascoltati

Il componente **non ascolta eventi custom**. Reagisce a:
- **Cambio props**: Quando `point` prop cambia, il componente re-renderizza automaticamente
- **User clicks**: Click su pulsanti triggera callback functions

---

## 📊 DATI

### Struttura Dati Input

```typescript
interface ConservationPointCardProps {
  point: ConservationPoint
  onEdit: (point: ConservationPoint) => void
  onDelete: (id: string) => void
}
```

**Oggetto `point` completo:**
```typescript
interface ConservationPoint {
  id: string
  company_id: string
  department_id: string
  name: string
  setpoint_temp: number
  type: 'ambient' | 'fridge' | 'freezer' | 'blast'
  product_categories: string[]
  status: 'normal' | 'warning' | 'critical'
  is_blast_chiller: boolean
  // Nuovi campi v1.1.0
  appliance_category?: string
  profile_id?: string
  profile_config?: ConservationProfile | null
  is_custom_profile?: boolean
  last_temperature_reading?: {
    temperature: number
    recorded_at: Date
  }
  maintenance_due?: Date
  created_at: Date
  updated_at: Date
  department?: {
    id: string
    name: string
  }
}
```

### Struttura Dati Output

Il componente **non emette output diretto**. Le azioni vengono comunicate tramite callback:

**Callback `onEdit(point)`:**
- **Input**: `point: ConservationPoint` completo
- **Scopo**: Notifica al parent che utente vuole modificare questo punto
- **Uso**: Parent component apre modal in modalità edit

**Callback `onDelete(id)`:**
- **Input**: `id: string` - ID del punto da eliminare
- **Scopo**: Notifica al parent che utente vuole eliminare questo punto
- **Uso**: Parent component mostra dialog di conferma e elimina il punto

### Mapping Database

Non applicabile - il componente non accede direttamente al database. I dati vengono mappati a livello di parent component (vedi `CONSERVATION_PAGE.md`).

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per ConservationPointCard:**

- [x] La card visualizza tutte le informazioni essenziali del punto (nome, reparto, tipo, temperatura, stato)
- [x] La card usa colori distintivi per tipo (frigorifero = sky, freezer = indigo, ecc.)
- [x] La card visualizza stato con colori e icone (verde = regolare, giallo = attenzione, rosso = critico)
- [x] La card mostra ultima lettura temperatura se disponibile
- [x] La card mostra prossima manutenzione se disponibile
- [x] La card mostra categorie prodotti se disponibili
- [x] La card permette modifica tramite icona edit
- [x] La card permette eliminazione tramite icona delete
- [x] La card permette espandere/collassare sezione dettagli
- [x] La card è responsive (mobile/tablet/desktop)
- [x] **NUOVA FEATURE v1.1.0**: La card mostra profilo HACCP quando presente (con icona ShieldCheck e label leggibile)
- [ ] **DA MIGLIORARE**: Aggiungere `aria-label` a pulsanti per accessibilità
- [ ] **DA IMPLEMENTARE**: Feature visualizzazione ingredienti associati (clic su elemento - da definire meglio cosa visualizzare e come)

---

## 🧪 TESTING

### Test da Eseguire

1. **Test rendering base**:
   - Verificare che tutte le informazioni essenziali vengano visualizzate correttamente
   - Verificare che i colori siano corretti per ogni tipo
   - Verificare che lo stato sia visualizzato correttamente con colori e icone

2. **Test rendering condizionale**:
   - Verificare che "Profilo HACCP" venga mostrato solo se `profile_id` esiste (nuova feature v1.1.0)
   - Verificare che "Ultima lettura" venga mostrata solo se `last_temperature_reading` esiste
   - Verificare che "Prossima manutenzione" venga mostrata solo se `maintenance_due` esiste
   - Verificare che "Categorie prodotti" venga mostrata solo se array non vuoto

3. **Test interazioni**:
   - Verificare che click su edit chiami `onEdit(point)` con punto corretto
   - Verificare che click su delete chiami `onDelete(id)` con ID corretto
   - Verificare che click su "Mostra dettagli" toggle `showDetails` state

4. **Test responsive**:
   - Verificare layout mobile (< 640px)
   - Verificare layout tablet (640px - 1024px)
   - Verificare layout desktop (> 1024px)

5. **Test accessibilità**:
   - Verificare navigazione con tastiera
   - Verificare screen reader compatibility (con aria-label aggiunti)
   - Verificare contrasto colori (WCAG AA)

### Scenari di Test

**Scenario 1: Card completa con tutti i dati**
- **Input**: Punto con nome, reparto, tipo "fridge", temperatura 4°C, stato "normal", ultima lettura, manutenzione, categorie
- **Output atteso**: Tutte le sezioni visualizzate correttamente con colori appropriati

**Scenario 2: Card minima con solo dati essenziali**
- **Input**: Punto con solo nome, reparto, tipo, temperatura, stato (senza letture, manutenzioni, categorie)
- **Output atteso**: Solo sezioni essenziali visualizzate, sezioni condizionali non presenti

**Scenario 3: Stato critico con temperatura fuori range**
- **Input**: Punto con stato "critical", temperatura target 2°C, ultima lettura 10°C
- **Output atteso**: Card con bordo/colore rosso, icona AlertTriangle rossa, testo "Critico"

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/features/conservation/components/ConservationPointCard.tsx`
- **Parent Component**: `src/features/conservation/ConservationPage.tsx`
- **Tipi**: `src/types/conservation.ts`
- **Modal Edit**: `src/features/conservation/components/AddPointModal.tsx`

### Documentazione Correlata
- Documentazione ConservationPage: `CONSERVATION_PAGE.md`
- Documentazione AddPointModal: `ADD_POINT_MODAL.md` (da creare)

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- Nessuna ottimizzazione specifica (componente leggero, re-renderizza solo quando props cambiano)

**Considerazioni performance:**
- Componente puramente presentazionale, nessun calcolo pesante
- Re-renderizza solo quando `point` prop cambia o `showDetails` state cambia
- Se vengono renderizzate centinaia di card, considerare virtualizzazione (gestita a livello di parent component)

**Miglioramenti proposti:**
- Considerare `React.memo()` se vengono renderizzate molte card e i re-render sono frequenti
- Memoizzare calcoli `typeColors`, `statusColors`, `tempRange` se diventano pesanti

### Sicurezza

**Validazioni sicurezza:**
- Nessuna validazione esplicita (assumiamo dati validi dal parent)
- Input sanitization non necessaria (componente non accetta input utente diretto)

**Autorizzazioni:**
- Non gestite a livello di componente (gestite a livello di parent component e RLS policies)
- Pulsanti edit/delete dovrebbero essere visibili solo a utenti con permessi (gestito dal parent)

**Miglioramenti proposti:**
- Aggiungere validazione props per prevenire crash se dati mancanti
- Aggiungere prop `canEdit`, `canDelete` per controllare visibilità pulsanti azione

### Limitazioni

**Limitazioni conosciute:**
1. **Feature "Visualizza ingredienti" non implementata**: L'utente ha menzionato che cliccando su un elemento nella card dovrebbero essere visualizzati gli ingredienti associati, ma questa feature non esiste ancora e deve essere ancora definita (cosa visualizzare e come interagire)
2. **Accessibilità incompleta**: Mancano `aria-label` su pulsanti icona
3. **Validazione props mancante**: Se `point` è null/undefined, il componente potrebbe crashare
4. **Real-time updates non implementati**: La card non si aggiorna automaticamente quando i dati cambiano remotamente

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Visualizzazione ingredienti**: Implementare feature per visualizzare ingredienti associati a un punto (da definire meglio: cosa visualizzare e come interagire)
2. **Azioni rapide**: Aggiungere azioni rapide direttamente dalla card (es. "Registra temperatura rapida")
3. **Grafico temperatura**: Mostrare mini grafico trend temperatura nella sezione dettagli
4. **Storico manutenzioni**: Mostrare storico manutenzioni completate per il punto

**Miglioramenti tecnici:**
1. **Accessibilità**: Aggiungere `aria-label` a tutti i pulsanti
2. **Validazione props**: Validare props per prevenire crash
3. **Error boundaries**: Gestire errori di rendering gracefully
4. **Real-time updates**: Aggiornare automaticamente quando dati cambiano

**Miglioramenti UX:**
1. **Animazioni**: Aggiungere animazioni smooth per toggle dettagli
2. **Tooltip**: Aggiungere tooltip informativi su hover
3. **Loading states**: Mostrare skeleton loading mentre dati caricano
4. **Empty states**: Migliorare visualizzazione quando dati mancanti

---

**Ultimo Aggiornamento**: 2026-02-01
**Versione**: 2.0.0

---

## NUOVE FEATURES v2.0.0 (2026-02-01)

### Check-up Centralizzato

**Obiettivo**: Sistema centralizzato per calcolo stato punto considerando sia temperatura che manutenzioni.

**Implementazione**:
- Funzione `getPointCheckup()` in `src/features/conservation/utils/pointCheckup.ts`
- Sostituisce `classifyPointStatus()` con logica unificata
- Calcola stato basato su:
  - Temperatura ultima lettura (fuori range ±1°C = problema)
  - Manutenzioni oggi (pendenti = problema)
  - Manutenzioni arretrate con severità (critical/high/medium/low)
- Output strutturato con messaggi per UI

**Vantaggi**:
- **Single source of truth**: logica centralizzata
- **Consistenza**: stesso calcolo ovunque nel sistema
- **Flessibilità**: facile aggiungere nuovi criteri
- **Testabilità**: funzione pura facilmente testabile

### Real-time Updates

**Obiettivo**: Aggiornamento automatico card quando altri utenti completano manutenzioni o registrano temperature.

**Implementazione**:
- Hook `useConservationRealtime()` in `ConservationPage`
- 3 subscriptions Supabase Realtime:
  1. `temperature_readings` → invalida `conservation-points`
  2. `maintenance_completions` → invalida `maintenance-tasks-critical`
  3. `maintenance_tasks` → invalida `maintenance-tasks-critical`
- Trigger PostgreSQL per next_due automatico

**Flusso**:
1. User B completa manutenzione
2. Trigger aggiorna `next_due`
3. Realtime notifica subscription
4. Query cache invalidata
5. React Query ricarica dati
6. Card si aggiorna automaticamente

### UI Due Box

**Obiettivo**: Visualizzare separatamente problemi temperatura e manutenzioni quando presenti entrambi.

**Implementazione**:
```typescript
{checkup.messages.priority === 'both' && (
  <div className="space-y-2 mb-3">
    {/* Box 1: Temperatura */}
    {checkup.messages.temperature && (
      <button onClick={() => onFocusTemperatureCard?.(point.id)}>
        <Thermometer />
        <p>Temperatura</p>
        <p>{checkup.messages.temperature}</p>
      </button>
    )}

    {/* Box 2: Manutenzioni */}
    {checkup.messages.maintenance && (
      <div>
        <Calendar />
        <p>Manutenzioni</p>
        <p>{checkup.messages.maintenance}</p>
        <button onClick={() => setShowMaintenanceDetails(!show)}>
          {show ? 'Nascondi' : 'Mostra'} dettagli
        </button>
      </div>
    )}
  </div>
)}
```

**Vantaggi**:
- Chiarezza visiva: problemi separati
- Azioni mirate: click temperatura → focus sezione temperature
- Espandibile: dettagli manutenzioni on-demand

### Gravità Arretrati

**Obiettivo**: Indicatori visuali per gravità ritardo manutenzioni.

**Implementazione**:
- **Critical** (>7 giorni): `bg-red-600`
- **High** (3-7 giorni): `bg-orange-500`
- **Medium** (1-3 giorni): `bg-yellow-500`
- **Low** (<1 giorno): `bg-gray-400`

**Visualizzazione**:
```
● [Rosso] Sanificazione - 10 giorni fa
● [Arancione] Sbrinamento - 5 giorni fa
● [Giallo] Controllo Scadenze - 2 giorni fa
```

**Calcolo**:
```typescript
const severity =
  daysOverdue >= 7 ? 'critical' :
  daysOverdue >= 3 ? 'high' :
  daysOverdue >= 1 ? 'medium' : 'low'
```

### File Coinvolti

- `src/features/conservation/utils/pointCheckup.ts` - Logica centralizzata
- `src/features/conservation/hooks/useConservationRealtime.ts` - Real-time subscriptions
- `src/features/conservation/hooks/useMaintenanceTasksCritical.ts` - Caricamento ottimizzato
- `src/features/conservation/components/ConservationPointCard.tsx` - UI aggiornata
- `supabase/migrations/20260201120000_trigger_maintenance_task_recurrence.sql` - Trigger PostgreSQL

### Riferimenti Documentazione

- Report dettagliato: `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/01-02-2026/REPORT_card_checkup_centralizzato.md`
- Test guide: `GUIDA_TEST_conservation_checkup.md`
- Master index: `00_MASTER_INDEX.md` (entry 01-02-2026)

---

## NUOVE FEATURES v1.1.0 (2026-01-20)

### Visualizzazione Profilo HACCP

**Obiettivo**: Mostrare il profilo HACCP selezionato per i punti di conservazione nella card, quando presente.

**Implementazione**:
- Visualizzazione condizionale della sezione profilo HACCP quando `point.profile_id` esiste
- Icona ShieldCheck (🛡️) per indicare il profilo
- Label leggibile del profilo tramite `PROFILE_LABELS[profile_id]` con fallback a `profile_id` se non trovato
- Posizionamento dopo reparto, prima delle azioni
- Integrazione con sistema profili HACCP implementato in AddPointModal v2.0.0

**File correlati**:
- `src/utils/conservationProfiles.ts` - Import di PROFILE_LABELS
- `src/types/conservation.ts` - Tipo ConservationProfileId
- `Production/Conoscenze_congelate/APP_DEFINITION/03_CONSERVATION/Lavoro/19-01-2026/` - Documentazione feature profili HACCP

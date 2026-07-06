# Implementazione Riorganizzazione Temperature Card v2

**Data**: 30 Gennaio 2026
**Stato**: Implementato - Da debuggare
**Piano di riferimento**: `c:\Users\matte.MIO\.cursor\plans\riorganizzazione_temperature_card_v2.plan.md`

---

## Panoramica

Implementazione completa del sistema a 3 tab per il monitoraggio temperature HACCP con workflow azioni correttive guidate, grafico andamento e gestione stati punti di conservazione.

### Obiettivi Raggiunti

- ✅ Sistema a 3 tab (Stato Corrente / Storico / Analisi)
- ✅ 4 stati badge punto con logica ±1°C dal setpoint
- ✅ Azioni correttive reattive con workflow guidato
- ✅ Alert panel per anomalie e punti senza lettura (obbligo HACCP)
- ✅ Grafico recharts con banda range consentito
- ✅ Stato "richiesta lettura" solo frontend (React state)

---

## File Creati

### 1. Utility - Logica Azioni Correttive

**File**: `src/features/conservation/utils/correctiveActions.ts`

**Scopo**: Gestione centralizzata della logica azioni correttive HACCP con tolleranza ±1°C.

**Exports**:
- `TOLERANCE_C: number` - Costante tolleranza 1.0°C
- `CorrectiveActionType` - Type: `'temperature_high' | 'temperature_low'`
- `CorrectiveAction` - Interface con type, title, description, instructions
- `getCorrectiveAction(reading, point): CorrectiveAction | null` - Determina se serve azione correttiva
- `getAllowedRange(setpoint): { min, max }` - Calcola range consentito (setpoint ± 1°C)
- `isTemperatureCompliant(temperature, setpoint): boolean` - Verifica conformità

**Regole Implementate**:
- Range consentito: `setpoint - 1.0°C` ≤ temperatura ≤ `setpoint + 1.0°C`
- Temperatura troppo alta → istruzioni per abbassare (specifiche per tipo punto)
- Temperatura troppo bassa → istruzioni per alzare (specifiche per tipo punto)
- Testi in italiano per UI, tipi in inglese nel codice

**Istruzioni per Tipo Punto**:
- `fridge`: "Abbassa il termostato del frigorifero e verifica che la porta sia chiusa correttamente."
- `freezer`: "Abbassa il termostato del congelatore. Verifica che la guarnizione sia integra e la porta chiusa."
- `blast`: "Verifica il funzionamento dell'abbattitore e che non sia sovraccarico."
- `ambient`: "Regola il termostato per abbassare la temperatura."

---

### 2. Hook Helpers

**File**: `src/features/conservation/hooks/useTemperatureReadings.ts`

**Modifiche**: Aggiunti helper functions alla fine del file (dopo l'hook principale).

**Nuovi Exports**:

#### `TemperaturePointStatus`
Type: `'conforme' | 'critico' | 'richiesta_lettura' | 'nessuna_lettura'`

#### `getLatestReadingByPoint(readings, pointId): TemperatureReading | undefined`
- Trova l'ultima lettura per un punto specifico
- Assume readings ordinati per `recorded_at DESC`
- Usa `Array.find()` per ottimizzare ricerca

#### `groupReadingsByDate(readings): Map<string, TemperatureReading[]>`
- Raggruppa letture per data (formato YYYY-MM-DD)
- Ritorna `Map<dateKey, readings[]>` per efficienza
- Usa `Date.toISOString().split('T')[0]` per key

#### `getPointStatus(point, latestReading, pointIdsInRichiestaLettura): TemperaturePointStatus`
**Logica prioritaria**:
1. Se `pointId` in Set richiesta lettura → `'richiesta_lettura'`
2. Se nessuna lettura → `'nessuna_lettura'`
3. Se `getCorrectiveAction()` ritorna azione → `'critico'`
4. Altrimenti → `'conforme'`

**Parametri**:
- `point: ConservationPoint` - Punto da valutare
- `latestReading?: TemperatureReading` - Ultima lettura (opzionale)
- `pointIdsInRichiestaLettura: Set<string>` - Stato frontend per "richiesta lettura"

---

### 3. Componenti UI

#### 3.1 TemperaturePointStatusCard

**File**: `src/features/conservation/components/TemperaturePointStatusCard.tsx`

**Scopo**: Card singolo punto con 4 stati visivi e azioni contestuali.

**Props**:
```typescript
interface TemperaturePointStatusCardProps {
  point: ConservationPoint
  latestReading?: TemperatureReading
  status: TemperaturePointStatus
  onAddReading: () => void
  onCorrectiveAction?: () => void
}
```

**Stati e Configurazione**:

| Stato | Bordo | Sfondo | Icona | Azione Disponibile |
|-------|-------|--------|-------|-------------------|
| `conforme` | `border-green-500` | `bg-green-50` | `CheckCircle` | Click card → registra |
| `critico` | `border-red-500` | `bg-red-50` | `AlertTriangle` | Pulsante "Correggi" |
| `richiesta_lettura` | `border-orange-500` | `bg-orange-50` | `RefreshCw` | Pulsante "Registra Lettura" |
| `nessuna_lettura` | `border-gray-400` | `bg-gray-50` | `Circle` | Pulsante "Prima Lettura" |

**Elementi Visualizzati**:
- Nome punto (top-left)
- Icona termometro (top-right)
- Temperatura grande (es. "4.0°C") o "--" se nessuna lettura
- Setpoint piccolo sotto (es. "Setpoint: 4.0°C")
- Badge stato con icona e label
- Pulsante azione (condizionale per stato)
- Timestamp ultima lettura (formato: gg/mm hh:mm)

**Behavior**:
- Click su card (stati non critici) → apre modal registra lettura
- Click "Correggi" (stato critico) → apre popover azione correttiva
- Click "Registra Lettura" (richiesta lettura) → apre modal registra
- Hover → shadow-md per feedback visivo

---

#### 3.2 CorrectiveActionPopover

**File**: `src/features/conservation/components/CorrectiveActionPopover.tsx`

**Scopo**: Popover Radix UI per workflow guidato azioni correttive HACCP.

**Props**:
```typescript
interface CorrectiveActionPopoverProps {
  action: CorrectiveAction
  pointName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}
```

**Struttura**:
1. **Header**: Icona alert + titolo azione + pulsante chiudi (X)
2. **Nome Punto**: Es. "Punto: Frigo 1"
3. **Description**: Es. "Rilevata 12.0°C, range consentito: 3.0°C / 5.0°C"
4. **Divider**
5. **Istruzioni**: Testo guidato da `correctiveActions.ts` (📋 emoji + testo)
6. **Divider**
7. **Checkbox Conferma**: "Ho eseguito l'azione correttiva" (required)
8. **Azioni**: "Annulla" (grigio) | "✓ Conferma" (verde, disabled se non checked)

**Stato Interno**:
- `confirmed: boolean` - Traccia checkbox
- Reset a `false` quando si annulla o conferma

**Flusso dopo Conferma**:
1. Callback `onConfirm()` chiamato
2. Parent aggiunge `pointId` al Set `pointsInRichiestaLettura`
3. Popover si chiude
4. Badge punto diventa arancione "Richiesta lettura"
5. Utente registra nuova lettura → `pointId` rimosso da Set

**Dipendenze**:
- `@radix-ui/react-popover` (installato separatamente)

---

#### 3.3 TemperatureAlertsPanel

**File**: `src/features/conservation/components/TemperatureAlertsPanel.tsx`

**Scopo**: Pannello alert con doppia sezione (anomalie + punti da rilevare) - stessa importanza.

**Props**:
```typescript
interface TemperatureAlertsPanelProps {
  anomalies: Array<{ point: ConservationPoint; reading: TemperatureReading }>
  missingReadings: ConservationPoint[]
  onGoToPoint: (pointId: string) => void
  onAddReading: (point: ConservationPoint) => void
}
```

**Sezioni**:

1. **ANOMALIE TEMPERATURA** (Rosso - `border-red-500`, `bg-red-50`)
   - Icona: `AlertTriangle`
   - Mostra: punti con temperatura fuori range
   - Info: "Frigo 2: +12°C (critico, range +3/+5°C)"
   - Azione: Pulsante "Vai →" → `onGoToPoint(pointId)`

2. **PUNTI DA RILEVARE OGGI (obbligo HACCP)** (Arancio - `border-orange-500`, `bg-orange-50`)
   - Icona: `AlertCircle`
   - Mostra: punti senza lettura oggi
   - Info: "Banco frigo: nessuna lettura oggi" o "ultima lettura ieri 18:30"
   - Azione: Pulsante "Rileva →" → `onAddReading(point)`

**Behavior**:
- Se `anomalies.length === 0 && missingReadings.length === 0` → non renderizza nulla
- Card con bordo 2px e sfondo colorato
- Ogni alert in card bianca interna con termometro icona

**Logica "Punti da rilevare"**:
- Punto senza nessuna lettura → incluso
- Punto con ultima lettura non di oggi → incluso
- Check data: `readingDate.getDate() === today.getDate()` + mese + anno

---

#### 3.4 TemperatureChart

**File**: `src/features/conservation/components/TemperatureChart.tsx`

**Scopo**: Grafico andamento temperature con recharts (linea + banda range).

**Props**:
```typescript
interface TemperatureChartProps {
  readings: TemperatureReading[]
  setpoint: number
  periodDays?: number // default 9
}
```

**Elementi Grafici**:
- **CartesianGrid**: Griglia tratteggiata grigio chiaro
- **XAxis**: Date in formato "gg MMM" (es. "21 Gen")
- **YAxis**: Temperatura in °C, domain auto con margine ±2°C
- **ReferenceArea**: Banda verde chiaro (`#86efac`, opacity 0.3) tra min e max range
- **ReferenceLine**: Linea tratteggiata verde per setpoint con label
- **Line**: Linea blu (`#3b82f6`), strokeWidth 2, type monotone
- **CustomDot**: Pallini blu per conformi, rossi per fuori range (r=4, stroke bianco)
- **CustomTooltip**: Box bianco con temperatura, data/ora, operatore, badge conforme/fuori range
- **Legend**: Mostra "Temperatura" con icona linea

**Filtraggio Dati**:
- Filtra readings entro `periodDays` dall'oggi
- Ordina per timestamp crescente
- Se nessun dato → mostra messaggio "Nessun dato disponibile"

**Calcoli**:
- `min = setpoint - 1.0`
- `max = setpoint + 1.0`
- `isCompliant = isTemperatureCompliant(temperature, setpoint)`

**Dimensioni**:
- ResponsiveContainer: width 100%, height 300px
- Margins: top 5, right 30, left 20, bottom 5

---

#### 3.5 TemperatureAnalysisTab

**File**: `src/features/conservation/components/TemperatureAnalysisTab.tsx`

**Scopo**: Tab analisi con selezione punto, periodo e statistiche.

**Props**:
```typescript
interface TemperatureAnalysisTabProps {
  points: ConservationPoint[]
  readings: TemperatureReading[]
}
```

**Layout**:
1. **Filtri** (flex wrap gap-4):
   - Dropdown "Punto": Tutti i punti con nome
   - Dropdown "Periodo": 3/7/9/14/30 giorni (default 9)

2. **Grafico**:
   - `<TemperatureChart>` con readings filtrati

3. **Statistiche Periodo** (grid 4 colonne):
   - **Media**: Temperatura media formattata 1 decimale
   - **Minima**: Temperatura min (blu)
   - **Massima**: Temperatura max (rosso)
   - **Anomalie**: Conteggio letture fuori range (rosso se > 0, verde se 0)

**Stati**:
- `selectedPointId: string` - Default primo punto
- `periodDays: number` - Default 9

**Filtraggio**:
```typescript
const filteredReadings = readings.filter(r =>
  r.conservation_point_id === selectedPointId &&
  new Date(r.recorded_at) >= cutoffDate
)
```

**Calcolo Statistiche**:
```typescript
average = sum(temperatures) / count
min = Math.min(...temperatures)
max = Math.max(...temperatures)
anomalies = count(readings where !isCompliant)
```

**Empty State**:
- Se `points.length === 0` → "Nessun punto di conservazione disponibile"

---

#### 3.6 TemperatureHistorySection

**File**: `src/features/conservation/components/TemperatureHistorySection.tsx`

**Scopo**: Tab storico con filtri, raggruppamento per data e sezioni espandibili.

**Props**:
```typescript
interface TemperatureHistorySectionProps {
  readings: TemperatureReading[]
  points: ConservationPoint[]
}
```

**Filtri** (3 filtri in riga):
1. **Periodo**: 7/14/30/60/90 giorni (default 30)
2. **Punto**: Dropdown "Tutti i punti" + lista punti
3. **Solo Anomalie**: Checkbox per filtrare solo letture fuori range

**Raggruppamento**:
- Usa `groupReadingsByDate()` helper
- Ordina date DESC (più recente prima)
- Ogni data → sezione espandibile (CollapsibleCard custom)

**Sezione Giorno**:
- **Header** (clickable):
  - Icona chevron (down se espanso, right se chiuso)
  - Data formattata: "Mercoledì 29 Gennaio 2026" (capitalizzata)
  - Badge: "X letture"
  - Icona status: ✓ verde se tutte conformi, numero anomalie + ⚠ rosso se ci sono anomalie

- **Contenuto Espanso**:
  - `<TemperatureReadingsTable>` con letture del giorno

**Stati**:
- `periodDays: number` - Default 30
- `selectedPointId: string` - Default 'all'
- `onlyAnomalies: boolean` - Default false
- `expandedDates: Set<string>` - Traccia quali date sono espanse

**Logica Filtri**:
```typescript
const filteredReadings = readings.filter(r => {
  const inPeriod = date >= cutoffDate
  const forPoint = pointId === 'all' || r.conservation_point_id === pointId
  const isAnomaly = !onlyAnomalies || !isCompliant(r.temperature, point.setpoint)
  return inPeriod && forPoint && isAnomaly
})
```

**Empty State**:
- Se nessuna lettura dopo filtri → "Nessuna lettura trovata con i filtri selezionati"

---

#### 3.7 TemperatureReadingsTable

**File**: `src/features/conservation/components/TemperatureReadingsTable.tsx`

**Scopo**: Tabella compatta letture con colonne essenziali.

**Props**:
```typescript
interface TemperatureReadingsTableProps {
  readings: TemperatureReading[]
  points: ConservationPoint[]
}
```

**Colonne**:
1. **Ora**: HH:MM (es. "08:15")
2. **Punto**: Nome punto (bold)
3. **Temperatura**: Valore 1 decimale + °C (rosso se non conforme, nero se conforme)
4. **Esito**: Icona `CheckCircle` verde o `AlertTriangle` rosso
5. **Operatore**: Nome completo o "-" se non disponibile

**Logica Conformità**:
- Recupera punto da `pointsMap`
- Usa `isTemperatureCompliant(reading.temperature, point.setpoint_temp)`

**Styling**:
- Tabella full width, text-sm
- Header: bg-gray-50, font-medium
- Righe: hover:bg-gray-50, divide-y grigio chiaro
- Padding uniforme (px-3 py-2)

**Empty State**:
- Se `readings.length === 0` → "Nessuna lettura disponibile" (centered, gray)

---

## Modifiche File Esistenti

### ConservationPage.tsx

**File**: `src/features/conservation/ConservationPage.tsx`

**Modifiche Imports** (linee 1-29):
```typescript
// Aggiunti:
import { getLatestReadingByPoint, getPointStatus } from './hooks/useTemperatureReadings'
import { getCorrectiveAction } from './utils/correctiveActions'
import { TemperaturePointStatusCard } from './components/TemperaturePointStatusCard'
import { CorrectiveActionPopover } from './components/CorrectiveActionPopover'
import { TemperatureAlertsPanel } from './components/TemperatureAlertsPanel'
import { TemperatureHistorySection } from './components/TemperatureHistorySection'
import { TemperatureAnalysisTab } from './components/TemperatureAnalysisTab'
```

**Nuovi Stati** (dopo riga 45):
```typescript
const [activeTemperatureTab, setActiveTemperatureTab] = useState<'status' | 'history' | 'analysis'>('status')
const [pointsInRichiestaLettura, setPointsInRichiestaLettura] = useState<Set<string>>(new Set())
const [correctiveActionPopover, setCorrectiveActionPopover] = useState<{
  open: boolean
  point: ConservationPoint | null
  reading: TemperatureReading | null
}>({ open: false, point: null, reading: null })
```

**Nuovi Handler**:

```typescript
// Modificato handleSaveTemperature (riga ~125)
const handleSaveTemperature = (data) => {
  // ... codice esistente ...

  // AGGIUNTO: Rimuovi punto da "richiesta lettura" quando si salva nuova lettura
  if (data.conservation_point_id) {
    setPointsInRichiestaLettura(prev => {
      const newSet = new Set(prev)
      newSet.delete(data.conservation_point_id)
      return newSet
    })
  }
}

// NUOVO: Handler apertura popover azione correttiva
const handleCorrectiveAction = (point: ConservationPoint, reading: TemperatureReading) => {
  setCorrectiveActionPopover({
    open: true,
    point,
    reading,
  })
}

// NUOVO: Handler conferma azione correttiva
const handleConfirmCorrectiveAction = () => {
  if (correctiveActionPopover.point) {
    // Aggiungi punto al Set "richiesta lettura"
    setPointsInRichiestaLettura(prev => new Set(prev).add(correctiveActionPopover.point!.id))
  }
  setCorrectiveActionPopover({ open: false, point: null, reading: null })
}
```

**Sostituzione CollapsibleCard "Letture Temperature"** (righe 360-561):

**Vecchia Struttura**:
- Mini statistics (4 card: totale, conformi, attenzione, critiche)
- Raggruppamento manuale per data con `reduce()`
- CollapsibleCard nidificate per ogni giorno
- `<TemperatureReadingCard>` per ogni lettura

**Nuova Struttura**:

1. **Tab Navigation** (3 pulsanti):
```typescript
<nav className="flex space-x-4">
  <button onClick={() => setActiveTemperatureTab('status')}>
    Stato Corrente
  </button>
  <button onClick={() => setActiveTemperatureTab('history')}>
    Storico
  </button>
  <button onClick={() => setActiveTemperatureTab('analysis')}>
    Analisi
  </button>
</nav>
```

2. **Tab Content Condizionale**:

**Tab "status"**:
```typescript
{activeTemperatureTab === 'status' && (
  <>
    <TemperatureAlertsPanel
      anomalies={/* calcolo dinamico anomalie */}
      missingReadings={/* punti senza lettura oggi */}
      onGoToPoint={/* apri modal temperatura */}
      onAddReading={handleAddTemperature}
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {conservationPoints.map(point => {
        const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
        const status = getPointStatus(point, latestReading, pointsInRichiestaLettura)

        return (
          <TemperaturePointStatusCard
            key={point.id}
            point={point}
            latestReading={latestReading}
            status={status}
            onAddReading={() => handleAddTemperature(point)}
            onCorrectiveAction={
              status === 'critico' && latestReading
                ? () => handleCorrectiveAction(point, latestReading)
                : undefined
            }
          />
        )
      })}
    </div>
  </>
)}
```

**Calcolo Anomalie** (inline):
```typescript
anomalies={conservationPoints
  .map(point => {
    const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
    if (!latestReading) return null
    const action = getCorrectiveAction(latestReading, point)
    return action ? { point, reading: latestReading } : null
  })
  .filter((item): item is { point: ConservationPoint; reading: TemperatureReading } => item !== null)
}
```

**Calcolo Missing Readings** (inline):
```typescript
missingReadings={conservationPoints.filter(point => {
  const latestReading = getLatestReadingByPoint(temperatureReadings, point.id)
  if (!latestReading) return true

  const readingDate = new Date(latestReading.recorded_at)
  const today = new Date()
  const isToday =
    readingDate.getDate() === today.getDate() &&
    readingDate.getMonth() === today.getMonth() &&
    readingDate.getFullYear() === today.getFullYear()

  return !isToday
})}
```

**Tab "history"**:
```typescript
{activeTemperatureTab === 'history' && (
  <TemperatureHistorySection
    readings={temperatureReadings}
    points={conservationPoints}
  />
)}
```

**Tab "analysis"**:
```typescript
{activeTemperatureTab === 'analysis' && (
  <TemperatureAnalysisTab
    points={conservationPoints}
    readings={temperatureReadings}
  />
)}
```

3. **Popover Azione Correttiva** (dopo CollapsibleCard):
```typescript
{correctiveActionPopover.point && correctiveActionPopover.reading && (
  <CorrectiveActionPopover
    action={getCorrectiveAction(correctiveActionPopover.reading, correctiveActionPopover.point)!}
    pointName={correctiveActionPopover.point.name}
    open={correctiveActionPopover.open}
    onOpenChange={(open) => setCorrectiveActionPopover(prev => ({ ...prev, open }))}
    onConfirm={handleConfirmCorrectiveAction}
  />
)}
```

---

## Dipendenze Installate

### recharts
**Versione**: Latest (installato via `npm install recharts`)
**Scopo**: Libreria grafici React per visualizzazione andamento temperature
**Utilizzato in**: `TemperatureChart.tsx`
**Componenti usati**: `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `ReferenceArea`, `ReferenceLine`, `Legend`

### @radix-ui/react-popover
**Versione**: Latest (installato via `npm install @radix-ui/react-popover`)
**Scopo**: Componente Popover accessibile per workflow azioni correttive
**Utilizzato in**: `CorrectiveActionPopover.tsx`
**Componenti usati**: `Popover.Root`, `Popover.Portal`, `Popover.Content`, `Popover.Arrow`

---

## Architettura e Flussi

### Flusso Stato "Richiesta Lettura"

```
1. Utente vede punto CRITICO (temperatura fuori ±1°C)
   └─> Badge rosso + pulsante "Correggi"

2. Click "Correggi"
   └─> Apre CorrectiveActionPopover
       ├─> Mostra temperatura rilevata vs range
       ├─> Mostra istruzioni HACCP specifiche
       └─> Checkbox "Ho eseguito l'azione correttiva"

3. Utente esegue azione fisica (es. abbassa termostato)
   └─> Spunta checkbox

4. Click "✓ Conferma"
   └─> handleConfirmCorrectiveAction()
       ├─> Aggiunge point.id a Set<string> pointsInRichiestaLettura
       ├─> Chiude popover
       └─> Badge diventa ARANCIO "Richiesta lettura"

5. Utente aspetta ciclo raffreddamento
   └─> Click card o pulsante "Registra Lettura"
       └─> Apre modal AddTemperatureModal

6. Salva nuova lettura
   └─> handleSaveTemperature()
       ├─> Crea reading in DB
       ├─> Rimuove point.id da Set pointsInRichiestaLettura
       └─> getPointStatus() ricalcola:
           ├─> Se ancora fuori range → CRITICO (ripete ciclo)
           └─> Se dentro range → CONFORME (verde)
```

### Flusso Calcolo Stato Punto

```
getPointStatus(point, latestReading, pointIdsInRichiestaLettura)
  │
  ├─> pointIdsInRichiestaLettura.has(point.id)?
  │   └─> YES: return 'richiesta_lettura'
  │
  ├─> !latestReading?
  │   └─> YES: return 'nessuna_lettura'
  │
  ├─> getCorrectiveAction(latestReading, point)?
  │   └─> YES (action exists): return 'critico'
  │
  └─> Altrimenti: return 'conforme'
```

### Flusso Alert Panel

```
TemperatureAlertsPanel
  │
  ├─> ANOMALIE TEMPERATURA (rosso)
  │   └─> conservationPoints.map(point =>
  │         latestReading = getLatestReadingByPoint()
  │         action = getCorrectiveAction(latestReading, point)
  │         if (action) include in anomalies[]
  │       )
  │
  └─> PUNTI DA RILEVARE (arancio)
      └─> conservationPoints.filter(point =>
            latestReading = getLatestReadingByPoint()
            if (!latestReading) return true
            if (!isToday(latestReading.recorded_at)) return true
            return false
          )
```

---

## Mappatura Completa Componenti

### Gerarchia Componenti Tab "Stato Corrente"

```
ConservationPage
└─> CollapsibleCard "Letture Temperature"
    └─> activeTemperatureTab === 'status'
        ├─> TemperatureAlertsPanel
        │   ├─> Sezione "ANOMALIE TEMPERATURA"
        │   │   └─> anomalies.map(({ point, reading }) =>
        │   │         Card con nome punto + temperatura + range + pulsante "Vai →"
        │   │       )
        │   │
        │   └─> Sezione "PUNTI DA RILEVARE OGGI"
        │       └─> missingReadings.map(point =>
        │             Card con nome punto + ultima lettura + pulsante "Rileva →"
        │           )
        │
        └─> Grid (1/2/3/4 colonne responsive)
            └─> conservationPoints.map(point =>
                  <TemperaturePointStatusCard
                    point={point}
                    latestReading={getLatestReadingByPoint(temperatureReadings, point.id)}
                    status={getPointStatus(point, latestReading, pointsInRichiestaLettura)}
                    onAddReading={() => handleAddTemperature(point)}
                    onCorrectiveAction={() => handleCorrectiveAction(point, latestReading)}
                  />
                )

CorrectiveActionPopover (renderizzato fuori CollapsibleCard)
└─> Popover.Root
    └─> Popover.Portal
        └─> Popover.Content
            ├─> Header (icona + titolo + X)
            ├─> Nome punto
            ├─> Description (temperatura + range)
            ├─> Divider
            ├─> Istruzioni (da correctiveActions.ts)
            ├─> Divider
            ├─> Checkbox "Ho eseguito..."
            └─> Azioni (Annulla | Conferma)
```

### Gerarchia Componenti Tab "Storico"

```
ConservationPage
└─> CollapsibleCard "Letture Temperature"
    └─> activeTemperatureTab === 'history'
        └─> TemperatureHistorySection
            ├─> Filtri (periodo + punto + checkbox anomalie)
            │
            └─> groupedReadings.map((dateKey, readings) =>
                  <div> {/* Sezione giorno espandibile */}
                    <button> {/* Header clickable */}
                      ├─> Icona chevron
                      ├─> Data formattata
                      ├─> Badge conteggio
                      └─> Icona status (✓ o ⚠)
                    </button>

                    {expandedDates.has(dateKey) && (
                      <TemperatureReadingsTable
                        readings={readings}
                        points={points}
                      />
                    )}
                  </div>
                )
```

### Gerarchia Componenti Tab "Analisi"

```
ConservationPage
└─> CollapsibleCard "Letture Temperature"
    └─> activeTemperatureTab === 'analysis'
        └─> TemperatureAnalysisTab
            ├─> Filtri
            │   ├─> Dropdown punto
            │   └─> Dropdown periodo
            │
            ├─> TemperatureChart
            │   ├─> ResponsiveContainer
            │   │   └─> LineChart
            │   │       ├─> CartesianGrid
            │   │       ├─> XAxis (date)
            │   │       ├─> YAxis (temperature)
            │   │       ├─> ReferenceArea (banda verde min-max)
            │   │       ├─> ReferenceLine (setpoint)
            │   │       ├─> Tooltip (CustomTooltip)
            │   │       ├─> Legend
            │   │       └─> Line (CustomDot per colori)
            │   │
            │   └─> (o) Empty state se nessun dato
            │
            └─> Statistiche Periodo
                └─> Grid 4 colonne
                    ├─> Media
                    ├─> Minima
                    ├─> Massima
                    └─> Anomalie
```

---

## Stati React e Gestione Dati

### Stati Globali in ConservationPage

```typescript
// ESISTENTI (non modificati)
const [showAddModal, setShowAddModal] = useState(false)
const [editingPoint, setEditingPoint] = useState<ConservationPoint | null>(null)
const [showTemperatureModal, setShowTemperatureModal] = useState(false)
const [selectedPointForTemperature, setSelectedPointForTemperature] = useState<ConservationPoint | null>(null)
const [editingReading, setEditingReading] = useState<TemperatureReading | null>(null)

// NUOVI
const [activeTemperatureTab, setActiveTemperatureTab] = useState<'status' | 'history' | 'analysis'>('status')
const [pointsInRichiestaLettura, setPointsInRichiestaLettura] = useState<Set<string>>(new Set())
const [correctiveActionPopover, setCorrectiveActionPopover] = useState<{
  open: boolean
  point: ConservationPoint | null
  reading: TemperatureReading | null
}>({ open: false, point: null, reading: null })
```

### Stati Locali nei Componenti

**CorrectiveActionPopover**:
```typescript
const [confirmed, setConfirmed] = useState(false)
// Reset a false quando si chiude/conferma
```

**TemperatureAnalysisTab**:
```typescript
const [selectedPointId, setSelectedPointId] = useState<string>(points[0]?.id || '')
const [periodDays, setPeriodDays] = useState(9)
```

**TemperatureHistorySection**:
```typescript
const [periodDays, setPeriodDays] = useState(30)
const [selectedPointId, setSelectedPointId] = useState<string>('all')
const [onlyAnomalies, setOnlyAnomalies] = useState(false)
const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
```

### Dati Derivati (useMemo)

**TemperatureAnalysisTab**:
```typescript
const filteredReadings = useMemo(() => {
  // Filtra per punto e periodo
}, [selectedPointId, periodDays, readings])

const stats = useMemo(() => {
  // Calcola media, min, max, anomalie
}, [filteredReadings, selectedPoint])
```

**TemperatureHistorySection**:
```typescript
const filteredReadings = useMemo(() => {
  // Filtra per periodo, punto, anomalie
}, [periodDays, selectedPointId, onlyAnomalies, readings])

const groupedReadings = useMemo(() => {
  return groupReadingsByDate(filteredReadings)
}, [filteredReadings])

const sortedDates = useMemo(() => {
  return Array.from(groupedReadings.keys()).sort((a, b) => ...)
}, [groupedReadings])
```

---

## Convenzioni e Pattern Implementati

### Naming Conventions

**File**: PascalCase per componenti (`TemperaturePointStatusCard.tsx`)
**Funzioni**: camelCase per utility (`getCorrectiveAction`)
**Types**: PascalCase per interface (`CorrectiveAction`)
**Costanti**: UPPER_SNAKE_CASE (`TOLERANCE_C`)
**Props Interface**: `{ComponentName}Props`

### Import Order

1. React imports (`import { useState } from 'react'`)
2. External libraries (`import * as Popover from '@radix-ui/react-popover'`)
3. Internal types (`import type { ConservationPoint } from '@/types/conservation'`)
4. Internal utilities (`import { getCorrectiveAction } from '@/features/conservation/utils/correctiveActions'`)
5. Internal components (`import { TemperatureChart } from './TemperatureChart'`)

### TypeScript Strict

- Tutti i parametri funzione tipizzati
- Return types espliciti per funzioni pubbliche
- Props interface sempre definite
- Uso di `type` per union types
- Uso di `interface` per object shapes
- Null checks espliciti (`latestReading?: TemperatureReading`)

### React Patterns

- Functional components con arrow functions
- Props destructuring
- Conditional rendering con `&&` e ternario
- Key prop sempre presente in `.map()`
- Event handler con `e.stopPropagation()` dove necessario
- useMemo per calcoli pesanti
- useState con functional updates per Set (`prev => new Set(prev)`)

### Accessibility

- `aria-label` su pulsanti con solo icone
- Semantic HTML (`<nav>`, `<button>`, `<table>`)
- Focus management in popover
- Keyboard navigation (Radix UI gestisce)

---

## Stile e Design System

### Colori Stati Punto

```typescript
const STATUS_CONFIG = {
  conforme: {
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-500',
  },
  critico: {
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
  },
  richiesta_lettura: {
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-500',
  },
  nessuna_lettura: {
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    iconColor: 'text-gray-400',
  },
}
```

### Spacing Consistente

- Card padding: `p-4`
- Gap tra elementi: `gap-2`, `gap-3`, `gap-4`
- Margin bottom sezioni: `mb-4`, `mb-6`
- Bordi: `border`, `border-2` per enfasi

### Typography

- Titoli: `text-lg font-semibold`, `text-2xl font-bold`
- Sottotitoli: `text-sm text-gray-600`
- Body: `text-sm`, `text-base`
- Labels: `text-xs text-{color}-700`
- Valori numerici: `text-3xl font-bold` (temperature), `text-lg font-semibold` (stats)

### Transizioni

- Hover: `hover:bg-gray-50`, `hover:shadow-md`
- Focus: `focus:ring-blue-500`, `focus:border-blue-500`
- Durations: `transition-colors`, `transition-all duration-200`

### Responsive Breakpoints

- Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Flex wrap: `flex-wrap gap-4`
- Min width inputs: `min-w-[200px]` per filtri

---

## Testing e Debug

### Aree da Testare

1. **Calcolo Stati**:
   - ✅ Punto conforme (temperatura = setpoint ± 0.5°C)
   - ✅ Punto critico (temperatura > setpoint + 1°C o < setpoint - 1°C)
   - ✅ Nessuna lettura
   - ✅ Transizione richiesta lettura dopo conferma azione

2. **Workflow Azione Correttiva**:
   - ✅ Apertura popover da pulsante "Correggi"
   - ✅ Checkbox richiesta per conferma
   - ✅ Badge diventa arancione dopo conferma
   - ✅ Badge torna verde/rosso dopo nuova lettura

3. **Alert Panel**:
   - ⚠️ Calcolo anomalie temperature
   - ⚠️ Calcolo punti senza lettura oggi
   - ⚠️ Logica "isToday" (verificare timezone)

4. **Grafico**:
   - ⚠️ Rendering con recharts
   - ⚠️ Banda verde range consentito
   - ⚠️ Pallini rossi per anomalie
   - ⚠️ Tooltip con dati corretti

5. **Tab Storico**:
   - ⚠️ Filtri periodo/punto/anomalie
   - ⚠️ Raggruppamento per data
   - ⚠️ Espansione/collasso sezioni

6. **Tab Analisi**:
   - ⚠️ Selezione punto
   - ⚠️ Cambio periodo
   - ⚠️ Calcolo statistiche

### Known Issues / TODO

1. **Timezone Handling**:
   - `isToday` usa `new Date()` locale - potrebbe dare problemi con letture vicino alla mezzanotte
   - Considerare uso di library date (date-fns, dayjs)

2. **Performance**:
   - `anomalies` e `missingReadings` ricalcolati ad ogni render
   - Considerare useMemo per calcoli

3. **Stato Persistente**:
   - `pointsInRichiestaLettura` si perde al refresh pagina
   - Valutare localStorage se necessario

4. **Errori TypeScript Esistenti**:
   - Non correlati ai nuovi componenti
   - Da fixare separatamente (vedi output type-check)

5. **Accessibilità**:
   - Test con screen reader necessario
   - Verificare keyboard navigation completa

---

## Comandi per Testing

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
npm run lint:fix  # Auto-fix
```

### Build
```bash
npm run build
```

### Dev Server
```bash
npm run dev
```

---

## Note Implementative

### Perché Set<string> per pointsInRichiestaLettura

- Operazioni O(1) per add/delete/has
- Immutabile: `new Set(prev)` crea nuova istanza → trigger re-render
- Semanticamente corretto per collezione unica di ID

### Perché Map per groupReadingsByDate

- Mantiene ordine inserimento (importante per sort successivo)
- O(1) get/set/has
- Più performante di object per chiavi dinamiche
- Type-safe con TypeScript

### Perché useMemo per Calcoli

- `filteredReadings`: evita filter() ad ogni render
- `stats`: evita reduce/Math.min/max ad ogni render
- `groupedReadings`: evita forEach + Map ad ogni render
- `sortedDates`: evita Array.from + sort ad ogni render

### Perché Radix UI Popover

- Accessibilità out-of-the-box (ARIA, focus trap, keyboard)
- Portal rendering (evita z-index issues)
- Allineamento automatico (collision detection)
- Stile customizzabile (headless UI)

### Perché Recharts

- Dichiarativo (component-based)
- Responsive automatico
- Tooltip/Legend built-in
- Customizzabile (CustomDot, CustomTooltip)
- Performance buona per dataset medio (<1000 punti)

---

## Riferimenti

### File Plan Originale
`c:\Users\matte.MIO\.cursor\plans\riorganizzazione_temperature_card_v2.plan.md`

### Documentazione Esterna

- **Recharts**: https://recharts.org/en-US
- **Radix UI Popover**: https://www.radix-ui.com/docs/primitives/components/popover
- **TailwindCSS**: https://tailwindcss.com/docs
- **React Query**: https://tanstack.com/query/latest

### File Correlati Esistenti

- `src/types/conservation.ts` - Types base
- `src/utils/conservationProfiles.ts` - Profili setpoint
- `src/features/conservation/hooks/useConservationPoints.ts` - Hook punti
- `src/features/conservation/components/AddTemperatureModal.tsx` - Modal registrazione
- `src/features/conservation/components/ConservationPointCard.tsx` - Card esistente punti

---

## Checklist Implementazione

- [x] Installare recharts
- [x] Installare @radix-ui/react-popover
- [x] Creare correctiveActions.ts
- [x] Aggiungere helpers in useTemperatureReadings.ts
- [x] Creare TemperaturePointStatusCard.tsx
- [x] Creare CorrectiveActionPopover.tsx
- [x] Creare TemperatureAlertsPanel.tsx
- [x] Creare TemperatureChart.tsx
- [x] Creare TemperatureAnalysisTab.tsx
- [x] Creare TemperatureHistorySection.tsx
- [x] Creare TemperatureReadingsTable.tsx
- [x] Modificare ConservationPage.tsx (imports)
- [x] Modificare ConservationPage.tsx (stati)
- [x] Modificare ConservationPage.tsx (handlers)
- [x] Modificare ConservationPage.tsx (render tab)
- [x] Type check (no errori nei nuovi file)
- [ ] Test manuale tab Stato Corrente
- [ ] Test manuale workflow azione correttiva
- [ ] Test manuale tab Storico
- [ ] Test manuale tab Analisi
- [ ] Test manuale alert panel
- [ ] Test responsive mobile
- [ ] Fix timezone isToday se necessario
- [ ] Ottimizzare performance con useMemo se necessario
- [ ] Test accessibilità

---

## Metriche

- **File Creati**: 8
- **File Modificati**: 1 (ConservationPage.tsx)
- **Linee di Codice Aggiunte**: ~1500
- **Dipendenze Aggiunte**: 2 (recharts, @radix-ui/react-popover)
- **Componenti React**: 7 nuovi
- **Utility Functions**: 4 nuove
- **Type Definitions**: 3 nuove
- **Stati React**: 3 nuovi in ConservationPage

---

**Fine Documentazione**

# Miglioramenti UI Conservazione - Temperature

**Data**: 31 Gennaio 2026  
**Stato**: Implementato  
**Area**: Conservation - Letture Temperature  
**Contesto**: Raffinamenti post-implementazione del sistema a 3 tab (v2)

---

## Indice

1. [Panoramica](#panoramica)
2. [Contesto e Motivazioni](#contesto-e-motivazioni)
3. [Modifiche Dettagliate](#modifiche-dettagliate)
4. [Strutture Dati e Dipendenze](#strutture-dati-e-dipendenze)
5. [Flussi Utente](#flussi-utente)
6. [File Modificati - Riepilogo](#file-modificati---riepilogo)
7. [Commit e Versioning](#commit-e-versioning)

---

## Panoramica

Raffinamenti UI per la sezione **Letture Temperature** della pagina Conservazione: semplificazione layout (rimozione pannello anomalie), arricchimento informativo nelle card e nella tabella storico, pulsante rapido per rilevamento temperatura con selezione punto, e comportamento differenziato del click sulla card in base allo stato del punto.

### Obiettivi Raggiunti

- ✅ Layout tab Stato Corrente semplificato (solo griglia card)
- ✅ Ordinamento card per tipo (frigo → freezer → abbattitore → ambiente)
- ✅ Reparto mostrato nelle card e nella tabella storico
- ✅ Nome operatore in "Ultima lettura"
- ✅ Pulsante "Rileva Temperatura" nell'header con dropdown selezione punto
- ✅ Click card apre modal solo per stati richiedenti lettura
- ✅ Prop `centerTitle` aggiunta a CollapsibleCard (riutilizzabile)

---

## Contesto e Motivazioni

### Prima delle Modifiche

- La tab **Stato Corrente** includeva due sezioni: `TemperatureAlertsPanel` (anomalie + punti da rilevare) e la griglia di card. L'utente ha richiesto di mantenere solo le card.
- Le card erano ordinate per nome/creazione; la richiesta era ordinarle per tipo (priorità operativa: frigoriferi prima, poi freezer, abbattitore, ambiente).
- Mancavano informazioni contestuali: reparto del punto e operatore che ha effettuato la lettura.
- Per registrare una temperatura l'utente doveva cliccare sulla singola card; nessun punto d'ingresso rapido dall'header.
- Il click sulla card apriva sempre il modal, anche per punti conformi (non necessari ulteriori rilevamenti immediati).

### Dopo le Modifiche

- Layout più pulito: solo griglia card, nessun pannello ridondante.
- Card ordinate per tipologia di conservazione.
- Informazioni complete: reparto, operatore, data/ora ultima lettura.
- Accesso rapido al rilevamento tramite pulsante header con dropdown.
- Click sulla card solo quando ha senso (nessuna lettura o richiesta lettura).

---

## Modifiche Dettagliate

### 1. Tab Stato Corrente - Rimozione TemperatureAlertsPanel

**File**: `src/features/conservation/ConservationPage.tsx`

**Cosa è stato rimosso**:
- Il componente `TemperatureAlertsPanel` che mostrava:
  - Sezione ANOMALIE TEMPERATURA (bordo rosso): punti con temperatura fuori range
  - Sezione PUNTI DA RILEVARE OGGI (bordo arancione): punti senza lettura odierna
- L'import: `import { TemperatureAlertsPanel } from './components/TemperatureAlertsPanel'`

**Cosa rimane**:
- Solo la griglia responsive di `TemperaturePointStatusCard`:
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
  - Ogni card mostra già lo stato (conforme/critico/richiesta lettura/nessuna lettura) e le azioni contestuali

**Nota**: Il componente `TemperatureAlertsPanel` esiste ancora in `src/features/conservation/components/TemperatureAlertsPanel.tsx` ma non è più utilizzato. Può essere rimosso in futuro o riutilizzato altrove.

---

### 2. Ordinamento Card per Tipo

**File**: `src/features/conservation/ConservationPage.tsx`  
**Linee**: ~479-488 (all'interno della map delle card)

**Implementazione**:
```typescript
{[...conservationPoints]
  .sort((a, b) => {
    const typeOrder: Record<string, number> = {
      fridge: 0,
      freezer: 1,
      blast: 2,
      ambient: 3,
    }
    return (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4)
  })
  .map(point => ( ... ))}
```

**Dettagli**:
- Si usa `[...conservationPoints]` per non mutare l'array originale.
- `typeOrder` definisce la priorità: valori minori = prima nella lista.
- Tipi non presenti in `typeOrder` (es. eventuali estensioni future) ottengono `4` e finiscono in fondo.
- All'interno dello stesso tipo, l'ordine è quello originale (es. nome alfabetico se così arriva da `useConservationPoints`).

**Ordine finale**:
1. Frigoriferi (`fridge`)
2. Freezer (`freezer`)
3. Abbattitore (`blast`)
4. Ambiente (`ambient`)

---

### 3. Reparto nelle Card Stato

**File**: `src/features/conservation/components/TemperaturePointStatusCard.tsx`  
**Sezione**: Point Name & Department

**Struttura JSX**:
```tsx
<div className="mb-2 flex items-start justify-between">
  <div>
    <h3 className="font-semibold text-gray-900">{point.name}</h3>
    {point.department?.name && (
      <p className="text-xs text-gray-500 mt-0.5">{point.department.name}</p>
    )}
  </div>
  <Thermometer className="h-5 w-5 text-gray-400 shrink-0" />
</div>
```

**Comportamento**:
- Il reparto è mostrato sotto il nome del punto, con `text-xs text-gray-500`.
- Se `point.department` è `undefined` o `point.department.name` è vuoto, la riga non viene renderizzata.
- Il dato arriva da `useConservationPoints`, che carica `department:departments(id, name)` nella query Supabase.

---

### 4. Operatore in "Ultima lettura"

**File**: `src/features/conservation/components/TemperaturePointStatusCard.tsx`  
**Sezione**: Last Reading Time

**Struttura JSX**:
```tsx
{latestReading && (
  <div className="mt-2 text-xs text-gray-500">
    Ultima lettura: {new Date(latestReading.recorded_at).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}
    {latestReading.recorded_by_user && (() => {
      const u = latestReading.recorded_by_user!
      const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()
      return name ? <> da {name}</> : null
    })()}
  </div>
)}
```

**Logica nome operatore**:
- Priorità 1: `recorded_by_user.name` (es. da staff)
- Priorità 2: concatenazione `first_name` + `last_name`
- Se nessuno dei due è valorizzato: non viene mostrato "da ..."

**Esempio output**:
- `Ultima lettura: 31/01, 00:51 da Matteo Test`
- `Ultima lettura: 31/01, 00:51` (se `recorded_by_user` assente o nome vuoto)

**Origine dati**: `useTemperatureReadings` popola `recorded_by_user` tramite join con `user_profiles` (o fallback `company_members` → `staff`) usando `recorded_by` (auth user id).

---

### 5. Colonna Reparto nella Tabella Storico

**File**: `src/features/conservation/components/TemperatureReadingsTable.tsx`

**Modifica header tabella**:
- Aggiunta colonna "Reparto" tra "Punto" e "Temperatura".
- Ordine colonne: Ora | Punto | **Reparto** | Temperatura | Esito | Operatore

**Implementazione cella**:
```tsx
<td className="px-3 py-2 text-gray-600">
  {point?.department?.name || '-'}
</td>
```

**Lookup**: `point` viene da `pointsMap.get(reading.conservation_point_id)`, dove `points` è passato da `TemperatureHistorySection` (e quindi da `ConservationPage`). I punti includono `department` da `useConservationPoints`.

**Fallback**: Se il punto non ha reparto o non è trovato, viene mostrato "-".

---

### 6. Pulsante "Rileva Temperatura" nell'Header

**File**: `src/features/conservation/ConservationPage.tsx`  
**Collocazione**: Prop `actions` della `CollapsibleCard` "Letture Temperature"

#### 6.1 State e Ref

```typescript
const [showPointSelectorForTemperature, setShowPointSelectorForTemperature] = useState(false)
const pointSelectorRef = useRef<HTMLDivElement>(null)
```

#### 6.2 Chiusura al click fuori

```typescript
useEffect(() => {
  if (!showPointSelectorForTemperature) return
  const handleClickOutside = (e: MouseEvent) => {
    if (pointSelectorRef.current && !pointSelectorRef.current.contains(e.target as Node)) {
      setShowPointSelectorForTemperature(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [showPointSelectorForTemperature])
```

#### 6.3 Pulsante - Classi CSS (stile "Aggiungi Punto")

```
flex items-center gap-2 px-4 py-2.5 text-sm font-medium
bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg
hover:from-blue-700 hover:to-blue-800
shadow-sm hover:shadow-md
transition-all duration-200 transform hover:scale-105 active:scale-95
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100
```

- Disabilitato quando `conservationPoints.length === 0`.

#### 6.4 Dropdown

- **Posizionamento**: `absolute right-0 top-full z-20 mt-1`
- **Dimensioni**: `min-w-[220px]`
- **Contenuto**: titolo "Scegli punto di conservazione" + elenco punti ordinati per tipo (stesso `typeOrder` delle card).
- **Ogni voce**: icona termometro, nome punto, reparto tra parentesi se presente.
- **Click su voce**: `handleAddTemperature(point)` + `setShowPointSelectorForTemperature(false)`.
- **Stop propagation**: `e.stopPropagation()` sul click del pulsante per evitare toggle della card.

---

### 7. Rimozione Subtitle "X letture registrate"

**File**: `src/features/conservation/ConservationPage.tsx`

- Rimosso `subtitle={`${tempStats.total} letture registrate`}` dalla `CollapsibleCard` "Letture Temperature".
- `tempStats` continua a essere usato eventualmente altrove (es. analisi); non è stato rimosso.

---

### 8. Offset Titolo nell'Header

**File**: `src/features/conservation/ConservationPage.tsx`

- Aggiunto `headerClassName="[&>div:first-child]:mt-2"` alla `CollapsibleCard` "Letture Temperature".
- `[&>div:first-child]` applica `margin-top: 0.5rem` al primo figlio diretto dell'header (blocco titolo+icona).
- Effetto: titolo "Letture Temperature" leggermente più in basso, mantenendo allineamento a sinistra.

---

### 9. Prop centerTitle in CollapsibleCard

**File**: `src/components/ui/CollapsibleCard.tsx`

**Nuova prop**:
```typescript
centerTitle?: boolean  // default: false
```

**Comportamento quando `centerTitle === true`**:
- Header usa grid: `grid grid-cols-[1fr_auto_1fr] items-center gap-4`
- Blocco titolo: `justify-center col-start-2`
- Blocco azioni: `justify-end col-start-3`
- Titolo centrato orizzontalmente tra due colonne flessibili.

**Uso attuale**: non utilizzata sulla card "Letture Temperature" (titolo a sinistra).

---

### 10. Click Card - Solo Stati Richiedenti Lettura

**File**: `src/features/conservation/components/TemperaturePointStatusCard.tsx`

#### 10.1 Logica

```typescript
const isClickable = status === 'nessuna_lettura' || status === 'richiesta_lettura'

const handleCardClick = () => {
  if (isClickable) {
    onAddReading()
  }
}
```

#### 10.2 Classi condizionali

```tsx
className={`
  relative rounded-lg border-2 p-4 transition-all
  ${config.borderColor} ${config.bgColor}
  ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
`}
```

#### 10.3 Matrice comportamento per stato

| Stato | Click card | Cursor | Hover | Pulsante dedicato |
|-------|------------|--------|-------|-------------------|
| `conforme` | Nessun effetto | default | no | - |
| `critico` | Nessun effetto | default | no | "Correggi" → popover azione correttiva |
| `richiesta_lettura` | Apre modal rilevamento | pointer | shadow | "Registra Lettura" |
| `nessuna_lettura` | Apre modal rilevamento | pointer | shadow | "Prima Lettura" |

I pulsanti "Registra Lettura" e "Prima Lettura" usano `e.stopPropagation()` per evitare doppio trigger col click sulla card.

---

## Strutture Dati e Dipendenze

### ConservationPoint (rilevante per le modifiche)

```typescript
interface ConservationPoint {
  id: string
  name: string
  type: ConservationPointType  // 'fridge' | 'freezer' | 'blast' | 'ambient'
  setpoint_temp: number
  department?: { id: string; name: string }
  // ... altri campi
}
```

### TemperatureReading (rilevante per le modifiche)

```typescript
interface TemperatureReading {
  id: string
  conservation_point_id: string
  temperature: number
  recorded_at: string | Date
  recorded_by?: string  // auth user id
  recorded_by_user?: {
    id: string
    first_name?: string
    last_name?: string
    name?: string
  }
  // ... altri campi
}
```

### Hook e dati

- **useConservationPoints**: fornisce `conservationPoints` con `department` popolato da `department:departments(id, name)`.
- **useTemperatureReadings**: fornisce `temperatureReadings` con `recorded_by_user` popolato da query aggiuntive su `user_profiles` / `company_members`.

---

## Flussi Utente

### Rilevamento temperatura da header

1. Utente clicca "Rileva Temperatura".
2. Si apre dropdown con punti ordinati per tipo.
3. Utente seleziona un punto.
4. Si apre `AddTemperatureModal` con quel punto.
5. Dropdown si chiude.
6. Utente inserisce temperatura e salva.
7. Lista letture si aggiorna; la card del punto riflette il nuovo stato.

### Rilevamento temperatura da card

1. Utente vede card con stato `nessuna_lettura` o `richiesta_lettura`.
2. Clicca sulla card o sul pulsante "Prima Lettura" / "Registra Lettura".
3. Si apre `AddTemperatureModal` per quel punto.
4. Stesso flusso di salvataggio e aggiornamento.

### Card conforme o critica

1. Utente vede card con stato `conforme` o `critico`.
2. Click sulla card non produce alcun effetto.
3. Se `critico`, l’unica azione disponibile è il pulsante "Correggi" → popover azione correttiva.

---

## File Modificati - Riepilogo

| File | Tipo modifica | Contenuto |
|------|---------------|-----------|
| `ConservationPage.tsx` | Modifica | Rimozione TemperatureAlertsPanel, ordinamento card, pulsante Rileva Temperatura + dropdown, subtitle, headerClassName, state/effect per dropdown |
| `TemperaturePointStatusCard.tsx` | Modifica | Reparto, operatore in ultima lettura, `isClickable`, classi condizionali, `handleCardClick` |
| `TemperatureReadingsTable.tsx` | Modifica | Colonna Reparto in thead e tbody |
| `CollapsibleCard.tsx` | Estensione | Prop `centerTitle`, layout grid quando attiva |

### Linee di codice (approssimative)

- **ConservationPage.tsx**: ~+50 / -35
- **TemperaturePointStatusCard.tsx**: ~+20 / -5
- **TemperatureReadingsTable.tsx**: ~+5
- **CollapsibleCard.tsx**: ~+5

---

## Commit e Versioning

| Hash | Descrizione |
|------|-------------|
| `af8d1e4e` | Conservazione: miglioramenti UI temperature e storico |
| `c06b924a` | Conservazione: rimuovi subtitle letture, aggiungi centerTitle a CollapsibleCard, offset titolo |

*Nota: la modifica sul click card (solo per nessuna_lettura/richiesta_lettura) può essere stata inclusa in uno di questi commit o in uno successivo.*

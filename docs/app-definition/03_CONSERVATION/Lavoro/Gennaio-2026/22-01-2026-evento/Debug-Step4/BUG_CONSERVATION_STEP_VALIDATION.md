# 🐛 Bug: Pulsante "Avanti" disabilitato dopo Precompila - Step Conservazione

## 📋 Descrizione

Dopo aver cliccato il pulsante **"Precompila"** nell'onboarding, lo step 4 (Conservazione) mostra i punti precompilati ma il pulsante **"Avanti"** resta disabilitato. 

L'utente deve:
1. Cliccare "Modifica" su un punto
2. Cliccare "Aggiorna" nel modal
3. Solo allora il pulsante "Avanti" si abilita

## 🔍 Analisi

### Problema identificato

Il problema è nella sincronizzazione tra:
- Dati precompilati salvati in `localStorage` → `formData.conservation.points`
- State locale `points` in `ConservationStep`
- Validazione che controlla `points` per abilitare/disabilitare "Avanti"

### Flusso attuale

1. **Precompila** → salva in `localStorage` con `source: 'prefill'`
2. **OnboardingWizard** carica da `localStorage` → `formData.conservation.points`
3. **ConservationStep** riceve `data={formData.conservation}`
4. **useState iniziale**: `points = (data?.points ?? []).map(normalizeConservationPoint)`
5. **useEffect sincronizzazione**: Solo se `points.length === 0` → non parte se punti già presenti
6. **Validazione**: Controlla `points` → potrebbe fallire se `source` mancante o altri campi

### Possibili cause

1. **Sincronizzazione non parte**: `points.length === 0` è falso se punti già inizializzati
2. **Normalizzazione incompleta**: `normalizeConservationPoint` potrebbe non preservare tutti i campi
3. **Validazione fallisce**: Schema Zod richiede `source` ma potrebbe mancare dopo normalizzazione
4. **Timing**: I dati arrivano ma la validazione viene eseguita prima della sincronizzazione

## 🔧 Fix applicati

### 1. Preservazione `source` in `mapModalDataToOnboardingPoint`
- Aggiunto parametro `existingPoint` per preservare `source` durante modifica
- Default `'manual'` se nuovo punto

### 2. Default `source` in `normalizeConservationPoint`
- `source: point.source ?? 'manual'` per evitare `undefined`

### 3. Sincronizzazione migliorata
- useEffect che sincronizza quando `data?.points` cambia
- **PROBLEMA**: Condizione `points.length === 0` impedisce sincronizzazione se punti già presenti

## 🐛 Bug rimanente

La sincronizzazione non funziona se:
- I punti vengono inizializzati da `useState` con dati da `data?.points`
- Ma questi dati non sono normalizzati correttamente o mancano campi
- Il useEffect di sincronizzazione non parte perché `points.length > 0`

## 🔍 Debug aggiunto

Aggiunto logging dettagliato per tracciare:
- Quando `data` cambia e quali punti contiene
- Quando `points` viene aggiornato
- Risultato validazione per ogni punto
- Perché la validazione fallisce (errori specifici)

## 📝 Note

- Il problema si verifica solo quando Precompila viene chiamato **dopo** che ConservationStep è già montato
- Se Precompila viene chiamato **prima** di navigare allo step Conservazione, funziona
- Dopo "Modifica" → "Aggiorna", il punto viene normalizzato correttamente e la validazione passa

## ✅ Fix finale applicato

### Problema identificato dai log

**Errore**: `{maintenanceTasks: 'Required'}` per tutti i punti

**Causa root**: I task precompilati hanno formato italiano (`manutenzione`, `frequenza`, `note`) ma lo schema Zod richiede formato inglese (`title`, `type`, `frequency`). La funzione `normalizeMaintenanceTask` non convertiva correttamente:

1. **`title` mancante**: Schema richiede `title: z.string().min(2)` ma i task precompilati non hanno `title`, solo `manutenzione`
2. **`type` mancante**: Schema richiede `type: z.enum(...)` ma i task hanno solo `manutenzione` (italiano)
3. **`frequency` mancante**: Schema richiede `frequency: z.enum(...)` ma i task hanno solo `frequenza` (italiano)

### Soluzione implementata

Modificata `normalizeMaintenanceTask` in `conservationUtils.ts` per:

1. **Generare `title`** da `manutenzione` usando mapping:
   - `rilevamento_temperatura` → `"Rilevamento Temperatura"`
   - `sanificazione` → `"Sanificazione"`
   - etc.
   - Fallback: usa `note` se disponibile
   - Ultimo fallback: `"Manutenzione programmata"`

2. **Convertire `manutenzione` → `type`**:
   - `rilevamento_temperatura` → `temperature`
   - `sanificazione` → `sanitization`
   - etc.

3. **Convertire `frequenza` → `frequency`**:
   - `giornaliera` → `daily`
   - `settimanale` → `weekly`
   - `mensile` → `monthly`

4. **Aggiunto debug** per tracciare le conversioni applicate

### Risultato atteso

Dopo questo fix, i punti precompilati dovrebbero:
- ✅ Passare la validazione Zod
- ✅ Abilitare il pulsante "Avanti" senza dover cliccare "Modifica" → "Aggiorna"
- ✅ Mantenere i campi italiani per compatibilità con AddPointModal

> **Stato Fase 3** (2026-07-06): `verificato-rotto` · Fonte: [`FASE3_REPORT_A2`](../../META/FASE3_REPORT_A2_CONSERVATION.md) §5.5  
> **Motivo**: claim «Campi Salvati» migration 015 — colonne assenti su DB live; letture non persistono (BUG-005).  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# TEMPERATURE_READINGS_SECTION - DOCUMENTAZIONE COMPLETA

**Data Creazione**: 2026-01-16
**Ultima Modifica**: 2026-02-05
**Versione**: 3.2.0
**File Componente**: `src/features/conservation/ConservationPage.tsx` (sezione "Letture Temperature")
**Tipo**: Sezione Pagina

**Nuove Features (v3.2.0 - 05-02-2026)**:
- ✅ **Struttura 3 Tab**: Stato Corrente (griglia `TemperaturePointStatusCard`, punti senza blast, ordinati per tipo fridge→freezer→ambient), Storico (`TemperatureHistorySection` con filtri e raggruppamento date), Analisi (`TemperatureAnalysisTab` con grafico recharts e statistiche)
- ✅ **Tolleranza Unica ±1°C**: Setpoint ±1°C per tutti i tipi (dentro = conforme, fuori = critico). Fonte: `correctiveActions.ts` TOLERANCE_C = 1.0
- ✅ **Campi Salvati**: `method`, `notes`, `photo_evidence`, `recorded_by` salvati in `temperature_readings` (migration 015)

**Features (v3.0.0 - 04-02-2026)**:
- ✅ **Completamento automatico task "Rilevamento Temperature"**: Al salvataggio di una lettura (pulsante "Rileva Temperatura"), l'hook `useTemperatureReadings.createReading` inserisce in `maintenance_completions` le task di tipo "Rilevamento Temperature" per quel punto con `next_due <= recorded_at`. La task risulta completata in Conservazione (card Manutenzioni Programmate) e in Attività/calendario. Invalidazioni: `maintenance-tasks`, `maintenance-tasks-critical`, `calendar-events`, `macro-category-events`, `maintenance-completions` + evento `calendar-refresh`.

**Features (v2.0.0)**:
- ✅ **Nome Utente visibile**: Ogni lettura mostra chi ha registrato la temperatura
- ✅ **Campo `recorded_by`**: Salvato in DB e risolto via `user_profiles.auth_user_id`
- ✅ **Fallback query**: Se utente non in `user_profiles`, cerca in `company_members` → `staff`
- ✅ **Metodo registrazione**: Manuale / Termometro digitale / Sensore automatico

---

## 🎯 SCOPO

### Scopo Business
La sezione "Letture Temperature" permette all'utente di avere sott'occhio tutte le letture di temperatura effettuate sui punti di conservazione dell'azienda. Rappresenta il centro di monitoraggio per la conformità HACCP relativa alle temperature.

Questa sezione risolve il bisogno di:
- **Monitorare** tutte le letture di temperatura registrate
- **Consultare** rapidamente lo stato di conformità (Conforme, Attenzione, Critico)
- **Registrare** nuove letture di temperatura in modo semplice e veloce
- **Visualizzare chi ha registrato** ogni lettura (nome e cognome dell'utente)
- **Ricercare** le ultime letture per sapere rapidamente chi ha fatto la lettura e se è tutto ok
- **Organizzare** migliaia di letture (considerando 1 anno intero di attività) in una struttura scalabile

### Scopo Tecnico
La sezione è implementata all'interno di una `CollapsibleCard` con navigazione a 3 tab:

- **Tab "Stato Corrente"**: Griglia `TemperaturePointStatusCard` con punti (escluso blast), ordinati per tipo (fridge→freezer→ambient), badge stato, ultima lettura, azioni correttive
- **Tab "Storico"**: `TemperatureHistorySection` con tabella letture, filtri periodo/punto/anomalie, raggruppamento per data, dettagli espandibili (metodo/note/foto)
- **Tab "Analisi"**: `TemperatureAnalysisTab` con grafico recharts (banda range, tooltip, pallini conformi/fuori), statistiche aggregate
- **Pulsante "Rileva Temperatura"**: Dropdown selettore punto nell'header per aprire modal registrazione
- **Gestione stato**: Calcolo automatico stato (conforme/critico) con tolleranza ±1°C unica per tutti i tipi
- **Nome utente** (v2.0.0): Risoluzione `recorded_by` → `user_profiles` → nome completo

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
La sezione viene mostrata quando:

- L'utente naviga alla pagina Conservazione
- La sezione "Letture Temperature" è espansa (di default è espansa)
- L'utente ha completato l'onboarding (le letture possono essere vuote)

**Condizioni di accesso:**
- L'utente deve essere autenticato
- L'utente deve avere un `company_id` valido (gestito tramite `useAuth()`)
- Non sono necessari permessi specifici per la visualizzazione (politiche RLS gestiscono l'accesso)

**Ruoli utente:**
- **Tutti i membri** possono visualizzare le letture di temperatura
- **Tutti i membri** possono registrare nuove letture
- Solo **manager/admin** possono modificare/eliminare letture (gestito da RLS policies)

### Casi d'Uso Principali

1. **Consultare stato generale letture**
   - **Scenario**: Un responsabile HACCP vuole verificare rapidamente quante letture sono conformi, in attenzione o critiche
   - **Azione**: Apre la pagina Conservazione, visualizza le mini-card statistiche nella sezione "Letture Temperature"
   - **Risultato**: Vede immediatamente "Totale 3, Conformi 1, Attenzione 1, Critiche 1"

2. **Registrare nuova temperatura**
   - **Scenario**: Un dipendente ha appena controllato la temperatura del "Frigo 2" e deve registrarla
   - **Azione**: Usa il dropdown "Registra temperatura...", seleziona "Frigo 2", inserisce la temperatura nel modal
   - **Risultato**: La lettura viene salvata e visualizzata nella lista, aggiornando le statistiche

3. **Verificare ultime letture**
   - **Scenario**: Un manager vuole vedere le ultime letture per verificare che tutto sia sotto controllo
   - **Azione**: Scorre la lista delle letture (ordinate per data più recente), vede temperatura, stato, punto, timestamp
   - **Risultato**: Identifica rapidamente le letture recenti e il loro stato di conformità

4. **Identificare letture critiche**
   - **Scenario**: Un responsabile vuole trovare tutte le letture fuori range per intervenire
   - **Azione**: Visualizza le card con badge "Critico" (rosso), legge il messaggio HACCP con consigli
   - **Risultato**: Identifica rapidamente i punti che richiedono intervento urgente

### Flusso Utente

**Flusso principale - Consultazione:**
1. Utente naviga a "Conservazione" dal menu principale
2. La pagina carica automaticamente tutte le letture di temperatura dell'azienda
3. Utente vede la sezione "Letture Temperature" (di default espansa)
4. Nella parte superiore, vede 4 mini-card statistiche: Totale, Conformi, Attenzione, Critiche
5. Sotto le statistiche, vede la lista delle letture ordinate per data più recente
6. Ogni lettura mostra: temperatura, nome punto, stato (badge colorato), **nome utente che ha registrato** (v2.0.0), range tolleranza, differenza temperatura, timestamp, messaggio HACCP
7. Cliccando su una card, può modificare/eliminare (se ha permessi)

**Dettaglio nome utente (v2.0.0):**
- Il sistema cerca il nome in `user_profiles` usando `auth_user_id` = `recorded_by`
- Se trovato, mostra "Registrata da: Mario Rossi"
- **Fallback**: Se non trovato in `user_profiles`, cerca in `company_members` → `staff`
- Query eseguita da `useTemperatureReadings` hook

**Flusso registrazione nuova temperatura (v3.0.0: con completamento automatico task temperatura):**
1. Utente usa il pulsante/dropdown **"Rileva Temperatura"** (o "Registra temperatura...") nell'header della CollapsibleCard
2. Seleziona un punto di conservazione dalla lista (es. "Frigo 2")
3. Si apre il modal `AddTemperatureModal` con il punto selezionato
4. Utente inserisce la temperatura rilevata (es. 6.0°C)
5. Il sistema mostra in anteprima lo stato calcolato (Conforme/Attenzione/Critico)
6. Utente può aggiungere metodo di rilevazione, note, foto evidenza
7. Utente salva → la lettura viene registrata; **in backend** (hook `useTemperatureReadings`): per quel punto vengono cercate le task "Rilevamento Temperature" con scadenza soddisfatta dalla data della lettura (`next_due <= recorded_at`) e per ognuna viene inserito un record in `maintenance_completions`. Il trigger DB aggiorna la task (next_due, last_completed, status). Vengono invalidate le cache manutenzioni e calendario.
8. **Atteggiamento atteso**: La lista letture si aggiorna; la card "Manutenzioni Programmate" e la pagina Attività mostrano la task "Rilevamento Temperature" come completata per quel punto. L'utente non deve andare in Attività a cliccare "Completa Manutenzione" per la temperatura.

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili

#### Conflitto 1: Registrazione temperatura simultanea
- **Quando si verifica**: Due utenti registrano temperature diverse per lo stesso punto contemporaneamente
- **Cosa succede**: Entrambe le letture vengono create correttamente, ognuna con il proprio timestamp
- **Come viene gestito**: **COMPORTAMENTO CORRETTO** - Ogni lettura è indipendente. L'ultima lettura (per timestamp) diventa la `last_temperature_reading` del punto. Non c'è conflitto perché ogni lettura è un record separato.
- **Esempio**: Dipendente A registra 4°C per "Frigo 2" alle 10:00, Dipendente B registra 5°C per "Frigo 2" alle 10:05. Entrambe vengono salvate, la seconda diventa la lettura più recente del punto.

#### Conflitto 2: Modifica lettura con aggiornamento simultaneo
- **Quando si verifica**: Due utenti modificano contemporaneamente la stessa lettura (ATTUALMENTE NON IMPLEMENTATO)
- **Cosa succede**: **ATTUALMENTE NON GESTITO** - La modifica non è ancora implementata (mostra solo alert "Funzionalità in arrivo")
- **Come viene gestito**: Quando verrà implementata, dovrà essere gestito con optimistic locking usando `updated_at` timestamp
- **Esempio**: (Futuro) Manager A modifica temperatura da 4°C a 5°C, Manager B modifica da 4°C a 3°C contemporaneamente. Il secondo salvataggio dovrebbe mostrare conflitto e permettere merge.

#### Conflitto 3: Eliminazione lettura durante visualizzazione
- **Quando si verifica**: Un utente elimina una lettura mentre un altro utente la sta visualizzando
- **Cosa succede**: La lettura viene eliminata dal database, ma l'altro utente continua a vederla finché non ricarica la pagina
- **Come viene gestito**: **ATTUALMENTE NON GESTITO** - Non ci sono real-time updates. La cache React Query viene invalidata solo dopo mutazioni locali.
- **Esempio**: Utente A elimina una lettura critica, Utente B continua a vederla fino a refresh manuale pagina.

**Soluzione proposta**: Implementare Supabase Realtime subscriptions per aggiornamenti automatici quando letture vengono eliminate/modificate da altri utenti.

### Conflitti Multi-Utente

**Registrazione simultanea:**
- **Comportamento attuale**: Non c'è conflitto - ogni lettura è indipendente con timestamp
- **Comportamento corretto**: Le letture vengono create con timestamp, quindi l'ordine è determinato dalla data/ora. L'ultima lettura diventa la `last_temperature_reading` del punto automaticamente.

**Visualizzazione simultanea:**
- **Comportamento attuale**: Ogni utente vede le proprie letture in cache (React Query). Se un utente elimina/modifica, gli altri non vedono l'aggiornamento in tempo reale.
- **Rischio**: Utenti potrebbero vedere dati obsoleti o eliminare/modificare letture già eliminate da altri.
- **Soluzione proposta**: Implementare real-time subscriptions per sincronizzazione automatica.

### Conflitti di Sincronizzazione

**Comportamento offline:**
- **Situazione**: L'app non gestisce attualmente lo stato offline per le letture temperatura
- **Cosa succede**: Se l'utente è offline, le chiamate API falliscono e viene mostrato un errore generico
- **Rischio**: Perdita di dati se l'utente ha registrato temperature senza connessione

**Soluzione proposta**: Implementare sistema di sincronizzazione offline con:
- Queue locale per letture pendenti
- Sync automatico quando la connessione viene ripristinata
- Indicatore visivo dello stato di sincronizzazione
- Gestione conflitti al ripristino (usare timestamp per determinare versione più recente)

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
La sezione viene generata automaticamente quando:

- L'utente naviga alla route `/conservation` (definita nel router dell'applicazione)
- Il componente `ConservationPage` viene montato e carica i dati automaticamente tramite `useTemperatureReadings()` hook
- La sezione è contenuta in una `CollapsibleCard` con `defaultExpanded={true}`

**Trigger di caricamento:**
- Mount del componente (`useEffect` interno all'hook `useQuery`)
- Invalidation della query cache (dopo creazione/eliminazione lettura)
- Cambio di `company_id` (utente cambia azienda)

### Generazione Manuale
Non applicabile - questa è una sezione della pagina, non un elemento creato dall'utente.

### Condizioni di Generazione

**Condizioni obbligatorie:**
1. Utente autenticato (gestito da `ProtectedRoute` wrapper)
2. `company_id` valido presente nel contesto auth
3. Permessi di lettura per la tabella `temperature_readings` (RLS policy)

**Condizioni opzionali:**
- Letture possono essere vuote (sezione mostra messaggio "Nessuna lettura di temperatura" con pulsanti per creare)
- Punti di conservazione possono essere vuoti (il dropdown "Registra temperatura..." è disabilitato se non ci sono punti)

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente

La sezione è implementata all'interno di `ConservationPage.tsx`:

```typescript
// Sezione "Letture Temperature" in ConservationPage.tsx
<CollapsibleCard
  title="Letture Temperature"
  subtitle={`${tempStats.total} letture registrate`}
  defaultExpanded={true}
  icon={Clock}
  actions={
    <select onChange={...}>
      <option value="">Registra temperatura...</option>
      {conservationPoints.map(point => (
        <option key={point.id} value={point.id}>{point.name}</option>
      ))}
    </select>
  }
>
  {/* Mini Statistics */}
  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
    {/* Totale, Conformi, Attenzione, Critiche cards */}
  </div>

  {/* Lista Letture */}
  {isLoadingReadings ? (
    <LoadingSkeleton />
  ) : temperatureReadings.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="space-y-4">
      {temperatureReadings
        .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
        .map(reading => (
          <TemperatureReadingCard
            key={reading.id}
            reading={reading}
            onEdit={handleEditReading}
            onDelete={handleDeleteReading}
          />
        ))}
    </div>
  )}
</CollapsibleCard>
```

### Props Richieste
Questa sezione non riceve props dirette. I dati vengono caricati tramite hooks che accedono al contesto di autenticazione.

### State Management

**State locale (useState nel parent ConservationPage):**
- `showTemperatureModal: boolean` - controlla visibilità modal registrazione temperatura
- `selectedPointForTemperature: ConservationPoint | null` - punto per cui registrare temperatura
- `editingReading: TemperatureReading | null` - lettura in modifica (attualmente non usato, feature futura)

**State globale (hooks + React Query):**
- `temperatureReadings: TemperatureReading[]` - lista letture (da `useTemperatureReadings()`)
- `tempStats: TemperatureStats` - statistiche aggregate (da `useTemperatureReadings()`)
- `isLoadingReadings: boolean` - stato caricamento letture
- `conservationPoints: ConservationPoint[]` - lista punti (per dropdown registrazione)

**Cache management (React Query):**
- Query key: `['temperature-readings', companyId]`
- Auto-refresh: quando viene invalidata la cache dopo mutazioni (create/delete)
- Cache time: default di React Query (5 minuti)

### Hooks Utilizzati

- **`useTemperatureReadings()`**: 
  - Carica letture temperatura dal database
  - Fornisce funzioni per creare/eliminare letture
  - Calcola statistiche aggregate (totale, conformi, attenzione, critiche)
  - Gestisce cache React Query

- **`useConservationPoints()`**: (per dropdown)
  - Carica punti di conservazione per popolare il dropdown "Registra temperatura..."
  - Fornisce lista punti disponibili per registrazione

- **`useAuth()`**: (interno agli hook)
  - Fornisce `company_id` per filtrare i dati per azienda
  - Gestisce autenticazione utente

### Funzioni Principali

#### `closeTemperatureModal()` (ConservationPage)
- **Scopo**: Chiude il modal temperatura, resetta state e azzera `location.state` (per evitare ri-aperture da deep link Attività). Usata come `onClose` del modal e nell'`onSuccess` di create/update lettura.
- **Logica**: `setShowTemperatureModal(false)`, `setSelectedPointForTemperature(null)`, `setEditingReading(null)`, `navigate(pathname, { replace: true, state: {} })`.

#### `handleAddTemperature(point)`
- **Scopo**: Apre il modal per registrare una temperatura per un punto specifico
- **Parametri**: `point: ConservationPoint` - punto per cui registrare temperatura
- **Ritorna**: void
- **Logica**: 
  1. Imposta `selectedPointForTemperature` con il punto selezionato
  2. Apre il modal temperatura (`setShowTemperatureModal(true)`). L'apertura può avvenire anche da Attività tramite `location.state.openTemperatureForPointId` (useEffect sulla pagina).

#### `handleSaveTemperature(readingData)`
- **Scopo**: Salva una nuova lettura di temperatura (o aggiorna se in modalità edit)
- **Parametri**: `readingData` - dati lettura (senza id, company_id, timestamp)
- **Ritorna**: void
- **Logica**: 
  1. Se edit: `updateReading(..., { onSuccess: () => { setEditingReading(null); closeTemperatureModal() } })`. Se nuova: `createReading(readingData, { onSuccess: () => { ...; closeTemperatureModal() } })`.
  2. La chiusura del modal avviene **solo in onSuccess**; durante il salvataggio il modal resta aperto; in caso di errore l'utente può riprovare.
  3. La cache viene invalidata automaticamente dall'hook.

#### `handleEditReading(reading)`
- **Scopo**: Gestisce la modifica di una lettura (ATTUALMENTE NON IMPLEMENTATO)
- **Parametri**: `reading: TemperatureReading` - lettura da modificare
- **Ritorna**: void
- **Logica**: 
  - Mostra alert "Funzionalità in arrivo"
  - TODO: Implementare modal di modifica

#### `handleDeleteReading(id)`
- **Scopo**: Elimina una lettura di temperatura dopo conferma
- **Parametri**: `id: string` - ID lettura da eliminare
- **Ritorna**: void
- **Logica**: 
  1. Mostra dialog di conferma (`confirm()`)
  2. Se confermato, chiama `deleteReading(id)`
  3. La cache viene invalidata automaticamente dall'hook

### Validazioni

**Validazioni client-side:**
- Nessuna validazione diretta nella sezione (gestite nel modal `AddTemperatureModal`)
- Validazione presenza `company_id` (gestita negli hook, ritorna array vuoto se mancante)

**Validazioni server-side:**
- RLS policies: controllano che `company_id` corrisponda all'azienda dell'utente
- Foreign key constraints: `conservation_point_id` deve esistere in `conservation_points`
- Not null constraints: campi obbligatori come `temperature`, `conservation_point_id`, `company_id`
- Check constraints: `temperature` deve essere un numero valido (gestito da database)

### Gestione Errori

**Errori di caricamento:**
- **Quando**: Errore nella query delle letture temperatura
- **Cosa succede**: `isLoadingReadings` rimane `true`, `error` viene popolato dall'hook
- **UI**: La sezione mostra skeleton loading, ma non gestisce esplicitamente l'errore (da migliorare)
- **Logging**: Errore loggato in console dall'hook

**Errori di salvataggio:**
- **Quando**: Errore nella creazione di una lettura
- **Cosa succede**: `toast.error()` mostra messaggio generico "Errore nella creazione della lettura"
- **UI**: Modal rimane aperto, utente può riprovare
- **Logging**: Errore loggato in console

**Errori di eliminazione:**
- **Quando**: Errore nell'eliminazione di una lettura
- **Cosa succede**: `toast.error()` mostra messaggio generico "Errore nell'eliminazione della lettura"
- **UI**: Lista non viene aggiornata, utente può riprovare
- **Logging**: Errore loggato in console

**Soluzione proposta**: Migliorare gestione errori con:
- Messaggi di errore più specifici (es. "Temperatura non valida", "Punto di conservazione non trovato")
- Retry automatico per errori di rete
- Fallback UI quando i dati non possono essere caricati
- Indicatori visivi dello stato di errore

---

## 🎨 LAYOUT

### Struttura Layout

```
┌─────────────────────────────────────────────────────────┐
│ CollapsibleCard: "Letture Temperature"                  │
│ Header: Titolo + Counter "7 punti"                      │
│         + Pulsante "Rileva Temperatura" (dropdown)       │
├─────────────────────────────────────────────────────────┤
│ Content (se espanso):                                    │
│                                                           │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Tab Navigation: [Stato Corrente][Storico][Analisi]│ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
│   [Tab "Stato Corrente" - attivo]                       │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Griglia TemperaturePointStatusCard (2 colonne)     │ │
│   │ ┌──────────────┐  ┌──────────────┐                │ │
│   │ │ Frigo 1      │  │ Frigo 2      │                │ │
│   │ │ Target: 3°C  │  │ Target: 4°C  │                │ │
│   │ │ Badge verde  │  │ Badge rosso  │                │ │
│   │ │ Ultima lett. │  │ Ultima lett. │                │ │
│   │ └──────────────┘  └──────────────┘                │ │
│   │ ┌──────────────┐  ┌──────────────┐                │ │
│   │ │ Freezer 1    │  │ Ambiente 1   │                │ │
│   │ └──────────────┘  └──────────────┘                │ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
│   [Tab "Storico"]                                        │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Filtri: [Periodo] [Punto] [Solo anomalie]         │ │
│   │ Tabella raggruppata per data con dettagli         │ │
│   │ espandibili (metodo, note, foto)                   │ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
│   [Tab "Analisi"]                                        │
│   ┌───────────────────────────────────────────────────┐ │
│   │ Grafico recharts con banda range, tooltip,        │ │
│   │ pallini conformi/fuori + statistiche aggregate     │ │
│   └───────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Responsive Design

**Mobile (< 640px):**
- Layout a colonna singola
- Mini statistiche: 1 colonna (`grid-cols-1`)
- Dropdown "Registra temperatura..." full-width o con spacing adeguato
- Card letture: full-width con padding ridotto
- Pulsanti Modifica/Elimina: full-width o stack verticale

**Tablet (640px - 1024px):**
- Mini statistiche: 2 colonne (`sm:grid-cols-2`)
- Dropdown "Registra temperatura..." con larghezza ottimizzata
- Card letture: full-width con padding normale
- Pulsanti Modifica/Elimina: affiancati con spazio adeguato

**Desktop (> 1024px):**
- Mini statistiche: 4 colonne (`md:grid-cols-4`)
- Dropdown "Registra temperatura..." nell'header della card
- Card letture: full-width ottimizzato con più spazio laterale
- Pulsanti Modifica/Elimina: affiancati con spacing ottimizzato

### Styling

**Colori principali:**
- Background sezione: `bg-white` con `border border-gray-200` e `shadow-sm`
- Mini statistiche:
  - Totale: `bg-blue-50`, `border-blue-200`, `text-blue-900`
  - Conformi: `bg-green-50`, `border-green-200`, `text-green-900`
  - Attenzione: `bg-yellow-50`, `border-yellow-200`, `text-yellow-900`
  - Critiche: `bg-red-50`, `border-red-200`, `text-red-900`
- Dropdown registrazione: `bg-blue-600 text-white rounded hover:bg-blue-700`
- Stati lettura:
  - Conforme: `text-green-600`, `bg-green-50`, `border-green-200`
  - Attenzione: `text-yellow-600`, `bg-yellow-50`, `border-yellow-200`
  - Critico: `text-red-600`, `bg-red-50`, `border-red-200`

**Spaziature:**
- Container sezione: padding interno gestito dalla CollapsibleCard
- Mini statistiche: `mb-6` (margin-bottom 24px), `gap-3` (gap 12px), `p-3` (padding 12px)
- Spazio tra card letture: `space-y-4` (16px verticale)
- Padding interno card: `p-4` (16px)

**Tipografia:**
- Titolo sezione: gestito da CollapsibleCard (default: `text-lg font-semibold`)
- Mini statistiche label: `text-xs` (12px)
- Mini statistiche valore: `text-lg font-bold` (18px bold)
- Card lettura temperatura: `text-base font-medium` (16px medium)
- Card lettura dettagli: `text-sm` (14px)
- Timestamp: `text-sm text-gray-600` (14px grigio)

**Effetti hover/focus:**
- Card letture: `hover:shadow-md transition-shadow` (shadow aumenta al hover)
- Dropdown: `hover:bg-blue-700 transition-colors` (colore cambia al hover)
- Pulsanti Modifica/Elimina: `hover:bg-gray-50` / `hover:bg-red-50` con `transition-colors`
- Focus ring: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-1` su elementi interattivi

### Accessibilità

**ARIA labels utilizzati:**
- `role="region"` sulla CollapsibleCard content
- `aria-expanded` sull'header della card collassabile
- `aria-controls` per collegare header e content
- `aria-labelledby` per associare regioni ai titoli

**Keyboard navigation:**
- CollapsibleCard header: `tabIndex={0}`, risponde a `Enter` e `Space` per espandere/collassare
- Dropdown: navigabile con tastiera (Tab, Arrow keys, Enter per selezionare)
- Pulsanti Modifica/Elimina: focusabile con Tab, attivabili con Enter/Space
- Card letture: non focusabili direttamente (pulsanti interni sono focusabili)

**Screen reader support:**
- Tutti i testi informativi sono visibili (non solo icone)
- Mini statistiche hanno label descrittive ("Totale", "Conformi", ecc.)
- Stati di loading/error hanno `role="status"` e `aria-live="polite"` (da implementare)
- Timestamp sono formattati in modo leggibile (es. "10/01/2026, 10:30")

**Contrasto colori:**
- Testo su background: minimo 4.5:1 (WCAG AA)
- Stati colorati (verde/giallo/rosso): rispettano i contrasti minimi
- Focus indicators: visibili con contrasto sufficiente

**Miglioramenti proposti:**
- Aggiungere `aria-label` descrittivi ai pulsanti icona (Modifica, Elimina)
- Aggiungere `aria-describedby` per spiegare azioni distruttive (eliminazione)
- Migliorare feedback audio per letture critiche
- Aggiungere `aria-live="polite"` per aggiornamenti automatici delle statistiche

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento

1. **Inizializzazione**: 
   - Il componente `ConservationPage` viene montato quando l'utente naviga alla route
   - `useTemperatureReadings()` hook viene eseguito automaticamente
   - `useQuery` carica i dati da Supabase filtrati per `company_id`
   - Se `company_id` non è disponibile, ritorna array vuoto e logga warning

2. **Caricamento dati**:
   - Query Supabase: `SELECT * FROM temperature_readings WHERE company_id = ? ORDER BY recorded_at DESC`
   - Include join con `conservation_points` per ottenere nome punto, tipo, setpoint_temp
   - Dati vengono trasformati in oggetti `TemperatureReading` con tipizzazione TypeScript
   - Statistiche vengono calcolate lato client aggregando i dati per stato (compliant/warning/critical)

3. **Rendering iniziale**:
   - Se `isLoadingReadings === true`: mostra skeleton loading con animazione pulse (3 card placeholder)
   - Se `isLoadingReadings === false && readings.length === 0`: mostra empty state con messaggio e pulsanti per creare prima lettura
   - Se dati presenti: renderizza la struttura completa con statistiche e lista letture

4. **Calcolo statistiche**:
   - `total`: conteggio totale letture (`temperatureReadings.length`)
   - `compliant`: conteggio letture in range (differenza temperatura vs setpoint <= tolleranza)
   - `warning`: conteggio letture fuori range ma non critiche (differenza > tolleranza && <= tolleranza + 2)
   - `critical`: conteggio letture fuori range critico (differenza > tolleranza + 2)
   - Tolleranza varia per tipo punto: blast = 5°C, ambient = 3°C, altri = 2°C

5. **Ordinamento letture**:
   - Letture vengono ordinate per `recorded_at DESC` (più recenti prima)
   - Ordinamento avviene lato client dopo il caricamento
   - Le ultime letture sono sempre in cima alla lista

6. **Interazione utente - Registrazione temperatura**:
   - Utente seleziona punto dal dropdown "Registra temperatura..." oppure arriva da Attività con `openTemperatureForPointId` (modal si apre per quel punto)
   - Modal `AddTemperatureModal` viene renderizzato con `onClose={closeTemperatureModal}` (X, Annulla, click overlay chiudono senza salvare e azzerano `location.state`)
   - Utente inserisce temperatura e clicca "Registra"
   - `handleSaveTemperature()` chiama `createReading(data, { onSuccess: () => closeTemperatureModal() })` (o update in edit); la chiusura avviene solo in onSuccess
   - Query cache invalidata; lista si aggiorna; modal si chiude dopo successo

7. **Interazione utente - Eliminazione lettura**:
   - Utente clicca pulsante "Elimina" su una card
   - `handleDeleteReading(id)` mostra dialog di conferma
   - Se confermato, chiama `deleteReading(id)` mutation
   - Query cache viene invalidata
   - Lista si aggiorna, statistiche vengono ricalcolate

8. **Aggiornamento automatico**:
   - Dopo ogni mutazione (create/delete), `queryClient.invalidateQueries()` viene chiamato
   - React Query ricarica automaticamente i dati
   - UI si aggiorna senza necessità di refresh manuale

### Integrazione Database

**Tabelle utilizzate:**

1. **`temperature_readings`**:
   - **Operazioni**: SELECT, INSERT, DELETE
   - **Filtri**: `company_id` (obbligatorio, da auth)
   - **Join**: `conservation_points` per nome punto, tipo, setpoint_temp
   - **Ordinamento**: `recorded_at DESC` (più recenti prima)

2. **`conservation_points`** (join):
   - **Operazioni**: SELECT (solo per join)
   - **Filtri**: `company_id` (obbligatorio)
   - **Campi utilizzati**: `id`, `name`, `type`, `setpoint_temp` (per calcolo stato e visualizzazione)

**Operazioni CRUD:**

- **CREATE**: 
  - Inserisce record in `temperature_readings`
  - Auto-aggiorna `last_temperature_reading` del punto di conservazione associato (gestito da trigger database o hook)
  - Auto-calcola stato del punto se necessario (se lettura è fuori range, punto diventa warning/critical)

- **READ**: 
  - Carica tutte le letture dell'azienda
  - Include informazioni punto di conservazione tramite join
  - Calcola statistiche aggregate lato client

- **UPDATE**: 
  - **ATTUALMENTE NON IMPLEMENTATO** - Mostra solo alert "Funzionalità in arrivo"
  - Quando implementato, aggiornerà singolo record per ID
  - Dovrà gestire optimistic locking per prevenire conflitti

- **DELETE**: 
  - Elimina record per ID
  - Non elimina automaticamente il punto di conservazione associato (foreign key non CASCADE)
  - Dopo eliminazione, `last_temperature_reading` del punto potrebbe dover essere aggiornato manualmente

**Transazioni:**
- Non vengono usate transazioni esplicite
- Ogni operazione è atomica (Supabase gestisce transazioni a livello di singola operazione)
- **Nota**: Creazione lettura + aggiornamento `last_temperature_reading` del punto potrebbe non essere atomica. Se la creazione va a buon fine ma l'aggiornamento fallisce, la lettura viene creata ma il punto non viene aggiornato.

**Soluzione proposta**: Usare transazione esplicita per creazione lettura + aggiornamento punto, oppure gestire con trigger database per garantire atomicità.

### Integrazione Servizi

**Supabase Client**:
- Utilizzato tramite `@/lib/supabase/client`
- Configurato con URL e anon key da variabili ambiente
- RLS policies applicate automaticamente a tutte le query

**React Query (TanStack Query)**:
- Gestisce cache e sincronizzazione stato-server
- Auto-retry per errori di rete
- Background refetch quando tab torna in focus
- Cache time: 5 minuti (default)

**Toast Notifications**:
- Utilizzato `react-toastify` per notifiche successo/errore
- Messaggi: "Lettura eliminata", "Errore nell'eliminazione della lettura", ecc.

### Real-time Updates

**Comportamento attuale**: 
- **NON implementato** - La sezione non si aggiorna in real-time quando altri utenti registrano/eliminano letture
- Aggiornamenti avvengono solo dopo:
  - Mutazioni locali (invalidation cache)
  - Refresh manuale pagina
  - Focus su tab (background refetch di React Query)

**Soluzione proposta**: Implementare Supabase Realtime subscriptions per:
- Aggiornamenti automatici quando nuove letture vengono create da altri utenti
- Aggiornamenti automatici quando letture vengono eliminate/modificate da altri utenti
- Indicatore visivo quando dati sono stati aggiornati da altro utente
- Auto-refresh statistiche quando nuove letture vengono aggiunte

### Scalabilità - Gestione Migliaia di Letture

**Problema identificato:**
- Considerando 1 anno intero di attività con letture giornaliere per ogni punto, potrebbero esserci **centinaia o migliaia di letture**
- Attualmente tutte le letture vengono caricate in memoria e renderizzate tutte insieme
- Questo può causare:
  - Lentezza nel caricamento iniziale
  - Lentezza nello scrolling della lista
  - Alto uso di memoria del browser
  - Esperienza utente scadente

**Soluzioni proposte:**

1. **Paginazione**:
   - Caricare solo le prime N letture (es. 50 per pagina)
   - Implementare paginazione con pulsanti "Precedente" / "Successivo" o infinite scroll
   - Permettere all'utente di navigare tra pagine

2. **Virtualizzazione**:
   - Usare libreria come `react-window` o `react-virtualized` per renderizzare solo le card visibili
   - Caricare tutte le letture, ma renderizzare solo quelle in viewport
   - Migliora significativamente performance con liste lunghe

3. **Filtri e Ricerca**:
   - Filtro per punto di conservazione (dropdown)
   - Filtro per stato (Conforme/Attenzione/Critico)
   - Filtro per data (range date picker)
   - Ricerca per nome punto
   - Filtri combinabili (es. "Solo critiche degli ultimi 7 giorni")

4. **Lazy Loading**:
   - Caricare solo le letture più recenti inizialmente (es. ultimi 30 giorni)
   - Caricare letture più vecchie solo su richiesta utente (pulsante "Carica altre")

5. **Aggregazione dati**:
   - Per visualizzazioni storiche, aggregare dati per giorno/settimana/mese
   - Mostrare grafici invece di lista per periodi lunghi
   - Lista dettagliata solo per periodo recente (es. ultimi 7 giorni)

6. **Ordinamento e raggruppamento**:
   - Permettere ordinamento per data, temperatura, punto, stato
   - Raggruppare per punto di conservazione (accordion)
   - Raggruppare per giorno/settimana (sezioni collassabili)

**Priorità implementazione:**
1. **PRIORITÀ 1**: Paginazione base (50 letture per pagina) - implementazione semplice, migliora subito performance
2. **PRIORITÀ 2**: Filtri per punto e stato - permette all'utente di ridurre risultati visualizzati
3. **PRIORITÀ 3**: Virtualizzazione - migliora performance scrolling con liste lunghe
4. **PRIORITÀ 4**: Filtro per data e ricerca - funzionalità avanzate per utenti esperti

---

## 🔗 INTERAZIONI

### Componenti Collegati

- **`CollapsibleCard`** (`@/components/ui/CollapsibleCard`):
  - **Tipo di interazione**: Wrapper per sezione collassabile
  - **Uso**: Contiene tutta la sezione "Letture Temperature"
  - **Props passate**: `title`, `subtitle`, `icon`, `actions` (dropdown), `defaultExpanded`, `children`

- **`TemperatureReadingCard`** (`./components/TemperatureReadingCard`):
  - **Tipo di interazione**: Card di visualizzazione per singola lettura
  - **Uso**: Renderizzato in loop per ogni lettura, ordinato per data più recente
  - **Props passate**: `reading`, `onEdit`, `onDelete`, `showActions`

- **`AddTemperatureModal`** (`./components/AddTemperatureModal`):
  - **Tipo di interazione**: Modal per registrare temperatura
  - **Uso**: Condizionale (`isOpen={showTemperatureModal}`)
  - **Props passate**: `isOpen`, `onClose`, `onSave`, `conservationPoint`, `isLoading`

- **Mini Statistiche Cards** (inline JSX):
  - **Tipo di interazione**: Componenti inline per visualizzare conteggi
  - **Uso**: 4 card (Totale, Conformi, Attenzione, Critiche)
  - **Dati**: `tempStats.total`, `tempStats.compliant`, `tempStats.warning`, `tempStats.critical`

### Dipendenze

- **Hooks custom**:
  - `useTemperatureReadings()` - gestione letture temperatura
  - `useConservationPoints()` - lista punti per dropdown registrazione
  - `useAuth()` - autenticazione e company_id (interno agli hook)

- **Librerie esterne**:
  - `react` - framework UI
  - `@tanstack/react-query` - gestione stato server
  - `lucide-react` - icone (Clock, CheckCircle, AlertTriangle)
  - `react-toastify` - notifiche (usato negli hook)

- **Servizi**:
  - `@/lib/supabase/client` - client Supabase per database
  - `@/types/conservation` - tipi TypeScript

### Eventi Emessi

La sezione non emette eventi custom. Le comunicazioni avvengono tramite:
- **Callback props** ai componenti figli (`onEdit`, `onDelete`)
- **Hook mutations** che aggiornano la cache React Query
- **Toast notifications** per feedback utente

### Eventi Ascoltati

La sezione non ascolta eventi custom. Reagisce a:
- **Mount/unmount** del componente (trigger caricamento dati)
- **Invalidation cache** React Query (trigger ricaricamento dati)
- **Cambio `company_id`** nel contesto auth (trigger ricaricamento)

---

## 📊 DATI

### Struttura Dati Input

La sezione non riceve input diretti. I dati vengono caricati tramite hook dal database.

**Dati caricati dal database:**

```typescript
interface TemperatureReading {
  id: string
  company_id: string
  conservation_point_id: string
  temperature: number
  recorded_at: Date
  created_at: Date

  // Campi v2.0.0
  recorded_by?: string               // User ID (auth.users.id)
  method?: 'manual' | 'digital_thermometer' | 'automatic_sensor'
  notes?: string
  photo_evidence?: string            // URL o base64

  // Relations (JOIN)
  conservation_point?: {
    id: string
    name: string
    type: 'ambient' | 'fridge' | 'freezer' | 'blast'
    setpoint_temp: number
  }

  // v2.0.0: Nome utente risolto
  recorded_by_user?: {
    id: string
    first_name?: string
    last_name?: string
    name?: string                    // Fallback se first_name/last_name non disponibili
  }
}

interface TemperatureStats {
  total: number
  compliant: number
  warning: number
  critical: number
}
```

### Struttura Dati Output

La sezione non emette output diretto. I dati vengono modificati tramite mutazioni che aggiornano il database.

**Dati inviati al database (CREATE Temperature Reading):**

```typescript
interface CreateTemperatureReadingInput {
  conservation_point_id: string
  temperature: number
  recorded_at?: Date  // opzionale, default now()
}
```

**NOTA**: Il form del modal `AddTemperatureModal` raccoglie anche:
- `method`: 'manual' | 'digital_thermometer' | 'automatic_sensor' (attualmente non salvato - TODO quando schema DB viene aggiornato)
- `notes`: string (attualmente non salvato - TODO)
- `photo_evidence`: string URL (attualmente non salvato - TODO)

### Mapping Database

**Campo form → Campo database:**

| Campo Form | Campo Database | Trasformazione |
|------------|----------------|----------------|
| `temperature` | `temperature_readings.temperature` | Diretto (number) |
| `recorded_at` | `temperature_readings.recorded_at` | Date → ISO string (default: now()) |
| `conservation_point_id` | `temperature_readings.conservation_point_id` | Diretto (string UUID) |
| `method` | `temperature_readings.method` | ✅ **SALVATO** - migration 015 (default: 'digital_thermometer') |
| `notes` | `temperature_readings.notes` | ✅ **SALVATO** - migration 015 (nullable) |
| `photo_evidence` | `temperature_readings.photo_evidence` | ✅ **SALVATO** - migration 015 (nullable, URL) |
| `recorded_by` | `temperature_readings.recorded_by` | ✅ **SALVATO** - migration 015 (UUID user.id) |

**Validazioni database:**

- **Not null**: `temperature`, `conservation_point_id`, `company_id`, `recorded_at`
- **Foreign key**: `conservation_point_id` deve esistere in `conservation_points`
- **Check constraints**: Nessuno esplicito (validazione lato client e database per tipo number)

**Trasformazioni applicate:**

1. **Calcolo stato lettura**:
   ```typescript
   // Tolleranza unica ±1°C per tutti i tipi (correctiveActions.ts: TOLERANCE_C = 1.0)
   function calculateTemperatureStatus(
     temperature: number,
     setpoint: number,
     type: 'ambient' | 'fridge' | 'freezer' | 'blast'
   ): 'compliant' | 'critical' {
     const tolerance = 1.0  // Tolleranza unica per tutti i tipi
     const diff = Math.abs(temperature - setpoint)

     if (diff <= tolerance) return 'compliant'  // Dentro ±1°C = conforme
     return 'critical'  // Fuori ±1°C = critico (no stato "warning")
   }
   ```

2. **Calcolo statistiche**:
   - Aggregazione lato client dei dati per stato
   - Conteggio totale, per stato (compliant/warning/critical)
   - Tolleranza varia per tipo punto

3. **Ordinamento letture**:
   - Ordinamento per `recorded_at DESC` (più recenti prima)
   - Ordinamento avviene lato client dopo caricamento

4. **Formattazione timestamp**:
   - `recorded_at` viene formattato come "DD/MM/YYYY, HH:mm" (locale it-IT)
   - Esempio: "10/01/2026, 10:30"

---

## ✅ ACCEPTANCE CRITERIA

**Criteri di accettazione per la sezione "Letture Temperature":**

- [x] La sezione carica e visualizza tutte le letture di temperatura dell'azienda
- [x] Le letture sono ordinate per data più recente (ultime in cima)
- [x] Le statistiche (Totale, Conformi, Attenzione, Critiche) vengono calcolate e visualizzate correttamente
- [x] L'utente può registrare una nuova temperatura tramite dropdown "Registra temperatura..."
- [x] Ogni lettura mostra informazioni essenziali (temperatura, punto, stato, timestamp)
- [x] Lo stato viene calcolato automaticamente in base a temperatura vs setpoint e tolleranza
- [x] L'utente può eliminare una lettura con conferma
- [ ] **DA IMPLEMENTARE**: Modifica lettura temperatura (attualmente mostra solo alert)
- [ ] **DA MIGLIORARE**: Visualizzazione utente che ha eseguito la lettura (campo non esiste nel DB - TODO)
- [ ] **DA MIGLIORARE**: Indicatore stato più chiaro (l'utente ha notato che "0.0°C" è poco chiaro - probabilmente barra progresso)
- [ ] **DA IMPLEMENTARE**: Paginazione per gestire migliaia di letture (1 anno di attività)
- [ ] **DA IMPLEMENTARE**: Filtri per punto, stato, data per facilitare ricerca
- [ ] **DA MIGLIORARE**: Real-time updates quando altri utenti modificano dati
- [ ] **DA MIGLIORARE**: Gestione errori più specifica e user-friendly

---

## 🧪 TESTING

### Test da Eseguire

1. **Test caricamento dati**:
   - Verificare che le letture vengano caricate correttamente al mount
   - Verificare comportamento con `company_id` mancante (dovrebbe ritornare array vuoto)
   - Verificare comportamento con errore di rete (dovrebbe mostrare errore)

2. **Test calcolo statistiche**:
   - Verificare che le statistiche vengano calcolate correttamente in base a temperatura vs setpoint
   - Verificare che la tolleranza vari correttamente per tipo punto (blast=5, ambient=3, altri=2)
   - Verificare che le statistiche si aggiornino dopo creazione/eliminazione lettura

3. **Test ordinamento**:
   - Verificare che le letture vengano ordinate per data più recente (ultime in cima)
   - Verificare che l'ordinamento sia stabile (non cambia con ricaricamenti)

4. **Test registrazione temperatura**:
   - Verificare che il dropdown si apra correttamente con lista punti
   - Verificare che il modal si apra con il punto selezionato
   - Verificare che la lettura venga salvata correttamente
   - Verificare che la lista si aggiorni automaticamente con nuova lettura in cima
   - Verificare che le statistiche si aggiornino

5. **Test eliminazione lettura**:
   - Verificare dialog di conferma
   - Verificare che la lettura venga eliminata dal database
   - Verificare aggiornamento lista e statistiche

6. **Test visualizzazione card**:
   - Verificare che tutte le informazioni vengano visualizzate correttamente (temperatura, punto, stato, timestamp, range, messaggio HACCP)
   - Verificare che lo stato venga calcolato correttamente e mostrato con colori appropriati
   - Verificare che la barra di progresso mostri correttamente la differenza temperatura

7. **Test responsive design**:
   - Verificare layout mobile (< 640px) - statistiche 1 colonna
   - Verificare layout tablet (640px - 1024px) - statistiche 2 colonne
   - Verificare layout desktop (> 1024px) - statistiche 4 colonne

8. **Test accessibilità**:
   - Verificare navigazione con tastiera (dropdown, pulsanti)
   - Verificare screen reader compatibility
   - Verificare contrasto colori (WCAG AA)

9. **Test scalabilità** (futuro):
   - Verificare performance con 100+ letture
   - Verificare performance con 1000+ letture (dopo implementazione paginazione)
   - Verificare che il rendering non blocchi il browser

### Scenari di Test

**Scenario 1: Registrazione lettura conforme**
- **Input**: Punto "Frigo 2" (setpoint 3°C), temperatura 4°C (tolleranza ±2°C)
- **Output atteso**: Lettura creata con stato "Conforme", statistiche aggiornate (+1 totale, +1 conforme), visualizzata in cima alla lista

**Scenario 2: Registrazione lettura critica**
- **Input**: Punto "Frigo 2" (setpoint 3°C), temperatura 8°C (differenza 5°C > tolleranza+2)
- **Output atteso**: Lettura creata con stato "Critico", statistiche aggiornate (+1 totale, +1 critica), messaggio HACCP "ATTENZIONE: La temperatura è fuori dal range di sicurezza. Intervento richiesto!"

**Scenario 3: Eliminazione lettura**
- **Input**: Eliminazione lettura esistente
- **Output atteso**: Dialog conferma, lettura eliminata, lista aggiornata, statistiche ricalcolate

**Scenario 4: Calcolo statistiche con tipi diversi**
- **Input**: 10 letture (5 frigoriferi setpoint 3°C, 5 abbattitori setpoint -30°C)
- **Output atteso**: Statistiche calcolate con tolleranza corretta (frigo=2°C, blast=5°C)

**Scenario 5: Ordinamento per data**
- **Input**: 5 letture con date diverse (10/01, 09/01, 11/01, 08/01, 12/01)
- **Output atteso**: Letture ordinate 12/01, 11/01, 10/01, 09/01, 08/01 (più recenti prima)

---

## 📚 RIFERIMENTI

### File Correlati
- **Pagina**: `src/features/conservation/ConservationPage.tsx` (linee 346-490)
- **Hook**: `src/features/conservation/hooks/useTemperatureReadings.ts`
- **Componente Card**: `src/features/conservation/components/TemperatureReadingCard.tsx`
- **Modal Registrazione**: `src/features/conservation/components/AddTemperatureModal.tsx`
- **Componente UI**: `src/components/ui/CollapsibleCard.tsx`
- **Tipi**: `src/types/conservation.ts`

### Documentazione Correlata
- Template standard: `00_TEMPLATE_STANDARD.md`
- Master Index: `00_MASTER_INDEX.md`
- Documentazione ConservationPage: `CONSERVATION_PAGE.md`
- Documentazione TemperatureReadingCard: `TEMPERATURE_READING_CARD.md` (da creare)
- Documentazione AddTemperatureModal: `ADD_TEMPERATURE_MODAL.md` (da creare)

---

## 📝 NOTE SVILUPPO

### Performance

**Ottimizzazioni implementate:**
- React Query cache: evita ricaricamenti inutili
- useMemo per calcoli statistiche (gestito internamente agli hook)
- Ordinamento lato client (efficiente per < 1000 letture)

**Considerazioni performance:**
- **N+1 Query Problem**: Attualmente non presente - tutte le query sono batch con JOIN
- **Re-renders**: Componente potrebbe re-renderizzare quando statistiche cambiano. Considerare `React.memo` per componenti figli se necessario
- **Lista grandi**: **PROBLEMA CRITICO** - Con centinaia/migliaia di letture, il rendering di tutte le card insieme può essere molto lento

**Miglioramenti proposti:**
- **PRIORITÀ ALTA**: Implementare paginazione per liste grandi (>50 letture)
- **PRIORITÀ MEDIA**: Virtualizzare liste lunghe con `react-window` o `react-virtualized`
- **PRIORITÀ MEDIA**: Debounce ricerca/filtri se verranno aggiunti
- **PRIORITÀ BASSA**: Lazy loading per letture più vecchie (caricare solo ultimi 30 giorni inizialmente)

### Sicurezza

**Validazioni sicurezza:**
- RLS policies: tutte le query sono filtrate automaticamente per `company_id`
- Input sanitization: gestita da Supabase (prepara statement)
- XSS prevention: React escape automaticamente i valori

**Sanitizzazione input:**
- Temperatura: validata come number, range controllato lato client (da -99 a 99°C)
- Timestamp: validato come Date, default now() se non fornito
- Conservation point ID: validato come UUID, deve esistere nel database

**Autorizzazioni:**
- Lettura: tutti i membri azienda (RLS policy)
- Scrittura (creazione lettura): tutti i membri azienda (RLS policy)
- Eliminazione: solo manager/admin (RLS policy - da verificare implementazione)

**Miglioramenti proposti:**
- Validare range temperatura realistico (es. -50°C a 50°C per la maggior parte dei punti)
- Validare che `conservation_point_id` appartenga all'azienda dell'utente
- Aggiungere audit log per eliminazioni (tracciare chi ha eliminato cosa e quando)
- Implementare rate limiting per prevenire spam di letture

### Limitazioni

**Limitazioni conosciute:**
1. **Modifica lettura non implementata**: Mostra solo alert "Funzionalità in arrivo"
2. **Campi form non salvati**: `method`, `notes`, `photo_evidence` vengono raccolti nel form ma non salvati (campo non esistono nel DB - TODO quando schema viene aggiornato)
3. **Utente che ha eseguito lettura non visualizzato**: Campo `recorded_by` non esiste nel DB (TODO)
4. **Scalabilità limitata**: Con migliaia di letture, performance degrada (manca paginazione/virtualizzazione)
5. **Real-time updates non implementati**: La sezione non si aggiorna automaticamente quando altri utenti modificano dati
6. **Filtri e ricerca non disponibili**: Non è possibile filtrare per punto, stato, data o cercare letture specifiche
7. **Indicatore stato poco chiaro**: L'utente ha notato che la barra di progresso con "0.0°C" è poco chiara - potrebbe essere migliorata con indicatori visivi più espliciti (es. semaforo, icona stato più grande)

**Limitazioni tecniche:**
- React Query cache time: 5 minuti - dati possono essere obsoleti
- Nessuna persistenza locale: se pagina viene ricaricata, tutti i dati vengono ricaricati dal server
- Nessun offline support: app non funziona senza connessione
- Ordinamento sempre per data: non è possibile ordinare per temperatura, punto, stato

### Future Miglioramenti

**Miglioramenti funzionali:**
1. **Visualizzazione utente che ha eseguito lettura**: Implementare campo `recorded_by` nel DB e mostrarlo nella card
2. **Modifica lettura**: Implementare modal per modificare letture esistenti
3. **Indicatore stato migliorato**: Sostituire/migliorare barra progresso con semaforo o icona stato più grande e chiara
4. **Filtri e ricerca**: Aggiungere filtri per punto, stato, data e ricerca per nome punto
5. **Paginazione**: Implementare paginazione (50 letture per pagina) o infinite scroll
6. **Virtualizzazione**: Virtualizzare liste lunghe per migliorare performance
7. **Raggruppamento**: Permettere raggruppamento per punto di conservazione o per giorno/settimana
8. **Esportazione dati**: Permettere export CSV/PDF delle letture per audit HACCP
9. **Grafici temperatura**: Visualizzare trend temperatura nel tempo per ogni punto (link a pagina dettaglio punto)
10. **Notifiche push**: Alert quando temperature critiche vengono registrate

**Miglioramenti tecnici:**
1. **Real-time subscriptions**: Implementare Supabase Realtime per aggiornamenti automatici
2. **Offline support**: Implementare queue locale e sync automatico
3. **Transazioni atomiche**: Usare transazioni per creazione lettura + aggiornamento punto
4. **Audit logging**: Tracciare tutte le modifiche critiche (creazione, modifica, eliminazione)
5. **Aggiornamento schema DB**: Aggiungere campi `method`, `notes`, `photo_evidence`, `recorded_by`, `status`, `target_temperature`, `tolerance_range_min`, `tolerance_range_max` alla tabella `temperature_readings`

**Miglioramenti UX:**
1. **Tutorial onboarding**: Guida interattiva per nuovi utenti su come registrare temperature
2. **Bulk operations**: Permettere eliminazione/modifica multipla (seleziona più letture)
3. **Quick actions**: Azioni rapide per registrare temperatura per punto più usato
4. **Dark mode**: Supporto tema scuro
5. **Accessibilità**: Migliorare supporto screen reader e navigazione tastiera

---

## 🆕 CHANGELOG v3.0.0 (2026-02-04)

### Completamento automatico task "Rilevamento Temperature"
- Al salvataggio di una lettura (createReading), l'hook cerca le task di tipo `temperature` per quel `conservation_point_id` con `next_due <= recorded_at` e inserisce per ognuna un record in `maintenance_completions`. La task risulta completata in Conservazione e Attività.
- **Flusso utente**: Rileva Temperatura → punto → temperatura → Salva → lettura + task completate → UI aggiornata.
- **Atteggiamento atteso**: Un solo gesto (registrare la temperatura) completa anche la manutenzione "Rilevamento Temperature" per quel punto.
- File: `src/features/conservation/hooks/useTemperatureReadings.ts` (mutationFn di createReadingMutation).
- Riferimenti: `03_CONSERVATION/Lavoro/04-02-2026/PIANO_completamento_temperatura_su_lettura.md`, `REPORT_LAVORO_04-02-2026.md`.

---

## 🆕 CHANGELOG v2.0.0 (2026-01-30)

### Features Aggiunte
- **Nome Utente**: Ogni lettura mostra chi ha registrato la temperatura
- **Campo `recorded_by`**: Salvato in DB (user.id) e risolto via `user_profiles.auth_user_id`
- **Fallback query**: Se non trovato in `user_profiles`, cerca in `company_members` → `staff`
- **Metodo registrazione**: Manuale / Termometro digitale / Sensore automatico

### Risoluzione Nome Utente
```
recorded_by (user.id)
    ↓
user_profiles.auth_user_id
    ↓
first_name + last_name
    ↓ (fallback se non trovato)
company_members → staff → name
```

### Riferimenti Sessioni di Lavoro
- [22-01-2026](../Lavoro/22-01-2026%20Nome%20associato%20ad%20evento/) - Implementazione nome utente
- [23-01-2026](../Lavoro/23-01-2026/) - Fix query useTemperatureReadings

---

**Ultimo Aggiornamento**: 2026-02-04
**Versione**: 3.0.0
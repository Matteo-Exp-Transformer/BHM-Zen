# REPORT DETTAGLIATO – Abbattitore (no rilevamento temperatura) e UI card

**Data**: 31 Gennaio 2026  
**Obiettivo**: Per la tipologia **Abbattitore** dei punti di conservazione: non richiedere né assegnare la manutenzione "Rilevamento temperatura"; nascondere temperatura target, badge regolazione e ultime letture nella card; escludere Abbattitore dalla sezione Rilevamento temperature; uniformare altezza card temperatura.

---

## 1. RIEPILOGO ESECUTIVO

| Area | Modifiche |
|------|------------|
| **Logica stato** | Abbattitore escluso da `typesRequiringTemp`; stato non basato su temperatura |
| **Card punto (ConservationPointCard)** | Nascosti: temperatura target, badge regolazione termostato, ultima lettura |
| **Manutenzioni** | Rilevamento temperatura non richiesto/assegnabile per Abbattitore (AddPointModal, TasksStep, onboardingHelpers) |
| **Validazioni** | Ambiente e Abbattitore: 2 manutenzioni obbligatorie; testo dinamico 2/4 |
| **Sezione Rilevamento temperature** | Card Abbattitore non mostrate (filter `point.type !== 'blast'`) |
| **Calendario** | Nessun evento rilevamento temperatura generato per punti blast |
| **UI card temperatura** | Altezza uniforme (min-h 246px, area azioni min-h 40px) |

---

## 2. MODIFICHE PER FILE

### 2.1 `src/types/conservation.ts`

**Funzione**: `classifyPointStatus`

- **typesRequiringTemp**: da `['fridge', 'freezer', 'blast']` a `['fridge', 'freezer']`. Per Abbattitore non si richiede più la lettura temperatura per lo stato.
- **Controllo temperatura**: eseguito solo se `point.type !== 'blast'`. Per Abbattitore non si calcola warning/critico in base alla temperatura.

```ts
// Punti che richiedono temperatura (Abbattitore non richiede rilevamento temperatura)
const typesRequiringTemp: ConservationPoint['type'][] = ['fridge', 'freezer']
// ...
// Check temperature status (Abbattitore non usa stato basato su temperatura)
if (point.type !== 'blast' && point.last_temperature_reading) {
```

---

### 2.2 `src/features/conservation/components/ConservationPointCard.tsx`

**Obiettivo**: Nella card del punto (sezione Punti di conservazione) per tipo Abbattitore non mostrare temperatura target, badge regolazione, ultima lettura.

- **Temperatura target**: blocco mostrato solo se `point.type !== 'blast'`.
- **Badge "Regola il termostato e rileva nuovamente..."**: mostrato solo se `point.type !== 'blast'` (e stato warning/critical).
- **Ultima lettura** (es. "Ultima lettura -24°C 31/01, 01:56 …"): mostrato solo se `point.type !== 'blast'`.

---

### 2.3 `src/features/conservation/components/AddPointModal.tsx`

**Obiettivo**: Abbattitore senza manutenzione "Rilevamento temperatura" (né richiesta né assegnabile).

- **getRequiredMaintenanceTasks(pointType)**  
  Per `pointType === 'blast'` (come per `ambient`): restituisce solo **Sanificazione** e **Controllo scadenze**. Rimosso "Rilevamento temperatura" dalla lista obbligatoria per blast.

- **Caricamento manutenzioni in modifica**  
  In edit, per punto di tipo blast le task con `task.type === 'temperature'` vengono escluse (non mostrate/assegnate).

- **Salvataggio**  
  Se `formData.pointType === 'blast'`, i task con `manutenzione === 'rilevamento_temperatura'` vengono filtrati prima di `transformMaintenanceTasks` (non salvati).

- **Testo manutenzioni obbligatorie**  
  Dinamico in base al tipo: per ambiente/abbattitore "Configura le **2** manutenzioni obbligatorie..."; per frigorifero/congelatore "Configura le **4** manutenzioni obbligatorie...".

---

### 2.4 `src/features/calendar/utils/temperatureCheckGenerator.ts`

**Obiettivo**: Nessun evento di rilevamento temperatura per punti Abbattitore.

- In `generateTemperatureCheckEvents`, prima del `forEach` sui punti: `if (point.type === 'blast') return` per ogni punto di tipo blast (nessun evento generato).

---

### 2.5 `src/components/onboarding-steps/TasksStep.tsx`

**Obiettivo**: In onboarding, per punti Abbattitore non richiedere né mostrare "Rilevamento Temperatura".

- **requiredMaintenances** (in `MaintenanceAssignmentForm`): per `pointType === 'blast'` stessa logica di `ambient` — solo **Sanificazione** e **Controllo scadenze** (filter su STANDARD_MAINTENANCE_TYPES).
- **validateAllMaintenanceAssigned**: stessa condizione `point.pointType === 'ambient' || point.pointType === 'blast'` per considerare solo 2 manutenzioni richieste.
- **Lista punti e badge Completato/Incompleto**: stesso `requiredMaintenances` per blast (2 manutenzioni = Completato).

---

### 2.6 `src/utils/onboardingHelpers.ts`

**Obiettivo**: In completamento onboarding non creare task "rilevamento temperatura" per punti Abbattitore.

- Nella mappa che costruisce `maintenanceTasks` da `formData.tasks.conservationMaintenancePlans`: per ogni piano si recupera il punto da `formData.conservation.points`; se `conservationPoint?.pointType === 'blast'` e `plan.manutenzione === 'rilevamento_temperatura'` (o tipo mappato `temperature`), si restituisce `null` (task saltata).

---

### 2.7 Validazioni form (stessa logica Abbattitore = Ambiente)

- **TasksStep – validateAllMaintenanceAssigned**: per ogni punto, `requiredMaintenances` = 2 tipi (sanificazione, controllo scadenze) se `pointType === 'ambient' || pointType === 'blast'`.
- **TasksStep – lista punti**: stesso `requiredMaintenances` per decidere Completato/Incompleto.
- **AddPointModal**: nessun controllo sul numero fisso "4" o sulla presenza di rilevamento temperatura; si validano solo i task presenti (già 2 per blast da getRequiredMaintenanceTasks).

---

### 2.8 `src/features/conservation/ConservationPage.tsx`

**Obiettivo**: Nella sezione "Rilevamento temperature" (tab Stato) non mostrare card per punti Abbattitore.

- Griglia delle `TemperaturePointStatusCard`: prima di sort e map, `.filter(point => point.type !== 'blast')`.
- Ordinamento: rimosso `blast` da `typeOrder` (solo fridge, freezer, ambient).

---

### 2.9 `src/features/conservation/components/TemperaturePointStatusCard.tsx`

**Obiettivo**: Altezza uniforme per tutte le card (Conforme uguale a Critico).

- **Contenitore card**: aggiunti `min-h-[246px]` e `flex flex-col` per altezza minima uguale alla card Critico.
- **Area azioni (pulsanti)**: aggiunti `min-h-[40px] flex-shrink-0` così l’area è sempre riservata anche quando non c’è il pulsante "Correggi" (stato Conforme).

---

## 3. RIEPILOGO FILE MODIFICATI

| File | Modifica |
|------|----------|
| `src/types/conservation.ts` | typesRequiringTemp senza blast; check temperatura solo se type !== 'blast' |
| `src/features/conservation/components/ConservationPointCard.tsx` | Temperatura target, badge regolazione, ultima lettura nascosti per blast |
| `src/features/conservation/components/AddPointModal.tsx` | getRequiredMaintenanceTasks(blast)=2 tipi; filter load/save temperature; testo 2/4 manutenzioni |
| `src/features/calendar/utils/temperatureCheckGenerator.ts` | Skip blast in generateTemperatureCheckEvents |
| `src/components/onboarding-steps/TasksStep.tsx` | requiredMaintenances e validateAllMaintenanceAssigned per blast come ambient (2 tipi) |
| `src/utils/onboardingHelpers.ts` | Skip insert maintenance task temperature per pointType blast |
| `src/features/conservation/ConservationPage.tsx` | Filter blast dalla griglia TemperaturePointStatusCard |
| `src/features/conservation/components/TemperaturePointStatusCard.tsx` | min-h-[246px], area azioni min-h-[40px] |

---

## 4. COMPORTAMENTO ATTESO

- **Abbattitore**  
  - Non richiede manutenzione "Rilevamento temperatura".  
  - In creazione/modifica punto (Conservazione e onboarding) non viene proposta né assegnabile.  
  - In card punto: non si vedono temperatura target, badge regolazione termostato, ultime letture.  
  - Stato (verde/giallo/rosso) non dipende dalla temperatura.  
  - In calendario non vengono creati controlli temperatura.  
  - Nella sezione "Rilevamento temperature" non compare la card Abbattitore.

- **Validazioni**  
  - Ambiente e Abbattitore: 2 manutenzioni obbligatorie (Sanificazione, Controllo scadenze).  
  - Testi e controlli (TasksStep, AddPointModal) allineati a 2/4 manutenzioni in base al tipo.

- **UI card temperatura**  
  - Tutte le card (Conforme, Critico, Richiesta lettura, Nessuna lettura) hanno altezza uniforme (min come card Critico).

---

## 5. VERIFICHE CONSIGLIATE

- Creare/modificare punto tipo Abbattitore: in manutenzioni solo 2 tipi (sanificazione, controllo scadenze).
- Onboarding: punto Abbattitore → step Manutenzioni con solo 2 manutenzioni; completamento senza errori.
- Pagina Conservazione: card Abbattitore senza temperatura target, senza badge regolazione, senza ultima lettura.
- Sezione Rilevamento temperature: nessuna card Abbattitore.
- Card temperatura: Conforme e Critico stessa altezza (min 246px).

---

## 6. DETTAGLI RILEVAMENTO (TABELLA E CARD)

**Obiettivo**: Mostrare metodo di rilevazione, note e foto evidenza dove servono; differenziare titoli da contenuti utente.

### 6.1 TemperatureReadingsTable (tab Storico)

- **Riga cliccabile**: clic sulla riga apre/chiude una sezione espandibile sotto la riga.
- **Colonna espandi**: icona ChevronRight/ChevronDown (solo se la lettura ha metodo, note o foto).
- **Sezione "Dettagli rilevamento"** (solo quando espansa):
  - **Metodo di rilevazione**: Manuale, Termometro Digitale, Sensore Automatico (o —).
  - **Note aggiuntive**: testo note (o —).
  - **Foto evidenza**: link URL che apre in nuova scheda (o —).
- **Distinzione titoli/contenuti**: titoli in `text-xs uppercase tracking-wider text-gray-500`, contenuti in `text-base text-gray-900` per separare visivamente etichette da dati inseriti dall’utente.

**File**: `src/features/conservation/components/TemperatureReadingsTable.tsx`

### 6.2 TemperaturePointStatusCard (tab Stato Corrente)

- **Solo metodo di rilevazione**: sotto "Ultima lettura" una riga fissa "Metodo: Termometro Digitale" (o Manuale / Sensore Automatico / —).
- Nessuna sezione espandibile, nessuna nota, nessuna foto evidenza in card.

**File**: `src/features/conservation/components/TemperaturePointStatusCard.tsx`

---

**Fine report**  
**Ultimo aggiornamento**: 31-01-2026

# Report: Bug calendario – weekend “unito” e casella vuota (30–1)

**Data:** 11-02-2026  
**Stato:** Problema non risolto – report di analisi e tentativi effettuati  
**Contesto:** Calendario dopo “Cancella ricomincia” + completamento onboarding, con sabato e domenica impostati come giorni di chiusura.

---

## 1. Descrizione del bug

### Sintomi riportati dall’utente

1. **Casella vuota tra 30 e 1**  
   In vista mese, tra il giorno 30 e il giorno 1 (confine di mese) compare una casella vuota.

2. **Fine settimana “uniti”**  
   Quando in onboarding **sabato e domenica** sono impostati come giorni di chiusura, il calendario mostra sabato e domenica come **un’unica cella** invece di due colonne distinte.

### Condizioni di riproduzione

- Esecuzione di “Cancella ricomincia” (reset app).
- Ricompilazione/completamento onboarding.
- Nello step calendario dell’onboarding: **sabato e domenica** deselezionati (giorni di chiusura).
- Apertura della pagina Calendario dopo il completamento.

---

## 2. Riferimenti e contesto tecnico

### Cartella di lavoro e report precedenti

- **Lavoro 08-02-2026**
  - `REPORT_FILTRO_GIORNI_CHIUSURA_CALENDARIO_08-02-2026.md`: filtri eventi nei giorni di chiusura, timezone in `isClosureDate`/`isDateOpen`, stile `.fc-day-closed` in `dayCellDidMount`.
  - `REPORT_MACRO_MODAL_VUOTO_E_NAVIGAZIONE_MESE_08-02-2026.md`: modal macro per date fuori mese corrente, `visibleRange`, key FullCalendar in modalità macro.

Da questi report risulta che:

- I giorni di chiusura **non** nascondono colonne (nessun uso di `hiddenDays`).
- `open_weekdays` e `closure_dates` sono usati per: filtrare eventi, `businessHours.daysOfWeek`, e per aggiungere la classe `fc-day-closed` alle celle in `dayCellDidMount`.

### Componenti coinvolti

| Componente | Ruolo |
|------------|--------|
| `Calendar.tsx` | FullCalendar, `dayCellDidMount`, `dayHeaderDidMount`, `businessHours`, `firstDay: 1` |
| `calendar-custom.css` | Stili `.fc-day-closed`, `.fc-day-sun`, `.fc-day-sat`, `.fc-daygrid-day-number` |
| `useCalendarSettings` | Carica `company_calendar_settings` → `open_weekdays`, `business_hours`, `is_configured` |
| `CalendarConfigStep` (onboarding) | Salvataggio `open_weekdays` (0–6: 0=dom, 6=sab) |

### Convenzione giorni della settimana

- **JavaScript / FullCalendar:** `getDay()` e `dow`: 0 = domenica, 1 = lunedì, …, 6 = sabato.
- **DB / UI:** `open_weekdays` array di 0–6 (es. `[1,2,3,4,5]` = lun–ven aperti; sabato e domenica chiusi).
- **firstDay:** `1` (lunedì) → colonne in ordine: Lun, Mar, Mer, Gio, Ven, Sab, Dom.

---

## 3. Ipotesi formulate e verifica con log

È stata aggiunta instrumentazione in `Calendar.tsx` (log inviati a endpoint debug) per verificare:

- **Ipotesi A:** Configurazione `calendarSettings` anomala dopo reset/onboarding (es. `open_weekdays` vuoto o incoerente).
- **Ipotesi B:** Uso di `dayHeaderDidMount` / `business_hours` che altera il DOM degli header e la percezione delle colonne.
- **Ipotesi C:** Celle al confine mese (30, 31, 1, 2) senza `.fc-daygrid-day-frame` o `.fc-daygrid-day-number` (cella “vuota”).
- **Ipotesi D:** Griglia con meno di 7 colonne o meno di 35/42 celle (struttura DOM errata).
- **Ipotesi E:** Ordine di caricamento: calendario renderizzato prima senza `calendarSettings`, poi con; possibili doppi mount e stili incoerenti.

### Risultati dai log (`.cursor/debug.log`)

- **Settings (A):**  
  Prima compaiono render con `is_configured: false` e `open_weekdays: null`, poi con `is_configured: true` e `open_weekdays: [1,2,3,4,5]` (o `[1,2,3,4,5,6]`). Quindi i dati di configurazione sono coerenti; possibile solo un doppio passaggio di render (E).

- **Header (B):**  
  Per tutti gli header `hasHours: false`. Non viene aggiunto contenuto extra agli header; nessuna evidenza che il bug sia lì.

- **Celle confine mese (C):**  
  Per le celle con giorno 1, 2, 29, 30, 31: `hasDayFrame: true`, `hasDayNumber: true`. Nessuna cella campionata senza numero o frame → la “casella vuota” non è spiegata da assenza di questi elementi nel DOM.

- **Conteggio celle (D):**  
  `cellCount: 42` (6 settimane × 7 giorni), intervallo visibile coerente. La griglia ha sempre 7 colonne e 42 celle.

**Conclusione dall’analisi log:**  
La struttura è corretta (42 celle, 7 colonne), i numeri di giorno e i frame ci sono. Il problema sembra **solo visivo**: due celle adiacenti (sabato e domenica) con lo stesso stile che vengono percepite come una sola, e/o un effetto che fa sembrare “vuota” una cella (es. numero coperto o poco visibile).

---

## 4. Tentativo di fix effettuato (non risolutivo)

### Idea

Con sabato e domenica entrambi chiusi, entrambe le celle hanno `.fc-day-closed` e lo stesso sfondo; il bordo tra le due celle poteva confondersi con lo sfondo e farle apparire “unite”. In più, il pseudo-elemento `::before` poteva coprire il numero del giorno.

### Modifiche applicate

1. **`src/features/calendar/calendar-custom.css`**
   - Su `.fc-day-closed`: aggiunto `border-left: 1px solid rgba(56, 189, 248, 0.55) !important` per separare visivamente celle chiuse adiacenti (in particolare sabato/domenica).
   - Su `.fc-day-closed::before`: impostato `z-index: 0`.
   - Aggiunta regola `.fc-day-closed .fc-daygrid-day-number { position: relative; z-index: 1; }` per tenere il numero sopra l’overlay.

2. **`src/features/calendar/Calendar.tsx`** (blocco di stili inline ripetuti)
   - Allineati gli stessi accorgimenti: `border-left` su `.fc-day-closed`, `z-index: 0` su `::before`, `z-index: 1` sul numero.

### Esito

L’utente ha confermato che **il problema non è risolto**: il weekend continua a essere percepito come “unito” (e, se presente, la casella vuota tra 30 e 1 resta).

---

## 5. Possibili cause ancora da indagare

1. **FullCalendar e colonne “non-business”**  
   Con `businessHours.daysOfWeek: [1,2,3,4,5]`, FullCalendar può applicare classi (es. `fc-non-business`) a sabato e domenica. Verificare se la libreria applica layout o stili che uniscono/occultano colonne o contenuti.

2. **Ordine / specificità CSS**  
   Stili inline in `Calendar.tsx` o altri CSS (anche di FullCalendar) potrebbero sovrascrivere `calendar-custom.css`. Controllare specificità e ordine di caricamento sui selettori `.fc-day-closed`, `.fc-day-sun`, `.fc-day-sat`, `.fc-non-business`.

3. **Layout tabella / larghezza colonne**  
   Qualche regola (nostra o di FullCalendar) potrebbe ridurre la larghezza o nascondere una colonna (es. `width: 0`, `display`, `visibility`), facendo sembrare due celle una sola o una cella “vuota”.

4. **Casella vuota 30–1**  
   Se la cella “vuota” è quella del 31 (o del 1 del mese successivo), potrebbe essere una cella “altro mese” (`.fc-other-month`) con stili che nascondono o schiacciano il numero. Cercare regole su `fc-other-month` e su `.fc-daygrid-day-number` in contesti chiusi/altro mese.

5. **hiddenDays / configurazione vista**  
   Anche se nei report non risulta l’uso di `hiddenDays`, verificare che in nessun ramo (es. dopo onboarding o con certi `calendarSettings`) venga passata una opzione che nasconde giorni e riduce le colonne.

---

## 6. File modificati in questa sessione

| File | Modifiche |
|------|-----------|
| `src/features/calendar/Calendar.tsx` | Instrumentazione debug (useEffect settings, dayHeaderDidMount, dayCellDidMount, datesSet); fix CSS inline `.fc-day-closed` (border-left, z-index). |
| `src/features/calendar/calendar-custom.css` | `.fc-day-closed` con border-left; `.fc-day-closed::before` con z-index: 0; `.fc-day-closed .fc-daygrid-day-number` con z-index: 1. |

**Nota:** L’instrumentazione di debug (fetch verso endpoint e log) è ancora presente in `Calendar.tsx`; può essere rimossa dopo la risoluzione del bug o in una passata di pulizia.

---

## 7. Prossimi passi suggeriti

1. Ispezionare nel browser gli elementi delle celle **sabato** e **domenica** (classi, dimensioni, bordi, `computed style`) e confrontarli con una cella “aperta”.
2. Cercare nel progetto e nei CSS di FullCalendar ogni riferimento a `fc-non-business`, `fc-other-month`, `fc-day-sun`, `fc-day-sat` e alle larghezze delle colonne.
3. Verificare se il problema si presenta solo in vista `dayGridMonth` o anche in `timeGridWeek` / `timeGridDay`.
4. Riprodurre con strumenti di sviluppo (DevTools) e, se utile, con uno screenshot o una descrizione precisa di quale cella appare vuota (data esatta e posizione nella griglia).

---

**Fine report.**

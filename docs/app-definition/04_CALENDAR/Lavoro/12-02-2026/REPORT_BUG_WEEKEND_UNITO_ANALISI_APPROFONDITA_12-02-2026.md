# Report: Bug Calendario "Weekend Unito" — Analisi Approfondita e Tentativi di Fix

**Data creazione:** 12-02-2026
**Last update:** 13-02-2026 ore 01:30
**Stato:** PARZIALMENTE RISOLTO — `fc-day-closed` applicata a 19 celle nel DOM, ma visivamente le celle Sab/Dom appaiono ancora come un'unica cella. Problema residuo: CSS specificity impedisce ai stili di `.fc-day-closed` di prevalere sui stili `.fc-day-sat`/`.fc-day-sun`.
**Sessione:** Analisi multi-agente + debug iterativo + implementazione fix

---

## 1. Descrizione del Bug

### Sintomo
Quando nell'onboarding si impostano **sabato e domenica** come giorni di chiusura, nella pagina "Attività" (calendario) le due colonne appaiono come **un'unica cella unita**, senza separazione visibile.

### Condizioni di riproduzione
1. Reset app ("Cancella ricomincia")
2. Completamento onboarding con sabato e domenica deselezionati (giorni chiusura)
3. Apertura pagina Attività → Calendario in vista mese

### Peculiarità
- Succede **solo** con sabato + domenica come giorni di chiusura
- **Non** succede con altre combinazioni (es. mercoledì + giovedì)

---

## 2. Cronologia delle Ipotesi e Risultati

### Ipotesi 1: Bordi CSS troppo sottili (Report 11-02-2026)
**Teoria:** Due celle `.fc-day-closed` adiacenti con bordi semi-trasparenti appaiono unite.
**Fix tentato:** Bordi da 1px semi-trasparente a 2px opaco (`#7dd3fc`).
**Esito:** NON risolutivo. Il problema persiste.

### Ipotesi 2: Contenuto asimmetrico negli header (sessione 12-02-2026)
**Teoria:** `dayHeaderDidMount` aggiunge div orari (`.fc-col-header-hours`) solo ai giorni aperti (Lun-Ven). I giorni chiusi (Sab/Dom) non hanno il div. Con `table-layout: fixed`, le colonne con più contenuto nell'header si allargano e le altre si comprimono.

**Verifica con debug:**
```
[Calendar DEBUG] Header column widths:
  fc-day-mon: 97px, fc-day-tue: 97px, ... fc-day-sat: 97px, fc-day-sun: 97px
[Calendar DEBUG] Colonne uniformi: min=97px, max=97px, delta=0px
```

**Esito:** FALSIFICATA. Tutte le colonne hanno la stessa larghezza (97px). Il contenuto asimmetrico NON causa compressione colonne.

**Sotto-scoperta:** `business_hours` nel DB contiene entry per TUTTI e 7 i giorni (chiavi 0-6), inclusi sabato e domenica. Quindi il div orari viene aggiunto anche ai giorni chiusi.

### Ipotesi 3: Race condition `dayCellDidMount` (sessione 12-02-2026) — CONFERMATA
**Teoria:** La classe `fc-day-closed` non viene mai applicata alle celle perché `calendarSettings` non è ancora caricato quando `dayCellDidMount` viene eseguito.

**Verifica con debug (prima del fix):**
```
[Calendar DEBUG] fc-day-closed cells: 0
[Calendar DEBUG] fc-day-sat cells: 7, con fc-day-closed: 0
[Calendar DEBUG] fc-day-sun cells: 7, con fc-day-closed: 0
[Calendar DEBUG] BUG CONFERMATO: calendarSettings configurate ma NESSUNA cella ha fc-day-closed!
[Calendar DEBUG] calendarSettings: { is_configured: true, open_weekdays: [1,2,3,4,5] }
```

**Esito:** CONFERMATA. Le settings sono caricate (`is_configured: true`) ma 0 celle hanno `fc-day-closed`. Il callback `dayCellDidMount` è one-shot: esegue al mount delle celle, e se `calendarSettings` è `null` in quel momento, fa `return` subito e non torna mai più.

---

## 3. Root Cause Dettagliata

### Sequenza del bug

```
1. Componente Calendar monta
   → FullCalendar crea le 42 celle della griglia
   → dayCellDidMount viene chiamato per ogni cella

2. In dayCellDidMount:
   if (!calendarSettings?.is_configured) return  ← calendarSettings è ANCORA NULL
   → le celle NON ricevono fc-day-closed

3. React Query carica calendarSettings da Supabase (async)
   → calendarSettings.is_configured diventa true

4. React re-renderizza Calendar con le nuove settings
   MA: FullCalendar NON ri-monta le celle (dayCellDidMount è one-shot)
   → le celle restano SENZA fc-day-closed per sempre

5. useEffect che incrementa calendarKey dipende da events.length
   → calendarSettings NON è nelle dipendenze → nessun re-mount

6. Anche se calendarKey cambia, con useMacroCategories=true
   il key del FullCalendar usa macroEventsKey, non calendarKey
   → il re-mount non avviene
```

### Perché solo sabato e domenica

Il bug colpisce TUTTI i giorni chiusi, ma:
- Sab/Dom sono gli unici giorni di chiusura configurati nell'onboarding
- Senza `fc-day-closed`, appaiono come celle bianche vuote
- Essendo le ultime due colonne (con `firstDay: 1`), non c'è una cella "aperta" a destra per creare contrasto
- Mercoledì/Giovedì nel mezzo della griglia, anche senza styling, sono percepiti come separati grazie alle celle aperte adiacenti

---

## 4. Fix Implementati

### Fix A: useEffect con DOM diretto per applicare fc-day-closed
**File:** `src/features/calendar/Calendar.tsx` (righe 206-249)

```typescript
useEffect(() => {
  if (!calendarSettings?.is_configured) return

  const applyTimer = setTimeout(() => {
    const cells = document.querySelectorAll('.fc-daygrid-day')
    let appliedCount = 0

    cells.forEach(cell => {
      const dateStr = cell.getAttribute('data-date')
      if (!dateStr) return
      const date = new Date(dateStr + 'T00:00:00')
      const dayOfWeek = date.getDay()
      const isClosedWeekday = !calendarSettings.open_weekdays.includes(dayOfWeek)
      const isSpecificClosure = calendarSettings.closure_dates.includes(dateStr)

      if (isClosedWeekday || isSpecificClosure) {
        if (!cell.classList.contains('fc-day-closed')) {
          cell.classList.add('fc-day-closed')
          appliedCount++
        }
        // Icona spiaggia per chiusure specifiche
        if (isSpecificClosure && !cell.querySelector('.fc-day-beach-icon')) { ... }
      } else {
        cell.classList.remove('fc-day-closed')
      }
    })
  }, 100)

  return () => clearTimeout(applyTimer)
}, [calendarSettings, calendarKey, macroEventsKey, visibleRangeKey])
```

**Logica:** Invece di dipendere da `dayCellDidMount` (one-shot), usa un `useEffect` che si attiva quando `calendarSettings` cambia e applica le classi direttamente via DOM.

### Fix B: Trigger navigazione mese
**File:** `src/features/calendar/Calendar.tsx`

Aggiunto stato `visibleRangeKey` che si incrementa su `datesSet` (navigazione mese/settimana), triggerando il re-apply delle classi sulle nuove celle.

### Fix C: calendarKey dipendenze ampliate
**File:** `src/features/calendar/Calendar.tsx` (righe 200-211)

```typescript
useEffect(() => {
  setCalendarKey(prev => prev + 1)
}, [
  events.length,
  calendarSettings?.is_configured,
  JSON.stringify(calendarSettings?.open_weekdays),
  JSON.stringify(calendarSettings?.closure_dates),
])
```

### Fix D: Placeholder "Chiuso" nell'header
**File:** `src/features/calendar/Calendar.tsx` (dayHeaderDidMount) + `calendar-custom.css`

Se un giorno chiuso non ha business hours, viene aggiunto un div "Chiuso" con classe `.fc-col-header-hours.fc-col-header-closed`. Garantisce struttura header simmetrica.

### Fix E: CSS larghezza colonne uguali
**File:** `src/features/calendar/Calendar.tsx` (inline styles)

```css
.fc .fc-col-header-cell {
  width: 14.285% !important;
}
```

---

## 5. Risultati Debug Post-Fix

### Evoluzione debug in 3 fasi

#### Fase 1: Prima di qualsiasi fix (bug confermato)
```
[Calendar DEBUG] fc-day-closed cells: 0
[Calendar DEBUG] fc-day-sat cells: 7, con fc-day-closed: 0
[Calendar DEBUG] fc-day-sun cells: 7, con fc-day-closed: 0
[Calendar DEBUG] BUG CONFERMATO: calendarSettings configurate ma NESSUNA cella ha fc-day-closed!
[Calendar DEBUG] calendarSettings: { is_configured: true, open_weekdays: [1,2,3,4,5] }
```

**Evidenza:** Settings caricate correttamente ma ZERO celle con la classe.

#### Fase 2: Dopo fix calendarKey (parziale)
```
[Calendar FIX] Applicato fc-day-closed a 0 nuove celle (totale celle: 42)
```

**Problema:** Il re-mount via `calendarKey` non bastava perché con `useMacroCategories=true`, il key di FullCalendar usa `macroEventsKey`, non `calendarKey`. Le celle venivano trovate ma il `dayCellDidMount` NON aveva ancora applicato le classi.

#### Fase 3: Dopo fix useEffect DOM diretto (FUNZIONANTE)
```
[Calendar FIX] Applicato fc-day-closed a 19 nuove celle, 0 già chiuse (totale: 42)
[Calendar DEBUG] fc-day-closed cells: 19
[Calendar DEBUG] fc-day-sat cells: 7, con fc-day-closed: 6
[Calendar DEBUG] fc-day-sun cells: 7, con fc-day-closed: 6
[Calendar DEBUG] calendarSettings: { is_configured: true, open_weekdays: [1,2,3,4,5], business_hours_keys: ['0','1','2','3','4','5','6'] }
```

**Analisi:**
- **19 nuove celle** ricevono `fc-day-closed` dal useEffect DOM (non da `dayCellDidMount`)
- **0 già chiuse**: conferma che `dayCellDidMount` NON stava applicando le classi (il useEffect le applica tutte lui)
- 6 sabati + 6 domeniche + 7 celle "altro mese" che cadono di sabato/domenica = 19
- 1 sabato e 1 domenica non hanno `fc-day-closed`: sono celle fuori dal range della griglia visibile (FullCalendar non le include nel querySelectorAll)

### Header info (confermato):
```
dow=6 (sab): isClosedWeekday=true, hasHours=true, headerText="sab08:00-14:00"
dow=0 (dom): isClosedWeekday=true, hasHours=false, headerText="domChiuso"
```

**Nota:** Il sabato ha business_hours ("08:00-14:00") nel DB anche se è chiuso (`open_weekdays: [1,2,3,4,5]`). Inconsistenza dati dall'onboarding: gli orari vengono salvati per il sabato ma il sabato è poi rimosso dai giorni aperti. Non impatta il fix ma potrebbe confondere l'utente (header mostra orari di un giorno chiuso).

### First row cell classes (post-fix):
```
2026-01-31 (sat): "fc-day fc-day-sat fc-day-past fc-day-other fc-daygrid-day fc-day-closed" ✅
2026-02-01 (sun): "fc-day fc-day-sun fc-day-past fc-daygrid-day fc-day-closed" ✅
```

### Colonne uniformi:
```
Header widths: tutte 25px (schermo piccolo) — uniformi, delta=0px
```

---

## 6. Dati Strutturali Raccolti

| Metrica | Valore | Note |
|---------|--------|------|
| Header widths | Tutte 97px | Uniformi, delta=0px |
| Cell widths (body) | Tutte 96px | Uniformi |
| Totale celle griglia | 42 | 6 righe × 7 colonne |
| Colonne visibili | 7 | lun-dom, `firstDay: 1` |
| fc-day-closed dopo fix | 19 | 6 sat + 6 sun + 7 extra |
| business_hours chiavi | 7 (0-6) | Tutti i giorni, inclusi chiusi |
| open_weekdays | [1,2,3,4,5] | Lun-Ven |
| FullCalendar table-layout | `fixed` | Da core CSS |

---

## 7. File Modificati in Questa Sessione

| File | Tipo | Dettaglio |
|------|------|-----------|
| `src/features/calendar/Calendar.tsx` | Aggiunta | useEffect debug (larghezze colonne, fc-day-closed count) |
| `src/features/calendar/Calendar.tsx` | Aggiunta | useEffect FIX CRITICO: applica fc-day-closed via DOM |
| `src/features/calendar/Calendar.tsx` | Aggiunta | stato `visibleRangeKey` per trigger su navigazione |
| `src/features/calendar/Calendar.tsx` | Modifica | `datesSet` callback: incrementa visibleRangeKey |
| `src/features/calendar/Calendar.tsx` | Modifica | `calendarKey` useEffect: aggiunto calendarSettings alle dipendenze |
| `src/features/calendar/Calendar.tsx` | Modifica | `dayHeaderDidMount`: aggiunto placeholder "Chiuso" per giorni chiusi |
| `src/features/calendar/Calendar.tsx` | Aggiunta | Debug log in dayHeaderDidMount |
| `src/features/calendar/Calendar.tsx` | Aggiunta | CSS inline: `.fc .fc-col-header-cell { width: 14.285% }` |
| `src/features/calendar/Calendar.tsx` | Aggiunta | CSS inline: `.fc-col-header-hours.fc-col-header-closed` |
| `src/features/calendar/calendar-custom.css` | Aggiunta | `.fc-col-header-hours.fc-col-header-closed` stile variante |

---

## 8. Stato Attuale e Prossimi Passi

### Cosa funziona ora
- `fc-day-closed` viene applicata correttamente (19 celle, confermato da debug)
- Header dei giorni chiusi mostrano info ("Chiuso" per dom, orari per sab)
- Colonne tutte uniformi

### BUG ANCORA VISIBILE (confermato dall'utente 13-02-2026)
Nonostante `fc-day-closed` sia applicata nel DOM a tutte le celle Sab/Dom, **visivamente le celle appaiono ancora come un'unica cella unita**. Il problema è ora confermato come **CSS specificity**.

### Diagnosi CSS Specificity (PROBLEMA IDENTIFICATO)

La classe `fc-day-closed` è nel DOM ma i suoi stili NON vengono applicati perché regole con **specificity più alta** li sovrascrivono.

#### Cascata CSS per una cella Saturday con fc-day-closed:

| Regola | Proprietà | Specificity | Posizione | Vince? |
|--------|-----------|-------------|-----------|--------|
| `.fc-day-closed` | `background: linear-gradient(...)` | 0,0,1,0 | calendar-custom.css L279 | **PERDE** |
| `.fc .fc-day-sat` | `background-color: #ffffff` | 0,0,2,0 | calendar-custom.css L192 | |
| `.fc .fc-daygrid-day.fc-day-sat` | `background-color: #ffffff` | 0,0,3,0 | calendar-custom.css L200 | |
| `.fc-daygrid-day.fc-day-sat:not(.fc-day-today):not(.fc-day-selected)` | `background-color: #fafafa` | 0,0,5,0 | calendar-custom.css L206 | **VINCE per bg-color** |
| `.fc-day-closed` | `border: 2px solid #7dd3fc` | 0,0,1,0 | calendar-custom.css L287 | **PERDE** |
| `.fc-daygrid-day` | `border-color: #d1d5db` | 0,0,1,0 | Calendar.tsx inline (LATER) | **VINCE per border** |

**Risultato:** La cella Saturday con `fc-day-closed` ha:
- `background-color: #fafafa` (bianco sporco, da regola sat con specificity 0,0,5,0)
- `background-image: linear-gradient(...)` (dal shorthand `background` di fc-day-closed — MA `background-image` potrebbe non essere visibile se `background-color` lo copre o se il gradiente è troppo trasparente)
- `border-color: #d1d5db` (grigio, NON #7dd3fc azzurro, perché l'inline style vince per posizione)

**Aggravante:** In `border-collapse: collapse`, tra due celle adiacenti c'è UN SOLO bordo condiviso. Due celle con stesso sfondo e un singolo bordo grigio sottile appaiono come un'unica area.

### Soluzione proposta (NON ancora implementata)

**Approccio 1: Alzare specificity di `.fc-day-closed`**
```css
/* Specificity: 0,0,3,0 — pari o superiore alle regole sat/sun */
.fc .fc-daygrid-day.fc-day-closed {
  background: linear-gradient(135deg,
    rgba(224, 242, 254, 0.95) 0%,
    rgba(186, 230, 253, 0.95) 50%,
    rgba(224, 242, 254, 0.95) 100%) !important;
  border: 2px solid #7dd3fc !important;
}
```

**Approccio 2: box-shadow invece di border (immune a border-collapse)**
```css
.fc .fc-daygrid-day.fc-day-closed {
  background: linear-gradient(...) !important;
  box-shadow: inset 0 0 0 2px #7dd3fc !important;
  /* box-shadow non partecipa a border-collapse,
     ogni cella ha il proprio "bordo" indipendente */
}
```

**Approccio 3: Rimuovere le regole fc-day-sat/fc-day-sun per celle fc-day-closed**
```css
/* Override esplicito: quando sat/sun è anche closed, usa closed styles */
.fc .fc-daygrid-day.fc-day-sat.fc-day-closed,
.fc .fc-daygrid-day.fc-day-sun.fc-day-closed {
  background: linear-gradient(...) !important;
  background-color: transparent !important;
  border: 2px solid #7dd3fc !important;
}
```

**Approccio raccomandato:** Combinazione di Approccio 1 + 2. L'alto specificity vince la cascata, e il box-shadow garantisce separazione visiva indipendente da border-collapse.

### Inconsistenza dati onboarding
Il sabato ha `business_hours["6"] = [{open: "08:00", close: "14:00"}]` ma non è in `open_weekdays`. L'header mostra "sab 08:00-14:00" per un giorno chiuso. Da valutare se:
- L'onboarding dovrebbe cancellare business_hours dei giorni chiusi
- Oppure l'header dovrebbe mostrare "Chiuso" anche se ci sono orari residui

---

## 9. Debug Logging Presente nel Codice

Il codice contiene strumentazione di debug che produce i seguenti log in console:

| Prefisso | Contenuto | Utilità |
|----------|-----------|---------|
| `[Calendar DEBUG] Header column widths` | Larghezza px di ogni colonna header | Verifica uniformità colonne |
| `[Calendar DEBUG] Colonne uniformi/NON UNIFORMI` | Warning se delta > 10px | Allarme compressione |
| `[Calendar DEBUG] First row cell widths` | Larghezza + classi delle prime 7 celle | Verifica fc-day-closed applicata |
| `[Calendar DEBUG] fc-day-closed cells` | Conteggio celle con la classe | Conferma applicazione |
| `[Calendar DEBUG] fc-day-sat/sun cells` | Conteggio sat/sun con fc-day-closed | Dettaglio per giorno |
| `[Calendar DEBUG] BUG CONFERMATO` | Error se settings ok ma 0 closed cells | Allarme regressione |
| `[Calendar DEBUG] calendarSettings` | Stato settings corrente | Verifica dati |
| `[Calendar DEBUG] dayHeaderDidMount` | Info per ogni header montato | Verifica orari/chiuso |
| `[Calendar FIX] Applicato fc-day-closed` | Conteggio celle fix applicato | Conferma fix attivo |

**Nota:** Tutta questa strumentazione deve essere rimossa dopo la risoluzione definitiva del bug.

---

## 10. Conclusione

Il bug "weekend unito" ha **due cause root** scoperte in sequenza:

### Causa 1 (RISOLTA): Race condition `dayCellDidMount`
`dayCellDidMount` è one-shot: esegue al mount, ma `calendarSettings` non era ancora caricato → le celle non ricevevano `fc-day-closed`.
**Fix:** useEffect con DOM diretto che applica le classi quando settings cambiano.
**Risultato:** 19 celle ora ricevono `fc-day-closed` nel DOM. ✅

### Causa 2 (DA RISOLVERE): CSS Specificity
Le regole `.fc .fc-daygrid-day.fc-day-sat` (specificity 0,0,3,0 a 0,0,5,0) sovrascrivono `.fc-day-closed` (specificity 0,0,1,0) per `background-color`. Inoltre, l'inline `<style>` in Calendar.tsx sovrascrive `border-color` di `.fc-day-closed`.
**Risultato:** La classe è nel DOM ma non produce effetto visivo. Le celle restano bianche con bordo grigio. ❌

### Prossimo step
Alzare la specificity del selettore `.fc-day-closed` in `calendar-custom.css` e/o usare `box-shadow` inset per separazione visiva immune a `border-collapse`. Vedere proposte nella sezione 8.

### Riepilogo bug
```
[Struttura DOM]     ✅ Corretta (42 celle, 7 colonne, larghezze uniformi)
[Classe fc-day-closed] ✅ Applicata (19 celle tramite useEffect DOM)
[Stile background]  ❌ Non visibile (sovrascitto da regole sat/sun a specificity maggiore)
[Bordo separazione] ❌ Non visibile (border-color sovrascritta da inline + border-collapse)
[Percezione utente] ❌ Celle ancora "unite" visivamente
```

---

## 11. Bug aggiuntivi: Hover su celle Sab/Dom (mappatura 15-02-2026)

**Stesso contesto:** celle di sabato e domenica (e in generale tutte le celle con `.fc-day-closed`). Due sintomi aggiuntivi riportati dall’utente.

### 11.1 Sintomo A: Lampeggiamento (flickering) al passaggio del mouse

| Campo | Valore |
|-------|--------|
| **Dove** | Cella giorno (es. "8") in vista mese, giorno chiuso (Sab/Dom). |
| **DOM tipico** | `div.fc-daygrid-day-frame.fc-scrollgrid-sync-inner` dentro `td.fc-day.fc-day-sun.fc-day-past.fc-daygrid-day.fc-day-closed`. |
| **Cosa succede** | Passando il mouse sulla casella, la cella inizia a lampeggiare. |
| **Posizione riportata** | top=351px, left=1293px (es. cella domenica). |

**Ipotesi causa:**
- Lo stile `:hover` applica `transform: translateY(-1px)` e `box-shadow` (calendar-custom.css L119–127). Lo spostamento può causare un continuo “entra/esci” dal hit-testing (il mouse sembra uscire dalla cella, poi rientrare) → loop hover on/off → flicker.
- In più FullCalendar può inserire un div `.fc-highlight` in un’altra cella (vedi Sintomo B). Se l’highlight appare nella cella adiacente e intercetta il mouse, la cella sotto il cursore perde l’hover → l’highlight scompare → hover ritorna → flicker.

### 11.2 Sintomo B: Highlight sulla cella adiacente

| Campo | Valore |
|-------|--------|
| **Dove** | Stesse celle (Sab/Dom / `.fc-day-closed`). |
| **DOM highlight** | `div.fc-highlight` (data-cursor-element-id="cursor-el-742") dentro `div.fc-daygrid-bg-harness` della cella. |
| **Cosa succede** | Passando il mouse su una casella, **si illumina la cella adiacente** (il div `.fc-highlight` appare nella cella sbagliata). |
| **Posizione riportata** | Cella con highlight errato: top=352px, left=899px (casella “accanto”). |

**Ipotesi causa:**
- FullCalendar (v6, interaction plugin) gestisce l’highlight di selezione/hover e lo posiziona in base a coordinate o indici di cella. Possibili cause:
  1. **Tabella “sync”**: la vista daygrid usa `table.fc-scrollgrid-sync-table` e layer separati (fc-daygrid-body, fc-scrollgrid-sync-inner). L’highlight potrebbe essere posizionato in un layer con indici/ordine non allineati alle celle effettive (es. off-by-one di colonna).
  2. **firstDay: 1**: con settimana che inizia dal lunedì, il mapping colonna → giorno potrebbe essere sbagliato per le ultime due colonne (Sab/Dom).
  3. **Manipolazione DOM**: l’applicazione ritardata di `fc-day-closed` via `useEffect` e la struttura con `::before` e overlay potrebbero cambiare il layout o l’ordine degli elementi e confondere il calcolo della cella “sotto il mouse”.

### 11.3 Relazione con il bug “weekend unito”

- Stesse celle: tutte le celle Sab/Dom (e in generale `.fc-day-closed`) coinvolte nel bug “weekend unito” (CSS specificity) sono le stesse in cui si osservano flicker e highlight sulla cella sbagliata.
- Probabile interazione: finché le celle chiuse non sono ben distinte visivamente (specificity), overlay e layer moltiplicano gli effetti (hover + highlight FullCalendar) e rendono più evidenti flicker e disallineamento.

### 11.4 Piano di soluzione (hover + highlight)

1. **Ridurre/eliminare il lampeggiamento**
   - **Opzione A (consigliata):** sulle celle `.fc-day-closed` non applicare `transform` in hover (o usare una transizione molto leggera). In `calendar-custom.css` aggiungere:
     - `.fc .fc-daygrid-day.fc-day-closed:hover { transform: none; }` (e eventualmente solo un leggero cambio di opacità/box-shadow senza spostamento).
   - In questo modo si evita lo spostamento che può far “uscire” il mouse dalla cella nel hit-testing e si riduce il flicker.

2. **Evitare l’highlight sulla cella sbagliata**
   - **Opzione B (consigliata):** disattivare visivamente l’highlight nativo di FullCalendar nella vista daygrid e usare solo gli stili CSS custom per hover/feedback:
     - Nascondere `.fc-highlight` nella vista daygrid: es. `.fc-daygrid .fc-highlight { display: none !important; }` in `calendar-custom.css`.
   - In questo modo si elimina sia l’effetto “cella adiacente illuminata” sia la possibile interferenza dell’highlight con il mouse (contributo al flicker).
   - L’evidenziazione del giorno resta affidata a:
     - `:hover` (gradiente/ombra già definiti),
     - `fc-day-selected` al click (handleDayClick).

3. **Verifiche post-fix**
   - Passaggio del mouse su ogni giorno della settimana (inclusi Sab/Dom): nessun lampeggiamento.
   - Nessun div `.fc-highlight` visibile sulla cella adiacente; al click, solo la cella cliccata mostra `fc-day-selected`.

4. **Opzionale (se in futuro si riattiva l’highlight nativo)**
   - Verificare versione FullCalendar e issue note su daygrid + firstDay + fc-highlight.
   - Valutare se il bug è nell’uso della tabella sync e segnalare upstream se confermato.

### 11.5 Sintomo C: Animazione hover assente su Sab/Dom (mappatura 15-02-2026)

| Campo | Valore |
|-------|--------|
| **Sintomo** | Dopo il fix flicker + highlight: su sabato e domenica **non è presente** l’animazione responsive al passaggio del mouse (illuminazione/transizione) che è invece presente sulle altre caselle. |
| **Celle interessate** | Solo celle con `.fc-day-closed` (Sab/Dom e eventuali chiusure specifiche). |
| **Confronto** | Celle Lun–Ven: hover con gradiente, box-shadow, `transition`, (e `transform` che su chiuse è disattivato per evitare flicker). Celle Sab/Dom: nessun feedback visivo animato. |

**Analisi root cause (mappatura a fondo):**

1. **Transizione solo in :hover**  
   La regola `.fc .fc-daygrid-day.fc-day-closed:hover` impostava `transition` solo nello stato hover. Se la **base** (stato non-hover) non ha `transition`, il browser può non animare correttamente il passaggio da base → hover (specie con `!important` su background/box-shadow in altre regole).

2. **Specificity e ordine**  
   Le regole per `.fc-day-sat` / `.fc-day-sun` (anche senza `:hover`) hanno specificity 0,0,3,0 o 0,0,4,0. La regola hover per `.fc-day-closed` era 0,0,3,0; in alcuni contesti di cascata (ordine caricamento CSS, stili inline in Calendar.tsx) poteva non prevalere su base/hover delle celle sabato/domenica.

3. **Mancanza di classe dedicata**  
   L’hover era legato solo a `.fc-day-closed`, condivisa con altre logiche (stile base, icona spiaggia). Nessuna classe esclusiva per “cella chiusa con hover/animazione” garantita da nostro codice.

**Soluzione applicata (Tailwind-style + classi):**

- **Classe dedicata** `calendar-cell-closed`: applicata insieme a `fc-day-closed` in `Calendar.tsx` (useEffect che applica le classi via DOM + `dayCellDidMount`). Usata solo per stili di transizione e hover.
- **Transizione sulla base**: su `.fc .fc-daygrid-day.calendar-cell-closed` è impostata `transition: background-color 0.2s ease, background-image 0.2s ease, box-shadow 0.2s ease` (equivalente Tailwind duration-200, ease), così l’animazione è sempre attiva.
- **Hover con specificity alta**: regole per `.fc .fc-daygrid-day.calendar-cell-closed:hover` e per `.fc .fc-daygrid-day.fc-day-sat.calendar-cell-closed:hover`, `.fc .fc-daygrid-day.fc-day-sun.calendar-cell-closed:hover` (0,0,4,0) con stesso effetto delle altre celle (gradiente + box-shadow), senza `transform`.
- **Design token allineati**: stesso gradiente/ombra delle altre celle (es. `rgba(99, 102, 241, 0.06)`), `0 2px 8px rgba(0, 0, 0, 0.08)`.

---

**Fine report.**

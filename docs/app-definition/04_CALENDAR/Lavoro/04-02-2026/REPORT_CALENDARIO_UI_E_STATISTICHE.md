# Report: Lavoro su Calendario – UI, Card e Statistiche

**Data:** 04-02-2026  
**Area:** Pagina Attività/Calendario (CalendarPage), componenti UI e pannello statistiche.

---

## 1. Rimozione header dal componente Calendar

**File:** `src/features/calendar/Calendar.tsx`

- **Modifica:** Eliminata la barra superiore del calendario che conteneva:
  - icona + titolo "Calendario Aziendale"
  - pulsante "Nuovo Evento"
- **Motivo:** Richiesta di rimozione dell’elemento DOM (header della card calendario).
- **Pulizia:** Rimosso l’import non più usato `Plus` da `lucide-react`.  
  Il calendario inizia ora direttamente con la sezione filtri (se presente) e il contenuto FullCalendar.

---

## 2. Spaziatura tra le card e CollapsibleCard Statistiche

**File:** `src/features/calendar/CalendarPage.tsx`

- **Problema:** Le card "Assegna nuova attività" e "Statistiche" risultavano attaccate; la card Statistiche non si chiudeva al click sull’header.
- **Interventi:**
  - Contenitore principale: `flex flex-col gap-6` per uno spazio uniforme (24px) tra le sezioni.
  - Card Statistiche resa **controllata**: stato `statsCardExpanded` in CalendarPage, props `expanded` e `onExpandedChange` passate a `CalendarStatsPanel`, così l’apertura/chiusura non si perde con i re-render.
  - Nel pannello Statistiche, sul pulsante "Aggiorna" è stato aggiunto `e.stopPropagation()` (e `type="button"`) per evitare che il click sul pulsante apra/chiuda la card.

---

## 3. Rimozione header e duplicati (hideHeader)

**File:** `src/components/ui/CollapsibleCard.tsx`

- **Nuova prop:** `hideHeader?: boolean`.
- **Comportamento:** Se `hideHeader={true}` l’header (titolo, icona, chevron, barra cliccabile) **non viene renderizzato**; il contenuto è sempre visibile. Utilizzata per mostrare solo il contenuto senza barra collapse.
- **Accessibilità:** Con `hideHeader` il wrapper usa `aria-label={title}` e non `aria-labelledby` sull’header.

**File:** `src/features/calendar/CalendarPage.tsx` e `CalendarStatsPanel.tsx`

- In una fase intermedia la prima card era senza CollapsibleCard (solo div) per evitare duplicati visivi; in seguito è stata **ripristinata** la CollapsibleCard "Assegna nuova attività / mansione" con header (icona ClipboardCheck, `defaultExpanded={false}`) per mantenere una card collassabile come richiesto.
- La card Statistiche è sempre rimasta una CollapsibleCard con header funzionante.

---

## 4. Correzioni al calcolo “Questo Mese” (statistiche temporali)

**Problema:** In vista "Mese", "Questo Mese" e "Quest'Anno" mostravano lo stesso numero perché le statistiche temporali usavano `viewBasedEvents`, già filtrato per vista (in vista mese = solo eventi del mese).

**File:** `src/features/calendar/CalendarPage.tsx`

- **Nuovo useMemo:** `eventsForTemporalStats` = eventi dell’**anno corrente** da `displayEvents` (indipendenti dalla vista calendario).
- Passaggio al pannello: nuova prop `eventsForTemporalStats`.

**File:** `src/features/calendar/components/CalendarStatsPanel.tsx`

- **Nuova prop:** `eventsForTemporalStats?: CalendarEvent[]`.
- I quattro box temporali (Oggi, Questa Settimana, Questo Mese, Quest'Anno) usano `temporalEvents = eventsForTemporalStats ?? viewBasedEvents`.
- "Quest'Anno" = `temporalEvents.length` (dataset già filtrato sull’anno).
- Per "Questo Mese" aggiunto `eventDate.setHours(0, 0, 0, 0)` per confronto in data locale e coerenza con gli altri box.

Risultato: i conteggi per Oggi / Settimana / Mese / Anno sono coerenti e "Questo Mese" non coincide più con "Quest'Anno" in vista mese.

---

## 5. Sottotitolo “tipo di vista” sulla card Statistiche

**File:** `src/features/calendar/components/CalendarStatsPanel.tsx`, `CalendarPage.tsx`

- **Prop:** `calendarView?: CalendarViewType` (`'year' | 'month' | 'week' | 'day'`).
- **Sottotitolo** nella CollapsibleCard Statistiche (prop `subtitle`):
  - Anno → "Statistiche annuali"
  - Mese → "Statistiche mensili"
  - Settimana → "Statistiche settimanali"
  - Giorno → "Statistiche giornaliere"
- In CalendarPage viene passato `calendarView={view}` (stato di `useCalendarView`).
- Tipo riutilizzato da `ViewSelector` (`CalendarViewType`).

---

## 6. Testi e etichette nel pannello Statistiche

**File:** `src/features/calendar/components/CalendarStatsPanel.tsx`

| Elemento | Prima | Dopo |
|----------|--------|------|
| Titolo card (h3) | "📊 Statistiche" | "Statistiche" (emoji rimossa) |
| Sezione sotto titolo (h4) | "📊 Statistiche Temporali" → "Eventi da completare" → "Numero di Eventi" | **"Eventi da Completare"** |
| Prima box (indigo) | "📊 Eventi da Completare" | **"Attività / Mansioni"** (emoji rimossa) |
| Seconda box (verde) | "✅ Completati" | **"Completate"** (emoji rimossa) |
| Terza box (giallo) | "⏳ In Attesa" | **"In Attesa"** (emoji rimossa) |

---

## 7. Casella “In Attesa” legata alla vista calendario

**Problema:** La casella "In Attesa" non cambiava al cambiare vista (Anno/Mese/Settimana/Giorno) perché usava `eventsInWaiting` dall’hook, che conta solo gli **eventi di oggi** non completati.

**File:** `src/features/calendar/components/CalendarStatsPanel.tsx`

- Il numero della terza box ("In Attesa") è stato cambiato da `eventsInWaiting.length` a **`viewBasedEvents.filter(e => e && e.status !== 'completed').length`**.
- Il conteggio è ora **sulla vista corrente** (stessa logica del primo box "Attività / Mansioni") e si aggiorna con Anno/Mese/Settimana/Giorno.

---

## 8. Riepilogo file modificati

| File | Modifiche principali |
|------|------------------------|
| `src/features/calendar/Calendar.tsx` | Rimozione header (titolo + pulsante Nuovo Evento), rimozione import `Plus` |
| `src/features/calendar/CalendarPage.tsx` | Layout `gap-6`, stato `statsCardExpanded`, `eventsForTemporalStats`, `calendarView` a CalendarStatsPanel, CollapsibleCard "Assegna" con icon ClipboardCheck |
| `src/features/calendar/components/CalendarStatsPanel.tsx` | Props `calendarView`, `eventsForTemporalStats`, sottotitolo vista, testi/etichette aggiornati, "In Attesa" da viewBasedEvents, rimozione emoji |
| `src/components/ui/CollapsibleCard.tsx` | Prop `hideHeader`, rendering condizionale header e contenuto con `showContent = hideHeader \|\| isExpanded` |

---

## 9. Comportamento attuale pagina Attività

- **Header pagina:** Titolo "Attività e Mansioni", alert, selettore vista (Anno/Mese/Settimana/Giorno).
- **Prima card:** "Assegna nuova attività / mansione" – CollapsibleCard con icona, chiusa di default, apri/chiudi funzionante.
- **Seconda card:** "Statistiche" – CollapsibleCard con sottotitolo che indica la vista (es. "Statistiche mensili"), pulsante Aggiorna (con stopPropagation), apri/chiudi controllato dalla pagina.
  - Box: Attività/Mansioni, Completate, In Attesa, In Ritardo (tutti basati su `viewBasedEvents` dove applicabile).
  - Sezione "Eventi da Completare" con Oggi / Questa Settimana / Questo Mese / Quest'Anno basata su `eventsForTemporalStats` (anno corrente).
- **Calendario:** Senza header proprio; filtri sopra il FullCalendar.
- **Spaziatura:** `gap-6` tra le sezioni principali.

---

*Report generato il 04-02-2026 – sessione Calendario UI e Statistiche.*

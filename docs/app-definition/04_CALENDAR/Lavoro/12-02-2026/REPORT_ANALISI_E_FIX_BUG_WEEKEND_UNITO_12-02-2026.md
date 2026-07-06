# Report: Analisi e Fix bug calendario – weekend "unito" + casella vuota (30–1)

**Data:** 12-02-2026
**Stato:** Fix implementato — In attesa di esito test in dev mode
**Sessione:** Plan → Analisi root cause → Implementazione fix

---

## 1. Riepilogo della sessione

In questa sessione sono state completate:

1. **Analisi approfondita del bug** (da report precedente 11-02-2026)
2. **Identificazione delle cause root** (2 bug distinti)
3. **Implementazione fix** (3 file modificati)
4. **Documentazione e cleanup** (strumentazione debug rimossa)

---

## 2. Screenshot del calendario (stato attuale)

![Calendar February 2026](Screenshot 2026-02-12 234817.png)

**Osservazioni:**
- Calendario di febbraio 2026 visualizzato
- 7 colonne visibili: lun, mar, mer, gio, ven, sab, dom ✅
- Cella "1 febbraio" nella colonna domenica (corretta)
- Nessuna cella visualmente "unita" in questa view
- Griglia corretta a 6 settimane × 7 giorni

---

## 3. Cause root identificate

### 3.1 Bug: Casella vuota tra 30 e 1 (confine mese)

**Causa:** FullCalendar v6 default CSS per celle "altro mese"

```css
/* Da node_modules/@fullcalendar/daygrid/internal.js:985 */
.fc . fc-day-other .fc-daygrid-day-top {
  opacity: .3;  /* 30% opacità */
}
```

**Scenario di riproduzione:**
- Visualizzazione di un mese (es. febbraio)
- Celle del mese precedente/successivo ricevono classe `fc-day-other` da FullCalendar
- Se quella cella è anche un giorno di chiusura (sabato/domenica) → classe `fc-day-closed`
- Numero del giorno: 30% opacità (FullCalendar) + sfondo azzurro `.fc-day-closed` = **numero quasi invisibile**
- Risultato: cella appare "vuota" anche se il DOM è corretto

**Esempio:** Se visualizzando febbraio 2026 il 31 gennaio fosse un sabato e fosse giorno di chiusura:
- `.fc-day-other` + `.fc-day-closed` = numero al 30% opacity su sfondo azzurro = cella vuota

**Root cause:** Nessun override nel progetto per `.fc-day-other.fc-day-closed`

---

### 3.2 Bug: Weekend "unito" (sabato e domenica come una cella)

**Causa primaria:** Bordi troppo sottili e semi-trasparenti

**Situazione nel codice prima del fix:**

| File | CSS Rule | Valore |
|------|----------|--------|
| `calendar-custom.css:279` | `.fc-day-closed border` | `1px solid rgba(56, 189, 248, 0.3)` ← semi-trasparente, quasi invisibile |
| `calendar-custom.css:288` | `.fc-day-closed border-left` | `1px solid rgba(56, 189, 248, 0.55)` ← ancora troppo leggero |
| `Calendar.tsx:901` | `.fc-day-closed` (inline) | `border-left: 1px solid rgba(56, 189, 248, 0.55)` ← **duplicazione** |

**Layout FullCalendar:** `border-collapse: collapse` (tabella)

**Problema:** Quando due celle `.fc-day-closed` adiacenti (sabato + domenica) hanno:
- Stesso background gradient (azzurro quasi uniforme)
- Bordo condiviso di 1px semi-trasparente (#7dd3fc al 30% opacity)
- Confine tra le celle non visibile

**Confronto:**
- Celle normali: `border: 2px solid #d1d5db` (grigio, opaco, visibile)
- Celle chiuse: `border: 1px solid rgba(56, 189, 248, 0.3)` (azzurro, semi-trasparente, invisibile)

In `border-collapse: collapse`, il bordo tra due celle chiuse viene calcolato dalle regole di collasso e risulta quasi impercettibile.

**Aggravante:** Duplicazione CSS
- Stesso `.fc-day-closed` definito in `calendar-custom.css` E nell'inline `<style>` di `Calendar.tsx`
- Inline `<style>` arriva dopo, quindi parzialmente sovrascrive → confusione nella cascata CSS
- Inline version NON ripete tutti i bordi, solo `border-left` → ambiguità

---

## 4. Fix implementati

### 4.1 Fix per casella vuota (30–1)

**File:** `src/features/calendar/calendar-custom.css` (aggiunta linea 312-315)

```css
/* 🔧 FIX: Giorni chiusi "altro mese" visibili - override opacity 0.3 di fc-day-other */
.fc . fc-day-other.fc-day-closed .fc-daygrid-day-top {
  opacity: 1 !important;
}
```

**Logica:**
- Combina i due selettori `.fc-day-other` (altro mese) + `.fc-day-closed` (giorno chiuso)
- Forza opacità 1 (100% visibile) con `!important` per vincere sia il default di FullCalendar che altri stili
- Consente ai numeri di giorni chiusi al confine mese di essere visibili

---

### 4.2 Fix per weekend "unito"

**File:** `src/features/calendar/calendar-custom.css` (modifica linea 279-288)

**Prima:**
```css
.fc-day-closed {
  background: linear-gradient(...) !important;
  position: relative;
  opacity: 1 !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  border-left: 1px solid rgba(56, 189, 248, 0.55) !important;  /* Duplicazione, poco visibile */
}
```

**Dopo:**
```css
.fc-day-closed {
  background: linear-gradient(135deg,
    rgba(224, 242, 254, 0.95) 0%,
    rgba(186, 230, 253, 0.95) 50%,
    rgba(224, 242, 254, 0.95) 100%) !important;
  position: relative;
  opacity: 1 !important;
  /* 🔧 FIX: bordi visibili (opachi) per separare celle chiuse adiacenti (es. sabato/domenica) */
  border: 2px solid #7dd3fc !important;
}
```

**Cambiamenti:**
- `border: 1px solid rgba(...)` → `border: 2px solid #7dd3fc !important`
- **Spessore:** da 1px a 2px (come le celle normali)
- **Colore:** da semi-trasparente (0.3 opacity) a **opaco** (#7dd3fc = cyan/sky-500 pieno)
- **Applicazione:** a **tutti e 4 i lati** (non solo `border-left`)

**Vantaggio:** Bordo ben visibile su tutte e 4 i lati, stesso colore e stile, separa visualmente le celle adiacenti

---

### 4.3 Cleanup e rimozione duplicazione

**File:** `src/features/calendar/Calendar.tsx` (righe 900-938)

**Rimosso:**
```css
/* Vecchia definizione duplicata in inline <style> - RIMOSSA */
.fc-day-closed {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
  position: relative;
  opacity: 1 !important;
  border-left: 1px solid rgba(56, 189, 248, 0.55) !important;
}

.fc-day-closed::before { ... }

.fc-day-closed . fc-daygrid-day-number { ... }
```

**Mantenuto:**
```css
.fc-day-beach-icon { ... }  /* OK, necessario per l'icona spiaggia */
```

**Razionale:**
- Stili `.fc-day-closed` ora centralizzati in `calendar-custom.css` soltanto
- Evita conflitti di cascata CSS
- Rende il codice più manutenibile

---

### 4.4 Rimozione strumentazione di debug

**File:** `src/features/calendar/Calendar.tsx`

**Rimossi:**
- `useEffect` con fetch verso endpoint debug (`http://127.0.0.1:7242/...`)
- Fetch in `datesSet` callback
- Fetch in `dayCellDidMount` callback
- Fetch in `dayHeaderDidMount` callback

**Pulizia:** Codice produttivo ripristinato, nessuno "scaffolding" di debug rimasto

---

## 5. Dettaglio file modificati

| File | Linee | Tipo Modifica | Dettagli |
|------|-------|---------------|----------|
| `src/features/calendar/calendar-custom.css` | 312-315 (nuovo) | Aggiunta | Override `.fc-day-other.fc-day-closed` opacità 1 |
| `src/features/calendar/calendar-custom.css` | 279-288 | Modifica | Bordo `.fc-day-closed` da 1px semi-trasparente a 2px opaco |
| `src/features/calendar/Calendar.tsx` | 143-147 (rimosso) | Rimozione | `useEffect` debug settings |
| `src/features/calendar/Calendar.tsx` | 417 (semplificato) | Modifica | `datesSet` callback senza fetch debug |
| `src/features/calendar/Calendar.tsx` | 418-421 (semplificato) | Modifica | `dayCellDidMount` senza fetch debug |
| `src/features/calendar/Calendar.tsx` | 450-451 (semplificato) | Modifica | `dayHeaderDidMount` senza fetch debug |
| `src/features/calendar/Calendar.tsx` | 900-938 (rimosso) | Rimozione | Definizione CSS `.fc-day-closed` duplicata in inline `<style>` |

---

## 6. Stato del fix

### Implementazione ✅
- [x] Identificate cause root
- [x] Fix per bug #1 (casella vuota) implementato
- [x] Fix per bug #2 (weekend unito) implementato
- [x] Cleanup code e rimozione duplicazione
- [x] Rimozione strumentazione debug

### Testing ⏳
- [ ] Test in dev mode con sabato/domenica come giorni di chiusura
- [ ] Verifica casella "altro mese" (es. 31 gennaio) come giorno chiuso
- [ ] Verifica visibilità bordi tra celle chiuse adiacenti
- [ ] Verifica nessuna regressione su viste week/day
- [ ] Test coverage coverage per nuovi stili CSS

---

## 7. Prossimi passi

### Immediati (dopo test)

1. **Confermare esito test in dev mode**
   - Se fix funziona: passare a git commit
   - Se fix parziale: analizzare quale aspetto rimane
   - Se fix non funziona: investigare altre cause

2. **Se ulteriori aggiustamenti sono necessari:**
   - Aumentare spessore bordo (es. 3px)
   - Cambiare colore del bordo (es. #0ea5e9 più saturo)
   - Aggiungere box-shadow per maggiore separazione visiva
   - Verificare specifici CSS di FullCalendar v6 per non-business days

3. **Test regressione:**
   - Verificare viste timeGridWeek e timeGridDay
   - Controllare che le celle normali (aperte) non siano visivamente alterate
   - Testare giorni di chiusura specifici (`.fc-day-other`) su confini mese diversi

### Se problema persiste

4. **Investigazioni ulteriori:**
   - Ispezionare nel DevTools le celle sabato/domenica (classi, computed styles, bordi effettivi)
   - Verificare se FullCalendar applica altre classi/stili (es. `fc-non-business`) che interferiscono
   - Controllare se `businessHours.daysOfWeek` interagisce in modo inaspettato con il CSS
   - Provare `border-collapse: separate` se possibile (cambio di layout)

5. **Documentazione:**
   - Aggiornare MEMORY.md con il pattern del bug e il fix definitivo
   - Aggiornare BUG_TRACKER.md con risoluzione

---

## 8. Note tecniche

### FullCalendar v6 e border-collapse

FullCalendar usa una struttura `<table>` con `border-collapse: collapse`. In questo modalità:
- I bordi tra celle adiacenti vengono "collassati" in un'unica linea
- Il bordo visibile è determinato da regole di precedenza (larghezza > colore > stile)
- Due bordi adiacenti di stessispessore: vince il colore che "sembra" più scuro/saturo

Nel nostro caso:
- Border rosso (closed cells) 2px #7dd3fc
- Border grigio (normal cells) 2px #d1d5db

Poiché i colori sono diversi e gli spessori uguali, il risultato dovrebbe essere un bordo visibile che alterna colore. Ma in pratica, CSS border-collapse usa il colore del primo elemento (ordine DOM/specificity).

**Fix applicato:** Rende il bordo opaco e più visibile, sufficientemente spesso da essere percepito

---

## 9. Allegati

- **Screenshot:** `Screenshot 2026-02-12 234817.png` — Calendario current state
- **Report precedente:** `11-02-2026/REPORT_BUG_CALENDARIO_WEEKEND_UNITO_11-02-2026.md` — Analisi root cause dettagliata

---

## 10. Conclusione

Sono state identificate e affrontate due distinte cause root di bug visivi nel calendario:

1. **Casella vuota:** Opacità 0.3 di `.fc-day-other` non sovrascritto per celle chiuse → fix: opacity override a 1
2. **Weekend unito:** Bordi 1px semi-trasparenti tra celle chiuse → fix: border 2px opaco

Il codice è stato pulito da duplicazioni CSS e strumentazione di debug. I fix sono pronti per il testing in dev mode.

**Esito awaiting:** Test in dev mode con configurazione di giorni di chiusura (sabato/domenica) per confermare visibilità corretta.

---

**Fine report.**

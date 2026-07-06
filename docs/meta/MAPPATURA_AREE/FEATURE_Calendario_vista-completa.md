# FEATURE — 📅 Calendario · vista completa delle cose da fare (dec. 13)

**Data:** 2026-07-06 · **Richiesta:** owner (sessione CP9→CP10) · **Casa:** 🕐 Oggi (lente Tempo)
**Stato:** definita → in costruzione (questa sessione)

> **La frase dell'owner (verbatim, 2026-07-06):** «la pagina calendario, dove admin o dipendenti
> o responsabili, conservano una vista completa delle mansioni da fare (se voglio completare una
> cosa che sarà da fare nei prossimi giorni la completo dal calendario, poiché il mio turno
> mostra solo le cose di oggi)».

---

## 1. Cos'è (una riga)

La **vista lunga della lente Tempo**: Oggi risponde a «cosa faccio ORA», il Calendario risponde a
«cosa c'è da fare NEI PROSSIMI GIORNI (e cosa è stato fatto)» — e permette di **completare in
anticipo** un'occorrenza futura senza aspettare che compaia nel turno.

## 2. Dove vive (navigazione)

- **NON è una quinta casa**: la bottom bar / side-rail resta quella del mockup 06 (4 case + tab
  reparto). Il Calendario è una **pagina figlia di Oggi**: route **`/calendario`**, si entra dal
  **pulsante-icona 📅 nell'header di Oggi** (e si torna con la freccia indietro).
- Motivo: il masterplan §12 fissa 4 case canoniche; il calendario è la stessa lente di Oggi a
  profondità diversa, non una lente nuova. (Legacy: era una pagina propria `CalendarPage` con
  FullCalendar — troppo per i guanti; qui si riscrive come **agenda verticale** §13.)

## 3. Chi vede cosa (ruoli — stesse regole di Oggi, nessuna nuova RLS)

| Ruolo | Vede | Può |
|-------|------|-----|
| dipendente | occorrenze dei **suoi reparti** + mansioni assegnate a lui + mansioni senza reparto | spuntare (anche in anticipo) · stornare |
| responsabile / admin (`canDirect`) | **tutto** | idem |

La sicurezza vera resta nel DB (RLS `company_id` + policy append-only): il filtro ruoli in
client è UX, identico a `useOggi` (`mieDeps`).

## 4. Cosa mostra (contenuto)

**Agenda verticale per giorno** (mobile-first, da guanti): mese corrente navigabile ± mesi,
un blocco per giorno con le occorrenze:

| Sorgente | Occorrenze mostrate | Completabile dal calendario? |
|----------|--------------------|------------------------------|
| `tasks` (mansioni generiche) | espansione client di `frequency` a partire da `next_due` (ancora); una card per occorrenza nel periodo visibile | ✅ sì, **qualsiasi occorrenza futura** — il completamento copre il SUO periodo (`periodForFrequency`, stessa semantica di Oggi) |
| `maintenance_tasks` ≠ temperature | la **prossima scadenza reale** (`next_due`) + **proiezioni** delle successive (derivate da frequency) | ✅ solo la **prossima occorrenza reale**; le proiezioni sono informative (il trigger DB ricalcola `next_due` dal completamento: completare due proiezioni in fila corromperebbe la ricorrenza) |
| `maintenance_tasks` = temperature | proiezione dei giorni di rilevamento | ❌ **mai dal calendario**: la temperatura si registra **al punto di conservazione** (gesto-firma 🌡️, Reparti). La card lo dice con voce umana e, se è oggi, porta a Reparti |
| completamenti / letture (passato e oggi) | il **registro**: cosa è stato fatto, da chi, quando (rispettando gli storni) | 🔁 storno con conferma armata (stesso pattern di Oggi, dec. 1) |

- **Giorni di chiusura** (`company_calendar_settings.open_weekdays`, fallback `[1..6]`): marcati
  «chiuso»; le occorrenze **giornaliere** non vi compaiono (slittano al primo giorno aperto);
  settimanali/mensili restano nel loro giorno.
- **Passato**: i giorni passati del mese mostrano solo il registro (niente «da fare» retroattivo
  in beta — l'arretrato vive già in Oggi come «arretrata»).

## 5. Completamento anticipato — semantica (il cuore della feature)

- **Mansioni**: `INSERT task_completions` con `period_start/period_end = periodForFrequency(freq,
  dataOccorrenza)`. Nessun trigger: la verità è «esiste un completamento valido che copre il
  periodo» — identico a Oggi, che quindi **smette automaticamente di mostrare** quella mansione
  quando il giorno arriva. Zero schema nuovo.
- **Manutenzioni**: `INSERT maintenance_completions` (stessa insert di Oggi). Il trigger live
  (`update_maintenance_task_on_completion`, storno-aware da `20260706070000`) ricalcola
  `next_due = completed_at + frequency` — **ricorrenza rolling**: completare in anticipo
  anticipa anche la prossima scadenza. È il comportamento onesto (il frigo sbrinato oggi va
  risbrinato tra N giorni da oggi, non dalla data teorica).
- **Storno**: identico a Oggi (`useStorna`): riga di annullo, mai DELETE (dec. 1); per le
  manutenzioni il trigger riporta il task esigibile.

## 6. Le due lenti (§9.5)

- 🛡️ **Ufficiale-HACCP**: il completamento anticipato resta una **prova onesta** — `completed_at`
  è il momento reale del gesto, il periodo coperto è dichiarato nelle colonne, lo storno è
  tracciato. Nessuna retro-datazione possibile (non offriamo mai il completamento di giorni
  passati). Le temperature non si «spuntano» mai a distanza: solo la lettura al punto vale.
- 👨‍🍳 **Ristoratore**: «domani non ci sono: la pulizia settimanale la faccio oggi e la spunto» —
  un tap dal calendario, senza chiamare il titolare. Il titolare vede il carico dei prossimi
  giorni in un colpo d'occhio (chi chiude può pianificare i turni).

## 7. Cosa NON è (confini)

- ❌ Non crea/modifica mansioni (① Imposto = Regia; qui solo ② Faccio + vista).
- ❌ Niente FullCalendar/vista mensile a griglia in beta (agenda verticale §13; la griglia è
  polish futuro, annotabile in IDEE_ESPERIENZA).
- ❌ Niente eventi «scadenze prodotti» in v1 (arrivano con la casa Scorte; il calendario è
  costruito per accoglierli come sorgente in più).
- ❌ Nessuna tabella nuova, nessuna migration: solo letture + le stesse due insert di Oggi.

## 8. Implementazione (file)

```
src/features/calendario/
├── CalendarioPage.tsx    ← agenda verticale, navigazione mese, spunta/storno
├── hooks.ts              ← useCalendario: occorrenze derivate (tasks + maintenance)
└── occurrences.ts        ← espansione ricorrenze pura (unit-testata)
src/App.tsx               ← route /calendario (dentro RequireSession + AppShell)
src/features/oggi/OggiPage.tsx ← pulsante 📅 nell'header
```

---

**Ultimo aggiornamento**: 2026-07-06 · prima stesura (definizione richiesta owner, dec. 13) · → report sessione CP10

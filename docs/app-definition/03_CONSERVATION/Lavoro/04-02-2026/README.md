# Sessione 4 Febbraio 2026

## Contenuto

| File | Descrizione |
|------|-------------|
| **REPORT_LAVORO_04-02-2026.md** | Report: Manutenzioni programmate, pallino verde/giallo/rosso, lettura = completamento task, completamento automatico su "Rileva Temperatura", box "Ultima lettura" colore solo da temperatura (verde/rosso) |
| **REPORT_SESSIONE_MODAL_TEMPERATURA_04-02-2026.md** | Report sessione: tentativo fix chiusura AddTemperatureModal (X, Annulla, dopo salvataggio) — **non risolto** |
| **PIANO_completamento_temperatura_su_lettura.md** | Piano: completamento automatico task "Rilevamento Temperature" quando si salva una lettura |
| **README.md** | Indice cartella |

## Riepilogo

### Manutenzioni programmate (ScheduledMaintenanceCard)

- **Conteggio**: il numero mostrato è per **tipologia** (max 4: Rilevamento Temperature, Sanificazione, Sbrinamento, Controllo Scadenze), non per quantità di eventi/task.
- **Ordine fisso**: le 4 tipologie sono sempre mostrate nello stesso ordine; per ogni tipo la prima riga è la **prossima per data**.
- **Link “Mostra altre”**: funziona per **tutte** le tipologie, inclusi Controllo Scadenze e Sbrinamento, quando ci sono più task dello stesso tipo.
- **Pallino stato (giornaliero)**: **Verde** = nessuna manutenzione da completare oggi (allineato alle scadenze giornaliere); **Giallo** = almeno una da completare oggi; **Rosso** = almeno una in ritardo. Le manutenzioni di domani o oltre non fanno andare in giallo.
- **Task temperatura nascosti**: se c'è una lettura temperatura che soddisfa la scadenza del task "Rilevamento Temperature", quel task non compare in elenco (stessa logica di pointCheckup).

### Completamento automatico task temperatura su lettura

- **Trigger**: salvataggio di una lettura tramite il pulsante **"Rileva Temperatura"**.
- **Effetto**: le task "Rilevamento Temperature" per quel punto con scadenza soddisfatta dalla lettura vengono completate automaticamente (insert in `maintenance_completions`), visibili in Conservazione e in Attività/calendario.

### Check-up card (pointCheckup)

- **Rilevamento temperatura**: se per un punto è stata registrata una **lettura temperatura** in data uguale o successiva alla scadenza del task “Rilevamento Temperature”, quel task **non** viene più mostrato come arretrato né come “di oggi da completare” sulla card del punto.

### Box "Ultima lettura" – colore solo da temperatura (04-02-2026)

- **Comportamento**: il box "Ultima lettura" nella ConservationPointCard usa **solo** la conformità della temperatura (range setpoint ±1°C) per il colore: **verde** = temperatura conforme, **rosso (critico)** = temperatura fuori range. Lo stato complessivo del punto (manutenzioni in attenzione/arretrate) non influenza più il colore di questo box.
- **Implementazione**: introdotto `temperatureBadgeColors` derivato da `checkup.temperature.inRange`; il box non usa più `statusColors` (overallStatus).

**File coinvolti**: `ScheduledMaintenanceCard.tsx`, `pointCheckup.ts`, `useTemperatureReadings.ts`, `ConservationPointCard.tsx`

---

## Riferimenti

- **Master Index**: [../00_MASTER_INDEX_CONSERVATION.md](../00_MASTER_INDEX_CONSERVATION.md)

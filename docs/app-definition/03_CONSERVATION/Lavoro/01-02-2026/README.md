# Sessione 1 Febbraio 2026

## Contenuto

| File | Descrizione |
|------|-------------|
| **REPORT_SESSIONE_01-02-2026.md** | Report dettagliato: conformità range, abbattitore solo Sanificazione, validazioni modali |
| **REPORT_card_checkup_centralizzato.md** | Report completo: sistema check-up centralizzato, real-time, task ricorrenti automatici |
| **README.md** | Indice cartella |

## Riepilogo

### Prima Parte: Conformità e Validazioni

- **Conformità**: temperatura in ±1°C = conforme (no Attenzione); messaggio correttivo solo fuori range
- **Abbattitore**: solo Sanificazione come manutenzione obbligatoria e assegnabile
- **Validazioni**: AddPointModal, MaintenanceTaskModal, conservationUtils, TasksStep aggiornati

### Seconda Parte: Card Check-up Centralizzato

- **Check-up Centralizzato**: card ConservationPointCard ora usa funzione centralizzata `getPointCheckup()` che calcola stato basato su temperatura + manutenzioni
- **Real-time**: aggiornamenti automatici quando utenti completano manutenzioni (useConservationRealtime con 3 subscriptions Supabase)
- **Task Ricorrenti**: trigger PostgreSQL che aggiorna automaticamente `next_due` quando task completato (daily/weekly/monthly/annually)
- **UI Due Box**: quando entrambi problemi (temperatura + manutenzioni), mostrati in box separati con click handlers
- **Gravità Arretrati**: indicatori colorati per task arretrati (rosso >7 giorni, arancione 3-7, giallo 1-3, grigio <1)
- **Completamenti Multipli**: permessi completamenti simultanei da utenti diversi (Mario + Luca → entrambi registrati)
- **Ottimizzazione Query**: caricamento selettivo solo task critici (arretrati + oggi + prossimo per tipo se oggi completato)

**File coinvolti**: pointCheckup.ts, useMaintenanceTasksCritical.ts, useConservationRealtime.ts, ConservationPointCard.tsx, migration SQL trigger, GUIDA_TEST_conservation_checkup.md

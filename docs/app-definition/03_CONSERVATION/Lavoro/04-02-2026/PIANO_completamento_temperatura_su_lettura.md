# Piano: Completamento task "Rilevamento Temperature" su lettura

## Obiettivo
Quando l’utente rileva la temperatura di un punto di conservazione tramite il pulsante **"Rileva Temperatura"** (pagina Conservazione/Attività), la task di manutenzione di tipo **"Rilevamento Temperature"** associata a quel punto deve risultare **completata** sia in pagina Conservazione che in pagina Attività (calendario/modal).

## Flusso attuale
1. Click "Rileva Temperatura" → apertura `AddTemperatureModal`.
2. Salvataggio → `useTemperatureReadings.createReading()` → insert in `temperature_readings`.
3. Le task "Rilevamento Temperature" vengono completate **solo** tramite "Completa Manutenzione" nel modal Attività.
4. La card "Manutenzioni programmate" nasconde il task temperatura se c’è una lettura recente, ma la task in DB resta `scheduled`/arretrata → il calendario/modal continuano a mostrarla come da completare.

## Comportamento desiderato
- **Trigger**: salvataggio di una lettura temperatura (stesso flusso del pulsante "Rileva Temperatura").
- **Azione**: per il `conservation_point_id` della lettura, trovare le task di tipo `temperature` con `next_due <= recorded_at` e stato non completato/skipped, e per ognuna inserire un record in `maintenance_completions` (come quando si clicca "Completa Manutenzione").
- **Effetto**: il trigger DB su `maintenance_completions` aggiorna `next_due`, `last_completed` e `status` sulla task → la task risulta completata in Conservazione e in Attività/calendario.

## Mappatura tecnica

| Dove | Cosa |
|------|-----|
| **Hook** | `src/features/conservation/hooks/useTemperatureReadings.ts` |
| **Mutation** | `createReadingMutation` (dopo insert in `temperature_readings`) |
| **Dati disponibili** | `conservation_point_id`, `recorded_at`, `company_id`; serve anche `user` da `useAuth()` |
| **Query task** | `maintenance_tasks` con `conservation_point_id`, `type = 'temperature'`, `status NOT IN ('completed','skipped')`, `next_due <= recorded_at` |
| **Scrittura** | Insert in `maintenance_completions` per ogni task trovata (stessi campi di MacroCategoryModal) |
| **Invalidazioni** | `maintenance-tasks`, `maintenance-tasks-critical`, `calendar-events`, `macro-category-events`, `maintenance-completions` |

## Regola “quale task completare”
- Completare tutte le task di tipo `temperature` per quel punto la cui **scadenza è soddisfatta dalla lettura**: `next_due <= recorded_at` (la lettura è stata fatta nel giorno di scadenza o dopo).
- In genere c’è una sola task “Rilevamento Temperature” per punto; se ce ne sono più (es. assegnazioni diverse), si completano tutte quelle con scadenza soddisfatta.

## File da modificare
1. **`useTemperatureReadings.ts`**
   - Aggiungere `user` da `useAuth()`.
   - In `createReadingMutation.mutationFn`, dopo l’insert della lettura:
     - Cercare le task temperatura per quel punto con `next_due <= recorded_at`.
     - Per ogni task, inserire in `maintenance_completions` (stesso payload del modal Attività).
     - Invalidare le query elencate sopra (anche in `onSuccess` per coerenza).

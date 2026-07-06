-- ============================================================================
-- ⚠️ DRAFT — NON ANCORA APPLICATA SUL LIVE (serve autorizzazione owner al push)
--
-- Storno-aware trigger per maintenance_completions (dec. 1)
--
-- Problema: trigger_update_task_on_completion ricalcola next_due su OGNI
-- INSERT. Una riga di STORNO (reverses_completion_id NOT NULL) è un annullo,
-- non un completamento: oggi farebbe avanzare la scadenza e sporcherebbe
-- last_completed. Finché questa migration non è applicata, la UI non offre
-- lo storno sulle manutenzioni (solo sulle mansioni generiche, senza trigger).
--
-- Comportamento nuovo:
--  · riga normale   → identico a prima (last_completed, next_due avanti, scheduled)
--  · riga di storno → il task TORNA ESIGIBILE: next_due riportata al momento
--    del completamento annullato (approssimazione onesta: la scadenza che quel
--    completamento aveva soddisfatto non è memorizzata), last_completed
--    ricalcolato dall'ultimo completamento ancora valido (non stornato).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_maintenance_task_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_task_frequency varchar;
  v_new_next_due timestamptz;
  v_reversed_at timestamptz;
  v_last_valid timestamptz;
BEGIN
  IF NEW.reverses_completion_id IS NOT NULL THEN
    -- STORNO: annulla l'effetto del completamento indicato
    SELECT completed_at INTO v_reversed_at
    FROM public.maintenance_completions
    WHERE id = NEW.reverses_completion_id;

    IF v_reversed_at IS NULL THEN
      RETURN NEW; -- riferimento inesistente: non toccare il task
    END IF;

    -- ultimo completamento ancora valido: non è uno storno e non è stornato
    SELECT MAX(mc.completed_at) INTO v_last_valid
    FROM public.maintenance_completions mc
    WHERE mc.maintenance_task_id = NEW.maintenance_task_id
      AND mc.id <> NEW.id
      AND mc.id <> NEW.reverses_completion_id
      AND mc.reverses_completion_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.maintenance_completions r
        WHERE r.reverses_completion_id = mc.id
      );

    UPDATE public.maintenance_tasks
    SET last_completed = v_last_valid,
        next_due = LEAST(next_due, v_reversed_at),
        status = 'scheduled',
        updated_at = now()
    WHERE id = NEW.maintenance_task_id;

    RETURN NEW;
  END IF;

  -- COMPLETAMENTO normale: comportamento originale
  SELECT frequency INTO v_task_frequency
  FROM public.maintenance_tasks
  WHERE id = NEW.maintenance_task_id;

  v_new_next_due := public.calculate_next_due_date(v_task_frequency, NEW.completed_at);

  UPDATE public.maintenance_tasks
  SET last_completed = NEW.completed_at,
      next_due = v_new_next_due,
      status = 'scheduled',
      updated_at = now()
  WHERE id = NEW.maintenance_task_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_maintenance_task_on_completion() IS
  'Trigger function: completamento → avanza la ricorrenza; storno (dec. 1) → il task torna esigibile e last_completed si ricalcola dai completamenti validi.';

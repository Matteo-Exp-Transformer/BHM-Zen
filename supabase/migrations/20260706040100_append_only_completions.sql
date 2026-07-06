-- ============================================================================
-- Completamenti append-only + storno (dec. 1)
-- - task_completions e maintenance_completions diventano registri immutabili
-- - «uncomplete» = riga di STORNO (reverses_completion_id), mai DELETE
-- - task_completions sul live aveva RLS attiva ma ZERO policy (flusso morto):
--   si creano le policy member SELECT/INSERT
-- ============================================================================

-- 1) Colonna di storno: una riga può annullare una riga precedente
ALTER TABLE public.task_completions
  ADD COLUMN IF NOT EXISTS reverses_completion_id uuid REFERENCES public.task_completions(id);

ALTER TABLE public.maintenance_completions
  ADD COLUMN IF NOT EXISTS reverses_completion_id uuid REFERENCES public.maintenance_completions(id);

-- Un completamento può essere stornato UNA sola volta
CREATE UNIQUE INDEX IF NOT EXISTS uq_task_completions_reverses
  ON public.task_completions (reverses_completion_id)
  WHERE reverses_completion_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_maintenance_completions_reverses
  ON public.maintenance_completions (reverses_completion_id)
  WHERE reverses_completion_id IS NOT NULL;

COMMENT ON COLUMN public.task_completions.reverses_completion_id IS
  'Storno (dec. 1): questa riga ANNULLA il completamento indicato. Un completamento è valido se nessuna riga lo storna.';
COMMENT ON COLUMN public.maintenance_completions.reverses_completion_id IS
  'Storno (dec. 1): questa riga ANNULLA il completamento indicato.';

-- 2) task_completions: policy mancanti sul live (RLS on, zero policy)
DROP POLICY IF EXISTS "Members can view task completions" ON public.task_completions;
CREATE POLICY "Members can view task completions"
  ON public.task_completions FOR SELECT
  USING (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Members can create task completions" ON public.task_completions;
CREATE POLICY "Members can create task completions"
  ON public.task_completions FOR INSERT
  WITH CHECK (public.is_company_member(company_id));

-- 3) maintenance_completions: rimuovi le policy UPDATE/DELETE (contrarie a dec. 1)
DROP POLICY IF EXISTS "Users can update maintenance completions for their company" ON public.maintenance_completions;
DROP POLICY IF EXISTS "Users can delete maintenance completions for their company" ON public.maintenance_completions;

-- 4) Blocco schema-level (difesa in profondità, vale anche per service_role)
DROP TRIGGER IF EXISTS task_completions_append_only ON public.task_completions;
CREATE TRIGGER task_completions_append_only
  BEFORE UPDATE OR DELETE ON public.task_completions
  FOR EACH ROW EXECUTE FUNCTION public.registro_append_only();

DROP TRIGGER IF EXISTS maintenance_completions_append_only ON public.maintenance_completions;
CREATE TRIGGER maintenance_completions_append_only
  BEFORE UPDATE OR DELETE ON public.maintenance_completions
  FOR EACH ROW EXECUTE FUNCTION public.registro_append_only();

-- I trigger updated_at su queste tabelle restano ma non scatteranno mai più
-- (gli UPDATE sono bloccati a monte): rimossi per pulizia.
DROP TRIGGER IF EXISTS update_task_completions_updated_at ON public.task_completions;

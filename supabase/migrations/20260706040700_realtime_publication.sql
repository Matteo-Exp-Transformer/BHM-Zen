-- ============================================================================
-- Realtime «live-refetch, conflict-free» (dec. 11)
-- Abilita la publication supabase_realtime sulle tabelle condivise beta:
-- il client usa SOLO invalidate-on-change (pattern useConservationRealtime);
-- floor = refetch-on-focus, quindi il realtime è UX, non correttezza.
-- Idempotente: aggiunge solo le tabelle non ancora pubblicate.
-- ============================================================================

DO $$
DECLARE
  t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'publication supabase_realtime assente: salto (ambiente senza realtime)';
    RETURN;
  END IF;

  FOREACH t IN ARRAY ARRAY[
    'temperature_readings',
    'task_completions',
    'maintenance_tasks',
    'maintenance_completions',
    'tasks',
    'shopping_lists',
    'shopping_list_items',
    'shift_seals',
    'stock_counts',
    'conservation_points'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      RAISE NOTICE 'realtime: aggiunta public.%', t;
    END IF;
  END LOOP;
END;
$$;

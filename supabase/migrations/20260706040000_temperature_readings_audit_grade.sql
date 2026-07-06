-- ============================================================================
-- temperature_readings audit-grade (masterplan §3 · dec. 1 + dec. 8 · gap 015)
-- - Colonne mancanti: method (OBBLIGATORIA), notes/photo_evidence (opzionali),
--   recorded_by (chi-ha-registrato)
-- - Append-only: niente UPDATE/DELETE (policy rimosse + trigger di blocco).
--   Una lettura sbagliata si corregge con una NUOVA lettura + nota, mai editando.
-- ============================================================================

-- 1) Colonne (gap migration 015 legacy, mai applicata sul live)
ALTER TABLE public.temperature_readings
  ADD COLUMN IF NOT EXISTS method varchar(50),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS photo_evidence text,
  ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES auth.users(id);

-- Backfill difensivo (il live risulta a 0 righe, ma non ci si fida delle stime)
UPDATE public.temperature_readings
SET method = 'digital_thermometer'
WHERE method IS NULL;

-- dec. 8: temperatura + metodo OBBLIGATORI; note e foto opzionali
ALTER TABLE public.temperature_readings
  ALTER COLUMN method SET NOT NULL;

COMMENT ON COLUMN public.temperature_readings.method IS
  'Metodo rilevazione (obbligatorio, dec. 8): manual | digital_thermometer | sensor';
COMMENT ON COLUMN public.temperature_readings.notes IS 'Note operatore (opzionale)';
COMMENT ON COLUMN public.temperature_readings.photo_evidence IS 'URL foto evidenza (opzionale)';
COMMENT ON COLUMN public.temperature_readings.recorded_by IS
  'Chi ha registrato (audit-grade: chi-cosa-quando)';

-- 2) Funzione generica di blocco per i registri append-only (riusata dalle
--    migration successive: completions, shift_seals, stock_counts)
CREATE OR REPLACE FUNCTION public.registro_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Registro append-only: % su %.% non consentito — inserisci una riga di storno (dec. 1)',
    TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$$;

COMMENT ON FUNCTION public.registro_append_only() IS
  'Invariante audit-grade (masterplan §3, dec. 1): i registri non si modificano né cancellano.';

-- 3) Le policy live permettevano UPDATE/DELETE ai manager: contrarie alla dec. 1
DROP POLICY IF EXISTS "Managers can update temperature readings" ON public.temperature_readings;
DROP POLICY IF EXISTS "Managers can delete temperature readings" ON public.temperature_readings;

-- 4) Blocco a livello di schema (vale anche per service_role: difesa in profondità)
DROP TRIGGER IF EXISTS temperature_readings_append_only ON public.temperature_readings;
CREATE TRIGGER temperature_readings_append_only
  BEFORE UPDATE OR DELETE ON public.temperature_readings
  FOR EACH ROW EXECUTE FUNCTION public.registro_append_only();

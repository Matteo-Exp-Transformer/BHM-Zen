-- ============================================================================
-- shift_seals — il timbro di fine turno «sigilla la giornata» (dec. 7)
-- Record append-only scritto AL MOMENTO del timbro: apertura/chiusura turno +
-- attestazione «tutto registrato». È la firma audit-grade che chiude i registri
-- del turno (chi/quando, immutabile). Gesto-firma §10.3/§13.5.
-- Nota design: la riga nasce COMPLETA alla chiusura (insert-at-seal), così
-- l'append-only regge senza UPDATE. I dettagli UI = Track A (mockup 01).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shift_seals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  -- orario del turno sigillato (solo orario, §2 masterplan: niente geo)
  opened_at timestamptz NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now(),
  -- attestazione «tutto registrato»: true = il turno dichiara i registri completi
  attestation boolean NOT NULL,
  -- voce per le eccezioni (§9.4): cosa non è stato possibile registrare e perché
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shift_seals_period_check CHECK (closed_at >= opened_at)
);

COMMENT ON TABLE public.shift_seals IS
  'Timbro di fine turno (dec. 7): sigillo append-only che chiude i registri del turno. Immutabile.';

CREATE INDEX IF NOT EXISTS idx_shift_seals_company_closed
  ON public.shift_seals (company_id, closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_shift_seals_user
  ON public.shift_seals (user_id, closed_at DESC);

-- RLS: ognuno timbra per sé, i membri della company vedono i timbri aziendali
ALTER TABLE public.shift_seals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shift seals"
  ON public.shift_seals FOR SELECT
  USING (public.is_company_member(company_id));

CREATE POLICY "Members can seal their own shift"
  ON public.shift_seals FOR INSERT
  WITH CHECK (public.is_company_member(company_id) AND user_id = auth.uid());

-- Append-only (dec. 1): nessun UPDATE/DELETE, mai
CREATE TRIGGER shift_seals_append_only
  BEFORE UPDATE OR DELETE ON public.shift_seals
  FOR EACH ROW EXECUTE FUNCTION public.registro_append_only();

GRANT SELECT, INSERT ON public.shift_seals TO authenticated;
GRANT ALL ON public.shift_seals TO service_role;

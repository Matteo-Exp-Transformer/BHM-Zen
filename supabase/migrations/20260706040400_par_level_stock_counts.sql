-- ============================================================================
-- Inventario come mansione (dec. 12): par level + storico conteggi
-- - products.par_level = «dovrei avere N»; rimanenza M < par → sotto scorta
-- - stock_counts = storico append-only dei conteggi del giro d'inventario
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS par_level numeric CHECK (par_level IS NULL OR par_level >= 0);

COMMENT ON COLUMN public.products.par_level IS
  'Scorta obiettivo «dovrei avere N» (dec. 12); rimanenza sotto par → suggerito in spesa';

CREATE TABLE IF NOT EXISTS public.stock_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  conservation_point_id uuid REFERENCES public.conservation_points(id) ON DELETE SET NULL,
  quantity numeric NOT NULL CHECK (quantity >= 0),
  counted_by uuid REFERENCES auth.users(id),
  counted_at timestamptz NOT NULL DEFAULT now(),
  -- nel giro la scadenza si CONFERMA (dec. 12.3): eventuale conferma registrata qui
  expiry_confirmed boolean,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stock_counts IS
  'Storico conteggi del giro d''inventario (dec. 12): registro append-only, alimenta rimanenze e sotto-scorta.';

CREATE INDEX IF NOT EXISTS idx_stock_counts_company_counted
  ON public.stock_counts (company_id, counted_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_counts_product
  ON public.stock_counts (product_id, counted_at DESC);

ALTER TABLE public.stock_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view stock counts"
  ON public.stock_counts FOR SELECT
  USING (public.is_company_member(company_id));

CREATE POLICY "Members can create stock counts"
  ON public.stock_counts FOR INSERT
  WITH CHECK (public.is_company_member(company_id));

-- Registro: append-only (dec. 1)
CREATE TRIGGER stock_counts_append_only
  BEFORE UPDATE OR DELETE ON public.stock_counts
  FOR EACH ROW EXECUTE FUNCTION public.registro_append_only();

GRANT SELECT, INSERT ON public.stock_counts TO authenticated;
GRANT ALL ON public.stock_counts TO service_role;

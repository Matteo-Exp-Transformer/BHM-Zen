-- ============================================================================
-- Ciclo scadenze completo su products (dec. 10)
-- scadenza → expired_at → reinserimento tracciato → archivio. Mai DELETE fisico.
-- ============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS expired_at timestamptz,
  ADD COLUMN IF NOT EXISTS previous_product_id uuid REFERENCES public.products(id),
  ADD COLUMN IF NOT EXISTS reinsertion_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Estendi lo status CHECK con 'archived' (i valori esistenti restano validi)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_status_check
  CHECK (status::text = ANY (ARRAY[
    'active'::varchar, 'expired'::varchar, 'consumed'::varchar,
    'waste'::varchar, 'archived'::varchar
  ]::text[]));

COMMENT ON COLUMN public.products.expired_at IS
  'Quando il prodotto è passato a expired (ciclo dec. 10)';
COMMENT ON COLUMN public.products.previous_product_id IS
  'Reinserimento: punta al prodotto precedente della catena (storico)';
COMMENT ON COLUMN public.products.reinsertion_count IS
  'Quante volte il prodotto è stato reinserito';
COMMENT ON COLUMN public.products.archived_at IS
  'Archiviazione (mai DELETE fisico, dec. 1/10)';

CREATE INDEX IF NOT EXISTS idx_products_previous
  ON public.products (previous_product_id)
  WHERE previous_product_id IS NOT NULL;

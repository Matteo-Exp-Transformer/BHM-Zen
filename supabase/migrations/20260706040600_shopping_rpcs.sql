-- ============================================================================
-- Le 4 RPC shopping (dec. 3 · gap P0 BUG-008) — firme = quelle che il codice
-- legacy chiama (shoppingListService.ts), così il port è diretto.
-- SECURITY INVOKER (a differenza del draft legacy SECURITY DEFINER): le RLS
-- policy esistenti su shopping_lists/shopping_list_items restano la guardia.
-- ============================================================================

-- 1) Crea lista + righe in un'unica transazione → uuid della lista
CREATE OR REPLACE FUNCTION public.create_shopping_list_with_items(
  p_company_id uuid,
  p_list_name varchar,
  p_description text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_list_id uuid;
BEGIN
  INSERT INTO public.shopping_lists (company_id, name, description, notes, created_by)
  VALUES (p_company_id, p_list_name, p_description, p_notes, auth.uid())
  RETURNING id INTO v_list_id;

  INSERT INTO public.shopping_list_items
    (shopping_list_id, product_id, product_name, category_name, quantity, unit, notes)
  SELECT
    v_list_id,
    (item->>'product_id')::uuid,
    item->>'product_name',
    COALESCE(item->>'category_name', 'Altro'),
    COALESCE((item->>'quantity')::numeric, 1),
    item->>'unit',
    item->>'notes'
  FROM jsonb_array_elements(p_items) AS item;

  RETURN v_list_id;
END;
$$;

-- 2) Liste con statistiche (per la vista elenco)
CREATE OR REPLACE FUNCTION public.get_shopping_lists_with_stats(
  p_company_id uuid,
  p_status varchar DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  company_id uuid,
  name varchar,
  description text,
  created_by uuid,
  is_template boolean,
  is_completed boolean,
  completed_at timestamptz,
  status varchar,
  notes text,
  created_at timestamptz,
  updated_at timestamptz,
  total_items bigint,
  checked_items bigint,
  completion_percentage numeric
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    sl.id, sl.company_id, sl.name, sl.description, sl.created_by,
    sl.is_template, sl.is_completed, sl.completed_at, sl.status, sl.notes,
    sl.created_at, sl.updated_at,
    COUNT(sli.id) AS total_items,
    COUNT(sli.id) FILTER (WHERE sli.is_checked) AS checked_items,
    CASE WHEN COUNT(sli.id) = 0 THEN 0
         ELSE ROUND(COUNT(sli.id) FILTER (WHERE sli.is_checked)::numeric
                    / COUNT(sli.id)::numeric * 100, 2)
    END AS completion_percentage
  FROM public.shopping_lists sl
  LEFT JOIN public.shopping_list_items sli ON sli.shopping_list_id = sl.id
  WHERE sl.company_id = p_company_id
    AND (p_status IS NULL OR sl.status = p_status)
  GROUP BY sl.id
  ORDER BY sl.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- 3) Spunta/de-spunta una riga (i sync is_completed/checked_at li fa il trigger live)
CREATE OR REPLACE FUNCTION public.toggle_shopping_list_item(
  p_item_id uuid,
  p_checked boolean
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.shopping_list_items
  SET is_checked = p_checked
  WHERE id = p_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Riga spesa % non trovata o non accessibile', p_item_id;
  END IF;
END;
$$;

-- 4) Chiude una lista
CREATE OR REPLACE FUNCTION public.complete_shopping_list(p_list_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.shopping_lists
  SET is_completed = true,
      status = 'completed',
      completed_at = now()
  WHERE id = p_list_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lista spesa % non trovata o non accessibile', p_list_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_shopping_list_with_items(uuid, varchar, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shopping_lists_with_stats(uuid, varchar, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_shopping_list_item(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_shopping_list(uuid) TO authenticated;

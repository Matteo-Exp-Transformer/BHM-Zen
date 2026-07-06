/**
 * Scorte (lente STOCK, dec. 12) — dati e gesti contro lo schema nuovo.
 * ♻️ Port selettivo dal legacy: useProducts (con i filtri APPLICATI, fix
 * BUG-008) + stack shopping via le 4 RPC live (dec. 3, un solo stack).
 * ✍️ Nuovo: giro d'inventario su stock_counts (append-only) — il conteggio
 * aggiorna la rimanenza del prodotto e lascia la riga-prova del giro.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import { suggerimentiSpesa, type SuggerimentoSpesa } from './stock'

export interface ProdottoInventario {
  id: string
  nome: string
  categoria: string
  departmentId: string | null
  departmentName: string | null
  quantita: number
  parLevel: number | null
  unit: string | null
  expiryDate: string | null
  allergens: string[]
  /** conferma scadenza nell'ultimo giro (stock_counts.expiry_confirmed) */
  status: string
}

export interface ListaSpesa {
  id: string
  nome: string
  descrizione: string | null
  totale: number
  presi: number
  completata: boolean
  creataIl: string
}

export interface RigaSpesa {
  id: string
  nome: string
  categoria: string
  quantita: number
  unit: string | null
  presa: boolean
}

const STATI_PRODOTTO_VIVI = ['active', 'expired']

/** Inventario: prodotti vivi con reparto, filtrati lato client per reparto. */
export function useInventario() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['scorte-inventario', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, name, quantity, par_level, unit, expiry_date, allergens, status, department_id, category:product_categories(name), department:departments(name)',
        )
        .eq('company_id', companyId!)
        .in('status', STATI_PRODOTTO_VIVI)
        .order('name')
      if (error) throw error
      return data.map(
        (p): ProdottoInventario => ({
          id: p.id,
          nome: p.name,
          categoria: p.category?.name ?? 'Altro',
          departmentId: p.department_id,
          departmentName: p.department?.name ?? null,
          quantita: p.quantity ?? 0,
          parLevel: p.par_level,
          unit: p.unit,
          expiryDate: p.expiry_date,
          allergens: p.allergens ?? [],
          status: p.status,
        }),
      )
    },
    enabled: !!companyId,
  })
  return { prodotti: query.data ?? [], isLoading: query.isLoading }
}

function useInvalidateScorte() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['scorte-inventario', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['scorte-liste', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['scorte-lista'] })
  }
}

/**
 * Conteggio del giro d'inventario: riga append-only in stock_counts (la
 * prova del giro: chi, quando, quanto) + rimanenza aggiornata sul prodotto.
 */
export function useContaRimanenza() {
  const { companyId, session } = useSession()
  const invalidate = useInvalidateScorte()
  return useMutation({
    mutationFn: async ({
      productId,
      quantita,
      confermaScadenza,
    }: {
      productId: string
      quantita: number
      confermaScadenza?: boolean
    }) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')
      const { error: countError } = await supabase.from('stock_counts').insert({
        company_id: companyId,
        product_id: productId,
        quantity: quantita,
        counted_by: userId,
        expiry_confirmed: confermaScadenza ?? null,
      })
      if (countError) throw countError
      const { error: updError } = await supabase
        .from('products')
        .update({ quantity: quantita })
        .eq('id', productId)
        .eq('company_id', companyId)
      if (updError) throw updError
    },
    onSuccess: invalidate,
    onError: err => logger.error('conteggio rimanenza fallito', err),
  })
}

/** Liste spesa (via RPC get_shopping_lists_with_stats — dec. 3, stack unico). */
export function useListeSpesa() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['scorte-liste', companyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_shopping_lists_with_stats', {
        p_company_id: companyId!,
      })
      if (error) throw error
      return data.map(
        (l): ListaSpesa => ({
          id: l.id,
          nome: l.name,
          descrizione: l.description,
          totale: Number(l.total_items),
          presi: Number(l.checked_items),
          completata: l.is_completed,
          creataIl: l.created_at,
        }),
      )
    },
    enabled: !!companyId,
  })
  return { liste: query.data ?? [], isLoading: query.isLoading }
}

/** Righe di una lista (lettura diretta: la RPC serve solo per le stats). */
export function useRigheLista(listaId: string | null) {
  const query = useQuery({
    queryKey: ['scorte-lista', listaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('id, product_name, category_name, quantity, unit, is_checked')
        .eq('shopping_list_id', listaId!)
        .order('category_name')
        .order('product_name')
      if (error) throw error
      return data.map(
        (r): RigaSpesa => ({
          id: r.id,
          nome: r.product_name,
          categoria: r.category_name,
          quantita: r.quantity,
          unit: r.unit,
          presa: r.is_checked,
        }),
      )
    },
    enabled: !!listaId,
  })
  return { righe: query.data ?? [], isLoading: query.isLoading }
}

/** Crea una lista (vuota o già compilata dai sotto-scorta) via RPC. */
export function useCreaLista() {
  const { companyId } = useSession()
  const invalidate = useInvalidateScorte()
  return useMutation({
    mutationFn: async ({
      nome,
      suggerimenti,
    }: {
      nome: string
      suggerimenti?: SuggerimentoSpesa[]
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const items = (suggerimenti ?? []).map(s => ({
        product_id: s.productId,
        product_name: s.nome,
        category_name: s.categoria,
        quantity: s.quantita,
        unit: s.unit,
      }))
      const { data, error } = await supabase.rpc('create_shopping_list_with_items', {
        p_company_id: companyId,
        p_list_name: nome,
        p_items: items,
      })
      if (error) throw error
      return data
    },
    onSuccess: invalidate,
    onError: err => logger.error('creazione lista spesa fallita', err),
  })
}

/** Spunta/de-spunta una riga della lista (RPC toggle_shopping_list_item). */
export function useSpuntaRiga(listaId: string | null) {
  const queryClient = useQueryClient()
  const { companyId } = useSession()
  return useMutation({
    mutationFn: async ({ rigaId, presa }: { rigaId: string; presa: boolean }) => {
      const { error } = await supabase.rpc('toggle_shopping_list_item', {
        p_item_id: rigaId,
        p_checked: presa,
      })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scorte-lista', listaId] })
      void queryClient.invalidateQueries({ queryKey: ['scorte-liste', companyId] })
    },
    onError: err => logger.error('spunta riga spesa fallita', err),
  })
}

/** Aggiunge una riga libera alla lista (la spesa resta tua, dec. 12.4). */
export function useAggiungiRiga(listaId: string | null) {
  const queryClient = useQueryClient()
  const { companyId } = useSession()
  return useMutation({
    mutationFn: async ({ nome }: { nome: string }) => {
      if (!listaId) throw new Error('Nessuna lista selezionata')
      const { error } = await supabase.from('shopping_list_items').insert({
        shopping_list_id: listaId,
        product_name: nome,
        category_name: 'Aggiunti da te',
      })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scorte-lista', listaId] })
      void queryClient.invalidateQueries({ queryKey: ['scorte-liste', companyId] })
    },
    onError: err => logger.error('aggiunta riga spesa fallita', err),
  })
}

/** Suggerimenti dai sotto-scorta (par − rimanenza), pronti per una lista. */
export function useSuggerimenti(prodotti: ProdottoInventario[]) {
  return suggerimentiSpesa(
    prodotti.map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      quantita: p.quantita,
      parLevel: p.parLevel,
      unit: p.unit,
    })),
  )
}

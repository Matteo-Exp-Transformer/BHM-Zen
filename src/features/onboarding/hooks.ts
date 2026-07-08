/**
 * Onboarding titolare (mockup 05 v2, FU-013) — dati e gesti del cantiere.
 * Ripetibile: ogni step legge il DB vivo, quindi riaprendo il cantiere
 * l'azienda compare già compilata e si può ritoccare (owner 08-07).
 * Le manutenzioni obbligatorie per tipo-punto vengono dalla mappa legacy
 * (processo, non numeri HACCP); le temperature restano derivate dal LOCK.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

export interface Anagrafica {
  nome: string
  indirizzo: string
  email: string
  partitaIva: string
  onboardingCompletato: boolean
}

export function useAzienda() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-azienda', companyId],
    queryFn: async (): Promise<Anagrafica> => {
      const { data, error } = await supabase
        .from('companies')
        .select('name, address, email, vat_number, onboarding_completed')
        .eq('id', companyId!)
        .single()
      if (error) throw error
      return {
        nome: data.name,
        indirizzo: data.address,
        email: data.email,
        partitaIva: data.vat_number ?? '',
        onboardingCompletato: data.onboarding_completed,
      }
    },
    enabled: !!companyId,
  })
  return { azienda: query.data ?? null, isLoading: query.isLoading }
}

/** Anagrafica azienda (RLS: is_admin). */
export function useSalvaAnagrafica() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      nome: string
      indirizzo: string
      email: string
      partitaIva?: string
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const { error } = await supabase
        .from('companies')
        .update({
          name: input.nome,
          address: input.indirizzo,
          email: input.email,
          vat_number: input.partitaIva?.trim() || null,
        })
        .eq('id', companyId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['onboarding-azienda', companyId] })
    },
    onError: err => logger.error('salvataggio anagrafica fallito', err),
  })
}

/* -------------------------------------------------------------------------- */
/* Step 5 — attività & manutenzioni                                            */
/* -------------------------------------------------------------------------- */

/** Set di manutenzioni richieste per tipo punto (mappa onboarding legacy). */
export const MANUTENZIONI_RICHIESTE: Record<string, string[]> = {
  fridge: ['temperature', 'sanitization', 'defrosting', 'expiry_check'],
  freezer: ['temperature', 'sanitization', 'defrosting', 'expiry_check'],
  ambient: ['sanitization', 'expiry_check'],
  blast: ['sanitization'],
}

export const MANUTENZIONE_LABEL: Record<string, string> = {
  temperature: 'Rilevamento temperatura',
  sanitization: 'Sanificazione',
  defrosting: 'Sbrinamento',
  expiry_check: 'Controllo scadenze',
}

/** Frequenze di partenza sensate (modificabili poi dal Calendario). */
const FREQUENZA_DEFAULT: Record<string, string> = {
  temperature: 'daily',
  sanitization: 'weekly',
  defrosting: 'monthly',
  expiry_check: 'weekly',
}

export interface ManutenzionePunto {
  id: string
  tipo: string
  puntoId: string
}

export function useManutenzioni() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-manutenzioni', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, type, conservation_point_id, status')
        .eq('company_id', companyId!)
        .neq('status', 'completed')
      if (error) throw error
      return data.map(
        (m): ManutenzionePunto => ({ id: m.id, tipo: m.type, puntoId: m.conservation_point_id }),
      )
    },
    enabled: !!companyId,
  })
  return { manutenzioni: query.data ?? [], isLoading: query.isLoading }
}

/** Genera le manutenzioni mancanti per i punti dati (batch, idempotente:
 *  inserisce solo ciò che manca — calcolato dal chiamante). */
export function useGeneraManutenzioni() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (mancanti: { puntoId: string; tipo: string }[]) => {
      if (!companyId) throw new Error('Sessione non pronta')
      if (mancanti.length === 0) return 0
      const domani = new Date()
      domani.setDate(domani.getDate() + 1)
      domani.setHours(10, 0, 0, 0)
      const { error } = await supabase.from('maintenance_tasks').insert(
        mancanti.map(m => ({
          company_id: companyId,
          conservation_point_id: m.puntoId,
          type: m.tipo,
          title: MANUTENZIONE_LABEL[m.tipo] ?? m.tipo,
          frequency: FREQUENZA_DEFAULT[m.tipo] ?? 'weekly',
          assignment_type: 'role',
          assigned_to: 'dipendente',
          assigned_to_role: 'dipendente',
          status: 'scheduled',
          next_due: domani.toISOString(),
        })),
      )
      if (error) throw error
      return mancanti.length
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['onboarding-manutenzioni', companyId] })
    },
    onError: err => logger.error('generazione manutenzioni fallita', err),
  })
}

export interface MansioneRiga {
  id: string
  nome: string
  frequenza: string
  ruolo: string | null
  repartoNome: string | null
}

export function useMansioni() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-mansioni', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, name, frequency, assigned_to_role, department:departments(name)')
        .eq('company_id', companyId!)
        .neq('status', 'cancelled')
        .order('name')
      if (error) throw error
      return data.map(
        (t): MansioneRiga => ({
          id: t.id,
          nome: t.name,
          frequenza: t.frequency,
          ruolo: t.assigned_to_role,
          repartoNome: t.department?.name ?? null,
        }),
      )
    },
    enabled: !!companyId,
  })
  return { mansioni: query.data ?? [], isLoading: query.isLoading }
}

/** Crea una mansione ricorrente (① Imposto → la vive il Calendario/Oggi). */
export function useCreaMansione() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      nome: string
      frequenza: string
      ruolo: string
      departmentId: string | null
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const oggi = new Date()
      oggi.setHours(10, 0, 0, 0)
      const { error } = await supabase.from('tasks').insert({
        company_id: companyId,
        name: input.nome,
        frequency: input.frequenza,
        assignment_type: 'role',
        assigned_to: input.ruolo,
        assigned_to_role: input.ruolo,
        department_id: input.departmentId,
        status: 'pending',
        next_due: oggi.toISOString(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['onboarding-mansioni', companyId] })
    },
    onError: err => logger.error('creazione mansione fallita', err),
  })
}

/* -------------------------------------------------------------------------- */
/* Step 6 — inventario (recap: il carico prodotti è la cascata, FU-014)        */
/* -------------------------------------------------------------------------- */

export function useInventarioRecap() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-inventario', companyId],
    queryFn: async () => {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId!)
          .eq('status', 'active'),
        supabase
          .from('product_categories')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId!),
      ])
      if (prodRes.error) throw prodRes.error
      if (catRes.error) throw catRes.error
      return { prodotti: prodRes.count ?? 0, categorie: catRes.count ?? 0 }
    },
    enabled: !!companyId,
  })
  return { inventario: query.data ?? null }
}

/* -------------------------------------------------------------------------- */
/* Step 7 — calendario & chiusura cantiere                                     */
/* -------------------------------------------------------------------------- */

export interface CalendarioImpostazioni {
  configurato: boolean
  annoInizio: string
  annoFine: string
  giorniApertura: number[]
}

export function useCalendarioImpostazioni() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-calendario', companyId],
    queryFn: async (): Promise<CalendarioImpostazioni | null> => {
      const { data, error } = await supabase
        .from('company_calendar_settings')
        .select('is_configured, working_year_start, working_year_end, open_weekdays, working_days')
        .eq('company_id', companyId!)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      return {
        configurato: data.is_configured,
        annoInizio: data.working_year_start,
        annoFine: data.working_year_end,
        giorniApertura: data.open_weekdays ?? data.working_days,
      }
    },
    enabled: !!companyId,
  })
  return { calendario: query.data ?? null, isLoading: query.isLoading }
}

export function useSalvaCalendario() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { annoInizio: string; annoFine: string; giorni: number[] }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const { error } = await supabase.from('company_calendar_settings').upsert(
        {
          company_id: companyId,
          working_year_start: input.annoInizio,
          working_year_end: input.annoFine,
          working_days: input.giorni,
          open_weekdays: input.giorni,
          is_configured: true,
        },
        { onConflict: 'company_id' },
      )
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['onboarding-calendario', companyId] })
    },
    onError: err => logger.error('salvataggio calendario fallito', err),
  })
}

/** Chiude il cantiere: l'azienda è impostata (companies.onboarding_completed). */
export function useCompletaOnboarding() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('Sessione non pronta')
      const { error } = await supabase
        .from('companies')
        .update({ onboarding_completed: true })
        .eq('id', companyId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['onboarding-azienda', companyId] })
      void queryClient.invalidateQueries({ queryKey: ['onboarding-gate', companyId] })
    },
    onError: err => logger.error('chiusura onboarding fallita', err),
  })
}

/** Gate d'avvio: azienda nuova (0 reparti) e onboarding mai chiuso → il
 *  titolare passa dal cantiere. Un'azienda già viva non viene dirottata. */
export function useOnboardingGate() {
  const { role, companyId } = useSession()
  const query = useQuery({
    queryKey: ['onboarding-gate', companyId],
    queryFn: async () => {
      const [compRes, depRes] = await Promise.all([
        supabase.from('companies').select('onboarding_completed').eq('id', companyId!).single(),
        supabase
          .from('departments')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId!),
      ])
      if (compRes.error) throw compRes.error
      if (depRes.error) throw depRes.error
      return {
        daFare: !compRes.data.onboarding_completed && (depRes.count ?? 0) === 0,
      }
    },
    enabled: role === 'admin' && !!companyId,
    staleTime: 5 * 60_000,
  })
  return { daFare: query.data?.daFare ?? false, pronto: role !== 'admin' || !!query.data }
}

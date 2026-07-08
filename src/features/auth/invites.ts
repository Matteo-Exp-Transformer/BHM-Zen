/**
 * Inviti staff (FU-001) — ♻️ logica dal legacy `inviteService.ts`, riscritta
 * contro lo schema nuovo: token in `invite_tokens` (RLS baseline: crea solo
 * is_admin, valida/accetta aperti), email via edge function `send-invite-email`
 * già attiva sul remoto. L'email è OPZIONALE e disattivabile senza toccare il
 * server: `VITE_INVITE_EMAIL_ENABLED=false` → resta il link da condividere.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import type { Database } from '@/types/database.types'

export type Invito = Database['public']['Tables']['invite_tokens']['Row']

/** Kill-switch email invito (lato app: la function non viene proprio chiamata). */
export const inviteEmailAbilitate = () =>
  import.meta.env.VITE_INVITE_EMAIL_ENABLED !== 'false'

export const linkInvito = (token: string) =>
  `${window.location.origin}/accept-invite?token=${token}`

/** Timestamp retrodatato di 1' per i CHECK `<= now()` server (pattern
 *  ERRORI_PROCESSO 08-07: mai confrontare orologio client col server). */
const nowServerSafe = () => new Date(Date.now() - 60_000).toISOString()

/* -------------------------------------------------------------------------- */
/* Creazione e gestione (Regia, solo titolare: RLS is_admin)                   */
/* -------------------------------------------------------------------------- */

export async function creaInvito(input: {
  email: string
  companyId: string
  ruolo: string
  staffId?: string | null
  giorniValidita?: number
}): Promise<Invito> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Non autenticato')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (input.giorniValidita ?? 7))

  const { data, error } = await supabase
    .from('invite_tokens')
    .insert({
      token: crypto.randomUUID(),
      email: input.email.trim().toLowerCase(),
      company_id: input.companyId,
      role: input.ruolo,
      staff_id: input.staffId ?? null,
      invited_by: auth.user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Invia l'email d'invito. Non-bloccante: se fallisce (o è disattivata)
 *  resta il link manuale. Ritorna true solo se l'email è partita davvero. */
export async function inviaEmailInvito(invito: Invito): Promise<boolean> {
  if (!inviteEmailAbilitate()) return false
  const { error } = await supabase.functions.invoke('send-invite-email', {
    body: { inviteToken: { ...invito, invite_link: linkInvito(invito.token) } },
  })
  if (error) {
    logger.error('invio email invito fallito (resta il link manuale)', error)
    return false
  }
  return true
}

export interface ValidazioneInvito {
  valido: boolean
  invito?: Invito
  errore?: string
}

export async function validaInvito(token: string): Promise<ValidazioneInvito> {
  const { data: invito, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .maybeSingle()
  if (error || !invito) return { valido: false, errore: 'Invito non trovato.' }
  if (invito.used_at)
    return { valido: false, invito, errore: 'Questo invito è già stato usato.' }
  if (new Date(invito.expires_at) < new Date())
    return { valido: false, invito, errore: 'Questo invito è scaduto: chiedi di rigenerarlo.' }
  return { valido: true, invito }
}

/* -------------------------------------------------------------------------- */
/* Accettazione — due strade, stesso claim                                     */
/*  A) arrivo dal link email: sessione già attiva → imposta password           */
/*  B) arrivo dal link condiviso: signUp (se la conferma email è attiva,       */
/*     l'ingresso si completa dopo la conferma; il claim avviene al login)     */
/* -------------------------------------------------------------------------- */

/** Aggancia l'invito all'utente: membership + sessione attiva + token usato.
 *  Idempotente (upsert su vincoli unique) — sicuro da ripetere. */
export async function claimInvito(userId: string, invito: Invito): Promise<void> {
  const { error: memberErr } = await supabase.from('company_members').upsert(
    {
      user_id: userId,
      company_id: invito.company_id,
      role: invito.role,
      staff_id: invito.staff_id,
      is_active: true,
    },
    { onConflict: 'user_id,company_id' },
  )
  if (memberErr) throw memberErr

  const { error: sessErr } = await supabase
    .from('user_sessions')
    .upsert(
      { user_id: userId, active_company_id: invito.company_id },
      { onConflict: 'user_id' },
    )
  if (sessErr) logger.warn('user_session non creata (non critico)', sessErr)

  if (!invito.used_at) {
    const { error: usedErr } = await supabase
      .from('invite_tokens')
      .update({ used_at: nowServerSafe() })
      .eq('id', invito.id)
    if (usedErr) logger.warn('invito non marcato usato (non critico)', usedErr)
  }
}

/** Al primo accesso senza membership: cerca un invito pendente per la propria
 *  email (policy «Anyone can view own invite») e lo aggancia. */
export async function claimInvitoPendente(
  userId: string,
  email: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('email', email.toLowerCase())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
  if (error || !data?.length) return false
  try {
    await claimInvito(userId, data[0]!)
    return true
  } catch (err) {
    logger.error('claim invito pendente fallito', err)
    return false
  }
}

export type EsitoAccettazione = 'entrato' | 'conferma-email'

/** Percorso B (link condiviso, nessuna sessione): crea l'account. */
export async function accettaInvitoConSignUp(input: {
  invito: Invito
  password: string
  nome?: string
}): Promise<EsitoAccettazione> {
  const { invito, password, nome } = input
  const { data, error } = await supabase.auth.signUp({
    email: invito.email,
    password,
    options: {
      data: nome ? { full_name: nome } : undefined,
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) throw error
  if (!data.user) throw new Error('Account non creato')
  if (!data.session) {
    // conferma email attiva: il claim avverrà al primo login (SessionProvider)
    return 'conferma-email'
  }
  await claimInvito(data.user.id, invito)
  return 'entrato'
}

/** Percorso A (arrivo dal link email, sessione già attiva): imposta password. */
export async function accettaInvitoConSessione(input: {
  invito: Invito
  password: string
  nome?: string
}): Promise<EsitoAccettazione> {
  const { invito, password, nome } = input
  const { data, error } = await supabase.auth.updateUser({
    password,
    ...(nome ? { data: { full_name: nome } } : {}),
  })
  if (error) throw error
  await claimInvito(data.user.id, invito)
  return 'entrato'
}

/* -------------------------------------------------------------------------- */
/* Hook per la Regia                                                           */
/* -------------------------------------------------------------------------- */

export function useInvitiPendenti() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['regia-inviti', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('company_id', companyId!)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!companyId,
  })
  return { inviti: query.data ?? [], isLoading: query.isLoading }
}

export function useCreaInvito() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { email: string; ruolo: string; staffId?: string | null }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const invito = await creaInvito({ ...input, companyId })
      const emailInviata = await inviaEmailInvito(invito)
      return { invito, emailInviata }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['regia-inviti', companyId] })
    },
    onError: err => logger.error('creazione invito fallita', err),
  })
}

export function useAnnullaInvito() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invitoId: string) => {
      const { error } = await supabase.from('invite_tokens').delete().eq('id', invitoId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['regia-inviti', companyId] })
    },
    onError: err => logger.error('annullamento invito fallito', err),
  })
}

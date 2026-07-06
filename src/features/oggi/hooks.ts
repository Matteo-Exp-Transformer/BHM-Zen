/**
 * Oggi (lente TEMPO) — il diario di bordo contro lo schema NUOVO.
 * ♻️ Port selettivo dal legacy (useGenericTasks + aggregazione eventi),
 * ridotto alla domanda della lente: «cosa faccio ORA, cosa ho FATTO».
 * ✍️ Riscritto: l'annullo è una riga di STORNO (dec. 1), mai DELETE —
 * chiude il buco audit del legacy (uncompleteTask cancellava la prova).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import {
  endOfDayLocal,
  localDateKey,
  periodForFrequency,
  startOfDayLocal,
} from '@/lib/dates'
import { usePuntiOggi, type PuntoOggi } from '@/features/reparti/hooks'
import type { TemperatureVerdict } from '@/compliance/haccp-rules'

export interface MansioneOggi {
  id: string
  nome: string
  frequency: string
  departmentId: string | null
  nextDue: string | null
  /** «entro le 18:00» — da time_management, se configurato */
  dueLabel: string | null
}

export interface ManutenzioneOggi {
  id: string
  titolo: string
  tipo: string
  pointName: string | null
  departmentId: string | null
  arretrata: boolean
}

export interface LetturaFatta {
  id: string
  pointName: string
  valueC: number
  recordedAt: string
  verdict: TemperatureVerdict | null
}

export type StornoInfo =
  | { kind: 'mansione'; taskId: string; periodStart: string; periodEnd: string }
  | { kind: 'manutenzione'; maintenanceTaskId: string }

export interface CompletamentoFatto {
  id: string
  titolo: string
  completedAt: string
  kind: 'mansione' | 'manutenzione'
  /** presente quando il completamento è annullabile con una riga di storno */
  storno?: StornoInfo
}

export interface OggiData {
  ora: PuntoOggi[]
  mansioni: MansioneOggi[]
  manutenzioni: ManutenzioneOggi[]
  letture: LetturaFatta[]
  completamenti: CompletamentoFatto[]
  ribbon: string | null
  sealedToday: boolean
  sealClosedAt: string | null
  /** prima attività di oggi dell'utente: apertura suggerita per il timbro */
  firstActivityAt: string | null
}

const STATI_TASK_APERTI = ['scheduled', 'overdue', 'in_progress']
const STATI_MANSIONE_CHIUSI = ['inactive', 'archived', 'deleted']

function estraiDueLabel(timeManagement: unknown): string | null {
  if (!timeManagement || typeof timeManagement !== 'object') return null
  const tm = timeManagement as {
    time_range?: { end_time?: string }
    completion_end_time?: string
  }
  const end = tm.completion_end_time ?? tm.time_range?.end_time
  return end ? `entro le ${end}` : null
}

export function useOggi(): OggiData & { isLoading: boolean } {
  const { companyId, session, canDirect, departmentIds, staffId } = useSession()
  const userId = session?.user.id
  const puntiOggi = usePuntiOggi()

  const query = useQuery({
    queryKey: ['oggi', companyId],
    queryFn: async () => {
      const startISO = startOfDayLocal().toISOString()
      const endISO = endOfDayLocal().toISOString()

      const [mtRes, tasksRes, tcRes, mcRes, sealsRes] = await Promise.all([
        supabase
          .from('maintenance_tasks')
          .select(
            'id, title, type, status, next_due, conservation_point:conservation_points(id, name, department_id)',
          )
          .eq('company_id', companyId!)
          .neq('type', 'temperature')
          .in('status', STATI_TASK_APERTI)
          .lte('next_due', endISO),
        supabase
          .from('tasks')
          .select(
            'id, name, frequency, status, next_due, department_id, assigned_to_staff_id, time_management',
          )
          .eq('company_id', companyId!)
          .not('next_due', 'is', null)
          .lte('next_due', endISO),
        supabase
          .from('task_completions')
          .select(
            'id, task_id, completed_at, completed_by, completed_by_name, period_start, period_end, reverses_completion_id, task:tasks(name)',
          )
          .eq('company_id', companyId!)
          .gte('period_end', startISO)
          .lte('period_start', endISO),
        supabase
          .from('maintenance_completions')
          .select(
            'id, maintenance_task_id, completed_at, completed_by, reverses_completion_id, maintenance_task:maintenance_tasks(title, type, conservation_point:conservation_points(name))',
          )
          .eq('company_id', companyId!)
          .gte('completed_at', startISO),
        supabase
          .from('shift_seals')
          .select('id, opened_at, closed_at')
          .eq('company_id', companyId!)
          .eq('user_id', userId!)
          .gte('closed_at', startISO)
          .order('closed_at', { ascending: false }),
      ])
      for (const r of [mtRes, tasksRes, tcRes, mcRes, sealsRes]) {
        if (r.error) throw r.error
      }
      return {
        manutenzioni: mtRes.data!,
        mansioni: tasksRes.data!,
        completamentiMansioni: tcRes.data!,
        completamentiManutenzioni: mcRes.data!,
        sigilli: sealsRes.data!,
      }
    },
    enabled: !!companyId && !!userId,
  })

  const oggiKey = localDateKey()
  const raw = query.data

  // filtro «le mie cose» (dec. §12.2): il dipendente vede i suoi reparti,
  // le mansioni assegnate a lui e quelle senza reparto; i direttori tutto
  const mieDeps = (depId: string | null) =>
    canDirect || !departmentIds || !depId || departmentIds.includes(depId)

  const reversedTc = new Set(
    raw?.completamentiMansioni
      .map(r => r.reverses_completion_id)
      .filter(Boolean) ?? [],
  )
  const validTc =
    raw?.completamentiMansioni.filter(
      r => !r.reverses_completion_id && !reversedTc.has(r.id),
    ) ?? []
  const reversedMc = new Set(
    raw?.completamentiManutenzioni
      .map(r => r.reverses_completion_id)
      .filter(Boolean) ?? [],
  )
  const validMc =
    raw?.completamentiManutenzioni.filter(
      r => !r.reverses_completion_id && !reversedMc.has(r.id),
    ) ?? []

  const mansioniCompletateIds = new Set(validTc.map(r => r.task_id))
  const startToday = startOfDayLocal().getTime()

  const mansioni: MansioneOggi[] =
    raw?.mansioni
      .filter(
        t =>
          !STATI_MANSIONE_CHIUSI.includes(t.status) &&
          !mansioniCompletateIds.has(t.id) &&
          (mieDeps(t.department_id) ||
            (staffId && t.assigned_to_staff_id === staffId)),
      )
      .map(t => ({
        id: t.id,
        nome: t.name,
        frequency: t.frequency,
        departmentId: t.department_id,
        nextDue: t.next_due,
        dueLabel: estraiDueLabel(t.time_management),
      })) ?? []

  const manutenzioni: ManutenzioneOggi[] =
    raw?.manutenzioni
      .filter(m => mieDeps(m.conservation_point?.department_id ?? null))
      .map(m => ({
        id: m.id,
        titolo: m.title ?? 'Manutenzione',
        tipo: m.type,
        pointName: m.conservation_point?.name ?? null,
        departmentId: m.conservation_point?.department_id ?? null,
        arretrata: !!m.next_due && new Date(m.next_due).getTime() < startToday,
      })) ?? []

  const letture: LetturaFatta[] = puntiOggi.punti
    .filter(p => p.lastToday)
    .map(p => ({
      id: p.lastToday!.id,
      pointName: p.name,
      valueC: p.lastToday!.valueC,
      recordedAt: p.lastToday!.recordedAt,
      verdict: p.lastToday!.verdict,
    }))

  const completamenti: CompletamentoFatto[] = [
    ...validTc
      .filter(r => localDateKey(new Date(r.completed_at)) === oggiKey)
      .map(r => ({
        id: r.id,
        titolo: r.task?.name ?? 'Mansione',
        completedAt: r.completed_at,
        kind: 'mansione' as const,
        storno: {
          kind: 'mansione' as const,
          taskId: r.task_id,
          periodStart: r.period_start,
          periodEnd: r.period_end,
        },
      })),
    // le manutenzioni-temperatura NON compaiono qui: le rappresenta la lettura
    ...validMc
      .filter(r => r.maintenance_task?.type !== 'temperature')
      .map(r => ({
        id: r.id,
        titolo: [r.maintenance_task?.title, r.maintenance_task?.conservation_point?.name]
          .filter(Boolean)
          .join(' · '),
        completedAt: r.completed_at,
        kind: 'manutenzione' as const,
        storno: {
          kind: 'manutenzione' as const,
          maintenanceTaskId: r.maintenance_task_id,
        },
      })),
  ].sort((a, b) => b.completedAt.localeCompare(a.completedAt))

  const ora = puntiOggi.punti.filter(p => p.daControllare)
  const primoDaControllare = ora[0]
  const ribbon = primoDaControllare
    ? `${primoDaControllare.name} · non ancora controllato oggi`
    : null

  const mieAttivita = [
    ...puntiOggi.lettureOggi
      .filter(l => l.recordedBy === userId)
      .map(l => l.recordedAt),
    ...validTc.filter(r => r.completed_by === userId).map(r => r.completed_at),
    ...validMc.filter(r => r.completed_by === userId).map(r => r.completed_at),
  ].filter(t => localDateKey(new Date(t)) === oggiKey)

  return {
    isLoading: query.isLoading || puntiOggi.isLoading,
    ora,
    mansioni,
    manutenzioni,
    letture,
    completamenti,
    ribbon,
    sealedToday: (raw?.sigilli.length ?? 0) > 0,
    sealClosedAt: raw?.sigilli[0]?.closed_at ?? null,
    firstActivityAt: mieAttivita.sort()[0] ?? null,
  }
}

function useInvalidateOggi() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['oggi', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['punti-oggi', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['calendario', companyId] })
  }
}

/** Spunta una mansione generica: il completamento copre il SUO periodo (♻️). */
export function useCompletaMansione() {
  const { companyId, session, displayName } = useSession()
  const invalidate = useInvalidateOggi()
  return useMutation({
    mutationFn: async (mansione: MansioneOggi) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')
      const riferimento = mansione.nextDue ? new Date(mansione.nextDue) : new Date()
      const period = periodForFrequency(mansione.frequency, riferimento)
      const { error } = await supabase.from('task_completions').insert({
        company_id: companyId,
        task_id: mansione.id,
        completed_by: userId,
        completed_by_name: displayName,
        period_start: period.start.toISOString(),
        period_end: period.end.toISOString(),
      })
      if (error) throw error
    },
    onSuccess: invalidate,
    onError: err => logger.error('completamento mansione fallito', err),
  })
}

/** Spunta una manutenzione (non-temperatura): il trigger DB avanza next_due. */
export function useCompletaManutenzione() {
  const { companyId, session, displayName } = useSession()
  const invalidate = useInvalidateOggi()
  return useMutation({
    mutationFn: async (manutenzione: ManutenzioneOggi) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')
      const { error } = await supabase.from('maintenance_completions').insert({
        maintenance_task_id: manutenzione.id,
        company_id: companyId,
        completed_by: userId,
        completed_by_name: displayName,
        completed_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    onSuccess: invalidate,
    onError: err => logger.error('completamento manutenzione fallito', err),
  })
}

/**
 * STORNO (dec. 1): annullare un completamento = registrare una riga che lo
 * annulla, mai cancellare la prova. Mansioni generiche e manutenzioni
 * (il trigger storno-aware `20260706070000` riporta il task esigibile).
 */
export function useStorna() {
  const { companyId, session, displayName } = useSession()
  const invalidate = useInvalidateOggi()
  return useMutation({
    mutationFn: async (fatto: CompletamentoFatto) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')
      if (!fatto.storno) throw new Error('Questo completamento non è stornabile')
      if (fatto.storno.kind === 'mansione') {
        const { error } = await supabase.from('task_completions').insert({
          company_id: companyId,
          task_id: fatto.storno.taskId,
          completed_by: userId,
          completed_by_name: displayName,
          period_start: fatto.storno.periodStart,
          period_end: fatto.storno.periodEnd,
          notes: 'Storno del completamento precedente',
          reverses_completion_id: fatto.id,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('maintenance_completions').insert({
          company_id: companyId,
          maintenance_task_id: fatto.storno.maintenanceTaskId,
          completed_by: userId,
          completed_by_name: displayName,
          completed_at: new Date().toISOString(),
          completion_notes: 'Storno del completamento precedente',
          reverses_completion_id: fatto.id,
        })
        if (error) throw error
      }
    },
    onSuccess: invalidate,
    onError: err => logger.error('storno fallito', err),
  })
}

/**
 * 🔖 Il timbro (dec. 7): sigilla la giornata con orario + attestazione.
 * Riga append-only che nasce completa alla chiusura; più timbri nello stesso
 * giorno = turni spezzati (pranzo/cena), ognuno col suo sigillo.
 */
export function useTimbra() {
  const { companyId, session } = useSession()
  const invalidate = useInvalidateOggi()
  return useMutation({
    mutationFn: async ({
      openedAt,
      notes,
    }: {
      openedAt: Date
      notes?: string
    }) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')
      const { error } = await supabase.from('shift_seals').insert({
        company_id: companyId,
        user_id: userId,
        opened_at: openedAt.toISOString(),
        attestation: true,
        notes: notes || null,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
    onError: err => logger.error('timbro fallito', err),
  })
}

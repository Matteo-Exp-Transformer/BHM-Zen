/**
 * Reparti (lente SPAZIO) — dati e gesti contro lo schema NUOVO.
 * ♻️ Port della logica legacy (useConservationPoints/useTemperatureReadings):
 * lettura append-only con attribuzione + auto-completamento del task
 * «Rilevamento temperature» del giorno (il trigger DB ricalcola next_due).
 * ✍️ Riscritto: verdetto SOLO da src/compliance (LOCK §14.3), niente soglie qui.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import { endOfDayLocal, startOfDayLocal } from '@/lib/dates'
import {
  ruleForPointType,
  verdictForPoint,
  type TemperatureRule,
} from '@/compliance/point-verdict'
import type { TemperatureVerdict } from '@/compliance/haccp-rules'

/** dec. 8: metodo obbligatorio; beta = default digitale, senza attrito (§9.4). */
export const METODO_DEFAULT = 'digital_thermometer'

export interface LetturaOggi {
  id: string
  conservationPointId: string
  valueC: number
  recordedAt: string
  recordedBy: string | null
}

export interface PuntoOggi {
  id: string
  name: string
  type: string
  departmentId: string | null
  departmentName: string | null
  rule: TemperatureRule | null
  /** ultima lettura di oggi (la più recente) con verdetto dalla fonte-unica */
  lastToday: (LetturaOggi & { verdict: TemperatureVerdict | null }) | null
  /** esiste un task temperatura in scadenza (oggi o arretrato) per il punto */
  tempTaskDue: boolean
  /** da controllare = task in scadenza e nessuna lettura registrata oggi */
  daControllare: boolean
}

export interface PuntiOggiData {
  punti: PuntoOggi[]
  /** tutte le letture di oggi (per la sezione «Fatto» della lente Oggi) */
  lettureOggi: LetturaOggi[]
}

/** Stati che tengono vivo un task di manutenzione (♻️ dal legacy). */
const TASK_STATI_APERTI = ['scheduled', 'overdue', 'in_progress']

export function useMyDepartments() {
  const { companyId, canDirect, departmentIds } = useSession()
  const query = useQuery({
    queryKey: ['departments', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', companyId!)
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data
    },
    enabled: !!companyId,
    staleTime: 5 * 60_000,
  })

  const all = query.data ?? []
  const departments =
    canDirect || !departmentIds
      ? all
      : all.filter(d => departmentIds.includes(d.id))
  return { departments, isLoading: query.isLoading }
}

export function usePuntiOggi() {
  const { companyId, canDirect, departmentIds } = useSession()

  const query = useQuery({
    queryKey: ['punti-oggi', companyId],
    queryFn: async (): Promise<PuntiOggiData> => {
      const startISO = startOfDayLocal().toISOString()
      const endISO = endOfDayLocal().toISOString()

      const [pointsRes, readingsRes, tasksRes] = await Promise.all([
        supabase
          .from('conservation_points')
          .select('id, name, type, department_id, department:departments(id, name)')
          .eq('company_id', companyId!)
          .order('name'),
        supabase
          .from('temperature_readings')
          .select('id, conservation_point_id, temperature, recorded_at, recorded_by')
          .eq('company_id', companyId!)
          .gte('recorded_at', startISO)
          .order('recorded_at', { ascending: false }),
        supabase
          .from('maintenance_tasks')
          .select('id, conservation_point_id, next_due, status')
          .eq('company_id', companyId!)
          .eq('type', 'temperature')
          .in('status', TASK_STATI_APERTI)
          .lte('next_due', endISO),
      ])
      if (pointsRes.error) throw pointsRes.error
      if (readingsRes.error) throw readingsRes.error
      if (tasksRes.error) throw tasksRes.error

      const lettureOggi: LetturaOggi[] = readingsRes.data.map(r => ({
        id: r.id,
        conservationPointId: r.conservation_point_id,
        valueC: r.temperature,
        recordedAt: r.recorded_at,
        recordedBy: r.recorded_by,
      }))

      // letture ordinate desc → la prima per punto è l'ultima di oggi
      const lastByPoint = new Map<string, LetturaOggi>()
      for (const l of lettureOggi) {
        if (!lastByPoint.has(l.conservationPointId))
          lastByPoint.set(l.conservationPointId, l)
      }
      const dueByPoint = new Set(
        tasksRes.data.map(t => t.conservation_point_id),
      )

      const punti: PuntoOggi[] = pointsRes.data.map(p => {
        const last = lastByPoint.get(p.id) ?? null
        const tempTaskDue = dueByPoint.has(p.id)
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          departmentId: p.department_id,
          departmentName: p.department?.name ?? null,
          rule: ruleForPointType(p.type),
          lastToday: last
            ? { ...last, verdict: verdictForPoint(p.type, last.valueC) }
            : null,
          tempTaskDue,
          daControllare: tempTaskDue && !last,
        }
      })

      return { punti, lettureOggi }
    },
    enabled: !!companyId,
  })

  // lente del dipendente: solo i suoi reparti (dec. §12.2); direttori vedono tutto
  const data = query.data
  const punti =
    !data || canDirect || !departmentIds
      ? (data?.punti ?? [])
      : data.punti.filter(
          p => p.departmentId && departmentIds.includes(p.departmentId),
        )

  return {
    punti,
    lettureOggi: data?.lettureOggi ?? [],
    isLoading: query.isLoading,
    error: query.error,
  }
}

/**
 * 🌡️ Il gesto-firma: la lettura ATTERRA nel registro (INSERT-only, dec. 1).
 * Una lettura sbagliata si corregge con una NUOVA lettura + nota, mai editando.
 */
export function useRegistraTemperatura() {
  const { companyId, session, displayName } = useSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      punto,
      valueC,
      notes,
    }: {
      punto: Pick<PuntoOggi, 'id' | 'type'>
      valueC: number
      notes?: string
    }) => {
      const userId = session?.user.id
      if (!companyId || !userId) throw new Error('Sessione non pronta')

      const now = new Date()
      const { data: reading, error } = await supabase
        .from('temperature_readings')
        .insert({
          company_id: companyId,
          conservation_point_id: punto.id,
          temperature: valueC,
          method: METODO_DEFAULT,
          notes: notes ?? null,
          recorded_at: now.toISOString(),
          recorded_by: userId,
        })
        .select('id, recorded_at')
        .single()
      if (error) throw error

      // ♻️ auto-completamento del task temperatura del giorno (stesso effetto
      // del pulsante «Completa»): il trigger DB fa avanzare next_due.
      const { data: tasks, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('id')
        .eq('company_id', companyId)
        .eq('conservation_point_id', punto.id)
        .eq('type', 'temperature')
        .in('status', TASK_STATI_APERTI)
        .lte('next_due', endOfDayLocal(now).toISOString())
      if (tasksError) {
        logger.warn('auto-complete: lettura task temperatura fallita', tasksError)
      } else if (tasks.length > 0) {
        const { error: completionsError } = await supabase
          .from('maintenance_completions')
          .insert(
            tasks.map(t => ({
              maintenance_task_id: t.id,
              company_id: companyId,
              completed_by: userId,
              completed_by_name: displayName,
              completed_at: now.toISOString(),
            })),
          )
        if (completionsError)
          logger.warn('auto-complete task temperatura fallito', completionsError)
      }

      return { reading, verdict: verdictForPoint(punto.type, valueC) }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['punti-oggi', companyId] })
      void queryClient.invalidateQueries({ queryKey: ['oggi', companyId] })
      void queryClient.invalidateQueries({ queryKey: ['calendario', companyId] })
    },
    onError: err => logger.error('registrazione temperatura fallita', err),
  })
}

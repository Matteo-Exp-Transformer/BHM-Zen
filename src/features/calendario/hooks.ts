/**
 * Calendario (dec. 13) — la vista LUNGA della lente Tempo: occorrenze del mese
 * (mansioni + manutenzioni) e registro dei giorni passati. Le scritture NON
 * vivono qui: si riusano le mutation di Oggi (useCompletaMansione con la data
 * dell'occorrenza come riferimento, useCompletaManutenzione, useStorna).
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { endOfDayLocal, localDateKey, startOfDayLocal } from '@/lib/dates'
import type { CompletamentoFatto } from '@/features/oggi/hooks'
import {
  copertaDaCompletamento,
  expandMansione,
  expandManutenzione,
  OPEN_WEEKDAYS_DEFAULT,
} from './occurrences'

export interface OccorrenzaGiorno {
  key: string
  kind: 'mansione' | 'manutenzione' | 'temperatura'
  titolo: string
  /** reparto o punto di conservazione, per la pill */
  dove: string | null
  frequency: string
  /** proiezione informativa (manutenzioni oltre la prossima scadenza reale) */
  proiezione: boolean
  /** payload per la spunta — assente per temperature e proiezioni */
  mansione?: { id: string; frequency: string; occorrenzaISO: string }
  manutenzione?: { id: string; tipo: string }
}

export interface LetturaGiorno {
  id: string
  pointName: string
  valueC: number
  recordedAt: string
}

export interface GiornoCalendario {
  dateKey: string
  date: Date
  oggi: boolean
  passato: boolean
  chiuso: boolean
  daFare: OccorrenzaGiorno[]
  fatte: CompletamentoFatto[]
  letture: LetturaGiorno[]
}

const STATI_TASK_APERTI = ['scheduled', 'overdue', 'in_progress']
const STATI_MANSIONE_CHIUSI = ['inactive', 'archived', 'deleted']

export function useCalendario(mese: Date) {
  const { companyId, canDirect, departmentIds, staffId } = useSession()
  const meseKey = `${mese.getFullYear()}-${String(mese.getMonth() + 1).padStart(2, '0')}`

  const rangeStart = startOfDayLocal(new Date(mese.getFullYear(), mese.getMonth(), 1))
  const rangeEnd = endOfDayLocal(new Date(mese.getFullYear(), mese.getMonth() + 1, 0))

  const query = useQuery({
    queryKey: ['calendario', companyId, meseKey],
    queryFn: async () => {
      const startISO = rangeStart.toISOString()
      const endISO = rangeEnd.toISOString()

      const [tasksRes, mtRes, tcRes, mcRes, readingsRes, settingsRes] =
        await Promise.all([
          supabase
            .from('tasks')
            .select(
              'id, name, frequency, status, next_due, department_id, assigned_to_staff_id, department:departments(name)',
            )
            .eq('company_id', companyId!)
            .not('next_due', 'is', null),
          supabase
            .from('maintenance_tasks')
            .select(
              'id, title, type, frequency, status, next_due, conservation_point:conservation_points(id, name, department_id)',
            )
            .eq('company_id', companyId!)
            .in('status', STATI_TASK_APERTI)
            .not('next_due', 'is', null),
          supabase
            .from('task_completions')
            .select(
              'id, task_id, completed_at, period_start, period_end, reverses_completion_id, task:tasks(name)',
            )
            .eq('company_id', companyId!)
            .gte('period_end', startISO)
            .lte('period_start', endISO),
          supabase
            .from('maintenance_completions')
            .select(
              'id, maintenance_task_id, completed_at, reverses_completion_id, maintenance_task:maintenance_tasks(title, type, conservation_point:conservation_points(name))',
            )
            .eq('company_id', companyId!)
            .gte('completed_at', startISO)
            .lte('completed_at', endISO),
          supabase
            .from('temperature_readings')
            .select(
              'id, temperature, recorded_at, conservation_point:conservation_points(name)',
            )
            .eq('company_id', companyId!)
            .gte('recorded_at', startISO)
            .lte('recorded_at', endISO)
            .order('recorded_at'),
          supabase
            .from('company_calendar_settings')
            .select('open_weekdays')
            .eq('company_id', companyId!)
            .limit(1)
            .maybeSingle(),
        ])
      for (const r of [tasksRes, mtRes, tcRes, mcRes, readingsRes]) {
        if (r.error) throw r.error
      }
      return {
        mansioni: tasksRes.data!,
        manutenzioni: mtRes.data!,
        completamentiMansioni: tcRes.data!,
        completamentiManutenzioni: mcRes.data!,
        letture: readingsRes.data!,
        openWeekdays: settingsRes.data?.open_weekdays ?? OPEN_WEEKDAYS_DEFAULT,
      }
    },
    enabled: !!companyId,
  })

  const raw = query.data
  const oggiStart = startOfDayLocal()
  const oggiKey = localDateKey()

  // stesso filtro «le mie cose» di Oggi (dec. §12.2)
  const mieDeps = (depId: string | null) =>
    canDirect || !departmentIds || !depId || departmentIds.includes(depId)

  // completamenti validi (storno-aware, come Oggi)
  const reversedTc = new Set(
    raw?.completamentiMansioni.map(r => r.reverses_completion_id).filter(Boolean) ?? [],
  )
  const validTc =
    raw?.completamentiMansioni.filter(
      r => !r.reverses_completion_id && !reversedTc.has(r.id),
    ) ?? []
  const reversedMc = new Set(
    raw?.completamentiManutenzioni.map(r => r.reverses_completion_id).filter(Boolean) ?? [],
  )
  const validMc =
    raw?.completamentiManutenzioni.filter(
      r => !r.reverses_completion_id && !reversedMc.has(r.id),
    ) ?? []

  const periodiPerTask = new Map<string, { periodStart: string; periodEnd: string }[]>()
  for (const r of validTc) {
    const arr = periodiPerTask.get(r.task_id) ?? []
    arr.push({ periodStart: r.period_start, periodEnd: r.period_end })
    periodiPerTask.set(r.task_id, arr)
  }

  // costruzione giorni del mese
  const giorni: GiornoCalendario[] = []
  const byKey = new Map<string, GiornoCalendario>()
  for (
    let d = new Date(rangeStart);
    d <= rangeEnd;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  ) {
    const g: GiornoCalendario = {
      dateKey: localDateKey(d),
      date: new Date(d),
      oggi: localDateKey(d) === oggiKey,
      passato: d < oggiStart && localDateKey(d) !== oggiKey,
      chiuso: !(raw?.openWeekdays ?? OPEN_WEEKDAYS_DEFAULT).includes(d.getDay()),
      daFare: [],
      fatte: [],
      letture: [],
    }
    giorni.push(g)
    byKey.set(g.dateKey, g)
  }

  if (raw) {
    // mansioni → occorrenze da oggi in poi, non coperte da un completamento
    for (const t of raw.mansioni) {
      if (STATI_MANSIONE_CHIUSI.includes(t.status)) continue
      if (!mieDeps(t.department_id) && !(staffId && t.assigned_to_staff_id === staffId))
        continue
      const anchor = new Date(t.next_due!)
      const occs = expandMansione(
        anchor,
        t.frequency,
        oggiStart > rangeStart ? oggiStart : rangeStart,
        rangeEnd,
        raw.openWeekdays,
      )
      for (const occ of occs) {
        if (copertaDaCompletamento(occ, periodiPerTask.get(t.id) ?? [])) continue
        byKey.get(localDateKey(occ))?.daFare.push({
          key: `t-${t.id}-${localDateKey(occ)}`,
          kind: 'mansione',
          titolo: t.name,
          dove: t.department?.name ?? null,
          frequency: t.frequency,
          proiezione: false,
          mansione: { id: t.id, frequency: t.frequency, occorrenzaISO: occ.toISOString() },
        })
      }
    }

    // manutenzioni → prossima scadenza reale + proiezioni
    for (const m of raw.manutenzioni) {
      const depId = m.conservation_point?.department_id ?? null
      if (!mieDeps(depId)) continue
      const occs = expandManutenzione(
        new Date(m.next_due!),
        m.frequency ?? '',
        oggiStart > rangeStart ? oggiStart : rangeStart,
        rangeEnd,
        new Date(),
      )
      const temperatura = m.type === 'temperature'
      for (const occ of occs) {
        byKey.get(localDateKey(occ.date))?.daFare.push({
          key: `m-${m.id}-${localDateKey(occ.date)}`,
          kind: temperatura ? 'temperatura' : 'manutenzione',
          titolo: m.title ?? 'Manutenzione',
          dove: m.conservation_point?.name ?? null,
          frequency: m.frequency ?? '',
          proiezione: occ.proiezione,
          manutenzione:
            temperatura || occ.proiezione
              ? undefined
              : { id: m.id, tipo: m.type },
        })
      }
    }

    // registro: completamenti validi + letture, sul giorno in cui sono avvenuti
    for (const r of validTc) {
      byKey.get(localDateKey(new Date(r.completed_at)))?.fatte.push({
        id: r.id,
        titolo: r.task?.name ?? 'Mansione',
        completedAt: r.completed_at,
        kind: 'mansione',
        storno: {
          kind: 'mansione',
          taskId: r.task_id,
          periodStart: r.period_start,
          periodEnd: r.period_end,
        },
      })
    }
    for (const r of validMc) {
      if (r.maintenance_task?.type === 'temperature') continue // la rappresenta la lettura
      byKey.get(localDateKey(new Date(r.completed_at)))?.fatte.push({
        id: r.id,
        titolo: [r.maintenance_task?.title, r.maintenance_task?.conservation_point?.name]
          .filter(Boolean)
          .join(' · '),
        completedAt: r.completed_at,
        kind: 'manutenzione',
        storno: { kind: 'manutenzione', maintenanceTaskId: r.maintenance_task_id },
      })
    }
    for (const l of raw.letture) {
      byKey.get(localDateKey(new Date(l.recorded_at)))?.letture.push({
        id: l.id,
        pointName: l.conservation_point?.name ?? 'Punto',
        valueC: l.temperature,
        recordedAt: l.recorded_at,
      })
    }
    for (const g of giorni) {
      g.fatte.sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    }
  }

  return { giorni, isLoading: query.isLoading, meseKey }
}

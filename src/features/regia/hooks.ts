/**
 * Regia (①③④, mockup 04) — dati e gesti del titolare contro lo schema nuovo.
 * ✍️ Riscritto dal legacy: la dashboard fabbricava numeri (turnover 85, split
 * 60/30/10) — qui OGNI numero viene dal DB (dec. 2: mai dati finti).
 * Il dossier (④) è l'export dei registri del giorno: append-only, già scritti.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import { endOfDayLocal, localDateKey, startOfDayLocal } from '@/lib/dates'
import { verdictForPoint } from '@/compliance/point-verdict'

export interface RespiroData {
  /** letture temperatura di oggi: totali e fuori norma (verdetto fonte-unica) */
  lettureOggi: number
  lettureAlarm: number
  /** punti con task temperatura in scadenza e nessuna lettura oggi */
  puntiDaControllare: number
  mansioniCompletate: number
  manutenzioniCompletate: number
  /** prodotti vivi che scadono entro 7 giorni */
  scadenzeSettimana: number
  turniSigillati: number
  reparti: number
  punti: number
  persone: number
}

export type RespiroTono = 'ok' | 'warn' | 'alarm'

/** Il respiro: onesto, non allarmistico. alarm = fuori norma oggi;
 *  warn = giornata ancora aperta (punti da controllare); ok = tutto coperto. */
export function tonoRespiro(d: RespiroData): RespiroTono {
  if (d.lettureAlarm > 0) return 'alarm'
  if (d.puntiDaControllare > 0) return 'warn'
  return 'ok'
}

export function useRespiro() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['regia-respiro', companyId],
    queryFn: async (): Promise<RespiroData> => {
      const startISO = startOfDayLocal().toISOString()
      const endISO = endOfDayLocal().toISOString()
      const tra7gg = new Date()
      tra7gg.setDate(tra7gg.getDate() + 7)

      const [readingsRes, tempTasksRes, tcRes, mcRes, sealsRes, prodRes, depRes, pointsRes, staffRes] =
        await Promise.all([
          supabase
            .from('temperature_readings')
            .select('id, temperature, conservation_point_id, conservation_point:conservation_points(type)')
            .eq('company_id', companyId!)
            .gte('recorded_at', startISO),
          supabase
            .from('maintenance_tasks')
            .select('id, conservation_point_id')
            .eq('company_id', companyId!)
            .eq('type', 'temperature')
            .in('status', ['scheduled', 'overdue', 'in_progress'])
            .lte('next_due', endISO),
          supabase
            .from('task_completions')
            .select('id, reverses_completion_id')
            .eq('company_id', companyId!)
            .gte('completed_at', startISO),
          supabase
            .from('maintenance_completions')
            .select('id, reverses_completion_id, maintenance_task:maintenance_tasks(type)')
            .eq('company_id', companyId!)
            .gte('completed_at', startISO),
          supabase
            .from('shift_seals')
            .select('id')
            .eq('company_id', companyId!)
            .gte('closed_at', startISO),
          supabase
            .from('products')
            .select('id')
            .eq('company_id', companyId!)
            .eq('status', 'active')
            .not('expiry_date', 'is', null)
            .lte('expiry_date', localDateKey(tra7gg)),
          supabase
            .from('departments')
            .select('id')
            .eq('company_id', companyId!)
            .eq('is_active', true),
          supabase
            .from('conservation_points')
            .select('id')
            .eq('company_id', companyId!),
          supabase
            .from('staff')
            .select('id')
            .eq('company_id', companyId!)
            .eq('status', 'active'),
        ])
      for (const r of [readingsRes, tempTasksRes, tcRes, mcRes, sealsRes, prodRes, depRes, pointsRes, staffRes]) {
        if (r.error) throw r.error
      }

      const letture = readingsRes.data!
      const lettureAlarm = letture.filter(l => {
        const v = verdictForPoint(l.conservation_point?.type ?? '', l.temperature)
        return v === 'alarm'
      }).length

      // punto «da controllare» = task temperatura in scadenza senza lettura oggi
      const puntiConLettura = new Set(letture.map(l => l.conservation_point_id))
      const puntiDaControllare = new Set(
        tempTasksRes.data!
          .map(t => t.conservation_point_id)
          .filter(id => id && !puntiConLettura.has(id)),
      ).size

      // storni esclusi dai conteggi «fatto» (dec. 1)
      const validi = <T extends { id: string; reverses_completion_id: string | null }>(rows: T[]) => {
        const stornati = new Set(rows.map(r => r.reverses_completion_id).filter(Boolean))
        return rows.filter(r => !r.reverses_completion_id && !stornati.has(r.id))
      }

      return {
        lettureOggi: letture.length,
        lettureAlarm,
        puntiDaControllare,
        mansioniCompletate: validi(tcRes.data!).length,
        manutenzioniCompletate: validi(
          mcRes.data!.filter(m => m.maintenance_task?.type !== 'temperature'),
        ).length,
        scadenzeSettimana: prodRes.data!.length,
        turniSigillati: sealsRes.data!.length,
        reparti: depRes.data!.length,
        punti: pointsRes.data!.length,
        persone: staffRes.data!.length,
      }
    },
    enabled: !!companyId,
  })
  return { respiro: query.data ?? null, isLoading: query.isLoading }
}

export interface PersonaStaff {
  id: string
  nome: string
  ruolo: string
  categoria: string
  email: string | null
  reparti: string[]
}

/** Staff & ruoli (①): elenco persone — CRUD collegato (default dec. 9). */
export function useStaffRegia() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['regia-staff', companyId],
    queryFn: async () => {
      const [staffRes, depRes] = await Promise.all([
        supabase
          .from('staff')
          .select('id, name, role, category, email, department_assignments, status')
          .eq('company_id', companyId!)
          .eq('status', 'active')
          .order('name'),
        supabase
          .from('departments')
          .select('id, name')
          .eq('company_id', companyId!),
      ])
      if (staffRes.error) throw staffRes.error
      if (depRes.error) throw depRes.error
      const depName = new Map(depRes.data.map(d => [d.id, d.name]))
      return staffRes.data.map(
        (s): PersonaStaff => ({
          id: s.id,
          nome: s.name,
          ruolo: s.role,
          categoria: s.category,
          email: s.email,
          reparti: (s.department_assignments ?? [])
            .map(id => depName.get(id))
            .filter((n): n is string => !!n),
        }),
      )
    },
    enabled: !!companyId,
  })
  return { persone: query.data ?? [], isLoading: query.isLoading }
}

/** Aggiunge una persona allo staff (RLS: has_management_role). */
export function useAggiungiPersona() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      nome,
      ruolo,
      email,
    }: {
      nome: string
      ruolo: string
      email?: string
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const { error } = await supabase.from('staff').insert({
        company_id: companyId,
        name: nome,
        role: ruolo,
        category: ruolo,
        email: email || null,
        status: 'active',
      })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['regia-staff', companyId] })
      void queryClient.invalidateQueries({ queryKey: ['regia-respiro', companyId] })
    },
    onError: err => logger.error('aggiunta persona fallita', err),
  })
}

/** Modifica una persona esistente (FU-013 parziale, owner 08-07: «da Regia
 *  devo poter modificare staff»). L'accesso auth resta FU-001 (inviti). */
export function useModificaPersona() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      nome,
      ruolo,
      email,
      reparti,
      attivo,
    }: {
      id: string
      nome: string
      ruolo: string
      email?: string
      reparti: string[]
      attivo: boolean
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      const { error } = await supabase
        .from('staff')
        .update({
          name: nome,
          role: ruolo,
          category: ruolo,
          email: email || null,
          department_assignments: reparti,
          status: attivo ? 'active' : 'inactive',
        })
        .eq('id', id)
        .eq('company_id', companyId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['regia-staff', companyId] })
      void queryClient.invalidateQueries({ queryKey: ['regia-respiro', companyId] })
    },
    onError: err => logger.error('modifica persona fallita', err),
  })
}

/* -------------------------------------------------------------------------- */
/* ① Imposto — struttura: reparti e pdc (owner 08-07: modifica da Regia).      */
/* RLS: has_management_role (policy baseline). UI dai mockup; la logica dei    */
/* form legacy (tipo → temperatura) passa dalla fonte-unica, mai hardcoded.    */
/* -------------------------------------------------------------------------- */

export interface RepartoRegia {
  id: string
  nome: string
  attivo: boolean
}

export function useRepartiRegia() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['regia-reparti', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, is_active')
        .eq('company_id', companyId!)
        .order('name')
      if (error) throw error
      return data.map((d): RepartoRegia => ({ id: d.id, nome: d.name, attivo: d.is_active }))
    },
    enabled: !!companyId,
  })
  return { reparti: query.data ?? [], isLoading: query.isLoading }
}

function useInvalidateStruttura() {
  const { companyId } = useSession()
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['regia-reparti', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['regia-punti', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['regia-respiro', companyId] })
    void queryClient.invalidateQueries({ queryKey: ['regia-staff', companyId] })
  }
}

/** Crea o rinomina/attiva un reparto (id assente = nuovo). */
export function useSalvaReparto() {
  const { companyId } = useSession()
  const invalidate = useInvalidateStruttura()
  return useMutation({
    mutationFn: async ({ id, nome, attivo }: { id?: string; nome: string; attivo?: boolean }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      if (id) {
        const { error } = await supabase
          .from('departments')
          .update({ name: nome, is_active: attivo ?? true })
          .eq('id', id)
          .eq('company_id', companyId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('departments')
          .insert({ company_id: companyId, name: nome })
        if (error) throw error
      }
    },
    onSuccess: invalidate,
    onError: err => logger.error('salvataggio reparto fallito', err),
  })
}

export interface PuntoRegia {
  id: string
  nome: string
  tipo: string
  setpoint: number
  departmentId: string | null
  departmentName: string | null
  status: string
}

export function usePuntiRegia() {
  const { companyId } = useSession()
  const query = useQuery({
    queryKey: ['regia-punti', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conservation_points')
        .select('id, name, type, setpoint_temp, department_id, status, department:departments(name)')
        .eq('company_id', companyId!)
        .order('name')
      if (error) throw error
      return data.map(
        (p): PuntoRegia => ({
          id: p.id,
          nome: p.name,
          tipo: p.type,
          setpoint: p.setpoint_temp,
          departmentId: p.department_id,
          departmentName: p.department?.name ?? null,
          status: p.status,
        }),
      )
    },
    enabled: !!companyId,
  })
  return { punti: query.data ?? [], isLoading: query.isLoading }
}

/** Crea o modifica un pdc (id assente = nuovo). Le letture restano intoccabili
 *  (append-only): qui si cambia solo l'anagrafica del punto. */
export function useSalvaPunto() {
  const { companyId } = useSession()
  const invalidate = useInvalidateStruttura()
  return useMutation({
    mutationFn: async ({
      id,
      nome,
      tipo,
      setpoint,
      departmentId,
    }: {
      id?: string
      nome: string
      tipo: string
      setpoint: number
      departmentId: string | null
    }) => {
      if (!companyId) throw new Error('Sessione non pronta')
      if (id) {
        const { error } = await supabase
          .from('conservation_points')
          .update({ name: nome, type: tipo, setpoint_temp: setpoint, department_id: departmentId })
          .eq('id', id)
          .eq('company_id', companyId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('conservation_points').insert({
          company_id: companyId,
          name: nome,
          type: tipo,
          setpoint_temp: setpoint,
          department_id: departmentId,
        })
        if (error) throw error
      }
    },
    onSuccess: invalidate,
    onError: err => logger.error('salvataggio punto fallito', err),
  })
}

/* -------------------------------------------------------------------------- */
/* ④ Dimostro — il dossier del giorno: CSV dei registri append-only.           */
/* -------------------------------------------------------------------------- */

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows.map(r => r.map(csvCell).join(';')).join('\r\n')
}

export interface DossierGiorno {
  csv: string
  letture: number
  mansioni: number
  manutenzioni: number
  sigilli: number
}

/**
 * Assembla il dossier del giorno: ogni riga è un fatto già registrato
 * (append-only, dec. 1) — il documento è il sottoprodotto del lavoro.
 */
export function useGeneraDossier() {
  const { companyId } = useSession()
  return useMutation({
    mutationFn: async (): Promise<DossierGiorno> => {
      if (!companyId) throw new Error('Sessione non pronta')
      const startISO = startOfDayLocal().toISOString()

      const [companyRes, readingsRes, tcRes, mcRes, sealsRes] = await Promise.all([
        supabase.from('companies').select('name').eq('id', companyId).single(),
        supabase
          .from('temperature_readings')
          .select('recorded_at, temperature, method, notes, conservation_point:conservation_points(name, type)')
          .eq('company_id', companyId)
          .gte('recorded_at', startISO)
          .order('recorded_at'),
        supabase
          .from('task_completions')
          .select('completed_at, completed_by_name, notes, reverses_completion_id, task:tasks(name)')
          .eq('company_id', companyId)
          .gte('completed_at', startISO)
          .order('completed_at'),
        supabase
          .from('maintenance_completions')
          .select('completed_at, completed_by_name, completion_notes, reverses_completion_id, maintenance_task:maintenance_tasks(title, type, conservation_point:conservation_points(name))')
          .eq('company_id', companyId)
          .gte('completed_at', startISO)
          .order('completed_at'),
        supabase
          .from('shift_seals')
          .select('opened_at, closed_at, attestation, notes')
          .eq('company_id', companyId)
          .gte('closed_at', startISO)
          .order('closed_at'),
      ])
      for (const r of [companyRes, readingsRes, tcRes, mcRes, sealsRes]) {
        if (r.error) throw r.error
      }

      const oggi = localDateKey()
      const rows: (string | number | null)[][] = [
        ['DOSSIER HACCP — registri del giorno'],
        ['Azienda', companyRes.data!.name],
        ['Data', oggi],
        [],
        ['REGISTRO TEMPERATURE'],
        ['Ora', 'Punto', 'Tipo', '°C', 'Verdetto', 'Metodo', 'Note'],
        ...readingsRes.data!.map(l => [
          new Date(l.recorded_at).toLocaleTimeString('it-IT'),
          l.conservation_point?.name ?? '',
          l.conservation_point?.type ?? '',
          l.temperature,
          verdictForPoint(l.conservation_point?.type ?? '', l.temperature) ?? 'n/d',
          l.method,
          l.notes,
        ]),
        [],
        ['MANSIONI SVOLTE'],
        ['Ora', 'Mansione', 'Chi', 'Storno', 'Note'],
        ...tcRes.data!.map(r => [
          new Date(r.completed_at).toLocaleTimeString('it-IT'),
          r.task?.name ?? '',
          r.completed_by_name,
          r.reverses_completion_id ? 'STORNO' : '',
          r.notes,
        ]),
        [],
        ['MANUTENZIONI & CONTROLLI'],
        ['Ora', 'Intervento', 'Punto', 'Chi', 'Storno', 'Note'],
        ...mcRes.data!
          .filter(r => r.maintenance_task?.type !== 'temperature')
          .map(r => [
            new Date(r.completed_at).toLocaleTimeString('it-IT'),
            r.maintenance_task?.title ?? '',
            r.maintenance_task?.conservation_point?.name ?? '',
            r.completed_by_name,
            r.reverses_completion_id ? 'STORNO' : '',
            r.completion_notes,
          ]),
        [],
        ['SIGILLI DI TURNO'],
        ['Apertura', 'Chiusura', 'Attestazione', 'Note'],
        ...sealsRes.data!.map(s => [
          new Date(s.opened_at).toLocaleTimeString('it-IT'),
          new Date(s.closed_at).toLocaleTimeString('it-IT'),
          s.attestation ? 'tutto registrato' : '',
          s.notes,
        ]),
      ]

      return {
        csv: toCsv(rows),
        letture: readingsRes.data!.length,
        mansioni: tcRes.data!.length,
        manutenzioni: mcRes.data!.filter(r => r.maintenance_task?.type !== 'temperature').length,
        sigilli: sealsRes.data!.length,
      }
    },
    onError: err => logger.error('generazione dossier fallita', err),
  })
}

/** Scarica il CSV (BOM per Excel italiano). */
export function scaricaDossier(dossier: DossierGiorno) {
  const blob = new Blob(['\uFEFF' + dossier.csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dossier_${localDateKey()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

#!/usr/bin/env node
/**
 * Verifica E2E dei flussi app (Oggi + Reparti) con l'UTENTE TEST — decisione
 * owner n.4 (2026-07-06): client ANON + login reale → RLS attiva, stesse
 * query dei hooks. Output: solo conteggi/strutture, niente dati personali.
 * Uso: npm run verify:flows (creato in CP8 per il port FU-002).
 */
import { createClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './lib/env.mjs'

const env = loadEnvLocal()
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY || !env.TEST_USER_EMAIL) {
  console.error('❌ Servono VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, TEST_USER_* in .env.local')
  process.exit(1)
}
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
  email: env.TEST_USER_EMAIL,
  password: env.TEST_USER_PASSWORD,
})
if (authErr) {
  console.error('❌ login test fallito:', authErr.message)
  process.exit(1)
}
console.log('✅ login utente test ok')

const { data: membership, error: mErr } = await supabase
  .from('company_members')
  .select('company_id, role, staff_id, staff:staff_id(name, department_assignments)')
  .eq('user_id', auth.user.id)
  .eq('is_active', true)
  .limit(1)
  .maybeSingle()
if (mErr || !membership) {
  console.error('❌ membership (query SessionProvider):', mErr?.message ?? 'nessuna riga')
  process.exit(1)
}
console.log('✅ membership:', membership.role, '· staff collegato:', !!membership.staff_id)
const companyId = membership.company_id

const start = new Date(); start.setHours(0, 0, 0, 0)
const end = new Date(); end.setHours(23, 59, 59, 999)
const startISO = start.toISOString()
const endISO = end.toISOString()

// --- stesse query di usePuntiOggi ---
const [punti, letture, taskTemp] = await Promise.all([
  supabase.from('conservation_points')
    .select('id, name, type, department_id, department:departments(id, name)')
    .eq('company_id', companyId).order('name'),
  supabase.from('temperature_readings')
    .select('id, conservation_point_id, temperature, recorded_at, recorded_by')
    .eq('company_id', companyId).gte('recorded_at', startISO)
    .order('recorded_at', { ascending: false }),
  supabase.from('maintenance_tasks')
    .select('id, conservation_point_id, next_due, status')
    .eq('company_id', companyId).eq('type', 'temperature')
    .in('status', ['scheduled', 'overdue', 'in_progress']).lte('next_due', endISO),
])
let fallito = false
for (const [nome, r] of [['punti', punti], ['letture oggi', letture], ['task temp due', taskTemp]]) {
  if (r.error) { console.error(`❌ ${nome}:`, r.error.message); fallito = true }
  else console.log(`✅ ${nome}: ${r.data.length} righe`)
}
if (fallito) process.exit(1)
if (punti.data.length) {
  console.log('   punti:', punti.data.map(p => `${p.name} [${p.type}] dep=${p.department?.name ?? '—'}`).join(' · '))
}

// --- stesse query di useOggi ---
const [mt, tasks, tc, mc, seals] = await Promise.all([
  supabase.from('maintenance_tasks')
    .select('id, title, type, status, next_due, conservation_point:conservation_points(id, name, department_id)')
    .eq('company_id', companyId).neq('type', 'temperature')
    .in('status', ['scheduled', 'overdue', 'in_progress']).lte('next_due', endISO),
  supabase.from('tasks')
    .select('id, name, frequency, status, next_due, department_id, assigned_to_staff_id, time_management')
    .eq('company_id', companyId).not('next_due', 'is', null).lte('next_due', endISO),
  supabase.from('task_completions')
    .select('id, task_id, completed_at, completed_by, completed_by_name, period_start, period_end, reverses_completion_id, task:tasks(name)')
    .eq('company_id', companyId).gte('period_end', startISO).lte('period_start', endISO),
  supabase.from('maintenance_completions')
    .select('id, maintenance_task_id, completed_at, completed_by, reverses_completion_id, maintenance_task:maintenance_tasks(title, type, conservation_point:conservation_points(name))')
    .eq('company_id', companyId).gte('completed_at', startISO),
  supabase.from('shift_seals')
    .select('id, opened_at, closed_at')
    .eq('company_id', companyId).eq('user_id', auth.user.id).gte('closed_at', startISO),
])
for (const [nome, r] of [
  ['manutenzioni due', mt],
  ['mansioni due', tasks],
  ['completamenti mansioni (finestra)', tc],
  ['completamenti manutenzioni oggi', mc],
  ['sigilli oggi (miei)', seals],
]) {
  if (r.error) { console.error(`❌ ${nome}:`, r.error.message); fallito = true }
  else console.log(`✅ ${nome}: ${r.data.length} righe`)
}
if (fallito) process.exit(1)
if (mt.data.length) console.log('   prima manutenzione:', mt.data[0].title, '@', mt.data[0].conservation_point?.name ?? '—')
if (tasks.data.length) console.log('   prima mansione:', tasks.data[0].name, `(${tasks.data[0].frequency})`)

// --- invariante dec. 1: l'UPDATE su una lettura DEVE essere rifiutato ---
if (letture.data.length > 0) {
  const { data: updData, error: updErr } = await supabase
    .from('temperature_readings')
    .update({ temperature: 99 })
    .eq('id', letture.data[0].id)
    .select()
  const respinto = updErr !== null || (updData?.length ?? 0) === 0
  console.log(respinto
    ? '✅ append-only regge: UPDATE lettura respinto'
    : '⚠️ ATTENZIONE: UPDATE lettura NON respinto!')
  if (!respinto) process.exitCode = 1
} else {
  console.log('ℹ️ nessuna lettura oggi: test append-only saltato')
}

await supabase.auth.signOut()
console.log('🎉 flussi app verificati (lettura sotto RLS)')

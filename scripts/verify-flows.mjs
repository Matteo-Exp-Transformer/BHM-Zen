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

// ============================================================================
// SCRITTURA (FU-009, autorizzata owner 2026-07-06): stesse insert dei hooks.
// Lascia righe PERMANENTI nei registri append-only (by design): attivare
// solo con --write. Flusso: registra → auto-complete → storno manutenzione
// (prova live del trigger 20260706070000) → spunta+storno mansione → timbro.
// ============================================================================
if (process.argv.includes('--write')) {
  console.log('\n--- E2E in scrittura (righe permanenti, marcate E2E) ---')
  const NOTA = 'E2E verify:flows'
  const nowISO = () => new Date().toISOString()

  // 1) registra temperatura sul primo punto (stessa insert di useRegistraLettura)
  const punto = punti.data[0]
  if (!punto) { console.error('❌ nessun punto di conservazione'); process.exit(1) }
  const { data: lettura, error: insErr } = await supabase
    .from('temperature_readings')
    .insert({
      company_id: companyId, conservation_point_id: punto.id,
      temperature: 4, method: 'digital_thermometer', notes: NOTA,
      recorded_at: nowISO(), recorded_by: auth.user.id,
    })
    .select('id').single()
  if (insErr) { console.error('❌ insert lettura:', insErr.message); process.exit(1) }
  console.log(`✅ lettura registrata su «${punto.name}»`)

  // 2) auto-complete del task temperatura del giorno (stessa logica del hook)
  const { data: tempTasks } = await supabase
    .from('maintenance_tasks')
    .select('id, next_due')
    .eq('company_id', companyId).eq('conservation_point_id', punto.id)
    .eq('type', 'temperature')
    .in('status', ['scheduled', 'overdue', 'in_progress']).lte('next_due', endISO)
  if (!tempTasks?.length) {
    console.log('ℹ️ nessun task temperatura in scadenza per questo punto: trigger-check saltato')
  } else {
    const tt = tempTasks[0]
    const { data: comp, error: compErr } = await supabase
      .from('maintenance_completions')
      .insert({
        maintenance_task_id: tt.id, company_id: companyId,
        completed_by: auth.user.id, completed_by_name: 'Utente test E2E',
        completed_at: nowISO(),
      })
      .select('id, completed_at').single()
    if (compErr) { console.error('❌ auto-complete:', compErr.message); process.exit(1) }
    const { data: dopo } = await supabase.from('maintenance_tasks')
      .select('next_due, last_completed').eq('id', tt.id).single()
    const avanzato = dopo && new Date(dopo.next_due) > new Date(tt.next_due)
    console.log(avanzato
      ? `✅ trigger completamento: next_due avanzata (${tt.next_due} → ${dopo.next_due})`
      : `⚠️ next_due NON avanzata (${tt.next_due} → ${dopo?.next_due})`)
    if (!avanzato) process.exitCode = 1

    // 3) STORNO manutenzione → il trigger storno-aware deve RIPORTARE il task esigibile
    const { error: stornoErr } = await supabase
      .from('maintenance_completions')
      .insert({
        maintenance_task_id: tt.id, company_id: companyId,
        completed_by: auth.user.id, completed_by_name: 'Utente test E2E',
        completed_at: nowISO(), completion_notes: NOTA,
        reverses_completion_id: comp.id,
      })
    if (stornoErr) { console.error('❌ storno manutenzione:', stornoErr.message); process.exit(1) }
    const { data: dopoStorno } = await supabase.from('maintenance_tasks')
      .select('next_due, last_completed').eq('id', tt.id).single()
    const tornato = dopoStorno &&
      new Date(dopoStorno.next_due) <= new Date(comp.completed_at)
    console.log(tornato
      ? `✅ trigger storno-aware: task di nuovo esigibile (next_due ${dopoStorno.next_due}, last_completed ${dopoStorno.last_completed ?? 'NULL'})`
      : `⚠️ storno NON ha riportato il task esigibile (next_due ${dopoStorno?.next_due})`)
    if (!tornato) process.exitCode = 1
  }

  // 4) spunta + storno di una mansione generica (stesse insert di useCompletaMansione/useStorna)
  const mansione = tasks.data[0]
  if (!mansione) {
    console.log('ℹ️ nessuna mansione in scadenza: spunta/storno mansione saltati')
  } else {
    const { data: tcRow, error: tcErr } = await supabase
      .from('task_completions')
      .insert({
        company_id: companyId, task_id: mansione.id,
        completed_by: auth.user.id, completed_by_name: 'Utente test E2E',
        period_start: startISO, period_end: endISO, notes: NOTA,
      })
      .select('id').single()
    if (tcErr) { console.error('❌ spunta mansione:', tcErr.message); process.exit(1) }
    console.log(`✅ mansione spuntata («${mansione.name}»)`)
    const { error: tsErr } = await supabase
      .from('task_completions')
      .insert({
        company_id: companyId, task_id: mansione.id,
        completed_by: auth.user.id, completed_by_name: 'Utente test E2E',
        period_start: startISO, period_end: endISO, notes: NOTA,
        reverses_completion_id: tcRow.id,
      })
    if (tsErr) { console.error('❌ storno mansione:', tsErr.message); process.exit(1) }
    // il filtro dell'app deve escludere ENTRAMBE le righe (annullata + annullo)
    const { data: tcAll } = await supabase
      .from('task_completions')
      .select('id, reverses_completion_id')
      .eq('company_id', companyId).eq('task_id', mansione.id)
      .gte('period_end', startISO).lte('period_start', endISO)
    const reversed = new Set(tcAll.map(r => r.reverses_completion_id).filter(Boolean))
    const validi = tcAll.filter(r => !r.reverses_completion_id && !reversed.has(r.id))
    const sparita = !validi.some(r => r.id === tcRow.id)
    console.log(sparita
      ? '✅ storno mansione: il completamento non conta più (torna «da fare»)'
      : '⚠️ il completamento stornato risulta ancora valido!')
    if (!sparita) process.exitCode = 1
  }

  // 5) timbro di fine turno (stessa insert di useTimbra)
  const { data: seal, error: sealErr } = await supabase
    .from('shift_seals')
    .insert({
      company_id: companyId, user_id: auth.user.id,
      opened_at: nowISO(), attestation: true, notes: NOTA,
    })
    .select('id, closed_at').single()
  if (sealErr) { console.error('❌ timbro:', sealErr.message); process.exit(1) }
  console.log(`✅ timbro impresso (chiuso alle ${seal.closed_at})`)

  // 6) invariante append-only anche sui registri appena scritti
  const { data: updSeal } = await supabase
    .from('shift_seals').update({ notes: 'manomesso' }).eq('id', seal.id).select()
  const sealRespinto = (updSeal?.length ?? 0) === 0
  console.log(sealRespinto
    ? '✅ append-only regge anche su shift_seals: UPDATE respinto'
    : '⚠️ ATTENZIONE: UPDATE su shift_seals NON respinto!')
  if (!sealRespinto) process.exitCode = 1
}

await supabase.auth.signOut()
console.log(process.argv.includes('--write')
  ? '🎉 flussi app verificati (lettura + SCRITTURA sotto RLS)'
  : '🎉 flussi app verificati (lettura sotto RLS)')

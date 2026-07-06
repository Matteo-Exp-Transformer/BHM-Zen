#!/usr/bin/env node
/**
 * Verifica completa pre-Fable: CLI Supabase + env + repo legacy raggiungibile.
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const legacyDefault = resolve(root, '..', 'BHM-v.2')

function run(label, cmd) {
  console.log(`\n--- ${label} ---`)
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit', shell: true })
    return true
  } catch {
    return false
  }
}

console.log('🔍 Verifica setup BHM-Zen per sessione Fable\n')

const cliOk = run('Supabase CLI', 'node scripts/verify-supabase-cli.mjs')
const envOk = existsSync(resolve(root, '.env.local'))
  ? run('Env + REST', 'node scripts/verify-supabase-env.mjs')
  : (console.log('\n⚠️  .env.local assente — salto verify:supabase-env (copia da .env.example)'), false)

const legacyPath = process.env.BHM_LEGACY_PATH || legacyDefault
const localMasterplan = resolve(root, 'docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md')
const legacyMasterplan = resolve(legacyPath, 'Production/Conoscenze_congelate/META/MASTERPLAN_RILANCIO_BHM_v2.md')
const masterplanOk = existsSync(localMasterplan) || existsSync(legacyMasterplan)
console.log(`\n--- Masterplan ---`)
console.log(
  masterplanOk
    ? `✅ ${existsSync(localMasterplan) ? 'docs/meta/ (locale)' : 'legacy'}`
    : `❌ Masterplan non trovato`
)

const allOk = cliOk && envOk && masterplanOk
console.log(allOk ? '\n🎉 Setup completo — Fable può partire\n' : '\n⚠️  Setup incompleto — vedi FABLE_AVVIO.md\n')
process.exit(allOk ? 0 : 1)

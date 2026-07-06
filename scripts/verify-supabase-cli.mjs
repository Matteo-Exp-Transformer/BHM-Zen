#!/usr/bin/env node
/**
 * Verifica che Supabase CLI sia installato, autenticato e collegato al progetto BHM.
 * Exit 0 = ok. Usato da Fable all'avvio (no MCP Supabase in quella sessione).
 */
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mergedEnv } from './lib/env.mjs'

const PROJECT_REF = 'hjteuounjwkadmsbsmdm'
const root = resolve(import.meta.dirname, '..')
// La CLI legge SUPABASE_DB_PASSWORD solo dall'ambiente → la carichiamo da .env.local
const env = mergedEnv()

function run(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env }).trim()
}

const checks = []

try {
  const version = run('supabase --version')
  checks.push({ name: 'CLI installata', ok: true, detail: version })
} catch {
  checks.push({
    name: 'CLI installata',
    ok: false,
    detail: 'Installa: npm i -g supabase oppure scoop/choco',
  })
  printAndExit(checks)
}

try {
  run('supabase projects list')
  checks.push({ name: 'CLI autenticata', ok: true, detail: 'supabase login attivo' })
} catch (e) {
  checks.push({
    name: 'CLI autenticata',
    ok: false,
    detail: 'Esegui: supabase login',
  })
}

const refFile = resolve(root, 'supabase/.temp/project-ref')
if (existsSync(refFile)) {
  const linked = readFileSync(refFile, 'utf8').trim()
  checks.push({
    name: 'Progetto linkato',
    ok: linked === PROJECT_REF,
    detail: linked === PROJECT_REF ? linked : `atteso ${PROJECT_REF}, trovato ${linked}`,
  })
} else {
  checks.push({
    name: 'Progetto linkato',
    ok: false,
    detail: `Esegui: npm run supabase:link (ref ${PROJECT_REF})`,
  })
}

try {
  const out = run('supabase inspect db table-stats --linked')
  const hasCompanies = out.includes('public.companies')
  checks.push({
    name: 'Connessione DB remoto',
    ok: hasCompanies,
    detail: hasCompanies ? 'tabella public.companies visibile' : 'output inatteso',
  })
} catch (e) {
  checks.push({
    name: 'Connessione DB remoto',
    ok: false,
    detail: e.stderr?.toString() || e.message,
  })
}

printAndExit(checks)

function printAndExit(checks) {
  console.log('\n=== verify:supabase-cli ===\n')
  let allOk = true
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`${icon} ${c.name}: ${c.detail}`)
    if (!c.ok) allOk = false
  }
  console.log(allOk ? '\n✅ Supabase CLI pronta per Fable\n' : '\n❌ Correggi i punti sopra\n')
  process.exit(allOk ? 0 : 1)
}

#!/usr/bin/env node
/**
 * Verifica .env.local: chiavi Supabase + query REST di smoke test.
 * Richiede SUPABASE_SERVICE_KEY (bypass RLS per conteggio tabelle core).
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const envPath = resolve(root, '.env.local')

function loadEnv(path) {
  if (!existsSync(path)) return null
  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

const env = loadEnv(envPath)
const checks = []

if (!env) {
  console.error('❌ .env.local mancante — copia .env.example → .env.local')
  process.exit(1)
}

const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
const service = env.SUPABASE_SERVICE_KEY

checks.push({
  name: 'VITE_SUPABASE_URL',
  ok: !!url && url.includes('hjteuounjwkadmsbsmdm'),
  detail: url || 'mancante',
})
checks.push({
  name: 'VITE_SUPABASE_ANON_KEY',
  ok: !!anon && anon !== 'your_supabase_anon_key',
  detail: anon ? `${anon.slice(0, 20)}…` : 'mancante',
})
checks.push({
  name: 'SUPABASE_SERVICE_KEY',
  ok: !!service && service !== 'your_service_role_key',
  detail: service ? 'presente' : 'mancante',
})

async function queryTable(apiKey, table) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  })
  return { status: res.status, ok: res.ok, body: res.ok ? await res.json() : await res.text() }
}

if (url && service) {
  for (const table of ['companies', 'conservation_points', 'departments']) {
    try {
      const r = await queryTable(service, table)
      checks.push({
        name: `REST ${table}`,
        ok: r.ok,
        detail: r.ok ? `HTTP ${r.status}` : `HTTP ${r.status}: ${String(r.body).slice(0, 80)}`,
      })
    } catch (e) {
      checks.push({ name: `REST ${table}`, ok: false, detail: e.message })
    }
  }
}

console.log('\n=== verify:supabase-env ===\n')
let allOk = true
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.name}: ${c.detail}`)
  if (!c.ok) allOk = false
}
console.log(allOk ? '\n✅ Env + REST API ok\n' : '\n❌ Correggi .env.local\n')
process.exit(allOk ? 0 : 1)

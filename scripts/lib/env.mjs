/**
 * Loader condiviso per .env.local — usato dagli script verify/supabase.
 * La CLI Supabase legge SUPABASE_DB_PASSWORD solo dall'ambiente: qui la
 * carichiamo da .env.local così ogni script funziona in qualunque shell.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const root = resolve(import.meta.dirname, '..', '..')

export function loadEnvLocal() {
  const path = resolve(root, '.env.local')
  if (!existsSync(path)) return {}
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

/** Ambiente di processo + .env.local (senza sovrascrivere variabili già settate). */
export function mergedEnv() {
  const local = loadEnvLocal()
  return { ...local, ...process.env }
}

/** Connection string pooler (session mode) con password URL-encoded, o null. */
export function poolerDbUrl() {
  const env = mergedEnv()
  const pwd = env.SUPABASE_DB_PASSWORD
  if (!pwd) return null
  const poolerFile = resolve(root, 'supabase', '.temp', 'pooler-url')
  if (!existsSync(poolerFile)) return null
  const base = readFileSync(poolerFile, 'utf8').trim()
  // base: postgresql://postgres.<ref>@host:port/postgres → inserisce :password
  return base.replace('@', `:${encodeURIComponent(pwd)}@`)
}

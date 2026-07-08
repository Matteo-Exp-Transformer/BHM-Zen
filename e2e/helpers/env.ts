/**
 * Credenziali E2E da .env.local — stesso contratto di verify-flows.mjs.
 * Non committare .env.local; in CI passare TEST_USER_* come secret.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..', '..')

function loadEnvLocal(): Record<string, string> {
  const path = resolve(root, '.env.local')
  if (!existsSync(path)) return {}
  const env: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return env
}

const local = loadEnvLocal()

export const testUser = {
  email: process.env.TEST_USER_EMAIL ?? local.TEST_USER_EMAIL ?? '',
  password: process.env.TEST_USER_PASSWORD ?? local.TEST_USER_PASSWORD ?? '',
}

export function requireTestUser() {
  if (!testUser.email || !testUser.password) {
    throw new Error(
      'E2E: servono TEST_USER_EMAIL e TEST_USER_PASSWORD in .env.local (o env CI)',
    )
  }
  return testUser
}

export const dipendenteUser = {
  email: process.env.TEST_USER_DIPENDENTE_EMAIL ?? local.TEST_USER_DIPENDENTE_EMAIL ?? '',
  password:
    process.env.TEST_USER_DIPENDENTE_PASSWORD ?? local.TEST_USER_DIPENDENTE_PASSWORD ?? '',
}

export function requireDipendenteUser() {
  if (!dipendenteUser.email || !dipendenteUser.password) {
    throw new Error(
      'E2E ruoli: servono TEST_USER_DIPENDENTE_* in .env.local — crea l’utente con: node scripts/create-test-user.mjs --dipendente',
    )
  }
  return dipendenteUser
}

#!/usr/bin/env node
/**
 * Genera src/types/database.types.ts dallo schema live.
 * Usa --db-url (connessione diretta) perché l'account CLI corrente non ha
 * privilegi management API sul progetto (gen types --linked → 403).
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { poolerDbUrl, root } from './lib/env.mjs'

const dbUrl = poolerDbUrl()
if (!dbUrl) {
  console.error('❌ SUPABASE_DB_PASSWORD assente in .env.local (o pooler-url mancante in supabase/.temp/)')
  process.exit(1)
}

const res = spawnSync(
  'supabase',
  ['gen', 'types', 'typescript', '--db-url', dbUrl, '--schema', 'public'],
  { cwd: root, encoding: 'utf8', shell: true, maxBuffer: 32 * 1024 * 1024 },
)

if (res.status !== 0 || !res.stdout?.includes('export')) {
  console.error('❌ gen types fallito:')
  console.error((res.stderr || res.stdout || '').replaceAll(dbUrl, '<db-url>'))
  process.exit(1)
}

const outPath = resolve(root, 'src', 'types', 'database.types.ts')
mkdirSync(resolve(root, 'src', 'types'), { recursive: true })
writeFileSync(outPath, res.stdout, 'utf8')
console.log(`✅ Tipi generati: src/types/database.types.ts (${res.stdout.split('\n').length} righe)`)

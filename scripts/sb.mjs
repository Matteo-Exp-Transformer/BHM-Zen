#!/usr/bin/env node
/**
 * Wrapper CLI Supabase: carica .env.local (SUPABASE_DB_PASSWORD) e inoltra
 * gli argomenti a `supabase`. Uso: node scripts/sb.mjs db pull
 */
import { spawnSync } from 'node:child_process'
import { mergedEnv, root } from './lib/env.mjs'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Uso: node scripts/sb.mjs <argomenti supabase>')
  process.exit(2)
}

const res = spawnSync('supabase', args, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: mergedEnv(),
})
process.exit(res.status ?? 1)

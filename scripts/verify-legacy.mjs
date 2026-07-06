#!/usr/bin/env node
/**
 * Verifica che la repo legacy BHM-v.2 sia raggiungibile (path locale + masterplan + remote git).
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const legacyPath = process.env.BHM_LEGACY_PATH || resolve(root, '..', 'BHM-v.2')
const masterplanRel = 'Production/Conoscenze_congelate/META/MASTERPLAN_RILANCIO_BHM_v2.md'
const localMasterplan = resolve(root, 'docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md')

const checks = []

checks.push({
  name: 'Cartella legacy locale',
  ok: existsSync(legacyPath),
  detail: legacyPath,
})

checks.push({
  name: 'Masterplan legacy',
  ok: existsSync(resolve(legacyPath, masterplanRel)),
  detail: masterplanRel,
})

checks.push({
  name: 'Masterplan locale (docs/meta)',
  ok: existsSync(localMasterplan),
  detail: 'docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md',
})

try {
  const remotes = execSync('git remote -v', { cwd: root, encoding: 'utf8' })
  const hasLegacy = remotes.includes('legacy')
  checks.push({
    name: 'Remote git legacy',
    ok: hasLegacy,
    detail: hasLegacy ? 'legacy → BHM-v.2' : 'Esegui: git remote add legacy https://github.com/Matteo-Exp-Transformer/BHM-v.2.git',
  })
} catch (e) {
  checks.push({ name: 'Remote git legacy', ok: false, detail: e.message })
}

const hooksPath = resolve(legacyPath, 'src/hooks')
checks.push({
  name: 'Logica riusabile (src/hooks legacy)',
  ok: existsSync(hooksPath),
  detail: hooksPath,
})

console.log('\n=== verify:legacy ===\n')
let allOk = true
for (const c of checks) {
  const icon = c.ok ? '✅' : '❌'
  console.log(`${icon} ${c.name}: ${c.detail}`)
  if (!c.ok) allOk = false
}
console.log(allOk ? '\n✅ Legacy raggiungibile per Fable\n' : '\n❌ Legacy incompleto — vedi FABLE_AVVIO.md §1\n')
process.exit(allOk ? 0 : 1)

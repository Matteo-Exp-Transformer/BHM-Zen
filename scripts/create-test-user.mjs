#!/usr/bin/env node
/**
 * Crea (o ripara) l'utente di test E2E — autorizzato dall'owner (2026-07-06):
 * credenziali TEST_USER_* in .env.local, ruolo admin sulla prima company.
 * Idempotente: riusa l'utente se esiste già, aggiorna la membership se serve.
 */
import { loadEnvLocal } from './lib/env.mjs'

const env = loadEnvLocal()
const url = env.VITE_SUPABASE_URL
const service = env.SUPABASE_SERVICE_KEY
const email = env.TEST_USER_EMAIL
const password = env.TEST_USER_PASSWORD

if (!url || !service || !email || !password) {
  console.error('❌ Servono VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD in .env.local')
  process.exit(1)
}

const headers = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  'Content-Type': 'application/json',
}

async function api(path, options = {}) {
  const res = await fetch(`${url}${path}`, { headers, ...options })
  const body = await res.text()
  return { status: res.status, ok: res.ok, json: body ? JSON.parse(body) : null }
}

// 1) utente auth: crea, o recupera se esiste
let userId
const created = await api('/auth/v1/admin/users', {
  method: 'POST',
  body: JSON.stringify({ email, password, email_confirm: true }),
})
if (created.ok) {
  userId = created.json.id
  console.log(`✅ Utente test creato: ${email}`)
} else if (
  created.status === 422 ||
  /already/i.test(created.json?.msg ?? created.json?.message ?? '')
) {
  const list = await api(`/auth/v1/admin/users?page=1&per_page=100`)
  const found = list.json?.users?.find(u => u.email === email)
  if (!found) {
    console.error('❌ Utente esistente ma non trovato nella lista:', created.json)
    process.exit(1)
  }
  userId = found.id
  // riallinea la password alle credenziali in .env.local
  await api(`/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ password, email_confirm: true }),
  })
  console.log(`✅ Utente test esistente riusato: ${email}`)
} else {
  console.error('❌ Creazione utente fallita:', created.status, created.json)
  process.exit(1)
}

// 2) prima company disponibile
const companies = await api('/rest/v1/companies?select=id,name&order=created_at.asc&limit=1')
const company = companies.json?.[0]
if (!company) {
  console.error('❌ Nessuna company nel DB — creala prima (onboarding)')
  process.exit(1)
}

// 3) membership admin attiva (idempotente)
const existing = await api(
  `/rest/v1/company_members?user_id=eq.${userId}&company_id=eq.${company.id}&select=id,role,is_active`,
)
if (existing.json?.length) {
  await api(`/rest/v1/company_members?id=eq.${existing.json[0].id}`, {
    method: 'PATCH',
    body: JSON.stringify({ role: 'admin', is_active: true }),
  })
  console.log(`✅ Membership aggiornata: admin @ ${company.name}`)
} else {
  const ins = await api('/rest/v1/company_members', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      company_id: company.id,
      role: 'admin',
      is_active: true,
    }),
  })
  if (!ins.ok) {
    console.error('❌ Insert membership fallita:', ins.status, ins.json)
    process.exit(1)
  }
  console.log(`✅ Membership creata: admin @ ${company.name}`)
}

console.log('🎉 Utente test pronto per il login')

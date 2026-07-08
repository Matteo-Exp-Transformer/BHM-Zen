#!/usr/bin/env node
/**
 * Verifica FU-001 — flusso inviti sul DB live (autorizzato owner 08-07-26).
 *
 * Percorso A (email): crea token come admin (RLS is_admin) e invoca la edge
 *   function `send-invite-email` → parte una MAIL VERA a INVITE_TEST_EMAIL
 *   (mettila in .env.local: una TUA inbox vera — il click sul link è il test
 *   manuale). GoTrue valida i domini: indirizzi finti vengono rifiutati.
 *   Senza INVITE_TEST_EMAIL fa solo il ping di raggiungibilità della function.
 *   Gli artefatti restano apposta: utente auth «invitato» + token pendente.
 *   `--cleanup` li rimuove quando il test manuale è finito.
 * Percorso B (link manuale, nessuna email): token → utente creato via admin
 *   API (GoTrue valida i domini sul signUp pubblico, quindi qui si simula) →
 *   login → claim come SessionProvider (membership + used_at). Tutto ripulito.
 *
 * Flag: --no-email (salta A) · --cleanup (rimuove artefatti A e esce)
 */
import { loadEnvLocal } from './lib/env.mjs'

const env = loadEnvLocal()
const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
const service = env.SUPABASE_SERVICE_KEY
const adminEmail = env.TEST_USER_EMAIL
const adminPassword = env.TEST_USER_PASSWORD
const baseUrl = env.BASE_URL || 'http://localhost:3000'

if (!url || !anon || !service || !adminEmail || !adminPassword) {
  console.error('❌ Servono VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD in .env.local')
  process.exit(1)
}

const emailA = env.INVITE_TEST_EMAIL || null
const emailB = adminEmail.replace('@', '+invito2@')
const skipEmail = process.argv.includes('--no-email')
const soloCleanup = process.argv.includes('--cleanup')

let failures = 0
const ok = msg => console.log(`✅ ${msg}`)
const ko = msg => {
  failures++
  console.error(`❌ ${msg}`)
}

async function rest(path, { jwt, headers: extraHeaders, ...options } = {}) {
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: jwt ? anon : service,
      Authorization: `Bearer ${jwt ?? service}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(extraHeaders ?? {}),
    },
  })
  const body = await res.text()
  let json = null
  try {
    json = body ? JSON.parse(body) : null
  } catch {
    json = body
  }
  return { status: res.status, ok: res.ok, json }
}

async function login(email, password) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  return res.ok ? json : null
}

async function trovaUtente(email) {
  const res = await rest('/auth/v1/admin/users?page=1&per_page=100')
  return res.json?.users?.find(u => u.email === email) ?? null
}

async function rimuoviArtefatti(email) {
  const user = await trovaUtente(email)
  if (user) {
    await rest(`/rest/v1/company_members?user_id=eq.${user.id}`, { method: 'DELETE' })
    await rest(`/rest/v1/user_sessions?user_id=eq.${user.id}`, { method: 'DELETE' })
    await rest(`/auth/v1/admin/users/${user.id}`, { method: 'DELETE' })
  }
  await rest(`/rest/v1/invite_tokens?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE' })
  return !!user
}

if (soloCleanup) {
  if (!emailA) {
    console.error('❌ --cleanup richiede INVITE_TEST_EMAIL in .env.local')
    process.exit(1)
  }
  const c = await rimuoviArtefatti(emailA)
  ok(`Cleanup percorso A: token rimossi${c ? ' + utente invitato eliminato' : ' (nessun utente da eliminare)'}`)
  process.exit(0)
}

// ── setup: login admin + company ─────────────────────────────────────────────
const adminSession = await login(adminEmail, adminPassword)
if (!adminSession) {
  console.error('❌ Login admin test fallito — controlla TEST_USER_* in .env.local')
  process.exit(1)
}
ok('Login admin test')
const adminJwt = adminSession.access_token

const companies = await rest('/rest/v1/companies?select=id,name&order=created_at.asc&limit=1', { jwt: adminJwt })
const company = companies.json?.[0]
if (!company) {
  console.error('❌ Nessuna company visibile')
  process.exit(1)
}

function nuovoInvito(email) {
  const expires = new Date()
  expires.setDate(expires.getDate() + 7)
  return {
    token: crypto.randomUUID(),
    email,
    company_id: company.id,
    role: 'dipendente',
    expires_at: expires.toISOString(),
  }
}

// ── percorso A: token (RLS is_admin) + email vera via edge function ─────────
if (skipEmail) {
  console.log('⏭️  Percorso A saltato (--no-email)')
} else if (!emailA) {
  // niente inbox vera configurata: solo ping di raggiungibilità della function
  const ping = await fetch(`${url}/functions/v1/send-invite-email`, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${adminJwt}`,
      'Content-Type': 'application/json',
      Origin: baseUrl,
    },
    body: JSON.stringify({
      inviteToken: { token: 'ping', email: 'ping@invalid.local', invite_link: baseUrl },
    }),
  })
  const pingJson = await ping.json().catch(() => null)
  if (/invalid|rate limit/i.test(JSON.stringify(pingJson))) {
    ok('Edge function attiva e collegata ad Auth (risposta attesa per email fittizia)')
    console.log('   ℹ️ Per il test email VERO: metti INVITE_TEST_EMAIL=tuo-indirizzo in .env.local e rilancia')
    if (/rate limit/i.test(JSON.stringify(pingJson)))
      console.log('   ⚠️ SMTP integrato Supabase: limite ~2-4 email/ora — per uso reale serve un SMTP custom')
  } else {
    ko(`Edge function non risponde come atteso: ${ping.status} ${JSON.stringify(pingJson)}`)
  }
} else {
  await rimuoviArtefatti(emailA) // run ripetibili
  const insA = await rest('/rest/v1/invite_tokens', {
    jwt: adminJwt,
    method: 'POST',
    body: JSON.stringify(nuovoInvito(emailA)),
  })
  if (!insA.ok) ko(`Creazione invito A (RLS is_admin): ${insA.status} ${JSON.stringify(insA.json)}`)
  else {
    const invitoA = insA.json[0]
    ok('Invito A creato come admin (RLS is_admin ok)')
    const fn = await fetch(`${url}/functions/v1/send-invite-email`, {
      method: 'POST',
      headers: {
        apikey: anon,
        Authorization: `Bearer ${adminJwt}`,
        'Content-Type': 'application/json',
        Origin: baseUrl,
      },
      body: JSON.stringify({
        inviteToken: { ...invitoA, invite_link: `${baseUrl}/accept-invite?token=${invitoA.token}` },
      }),
    })
    const fnJson = await fn.json().catch(() => null)
    if (fn.ok && fnJson?.success) {
      ok(`Email invito PARTITA a ${emailA} — controlla la inbox e clicca il link (test manuale)`)
      console.log(`   Link equivalente: ${baseUrl}/accept-invite?token=${invitoA.token}`)
      console.log('   ⚠️ Se il click atterra su un dominio sbagliato: Dashboard → Auth → URL Configuration')
    } else {
      ko(`Edge function send-invite-email: ${fn.status} ${JSON.stringify(fnJson)}`)
    }
  }
}

// ── percorso B: link manuale, zero email ─────────────────────────────────────
await rimuoviArtefatti(emailB)
const insB = await rest('/rest/v1/invite_tokens', {
  jwt: adminJwt,
  method: 'POST',
  body: JSON.stringify(nuovoInvito(emailB)),
})
if (!insB.ok) {
  ko(`Creazione invito B: ${insB.status} ${JSON.stringify(insB.json)}`)
} else {
  const invitoB = insB.json[0]
  ok('Invito B creato (percorso link manuale)')

  // validazione da anonimo (come fa la pagina /accept-invite senza sessione)
  const anonRead = await fetch(
    `${url}/rest/v1/invite_tokens?token=eq.${invitoB.token}&select=email,used_at,expires_at`,
    { headers: { apikey: anon, Authorization: `Bearer ${anon}` } },
  )
  const anonRows = await anonRead.json()
  if (anonRows?.length === 1) ok('Token leggibile da anonimo (validazione pagina invito)')
  else ko('Token NON leggibile da anonimo — la pagina invito non può validare')

  // account invitato: via admin API (il signUp pubblico è identico ma GoTrue
  // valida i domini — con una inbox vera lo fa la pagina /accept-invite)
  const pwdB = crypto.randomUUID() + 'Aa1!'
  const creaB = await rest('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email: emailB, password: pwdB, email_confirm: true }),
  })
  if (!creaB.ok) {
    ko(`Creazione account invitato: ${creaB.status} ${JSON.stringify(creaB.json)}`)
  } else {
    ok('Account invitato creato (equivale a signUp + conferma email)')
    const sessB = await login(emailB, pwdB)
    if (!sessB) ko('Login post-conferma fallito')
    else {
      ok('Login invitato ok')
      // claim come fa SessionProvider: membership + used_at (retrodatato: CHECK <= now())
      const member = await rest('/rest/v1/company_members', {
        jwt: sessB.access_token,
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({
          user_id: sessB.user.id,
          company_id: invitoB.company_id,
          role: invitoB.role,
          is_active: true,
        }),
      })
      if (!member.ok) ko(`Claim membership: ${member.status} ${JSON.stringify(member.json)}`)
      else ok(`Membership creata: ${invitoB.role} @ ${company.name}`)

      const used = await rest(`/rest/v1/invite_tokens?id=eq.${invitoB.id}`, {
        jwt: sessB.access_token,
        method: 'PATCH',
        body: JSON.stringify({ used_at: new Date(Date.now() - 60_000).toISOString() }),
      })
      if (used.ok && used.json?.[0]?.used_at) ok('Token marcato usato dal claim')
      else ko(`used_at non aggiornato: ${used.status} ${JSON.stringify(used.json)}`)

      // il membro vede la propria membership (quello che fa SessionProvider)
      const check = await rest(
        `/rest/v1/company_members?user_id=eq.${sessB.user.id}&select=role,is_active`,
        { jwt: sessB.access_token },
      )
      if (check.json?.[0]?.role === 'dipendente') ok('SessionProvider vedrà la membership → app pronta')
      else ko('Membership non visibile al nuovo utente')
    }
  }

  // pulizia percorso B (l'invitato B è solo di test)
  await rimuoviArtefatti(emailB)
  ok('Pulizia percorso B completata (utente, membership, token rimossi)')
}

console.log(failures === 0 ? '\n🎉 Flusso inviti verificato' : `\n💥 ${failures} verifiche fallite`)
process.exit(failures === 0 ? 0 : 1)

# Report — Esecuzione: inviti staff (FU-001) + onboarding cantiere (FU-013) + modal v2

> **Data**: 08-07-2026 (pomeriggio, stessa sessione della blindatura) · **Profilo**: Esecuzione
> **Mandato owner**: «fai commit lavoro svolto. poi prosegui: sistemiamo inviti (dimmi cosa
> disattivare per disabilitare email dopo test) · priorità onboarding (guidata, ripetibile,
> pre-compilata, schermo intero) · modal: 2 colonne su tablet/desktop + scrollbar integrata».
> Commit blindatura eseguiti a inizio sessione: `7402694` (feat regia) · `4636162` (test) · `df5c9d9` (docs).

---

## 1 · FU-001 — Inviti staff, chiusi

### Architettura (♻️ logica dal legacy `inviteService.ts`, riscritta per Zen)

- **`src/features/auth/invites.ts`** — token in `invite_tokens` (RLS baseline: crea solo
  `is_admin`; validazione/claim aperti), email OPZIONALE via edge function `send-invite-email`
  (già ACTIVE sul remoto, nessun deploy fatto). Timestamp `used_at` retrodatato 1′
  (pattern clock-skew di ERRORI_PROCESSO).
- **`/accept-invite`** (`AcceptInvitePage.tsx`) — due strade, stesso esito:
  - **A (email)**: il link Supabase apre la pagina con sessione già attiva → si imposta la
    password (`updateUser`) → claim. Un token «già usato» dal claim automatico resta valido
    per chi arriva con la sessione giusta (niente vicolo cieco).
  - **B (link condiviso a mano)**: `signUp` con password; con conferma email attiva il claim
    avviene al primo login. Sessione di un ALTRO account aperta → si chiede di uscire prima.
- **Claim al login** — `SessionProvider`: sessione senza membership → cerca invito pendente
  per la propria email (policy «Anyone can view own invite») → membership + `user_sessions`
  + token usato (upsert idempotenti sui vincoli unique verificati in baseline).
- **Regia → Staff → tocca la persona** — blocco «Accesso all'app»: *Invita nell'app*
  (crea token, tenta l'email se attive, copia il link negli appunti), invito attivo con
  scadenza + *Copia link* / *Annulla invito*. Solo il titolare (`role === 'admin'`, coerente
  con la RLS); per email mancante la UI lo dice.

### Verifica live — `npm run verify:invite` (script nuovo, tutto verde)

login admin → invito con RLS `is_admin` → function attiva e collegata ad Auth → token
leggibile da anonimo (validazione pagina) → account invitato → login → claim membership →
token usato → membership visibile al nuovo utente → **pulizia completa** (utente, membership,
token rimossi — sul live non resta nulla del percorso B).

Scoperte live: **GoTrue valida i domini email** (i domini finti tipo `…@t.com` vengono
rifiutati su signup/invito → per il test email serve `INVITE_TEST_EMAIL` vera);
**SMTP integrato = rate limit ~2-4 email/ora** → FU-017 (SMTP custom prima dell'uso reale).

### 🔌 Come disattivare le email (richiesta owner)

| Cosa | Dove | Effetto |
|------|------|---------|
| `VITE_INVITE_EMAIL_ENABLED=false` | `.env.local` (riavvia `npm run dev`) | **Il kill-switch.** L'app non chiama più la edge function: l'invito genera solo il link da condividere (WhatsApp, a voce…). La UI lo dice: «Le email sono spente». |
| Conferma email OFF (facoltativo) | Dashboard → Authentication → Sign In/Up → Email → «Confirm email» | Col percorso link-manuale l'invitato entra subito dopo il signUp, senza NESSUNA email di conferma. Con conferma ON, invece, il signUp manda comunque una mail. |
| Niente da toccare lato server | — | La function `send-invite-email` resta ACTIVE ma non viene chiamata da nessuno. Eliminarla non serve. |

Riattivare = rimettere `true` (o rimuovere la riga).

## 2 · Onboarding «cantiere» (FU-013, priorità owner)

**`/onboarding`** — full-screen fuori dalla shell, dal mockup 05 v2:

- **Rail-cantiere** collassabile (pallini ↔ pannello con brand, barra progresso «N di 7»,
  passi navigabili, anteprima «La tua azienda»: chip reparti, avatar staff, punti con
  temperatura). Su mobile è la striscia in alto.
- **7 passi** (ordine mappa legacy): Anagrafica → Reparti → Staff → Punti → Attività &
  manutenzioni → Inventario → Calendario. Dipendenze reali: senza reparti niente staff/punti,
  senza punti niente attività.
- **Ripetibile** (owner): ogni passo legge il DB vivo → riaprendo il cantiere è tutto già
  compilato e modificabile a schermo intero. Card «La tua azienda» in Regia lo riapre.
- **Gate d'avvio**: titolare + azienda vuota (0 reparti) + cantiere mai chiuso → si parte
  da `/onboarding` (mockup: obbligatorio, senza «salta»). Un'azienda già viva NON viene
  dirottata (Al Ritrovo entra normale; gli e2e non lo vedono mai).
- **Passo 4** — temperatura MAI digitata: `suggestedSetpointForType` (spostata nel ponte
  `point-verdict.ts`, riusata da StrutturaSheet, con unit test) la deriva dal LOCK, pill
  «derivata dalle regole HACCP» + range atteso. **Profili frigo legacy NON portati**: le loro
  temperature (2/3/1 °C) sono numeri HACCP che oggi non stanno nella fonte-unica → FU-005.
- **Passo 5** — copertura manutenzioni obbligatorie per punto (set per tipo dalla mappa:
  frigo/freezer 4 · ambiente 2 · abbattitore 1) con «Genera le N mancanti» (batch su
  `maintenance_tasks`, valori conformi ai CHECK live) + creazione mansioni ricorrenti
  (`tasks`: nome, frequenza, ruolo, reparto). Le vivono Calendario e Oggi.
- **Passo 6** — recap onesto: prodotti/categorie contati; il carico prodotti è la cascata
  (FU-014), il passo non blocca la chiusura.
- **Passo 7** — anno lavorativo + giorni apertura (`company_calendar_settings`, upsert su
  vincolo `company_id`) e **«Chiudi il cantiere»** → `companies.onboarding_completed = true`.

## 3 · Modal v2 (fix A + B owner)

- **A** — `Sheet.tsx`: corpo scrollabile; su tablet/desktop pannello più largo (680px),
  contenuto a **2 colonne** (h3/p/bottoni a tutta riga) e **font ~6% più grande** (`zoom`),
  **mobile invariato**. `layout="stretto"` per i gesti focalizzati: keypad temperatura e
  timbro fine-turno restano a colonna singola. Ritocchi mirati: staff (elenco | aggiungi),
  struttura (reparti | punti), parametri HACCP (regole su 2 colonne).
- **B** — scrollbar dei modal integrata: sottile (6px), senza binario, colore dall'inchiostro
  del tema, raggio pieno — CSS in `index.css` scopato su `[role="dialog"]`, vale per ogni
  area scrollabile presente e futura dentro un dialog.

## 4 · Gate

| Gate | Esito |
|------|-------|
| `npm run validate` | ✅ lint 0 · tsc ok · **58/58 unit** (+2 `suggestedSetpointForType`) |
| `npm run test:e2e` | ✅ **10/10** (+1: onboarding pre-compilato + temperatura dal LOCK) |
| `npm run verify:invite` | ✅ tutto verde, pulizia completa |

## 5 · Derivazione errori (→ ERRORI_PROCESSO)

- **GoTrue rifiuta i domini email finti** su signup/invito (gli utenti test creati via admin
  API passano, i flussi pubblici no) — vincolo strutturale, loggato.
- **Spread di `options` dopo `headers` composti** in uno script fetch: gli header custom
  sovrascrivevano l'apikey (401 fuorviante) — errore agente, corretto destrutturando.
- Strict-mode Playwright: sub-stringa presente in due nodi → `{ exact: true }` (variante del
  pattern già loggato l'08-07).

## 6 · Cosa resta (in ordine)

1. **Test email inviti con inbox vera** (passo TUO: FU-017 — `INVITE_TEST_EMAIL` + `npm run verify:invite`).
2. **FU-014 cascata** (mockup 03) — il carico prodotti che completa il passo 6.
3. **FU-005 profili frigo** nella fonte-unica (change-control) → passo 4 passa ai profili.
4. FU-015 mansione Inventario · FU-016 hardening RLS legacy · FU-010 realtime · residui FU-012.

## File toccati

`src/features/auth/invites.ts`* · `src/features/auth/AcceptInvitePage.tsx`* ·
`src/features/onboarding/{hooks.ts,OnboardingPage.tsx}`* · `src/lib/auth/SessionProvider.tsx` ·
`src/App.tsx` · `src/features/regia/{RegiaPage.tsx,StrutturaSheet.tsx}` ·
`src/components/ui/Sheet.tsx` · `src/features/reparti/KeypadSheet.tsx` ·
`src/features/oggi/OggiPage.tsx` · `src/compliance/point-verdict.{ts,test.ts}` ·
`src/index.css` · `e2e/smoke.spec.ts` · `scripts/verify-invite.mjs`* · `package.json` ·
`.env.example` (+ `.env.local` non committato) · docs (FOLLOW_UP, CHECKPOINT, SESSION_LOG,
HEALTH_CHECK, REGIA_SKILL, TESTING_SKILL, ERRORI_PROCESSO). `*` = nuovo.

---

*Report scritto da Fable (Esecuzione) — 08-07-2026, pomeriggio.*

# Prompt di ripresa — sessione Fable BHM-Zen (auto-contenuto)

> Incolla il testo sotto come primo messaggio della nuova sessione Fable.
> Aggiorna solo la riga «Prossimo lavoro» se il checkpoint è avanzato nel frattempo.

---

Riprendi il lavoro di Fable su BHM-Zen (PWA HACCP, rilancio da masterplan). Sei il proprietario
tecnico: decidi tu ordine di lavoro e scelte tecniche dentro lo scope; non chiedermi
autorizzazioni salvo ambiguità bloccanti (falle tutte insieme, subito) o scritture sul DB.

**Bootstrap obbligatorio (in ordine):**
1. `npm run verify:setup` → deve uscire 0.
2. Leggi `docs/FABLE_CHECKPOINT.md` + `git log --oneline -20` → stato e prossimo passo.
3. Carica la bussola `docs/skill-system/00_BUSSOLA_SKILL.md` (profili, routing, LOCK, RULE).
4. Riferimenti rapidi: `docs/guide/SCOPE_PRODOTTO_BETA.md` (cosa è dentro/fuori) e
   `docs/guide/PRATICHE_INGEGNERIA.md` (come si lavora). Revisione critica + rischi aperti:
   `docs/meta/REVISIONE_FONDAMENTA_2026-07-06.md`.

**Stato al 2026-07-06 (CP8):** ws1-3 completi + **Oggi e Reparti PORTATE e vive** contro il DB
live sotto RLS — diario card-focus (spunta mansioni/manutenzioni, STORNO append-only mansioni,
timbro `shift_seals` con sigillo), Reparti (schematico marker-verdetto, tastierone da guanti,
auto-complete task temperatura), tab nome-reparto reale. Verdetto SOLO da
`src/compliance/point-verdict.ts` → `haccp-rules.ts` (LOCK). `npm run verify:flows` = E2E
lettura con utente test. 10 migration applicate + **1 DRAFT NON applicata**
(`20260706070000` trigger storno-aware manutenzioni). `npm run validate` verde (29 test).
Branch: `init/fondamenta` avanti di 4+ commit sull'origin (push da autorizzare).

**Prossimo lavoro (in ordine, da FOLLOW_UP.md):**
- **FU-008**: chiedere ok owner → `db push` della migration storno-trigger (dry-run prima),
  poi abilitare storno manutenzioni in UI (`useOggi`/OggiPage).
- **FU-009**: E2E in scrittura con utente test (registra → auto-complete → spunta → storno →
  timbro; righe permanenti nei registri: serve ok owner) — estendere `verify:flows`.
- **FU-001 residuo**: inviti staff (nasce con Regia) + icone PWA.
- **Prossima casa: Scorte** (mockup 07 = verità visiva; 4 RPC shopping già live da CP5;
  mappa `MAPPA_Scorte_inventory-shopping.md`; dec. 12 mansione «Inventario»).

**Vincoli duri (non negoziabili):**
- Scrivi solo in BHM-Zen; `../BHM-v.2` è read-only (cherry-pick di logica, MAI componenti UI).
- NO MCP Supabase: solo CLI + script npm (`scripts/sb.mjs` carica la password da `.env.local`).
- DB unico = trattalo da PROD: ogni `db push` → dry-run + **autorizzazione esplicita owner**
  (il classificatore permessi lo blocca comunque). Docker Desktop deve essere attivo per `db pull`.
- Numeri HACCP solo in `src/compliance/haccp-rules.ts` via Change-Control §14.3; gate-2 mai saltato.
- Registri append-only: annullare = riga di storno, mai UPDATE/DELETE.
- UI nuova dai mockup §13 (clinico-caldo, colore=verdetto, tempo=calma §13.6).

**Trappole ambiente note:** account CLI ≠ account progetto (management API 403 → tutto via
connessione diretta, `npm run supabase:types` già configurato); non troncare l'output di comandi
CLI lunghi con `Select-Object -First` (uccide il processo a metà).

**Chiusura di ogni milestone:** commit conventional + aggiorna `docs/FABLE_CHECKPOINT.md` +
ff `integrazione`; a fine sessione report secondo
`docs/skill-system/comunicazione/CHIUSURA_SESSIONE.md` (modalità per peso task, bussola §6).

---

**Ultimo aggiornamento**: 2026-07-06 · aggiornato in chiusura CP8 (port Oggi+Reparti) · → `Report-port-fu002-fable.md`

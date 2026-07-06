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

**Stato al 2026-07-06 (CP6):** workstream 1–3 masterplan completi — ambiente sbloccato, baseline
schema live + tipi, skill-system §14.5 installato, app scaffoldata (Vite 6/React 18/TS strict,
gira su :3000), `haccp-rules.ts` LOCK con gate-2 (14 test), 9 migration applicate sul DB live
(append-only+storno, shift_seals, RPC shopping, realtime, RLS hardening). Branch:
`init/fondamenta` = `integrazione`, protetti. `npm run validate` = gate, verde.

**Prossimo lavoro (in ordine, da FOLLOW_UP.md):**
- **FU-001**: shell di navigazione dai mockup (`docs/meta/MOCKUP_UI/06_NAVIGAZIONE_shell.html` =
  verità visiva: bottom tab mobile → side-rail desktop, barra che si trasforma col ruolo, tab
  centrale dinamica) + auth base solo-invito (valuta se Supabase Auth basta: perplessità n.8
  della revisione — NON portare ciecamente il CSRF custom legacy).
- **FU-002**: port hooks/services legacy contro lo schema nuovo, seguendo i verdetti ♻️/✍️/🗑️
  delle 5 mappe (`docs/meta/MAPPATURA_AREE/`); include lo STORNO (chiude FU-007).

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

**Ultimo aggiornamento**: 2026-07-06 · creato in chiusura sessione fondamenta · → `Report-fondamenta-fable.md`

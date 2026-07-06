# Report — Port FU-002: Oggi + Reparti contro lo schema nuovo (CP8)

**Data:** 2026-07-06 · **Sessione:** Fable (ripresa dopo interruzione per limite) · **Modalità:** DEEP
(trigger: registri append-only + più view nuove + zona LOCK compliance + flussi identità in sessione)

---

## 1. Cappello

- **Cosa è cambiato:** le prime due case sono VIVE — «Oggi» è un diario vero (cose da fare ora,
  spunta, storno, timbro di fine turno) e «Reparti» mostra i punti di conservazione con la
  temperatura che atterra col verdetto-colore. Tutto contro il DB live, sotto RLS.
- **Cosa resta:** storno manutenzioni (migration draft pronta, serve tuo ok al push) · E2E in
  scrittura con l'utente test (serve tuo ok) · inviti staff + icone PWA (FU-001 residuo) ·
  realtime (dec. 11, il floor refetch-on-focus è attivo) · push dei branch.
- **Serve una tua azione:** sì — 3 domande in fondo (push migration, E2E scrittura, push branch).

## 2. Cosa è stato fatto (in linguaggio utente)

1. **Ripresa e messa in sicurezza**: la sessione precedente si era interrotta a metà del port.
   Ho verificato cosa c'era su disco, sistemato 5 errori che bloccavano il gate (1 lint + 4 tipi)
   e committato subito un checkpoint di sicurezza (`2201036`) — niente lavoro a rischio.
2. **Apri l'app → «Oggi»**: vedi il tuo diario. In alto un nastro gentile ti dice se un frigo
   non è ancora stato controllato. Le card sono in tre sezioni: **Ora** (temperature che
   aspettano, card-eroe), **A breve** (mansioni e manutenzioni del giorno, con «arretrata» se
   scadute), **Fatto** (letture col verdetto, completamenti con l'orario).
3. **Spunti una mansione → puoi ripensarci**: sulla card fatta c'è un gesto discreto di annullo.
   Non cancella niente: scrive una **riga di storno** e la mansione torna tra le cose da fare
   (dec. 1 — la prova resta, la storia si corregge a testa alta).
4. **Timbri il turno**: bottone tratteggiato in fondo → conferma con attestazione e voce per le
   eccezioni («qualcosa non registrato? scrivilo qui») → il sigillo si imprime, la lista si
   acquieta, «Il tuo l'hai fatto». Più timbri nello stesso giorno = turni spezzati, ognuno col
   suo sigillo. Se devi aggiungere qualcosa dopo, riapri senza cancellare nulla.
5. **«Reparti»**: switcher del reparto (se ne hai più d'uno), schematico dei punti con
   marker-verdetto (verde/ambra/rosso, terracotta pulsante = da controllare), card per ogni
   punto col range atteso **dalla fonte-unica HACCP** e il tastierone da guanti: il numero
   atterra col colore, il sussurro dice il range, la card si aggiorna.
6. **Registri una temperatura → il task del giorno si chiude da solo** (auto-completamento,
   come nel legacy ma senza il bug che lo bloccava da mesi — le colonne mancanti erano già
   state aggiunte in CP5).
7. **La tab centrale ora ha il nome vero**: un dipendente con un solo reparto assegnato vede
   «Cucina», non «Reparti» (resto FU-001).
8. **Guardia sul trigger delle manutenzioni**: ho scoperto che il trigger live ricalcola la
   scadenza su OGNI insert — una riga di storno l'avrebbe corrotta. Migration correttiva
   pronta (`20260706070000`), **NON applicata**: finché non la autorizzi, lo storno in UI c'è
   solo per le mansioni generiche (che non hanno trigger).
9. **Verifica sotto RLS con l'utente test** (`npm run verify:flows`, nuovo script della
   famiglia verify): login reale, stesse query dei hooks → 7 punti (Cucina), 10 task
   temperatura in scadenza, 10 manutenzioni, 5 mansioni. Tutti gli embed FK funzionano.

## 3. File toccati e perché

| File | Perché |
|------|--------|
| `src/lib/dates.ts` (+test) | date locali Italia (RULE timezone) + periodo-per-frequenza (♻️ legacy) |
| `src/compliance/point-verdict.ts` (+test) | ponte punto→regola: il verdetto legge SOLO da `haccp-rules.ts` (LOCK §14.3), zero numeri fuori |
| `src/lib/auth/session.ts` · `SessionProvider.tsx` | sessione estesa: staff collegato, nome da mostrare, reparti assegnati |
| `src/components/ui/Sheet.tsx` · `Toast.tsx` · `VerdictChip.tsx` | primitive UI dei mockup (foglio dal fondo, pillola-voce, chip-verdetto) |
| `src/components/icons.tsx` | icone tipi-punto e gesti (stroke, mai emoji — §13) |
| `src/index.css` | keyframes canonici §13.5 (atterraggio, pop, timbro) con guardia reduced-motion |
| `src/features/reparti/hooks.ts` | punti+letture di oggi, registra append-only con auto-complete (♻️ `useTemperatureReadings`) |
| `src/features/reparti/KeypadSheet.tsx` | tastierone da guanti — gesto-firma 🌡️ riusato da entrambe le lenti |
| `src/features/reparti/RepartiPage.tsx` | schermata Reparti (mockup 02): schematico, card, switcher |
| `src/features/oggi/hooks.ts` | aggregazione diario (♻️ ridotto da `useAggregatedEvents` 770 righe → ~390 col solo necessario), completa/storna/timbra |
| `src/features/oggi/OggiPage.tsx` | schermata Oggi (mockup 01): sezioni, ribbon, storno, sigillo |
| `src/components/shell/AppShell.tsx` | tab centrale col nome-reparto reale |
| `src/App.tsx` | route reali per Oggi e Reparti (via i placeholder) |
| `scripts/verify-flows.mjs` + `package.json` | verifica E2E lettura sotto RLS (utente test, decisione 4) |
| `supabase/migrations/20260706070000_storno_maintenance_trigger.sql` | **DRAFT non applicata** — trigger storno-aware |

## 4. Test eseguiti e risultato

- `npm run validate` → **verde**: lint 0 warning · typecheck pulito · **29/29 test**
  (14 haccp-rules gate-2 + 8 point-verdict + 7 date/periodi).
- `npm run build` → ok in 1.33s, PWA generata (5 entry precache).
- `npm run dev` → HTTP 200 su :3000 (avviato e fermato da me).
- `npm run verify:flows` → login utente test ok, membership admin, 8 query dei hooks tutte ok
  sotto RLS (conteggi sopra). Test append-only sull'UPDATE saltato: zero letture nel registro
  (il write-path E2E aspetta il tuo ok).

## 5. File di skill aggiornati (tabella obbligatoria)

| File | Modifica | Perché |
|------|----------|--------|
| `aree/REPARTI_SKILL.md` | §5 questioni aperte + §7 + footer | 015 applicata (CP5), port fatto (CP8), realtime→FU-010; entry point ora esiste |
| `aree/OGGI_SKILL.md` | §5 questioni aperte + footer | shift_seals esiste ed è usata; storno implementato; `[END_DATE:]` e realtime restano FU |
| `comunicazione/IDEE_ESPERIENZA.md` | +2 voci 💡 | mappa che impara le posizioni; sigilli multipli come ceralacca |
| `sessioni/FOLLOW_UP.md` | FU-001/002/007 aggiornati; +FU-008/009/010 | stato reale post-CP8 |
| `docs/FABLE_CHECKPOINT.md` | riga CP8 + «Dove sono» | filo di Arianna |
| `sessioni/06-07-26/PROMPT_RIPRESA_FABLE.md` | riga «Prossimo lavoro» | punta al residuo (FU-008/009, Scorte/Regia) |
| questo report | nuovo | chiusura deep |

## 6. Dati comunicazione

- **Prompt ricorrenti:** ripresa-da-checkpoint (2ª volta oggi: «leggi contesto e parti da…»,
  poi «fai checkpoint… guarda cosa ha già fatto e riprendi») — il pattern «filo di Arianna»
  funziona: PROMPT_RIPRESA + FABLE_CHECKPOINT + git log sono bastati a riprendere senza
  perdere nulla.
- **Formato che ha funzionato:** l'owner incolla l'ultimo pezzo della chat interrotta — utile
  come conferma, ma il confronto con `git status` + file su disco è stato la verità.
- **Liv.2 applicate:** nessuna voce di vocabolario invocata esplicitamente in sessione.
- **Automatizzabile:** il «checkpoint di sicurezza a metà lavoro» (commit WIP appena il gate è
  verde) — da fare sempre quando il lavoro supera ~10 file, senza aspettare la milestone.

## 7. Analisi flusso prompt, efficienza e statistiche

- **Prompt sostanziali:** 2 (ripresa iniziale · «fai checkpoint + riprendi»). **Correzioni
  dopo la 1ª risposta:** 0. **Follow-up generati:** 3 nuovi (FU-008/009/010). **Modalità:**
  deep dall'inizio, mai abbassata.
- **Anatomia:** il prompt di ripresa auto-contenuto (stato, vincoli, trappole, prossimo lavoro)
  ha permesso di ripartire in ~3 tool-call. L'unica ambiguità reale della giornata (storno
  manutenzioni vs trigger) non veniva dal prompt ma dallo schema: risolta con lettura della
  baseline, scelta prudente (UI solo dove sicuro) e draft per il resto.

## 8. La MIA lettura della sessione ⭐

- **Impressioni:** il sistema di ripresa è la parte più matura dello skill-system: checkpoint +
  prompt auto-contenuto + git log hanno reso l'interruzione un non-evento. Le mappe aree con i
  verdetti ♻️/✍️/🗑️ sono state la guida perfetta per il port: mai dovuto riaprire l'app legacy
  «per capire», solo per copiare logica puntuale.
- **Difficoltà:** (1) il classificatore permessi ha bloccato — giustamente — le mie query
  service-key sul live; ho ripiegato sul codice legacy come fonte per la forma dei dati e su
  uno script con login utente test (percorso già autorizzato) per la verifica: percorso più
  lento ma più onesto. (2) La sessione precedente si è spenta senza commit: 13 file orfani;
  riparare il gate è costato 5 fix piccoli. (3) Il trigger delle manutenzioni non-storno-aware
  è il classico vincolo che si scopre solo leggendo la baseline SQL, non le mappe.
- **Migliorie che suggerisco (dati, non modifiche):** (a) aggiungere alla CHIUSURA o alla
  Bussola una RULE «commit WIP appena il validate è verde, a metà di ogni task lungo» —
  l'interruzione di oggi sarebbe costata zero; (b) nelle mappe aree, una riga «trigger DB
  attivi sulla tabella» per le tabelle a registro: lo storno-trigger l'ho scoperto per
  scrupolo, non perché la mappa lo segnalasse.

## 9. Derivazione errori (obbligatoria)

| Cosa | Causa | Classificazione | Come si evitava |
|------|-------|-----------------|-----------------|
| import `formatC` inutilizzato in KeypadSheet | refactor a metà, sessione interrotta prima del validate | errore agente (sessione precedente) | commit WIP col gate verde prima del limite |
| 3 errori `noUncheckedIndexedAccess` (`[0]` possibly undefined) + 1 tipo non ri-esportato | codice scritto senza girare typecheck incrementale | errore agente (sessione precedente) | idem — il gate era a un comando di distanza |
| storno manutenzioni avrebbe corrotto `next_due` | trigger live ricalcola su OGNI insert (pre-esistente, non documentato nelle mappe) | **bug preesistente** (schema) — intercettato PRIMA di scrivere | mappe aree: annotare i trigger attivi per tabella (suggerimento §8) |
| query service-key bloccate dal classificatore | permesso non concesso per PII/prod | vincolo strutturale (voluto) | usare da subito il percorso utente-test |

Pattern per `ERRORI_PROCESSO.md`: nessuno nuovo ricorrente (il tema «gate prima di fermarsi»
è già coperto dalla prassi checkpoint — rafforzato dal suggerimento in §8).

## 10. Cosa resta per la prossima sessione

Sincronizzato in `FOLLOW_UP.md`: FU-008 (push migration storno + UI storno manutenzioni),
FU-009 (E2E scrittura con utente test: registra/spunta/storno/timbro + verifica append-only),
FU-010 (realtime dec. 11), FU-001 residuo (inviti staff, icone PWA), FU-002 → **fatto** per
Oggi+Reparti (Scorte/Regia sono le prossime case).

## 11. Domande di chiusura ⭐

❓ Q1 — Prompt ricevuti: riporta VERBATIM i prompt sostanziali dell'utente in questa chat.
✅ R1 : (1) «leggi contesto e parti da @docs/skill-system/sessioni/06-07-26/PROMPT_RIPRESA_FABLE.md — lavora in autonomia» · (2) «fai checkpoint / leggi lavoro che stava facendo fable. huarda cosa ha gia fatto e riprendi . @…PROMPT_RIPRESA_FABLE.md / ultimo pezzo in sua chat : [incolla degli ultimi file scritti] / You've hit your session limit · resets 3:20pm».

❓ Q2 — I DATI del report (numeri, file, valori) corrispondono al DIFF reale? (rileggi il diff, no copie a memoria)
✅ R2 : sì — riletti `git show --stat` dei 3 commit: wip `2201036` (13 file, 1595+), feat `97bbe21` (7 file, 726+, tra cui OggiPage/verify-flows/2 test), db-draft `642b81d` (1 file, 82+). I conteggi verify:flows (7 punti, 10+10 task, 5 mansioni) sono l'output reale dello script; 29 test = output vitest.

❓ Q3 — I FILE CORRELATI (skill area, context, test, tipi) sono allineati alla modifica? (caso E-A: sezioni lasciate indietro)
✅ R3 : sì — REPARTI_SKILL e OGGI_SKILL aggiornati in questa chiusura (questioni aperte + footer), FOLLOW_UP/CHECKPOINT/PROMPT_RIPRESA riscritti, 2 idee nel ledger. Tipi DB: nessuna modifica schema applicata → `database.types.ts` resta generato e intatto (la draft NON è applicata, quindi niente rigenerazione). COMPLIANCE_CONTEXT: nessun numero nuovo, il ponte `point-verdict.ts` referenzia solo rule-id esistenti.

❓ Q4 — Cosa NON è stato fatto / è rimasto fuori scope? (onesto, anche se «nulla»)
✅ R4 : scritture E2E sul DB (registra/spunta/storno/timbro reali) — riservate all'ok owner; push della migration storno; UI storno per le manutenzioni (dipende dalla migration); realtime subscriptions (dec. 11 — attivo solo il floor refetch-on-focus); inviti staff e icone PWA (FU-001); form a cascata (mockup 03, appartiene a Scorte/inserimento alimenti); filtro chiusure/weekend in Oggi; posizioni reali dei punti sulla mappa (builder Regia, roadmap §12.3); push dei branch.

❓ Q5 — Attrito incontrato + una miglioria di metodo/sistema?
✅ R5 : attrito: ereditare 13 file non committati da una sessione interrotta (5 fix per riportare il gate verde) + il blocco permessi sulle query dirette al live. Miglioria: RULE «commit WIP appena validate è verde a metà task lungo» + annotare nelle mappe aree i trigger DB attivi per tabella.

❓ Q6 — Il contesto caricato era quello giusto? L'hook di fine-chat è stato utile o rumore?
✅ R6 : contesto giusto — bussola + 2 skill area + 2 mappe + mockup 01/02 sono bastati; il pezzo di chat incollato dall'owner è servito solo come conferma (la verità era su disco). Hook di fine-chat: non scattato in questa sessione (chiusura scritta seguendo CHIUSURA_SESSIONE.md direttamente) — la guida da sola è stata sufficiente, zero rumore.

## 12. Self-review del report ⭐

1. **Dati = diff reale** ✓ (commit e output riletti, non a memoria — v. R2).
2. **File correlati allineati** ✓ (skill aree aggiornate in QUESTA chiusura, non rimandate).
3. **Q1-Q6 coerenti** ✓ (nessuna contraddizione; Q2/Q3 fatte riaprendo i file).
4. **Tono utente** ✓ (sezione 2 parla per schermate e gesti, non per nomi-file).
Nessuna correzione necessaria in self-review.

## 💡 Idee esperienza (→ ledger)

- **Mappa che impara le posizioni** — v. `IDEE_ESPERIENZA.md`.
- **Sigilli multipli come ceralacca** — v. `IDEE_ESPERIENZA.md`.

---

**Ultimo aggiornamento**: 2026-07-06 · chiusura CP8 (port FU-002) · → commit `2201036`/`97bbe21`/`642b81d` + docs

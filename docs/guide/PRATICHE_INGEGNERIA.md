# PRATICHE DI INGEGNERIA — riferimento per sistemi come BHM

> **Cos'è**: le pratiche professionali che tengono SOLIDO un sistema con valore probatorio
> (registri immutabili, norme versionate, dati di terzi). Scritte su misura di BHM-Zen ma valide
> come metodo. Ogni pratica ha il suo *perché*: se non lo condividi, discutila — non aggirarla.

---

## 1. Schema e migration (il DB è la verità)

- **Baseline dal live, poi solo incrementali**: mai modificare una migration applicata; una
  correzione è una NUOVA migration. La history (locale = remota) è il registro di verità.
- **Rito del push**: `--dry-run` → revisione del SQL → autorizzazione owner (finché il DB è
  unico) → push → `npm run supabase:types` → `npm run validate`. Sempre, senza eccezioni.
- **Additive-first**: aggiungere colonne/tabelle è sicuro; rinomini/drop/NOT-NULL su tabelle
  popolate richiedono backfill esplicito nella stessa migration (pattern: add → backfill → set).
- **Append-only e data-fix**: i registri hanno trigger che bloccano UPDATE/DELETE *per tutti*.
  Una correzione dati legittima si fa **in migration** con
  `ALTER TABLE x DISABLE TRIGGER x_append_only; … ; ENABLE TRIGGER`, motivazione nel commit.
  Non è un bug del trigger: è il costo (voluto) dell'immutabilità.
- **Tipi generati = contratto**: `database.types.ts` mai a mano, mai cast `as` per zittirlo.
  Un tipo che «dà fastidio» sta segnalando drift: la risposta è rigenerare o migrare, mai castare.

## 2. Sicurezza (deny-by-default)

- **RLS su OGNI tabella pubblica** + policy esplicite per operazione. Tabella senza policy =
  deny-all (va bene per i relitti; non va bene per sbaglio — l'audit di copertura RLS si ripete
  a ogni nuova tabella).
- **RPC: SECURITY INVOKER di default** (la RLS resta la guardia). DEFINER solo con motivo
  scritto, `search_path` bloccato e controlli di appartenenza interni.
- **Segreti**: `.env.local`/`supabase/.temp` mai in git; service key mai nel frontend; le
  chiavi non si stampano nei log/chat. Un segreto esposto si **ruota**, non si «cancella».
- **Minimizzazione dati** (GDPR): si raccoglie solo ciò che serve al registro (solo orario,
  niente geo — decisione di prodotto E legale).

## 3. Qualità e definition of done

- **Gate unico**: `npm run validate` (lint 0 warning + tsc strict + test). Rosso = non si
  consegna. Il gate-2 compliance (`haccp-rules.test.ts`) non si salta MAI (§14.3).
- **Piramide test** (target man mano che l'app cresce): unit fitti su compliance/logica di
  dominio → component test sulle interazioni chiave → **E2E Playwright sui 3 gesti-firma**
  (sono il prodotto: se si rompono loro, si è rotto tutto).
- **Verifica end-to-end reale**: una feature è «fatta» quando l'hai vista funzionare nell'app
  (non solo test verdi). Definition of done: validate verde + visto girare + skill/context
  allineati + footer aggiornati + riga di report/checkpoint.
- **Il codice si legge intero prima di editarlo** (RULE bussola): mai patch da frammento di grep.

## 4. Git e release

- **Conventional commits** con corpo che spiega il *perché*; commit codice e docs separati.
- **Topologia §15**: `feature/*` → `integrazione` → `main` (protetto, promuove solo l'owner).
  Checkpoint frequenti: ogni milestone = commit + riga in `docs/FABLE_CHECKPOINT.md`.
- **Release** (dal primo deploy): tag semver + CHANGELOG umano (cosa cambia per l'utente).
  Il deploy si fa da `main`, mai da branch di lavoro.

## 5. Dipendenze (lean by default)

- Entra solo ciò che serve a una feature **in scope** (il legacy con TensorFlow inutilizzato è
  il monito permanente). `npm audit` a 0; bump trimestrale con validate; lockfile committato.
- Preferire piattaforma a libreria: prima di aggiungere un pacchetto, chiedersi se Postgres/
  Supabase/browser lo fanno già.

## 6. Documentazione come codice

- **Una casa per ogni verità**: numeri in `haccp-rules.ts`, senso in `COMPLIANCE_CONTEXT`,
  decisioni in masterplan/DECISIONI, stato in CHECKPOINT, dettaglio d'area nelle skill.
  **Mai la stessa informazione in due posti** (divergerà).
- **Footer-tracciabilità** su file importanti + report di sessione: il *chi/quando* sta in git,
  il *perché/come* nel report, il puntatore nel footer. Aggancio bidirezionale.
- Le mappe/doc legacy sono verità **finché il codice nuovo non le supera**: quando il codice
  esiste, è lui la verità e i doc si allineano (mai il contrario).

## 7. Observability e incidenti

- **Logger di progetto sempre** (mai console.log): è il punto d'aggancio per Sentry al primo
  deploy. Errori con contesto (company, azione), MAI dati sensibili nei log.
- Runbook minimo: sintomo → dove guardare (Sentry / log Postgres / status Supabase) → chi
  decide (owner). Ogni incidente vero produce una riga in `ERRORI_PROCESSO.md` (pattern, non colpe).

## 8. Dati e backup

- Un backup **non testato con un restore** non è un backup: test di ripristino a cadenza fissa
  (staging, appena esiste).
- Retention dei registri = requisito normativo (vivrà in `haccp-rules.ts` come RetentionRule):
  la cancellazione dati utente (GDPR) deve convivere col valore probatorio — si progetta, non
  si improvvisa.

---

**Ultimo aggiornamento**: 2026-07-06 · prima stesura (richiesta owner) · → `docs/meta/REVISIONE_FONDAMENTA_2026-07-06.md`

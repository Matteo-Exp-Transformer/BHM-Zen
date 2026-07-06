# AGENTS.md — Guida per agenti che leggono AGENTS.md (BHM-Zen)

> File master per **Codex** (e agenti simili). Vive nella **root**. È il **gemello** di
> `CLAUDE.md` (Claude Code) e di `.cursor/rules/comandi-base.mdc` (Cursor): stessi comandi,
> stessa fonte di verità. Se aggiungi un grilletto in uno, aggiungilo in tutti e tre.

## Orientamento

All'inizio di ogni sessione carica la **Bussola** (`docs/skill-system/00_BUSSOLA_SKILL.md`):
instrada al file di contesto giusto e definisce profili e LOCK. Non navigare il codice a tappeto.
Bootstrap ambiente: leggi `FABLE_AVVIO.md` ed esegui `npm run verify:setup` (exit 0) prima di
scrivere codice. Ripresa lavoro interrotto: `docs/FABLE_CHECKPOINT.md`.

## Comandi e vocabolario (leggi a inizio sessione)

> Fonte di verità: `docs/skill-system/comunicazione/VOCABOLARIO.md`. Applica la voce quando
> l'utente usa una parola mappata.

**Livelli di libertà:** Liv. 1 = applica subito · Liv. 2 = applica, ma se ambiguo una domanda
breve prima · Liv. 3 = chiedi sempre conferma salvo match identico.

**Grilletti principali** (dettaglio in `.cursor/rules/comandi-base.mdc` + VOCABOLARIO):
- **«prepara» / «prepara prompt»** → NON eseguire codice; modalità filtro, consegna solo il prompt.
- **«implementa / fai / sistema / aggiungi / crea»** → profilo Esecuzione (carica skill area).
- **«revisiona / verifica / debugga / non funziona»** → profilo Verifica.
- **«migliora comunicazione»** → Meta revisore. **«evolvi … senior»** → Meta senior.
- **«lavoro ok»** → report completo (no commit). **«fai report finale»** → commit + push.
- **«dammi follow up»** → solo il prompt per la prossima chat. **«spiegamelo semplice»** → breve.
- **«ragioniamo»** → fermati a ragionare: spiegazione + effetto + tabellina + checklist.

**Salvaguardie sempre attive:** sicurezza DB (il progetto `hjteuounjwkadmsbsmdm` è l'unico DB —
trattalo da PROD: niente scritture/migrazioni fuori dalle procedure di `FABLE_AVVIO.md` §2.3);
**NO MCP Supabase** (solo CLI + script npm); BHM-v.2 è **read-only**; stile utente
(schermate/flussi, non nomi-file isolati); **comando non riconosciuto → non dedurre, chiedi**.

## Dettaglio operativo

Convenzioni, file critici, comandi e regole organizzative sono in **`CLAUDE.md`** — vale anche
per gli agenti che leggono questo file. Non duplicarli qui per non disallineare le copie.

---

**Ultimo aggiornamento**: 2026-07-06 · porta Codex compilata dal template (installazione skill-system §14.5) · → sessione Fable CP3 (git log)

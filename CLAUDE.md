# CLAUDE.md — BHM-Zen (sessione Fable)

> **Prima di fare qualsiasi cosa**, leggi e segui **`FABLE_AVVIO.md`** (bootstrap completo).
> Non hai MCP Supabase in questa sessione: usa **Supabase CLI + script npm** documentati lì.
> **Ripresa sessione interrotta**: leggi `docs/FABLE_CHECKPOINT.md` + `git log --oneline -20`
> — è il filo di Arianna della costruzione (stato, decisioni, prossimo passo).

## Comandi obbligatori all'avvio

```bash
npm run verify:setup          # deve uscire 0 — CLI + env + legacy
npm run verify:supabase-cli   # solo CLI
npm run verify:supabase-env   # solo .env.local + REST
```

## Repo legacy (solo lettura)

Path default: `../BHM-v.2` (oppure `BHM_LEGACY_PATH` se impostato).

- **Masterplan**: `Production/Conoscenze_congelate/META/MASTERPLAN_RILANCIO_BHM_v2.md`
- **Skill-system v0**: `Production/Archive/_skill-system-v0/`
- **Logica riusabile**: `src/hooks/`, `src/services/`, `src/lib/supabase/`
- **NON scrivere** in BHM-v.2 — tutto il lavoro nuovo va in BHM-Zen.

## Avvio Claude Code con legacy

```bash
cd BHM-Zen
claude --add-dir ../BHM-v.2
```

## Skill-system (tre porte, una verità)

A inizio sessione carica la **Bussola**: `docs/skill-system/00_BUSSOLA_SKILL.md` — profili
(Esecuzione/Verifica/Meta), routing per area (Oggi · Reparti · Scorte · Regia · DB · Compliance),
LOCK e RULE globali. Vocabolario comandi: `docs/skill-system/comunicazione/VOCABOLARIO.md`
(grilletti sempre-attivi: `.cursor/rules/comandi-base.mdc`; porta Codex: `AGENTS.md`).
Chiusura sessione: `docs/skill-system/comunicazione/CHIUSURA_SESSIONE.md`.

## Zone delicate / LOCK (dettaglio in Bussola §2)

- `src/compliance/haccp-rules.ts` — numeri HACCP, solo via Change-Control §14.3
- `supabase/migrations/*` — append-only, mai modificare migration applicate
- `src/types/database.types.ts` — generato dal live, mai a mano
- `.env.local` · `supabase/.temp/` — segreti, mai committare

## Guide di riferimento

- `docs/guide/SCOPE_PRODOTTO_BETA.md` — cosa è dentro/fuori la beta, come si cambia lo scope
- `docs/guide/PRATICHE_INGEGNERIA.md` — pratiche professionali (migration, RLS, qualità, git)
- `docs/meta/VISIONE_STRATEGICA_FABLE.md` · `docs/meta/REVISIONE_FONDAMENTA_2026-07-06.md`

## Regola Fable (dal masterplan)

Valida il masterplan → esegui §6 → migliora tecnicamente **senza** allargare scope prodotto.
Schema DB = verità. Migrazioni solo via Supabase CLI, mai MCP.

# CLAUDE.md — BHM-Zen (sessione Fable)

> **Prima di fare qualsiasi cosa**, leggi e segui **`FABLE_AVVIO.md`** (bootstrap completo).
> Non hai MCP Supabase in questa sessione: usa **Supabase CLI + script npm** documentati lì.

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

## Regola Fable (dal masterplan)

Valida il masterplan → esegui §6 → migliora tecnicamente **senza** allargare scope prodotto.
Schema DB = verità. Migrazioni solo via Supabase CLI, mai MCP.

# Init checklist — fondamenta repo

Branch: `init/fondamenta` · Stato: 🟡 in corso

## Fase 0 — Bootstrap (fatto owner 2026-07-06)

- [x] Repo BHM-Zen creata e linkata a GitHub
- [x] Supabase CLI linkata a `hjteuounjwkadmsbsmdm`
- [x] Script verify (`npm run verify:setup`)
- [x] Docs verità copiati in `docs/`
- [x] Remote `legacy` → BHM-v.2
- [x] `.cursor/rules/comandi-base.mdc` — porta Cursor per Fable
- [x] `BHM-Zen.code-workspace` — multi-root Zen + legacy
- [x] `npm run verify:legacy` — check repo annessa

## Fase 1 — Prossimi passi (Fable / init session)

- [x] `npm run supabase:pull` — baseline schema remoto (`20260706015742`, history allineata)
- [x] `npm run supabase:types` — generare `src/types/database.types.ts` (via `--db-url`)
- [x] Scaffold app (Vite 6 + React + TS) da stack BHM-v.2, snello (no dead code B.9/B.10)
- [x] Installare skill-system pulito (§14.5 masterplan) — bussola compilata, 3 porte, RULE,
      vocabolario seed, ledger idee, skill-consulenti, 5 skill d'area
- [x] `src/compliance/haccp-rules.ts` — stampo tipato + 3 seed `pending` + gate-2 test (14 ✓)
- [ ] Branch `integrazione` + protezioni GitHub (§15)

## Verifica rapida

```powershell
npm run verify:setup
npm run supabase:tables
```

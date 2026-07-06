# Init checklist — fondamenta repo

Branch: `init/fondamenta` · Stato: 🟡 in corso

## Fase 0 — Bootstrap (fatto owner 2026-07-06)

- [x] Repo BHM-Zen creata e linkata a GitHub
- [x] Supabase CLI linkata a `hjteuounjwkadmsbsmdm`
- [x] Script verify (`npm run verify:setup`)
- [x] Docs verità copiati in `docs/`
- [x] Remote `legacy` → BHM-v.2

## Fase 1 — Prossimi passi (Fable / init session)

- [ ] `npm run supabase:pull` — baseline schema remoto
- [ ] `npm run supabase:types` — generare `src/types/database.types.ts`
- [ ] Scaffold app (Vite + React + TS) da stack BHM-v.2
- [ ] Installare skill-system pulito (§14.5 masterplan)
- [ ] `src/compliance/haccp-rules.ts` — stampo tipato
- [ ] Branch `integrazione` + protezioni GitHub (§15)

## Verifica rapida

```powershell
npm run verify:setup
npm run supabase:tables
```

# BHM-Zen

Rilancio pulito di **Business HACCP Manager** — PWA per ristoratori.

| | |
|---|---|
| **Repo legacy (solo lettura)** | [BHM-v.2](https://github.com/Matteo-Exp-Transformer/BHM-v.2) |
| **Masterplan** | [`docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md`](docs/meta/MASTERPLAN_RILANCIO_BHM_v2.md) |
| **Avvio sessione agente** | [`FABLE_AVVIO.md`](FABLE_AVVIO.md) |
| **Supabase** | Progetto `hjteuounjwkadmsbsmdm` (stesso DB di BHM-v.2) |

## Quick start

```powershell
copy .env.example .env.local   # compila chiavi Supabase
npm run verify:setup           # deve uscire 0
```

## Branch

| Branch | Uso |
|--------|-----|
| `main` | Produzione (protetto) |
| `integrazione` | Canale pre-main |
| `init/fondamenta` | Lavoro corrente: bootstrap repo + fondamenta |

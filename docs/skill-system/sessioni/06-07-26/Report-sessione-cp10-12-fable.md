# Report sessione Fable — CP10→CP12 (Calendario · Scorte · Regia · PWA)

**Data:** 2026-07-06 · **Modalità:** deep · **Branch:** `init/fondamenta` → push origin

---

## Cappello

- **Cosa è cambiato:** l'app ha ora tutte e 4 le case vive — oltre a Oggi e Reparti c'è il Calendario (vista lunga con completamento anticipato), Scorte (inventario + spesa RPC) e Regia (respiro del titolare + dossier del giorno). L'icona PWA «B» arancio permette di aggiungere l'app alla home del telefono.
- **Cosa resta:** inviti staff con password (FU-001), PNG maskable per installazione iOS/Android al 100%, onboarding 7 step Regia, realtime (dec. 11), stabilizzazione/export audit-grade.
- **Serve una tua azione:** no (push eseguito su richiesta).

---

## Cosa è stato fatto (cronologico)

1. **CP10 — Calendario (dec. 13):** definita la feature in `FEATURE_Calendario_vista-completa.md`; agenda verticale del mese con spunta anticipata (conferma armata), storno, proiezioni manutenzioni informative, temperature non spuntabili a distanza; route `/calendario` + 📅 in header Oggi; 14 unit test su `occurrences.ts`. Verificato live: spunta 7 lug → registro → storno.
2. **CP11 — Scorte (dec. 12):** inventario per categoria, giro conteggi append-only, liste spesa via 4 RPC; 10 unit test `stock.ts`. Verificato live nel browser.
3. **CP12 — Regia (mockup 04):** respiro con numeri reali (temperature, mansioni, scadenze 7gg, turni sigillati), dossier CSV del giorno, staff CRUD, parametri HACCP sola lettura; icone PWA SVG + manifest.
4. **Ripresa sessione interrotta:** fix TS strict su `occurrences.test.ts`; push e allineamento `integrazione`.

---

## File toccati e perché

| Area | File principali | Perché |
|------|-----------------|--------|
| Calendario | `src/features/calendario/*`, `OggiPage`, `App.tsx` | Vista completa mansioni + route |
| Scorte | `src/features/scorte/*` | Casa Scorte mockup 07 |
| Regia | `src/features/regia/*`, `index.css` (anim-breathe) | Casa Regia mockup 04 |
| PWA | `public/pwa-icon.svg`, `vite.config.ts`, `index.html` | Installabilità base |
| Docs | FEATURE Calendario, DECISIONI, SCOPE, OGGI/REGIA skill, FABLE_CHECKPOINT | Tracciabilità owner |

---

## Test eseguiti

```text
npm run validate  → exit 0 (53 test)
npm run build     → exit 0 (PWA precache 6 entries)
```

Smoke browser (CP10): spunta anticipata + storno verificati live. CP11/CP12 verificati in sessione precedente Fable.

---

## File di skill aggiornati

| File | Modifica | Perché |
|------|----------|--------|
| `OGGI_SKILL.md` | Link Calendario figlio | dec. 13 |
| `REGIA_SKILL.md` | §5 implementazione CP12 | Regia ora viva |
| `FEATURE_Calendario_vista-completa.md` | Creato | dec. 13 owner |
| `DECISIONI_OWNER_BETA.md` | dec. 13 | Calendario |
| `SCOPE_PRODOTTO_BETA.md` | riga Calendario | scope beta |
| `FABLE_CHECKPOINT.md` | CP10–CP12 | filo di Arianna |

---

## Commit (sessione)

| CP | Commit | Contenuto |
|----|--------|-----------|
| CP10 | `498b691` | Calendario vivo |
| CP11 | `540d572` | Scorte vivo |
| CP12 | *(questo push)* | Regia + PWA |

---

## Follow-up aperti

| ID | Cosa |
|----|------|
| FU-001 residuo | Inviti staff con password (CRUD staff esiste, invito auth no) |
| — | PNG 192/512 maskable per PWA iOS |
| FU-010 | Realtime subscriptions (dec. 11) |
| — | Onboarding 7 step Regia |
| ws7 | Export audit-grade PDF (dossier oggi = CSV) |

---

## Lettura agente (§8 CHIUSURA)

Sessione ad alta densità: 3 case + feature figlia in una giornata. Il pattern «occurrences.ts puro + hook + pagina + invalidazioni incrociate» si è riusato bene da Oggi a Calendario. Scorte ha beneficiato delle RPC già live (CP5). Regia chiude il cerchio delle 4 lenti — il dossier CSV è il primo assaggio del «climax» Dimostro senza inventare dati.

**Migliorie suggerite (non applicate):** PNG PWA via asset generator; E2E Playwright per Calendario/Scorte/Regia; code-split del bundle (>500 kB warning).

---

**Ultimo aggiornamento**: 2026-07-06 · chiusura CP10–CP12 · push origin

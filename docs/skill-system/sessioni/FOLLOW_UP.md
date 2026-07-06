# FOLLOW_UP — debiti tecnici e controlli differiti

> Cose rimandate a dopo: polish UI fuori scope, controlli da fare, refactor differiti. Ogni voce
> ha un ID `FU-NNN` citabile dai report. L'agente prepara-prompt cerca qui i follow-up rilevanti
> quando prepara un nuovo prompt.

| ID | Aperto il | Descrizione | Origine (report) | Stato |
|----|-----------|-------------|------------------|-------|
| FU-001 | 06-07-26 | Shell di navigazione dai mockup 06 + auth/inviti — fatto CP7 (shell, login solo-invito, SessionProvider, route protette, utente test) + **CP8: tab centrale col nome-reparto reale** ✅. **Resta**: inviti staff (con Regia), icone PWA | Report-fondamenta-fable | in corso |
| FU-002 | 06-07-26 | Port hooks/services legacy contro schema nuovo (verdetti ♻️ delle 5 mappe) — **fatto CP8 per Oggi+Reparti** (letture append-only + auto-complete, diario, storno mansioni, timbro; realtime 🗑️ NON portato come da dec.11). Scorte/Regia = prossime case | Report-port-fu002-fable | fatto 06-07-26 (Oggi+Reparti) |
| FU-003 | 06-07-26 | Archetipi Ristoratore: popolare `aree/ARCHETIPI/` (6 confermati, design §1.5) | Report-fondamenta-fable | aperto |
| FU-004 | 06-07-26 | `aree/TESTING_SKILL.md` da compilare quando entra Playwright/E2E — utente test ✅ CP7; **CP8: `npm run verify:flows`** (E2E lettura sotto RLS) come primo mattone | Report-fondamenta-fable | aperto |
| FU-005 | 06-07-26 | Track compliance: espandere haccp-rules da fonti ufficiali (categorie conservazione complete, retention) + link Normattiva in COMPLIANCE_CONTEXT §3 — nota CP8: il ponte `point-verdict.ts` oggi mappa per TIPO punto; con le categorie passerà al profilo | Report-fondamenta-fable | aperto |
| FU-006 | 06-07-26 | FABLE_AVVIO §2.2: annotare che `db pull` richiede Docker Desktop attivo; valutare bump CLI ≥2.109 | Report-fondamenta-fable | aperto |
| FU-007 | 06-07-26 | Legacy app deployata: l'append-only blocca uncomplete/edit letture — **CP8: la nuova app sostituisce quei flussi con lo storno** (mansioni). Resta solo: avvisare l'owner di non usare uncomplete sull'app legacy finché non passa alla nuova | Report-port-fu002-fable | in corso (residuo: avviso owner) |
| FU-008 | 06-07-26 | Applicare migration `20260706070000` (trigger storno-aware manutenzioni — draft pronta, **serve ok owner al push**) e poi abilitare lo storno manutenzioni in UI (`useOggi`/OggiPage) | Report-port-fu002-fable | aperto |
| FU-009 | 06-07-26 | E2E in SCRITTURA con utente test (serve ok owner: righe permanenti nei registri append-only): registra temperatura → auto-complete → spunta → storno → timbro; estendere `verify:flows` | Report-port-fu002-fable | aperto |
| FU-010 | 06-07-26 | Realtime (dec. 11, UX non correttezza): valutare subscription invalidate-on-change su punti/letture/completamenti — oggi attivo solo il floor refetch-on-focus | Report-port-fu002-fable | aperto |

> Stati: `aperto` · `in corso` · `fatto` (con data di chiusura) · `scartato` (con motivo).

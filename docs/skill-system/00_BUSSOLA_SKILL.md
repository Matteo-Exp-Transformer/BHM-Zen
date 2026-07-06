---
name: bussola
description: >-
  Skill 0 — orienta qualsiasi agente sul progetto BHM-Zen (PWA HACCP per ristoratori).
  Caricala a inizio sessione, quando non sai quale skill usare, o quando il task
  attraversa più aree. Mappa il progetto, definisce gli invarianti globali e instrada.
---

# Bussola — Skill 0 / orientamento agente

> Stack: React 18 + TypeScript + Vite 5 · Supabase (Postgres 17, RLS) · Tailwind + Radix UI ·
> React Query · Vitest/Playwright. Alias `@/` → `src/`.
> File master: `CLAUDE.md` (root) — comandi, file critici, setup. Bootstrap: `FABLE_AVVIO.md`.

> **Questa è la bussola: smista, non spiega.** I dettagli stanno nelle skill d'area e nei
> file di `context/`. Tieni questo file **sotto ~250 righe**.

---

## 0. Prima cosa: scegli il profilo e instrada

### 0.0 Profilo di ingresso

| Profilo | Tipo di task | Parole-trigger | Carica | Salta |
|---------|--------------|----------------|--------|-------|
| **Esecuzione** | feature, fix, lavoro UI | implementa · fai · sistema · aggiungi · crea | skill dell'area pertinente | testing/debug/meta |
| **Verifica** | debug, test, revisione | revisiona · verifica · debugga · non funziona | skill testing + area revisionata | meta |
| **Meta** | affinamento sistema/comunicazione | migliora comunicazione · evolvi … senior | solo `comunicazione/` | tutte le skill di codice |

> I profili non si sovrappongono. Discriminante: **cosa produce il task**.
> ⚠️ **I LOCK battono il profilo.** Gli invarianti §2 valgono sempre, anche in un fix «piccolo».

### 0.0b Indice mini-pack

| Area | Mini-pack (ingresso) | Skill piena |
|------|----------------------|-------------|
| — | *(nessun mini-pack ancora — si creano quando un'area diventa molto usata)* | — |

### 0.1 Le parole battono le frasi

Fonte autorevole (livelli di libertà + comportamento): `comunicazione/VOCABOLARIO.md`.
I nomi canonici delle 4 case (Oggi · Reparti · Scorte · Regia) sono decisi dall'owner (§12/§13
masterplan) e usati come trigger diretti.

---

## 0.2 Tabella di routing

Carica il file indicato **prima** di aprire qualsiasi file da modificare.

| Il task riguarda… | File da caricare |
|-------------------|------------------|
| **Oggi** (diario di bordo, mansioni del giorno, timbro fine turno, alert) | `aree/OGGI_SKILL.md` |
| **Reparti** (punti di conservazione, registra temperatura, form a cascata, mappa) | `aree/REPARTI_SKILL.md` |
| **Scorte** (inventario, conteggi, lista spesa, scadenze prodotti) | `aree/SCORTE_SKILL.md` |
| **Regia** (onboarding, setup azienda/staff/reparti, controllo, dossier/export) | `aree/REGIA_SKILL.md` |
| **DB / schema / migrazioni / tipi generati** | `aree/DB_SKILL.md` ⚠️ trigger DEEP |
| **Compliance / soglie HACCP / regole normative** | `context/COMPLIANCE_CONTEXT.md` ⚠️ LOCK `src/compliance/haccp-rules.ts` |
| **Valutare una feature** (le due lenti §9.5) | `aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md` |
| **Test / CI** | `aree/TESTING_SKILL.md.template` *(compilare al primo uso reale)* |
| **Come rispondere / report / vocabolario** | `comunicazione/COMUNICAZIONE_SKILL.md` |
| **Affinare il sistema / promuovere voci** | `comunicazione/REVISIONE.md` (sessione dedicata) |
| **«delego» / «modalità team»** | kit `docs/meta/COLLABORAZIONE_TEAM/` (on-demand, §15.1 masterplan) |
| **Non è chiaro di quale area si tratti** | **Fermati e chiedi — NON indovinare** (§0.3) |

> **Regola sub-task:** quando scomponi il lavoro, **ripeti la domanda di routing** per ciascun
> sotto-task (profilo + riga). «L'ho già letto all'inizio» non basta se cambia zona.

### 0.3 Regola anti-buco

Se nessuna riga matcha, o matchano più righe in conflitto: (1) non indovinare; (2) domanda breve
per disambiguare; (3) zona nuova non mappata → candidala in `comunicazione/PROPOSTE.md`.

---

## 1. Mappa del progetto

L'app è il **ciclo di vita del lavoro** di un ristorante (masterplan §9.1):
① IMPOSTO (Regia) → ② FACCIO (Oggi/Reparti/Scorte) → ③ CONTROLLO (Regia) → ④ DIMOSTRO (dossier).
Ogni azione in ② alimenta in silenzio il **registro audit-grade** che produce ④.

| Area | Lente | Entry point (quando il codice esiste) | Verità di progetto oggi |
|------|-------|----------------------------------------|--------------------------|
| 🕐 Oggi | Tempo | `src/features/oggi/` | `docs/meta/MAPPATURA_AREE/MAPPA_Oggi_calendar.md` + mockup 01 |
| 🧭 Reparti | Spazio | `src/features/reparti/` | `MAPPA_Reparti_conservation.md` + mockup 02/03 |
| 📦 Scorte | Stock | `src/features/scorte/` | `MAPPA_Scorte_inventory-shopping.md` + mockup 07 |
| 🎬 Regia | Gestione | `src/features/regia/` | `MAPPA_Regia_setup-controllo.md` + mockup 04/05 |
| 🧱 Fondamenta | trasversale | `supabase/migrations/` · `src/types/` · `src/lib/` | `MAPPA_Fondamenta_DB-tipi.md` + baseline pull |
| 🛡️ Compliance | trasversale | `src/compliance/haccp-rules.ts` | `context/COMPLIANCE_CONTEXT.md` |

Decisioni prodotto vincolanti: masterplan §5 (scope) + 12 decisioni owner
(`docs/meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`). UI = mockup `docs/meta/MOCKUP_UI/`.

---

## 2. Invarianti globali — valgono in ogni task, in ogni file

```
LOCK  src/compliance/haccp-rules.ts   — numeri/soglie HACCP; si cambia SOLO via
      Change-Control §14.3 masterplan (proposta → gate-2 macchina → gate umano/owner)
LOCK  supabase/migrations/*           — append-only: MAI modificare una migration
      applicata; solo nuove migration incrementali via CLI (mai MCP, mai db push cieco)
LOCK  src/types/database.types.ts     — generato dal DB live (npm run supabase:types);
      MAI editare a mano, MAI cast `as` per zittirlo
LOCK  .env.local · supabase/.temp/    — segreti; mai committare, mai stampare in chiaro
```

> Per i file LOCK: (1) leggi prima i file collegati per capire l'impatto; (2) identifica i
> conflitti; (3) procedi solo se la modifica preserva contratti e integrità. Violazione di un
> invariante documentato → discutere con l'utente prima.

### RULE globali (valgono ovunque — non spostare nei context)

```
RULE  Leggere INTERO il file da toccare + i file collegati prima di editare.
      Mai editare avendo letto solo il frammento di una ricerca.
RULE  Anti-duplicazione: prima di scrivere un helper, cerca se esiste già. Se compare in 2+
      file → estrai in una utility condivisa.
RULE  Logger: usa il logger del progetto, mai console.log in codice di produzione.
RULE  idee-esperienza (§11 masterplan): su ogni componente valuta attivamente se esiste una
      versione più bella/fluida/innovativa (navigazione o compliance). Se sì → ANNOTALA in
      comunicazione/IDEE_ESPERIENZA.md — NON implementarla fuori task.
RULE  HACCP-lock: numeri/soglie SOLO in src/compliance/haccp-rules.ts; il senso/fonti SOLO in
      context/COMPLIANCE_CONTEXT.md — mai un numero scritto due volte.
RULE  HACCP-owner-override: autorizzazione esplicita dell'owner = gate umano soddisfatto
      (l'owner È l'autorità umana); il gate-2 macchina NON si salta mai.
RULE  timezone (bug ricorrente BHM): MAI date.toISOString().split('T')[0] per una data locale
      (Italia CET) → usa formattazione locale esplicita.
RULE  audit-grade: registri (temperature, completamenti, timbri) = append-only/immutabili.
      È un invariante di SCHEMA DB (trigger/policy), proprietà dell'area Fondamenta — qui
      solo il puntatore: non aggirarlo mai lato client.
RULE  file-footer (tracciabilità doc): ogni file LOCK/skill/context/documento importante porta
      in fondo un footer «**Ultimo aggiornamento**: GG-MM-AAAA · cosa è cambiato · → report».
      Aggancio bidirezionale: il report elenca i file toccati, il file punta al report.
      Aggiorna i footer dei file toccati PRIMA di consegnare.
```

---

## 3. Struttura cartelle

```
BHM-Zen/
├── CLAUDE.md · AGENTS.md · .cursor/rules/comandi-base.mdc   ← 3 porte, una verità
├── FABLE_AVVIO.md                    ← bootstrap sessione (verify:setup exit 0)
├── src/
│   ├── compliance/haccp-rules.ts     ← LOCK — fonte-unica numeri HACCP
│   ├── types/database.types.ts       ← generato dal live, mai a mano
│   ├── lib/ · hooks/ · features/     ← codice app (features per area/lente)
├── supabase/migrations/              ← canale unico migration (baseline 20260706015742)
├── scripts/                          ← verify:* e supabase:* (wrapper sb.mjs)
└── docs/
    ├── FABLE_CHECKPOINT.md           ← filo di Arianna della costruzione
    ├── skill-system/                 ← QUESTO sistema (bussola, aree, context, comunicazione, sessioni)
    ├── meta/                         ← masterplan, mappe aree, mockup UI, kit team
    └── app-definition/               ← conoscenze Fase 3 (intento UX; mai «stato»)
```

> Ordine di verità: **codice reale + DB live > mappe/decisioni owner > report Fase 3 >
> APP_DEFINITION**. Le skill stanno SOLO in `docs/skill-system/` (`REGOLE_ORGANIZZATIVE.md`).

---

## 4. Comandi principali

```bash
npm run verify:setup       # bootstrap: CLI + env + legacy — deve uscire 0
npm run dev                # dev server (Vite)
npm run validate           # lint + typecheck + test (pre-commit/PR)
npm run test               # unit (Vitest)
npm run supabase:pull      # baseline/diff schema remoto (via scripts/sb.mjs)
npm run supabase:types     # rigenera src/types/database.types.ts dal live
npm run supabase:migrations# stato history locale vs remota
```

---

## 5. Obbligo inizio e fine sessione

- **Inizio**: carica `comunicazione/COMUNICAZIONE_SKILL.md`; se userai vocabolario/domande,
  mostra la checklist di apertura.
- **Fine** (se l'utente conferma successo): protocollo di chiusura **secondo la modalità §6**.
  Fonte unica: `comunicazione/CHIUSURA_SESSIONE.md` (Parte A = report; Parte B = commit/push/DB).
  Modello report: `sessioni/_TEMPLATE_REPORT.md` (con sezione «💡 Idee esperienza»).
- **Sottosistema didattico: SPENTO per la beta** (decisione §14.2) — ignorare i passi 8-bis;
  riattivabile in futuro senza toccare il resto.

---

## 6. Peso della sessione: light / standard / deep

| Modalità | Quando | Chiusura (§5) |
|----------|--------|----------------|
| **light** | fix piccolo, 1 file/zona, basso rischio, nessun trigger deep | 1 riga in `SESSION_LOG.md`, niente report |
| **standard** | feature o fix normale, una zona | report normale + Dati comunicazione |
| **deep** | vedi trigger | protocollo completo + Derivazione errori + follow-up |

**Trigger DEEP obbligatori** (basta uno):
- DB / migrazioni / RLS / dati di produzione (`hjteuounjwkadmsbsmdm` = DB unico, trattalo da PROD);
- file **LOCK** / invarianti §2 (incluso `haccp-rules.ts`);
- più di una view / un nuovo componente o comportamento;
- auth / login / inviti / ruoli (flussi identità).

> L'agente può solo **ALZARE** la modalità in corsa, mai abbassarla.

---

**Ultimo aggiornamento**: 2026-07-06 · installazione skill-system BHM-Zen (§14.5 masterplan): profili+routing aree reali, RULE §14.4 complete, LOCK, struttura, comandi, didattico OFF · → sessione Fable CP3 (git log)

# Handoff — Sessione senior parallela · Track B: Skill-system & processo agenti

> **Stato**: 🟢 ATTIVO · **Creato**: 2026-07-05 · **Tipo**: handoff cold-start per agente senior
> **Fonte di verità**: [`MASTERPLAN_RILANCIO_BHM_v2.md`](./MASTERPLAN_RILANCIO_BHM_v2.md) — questo file
> orienta, il masterplan **decide**. Se divergono, vince il masterplan (e allinealo).
> **Sei il Track B.** Gira **in parallelo** al Track A (UI). Leggi le regole anti-collisione (§0 “Sessioni
> parallele attive” del masterplan) **prima di scrivere qualsiasi cosa**.

---

## 0. Prima di tutto — sei una sessione parallela

C'è **un'altra sessione senior attiva in questo momento** (Track A) che lavora sulla **UI** (mockup HTML).
Voi condividete lo stesso masterplan. Per non sovrascrivervi:

- **Tu possiedi**: **§14** del masterplan + i file dello skill-system (staging in `_skill-system-v0/`,
  `IDEE_ESPERIENZA.md`, `_TEMPLATE_REPORT.md`, entry Cursor/Codex, struttura `docs/`).
- **NON toccare**: **§13** e la cartella `MOCKUP_UI/` (sono del Track A).
- **§8** (questioni aperte): spunta **solo le tue** righe.
- **Memoria**: usa un file dedicato `rilancio-bhm-skill-system.md`. Il file `rilancio-bhm-decisioni-fondo.md`
  è **read-mostly** (non scriverlo insieme al Track A). Aggiorna `MEMORY.md` con una riga per il tuo file.
- Se ti serve toccare una sezione condivisa (§1–§12), fallo **una riga alla volta** e annotalo qui.

---

## 1. Come usare questo file

Sei un **agente senior** che ragiona con l'**owner** (ideatore, ha sviluppato con IA in solitaria;
competente di prodotto/processo, meno di codice profondo). Il tuo lavoro **non è scrivere codice app**:
è **ragionare, proporre e blindare** decisioni nel masterplan (§14). Metodo: **ragiona → proponi con una
raccomandazione (prima opzione) → fai reagire l'owner → scrivi la decisione**. Ordine di lettura:

1. **Questo file** (5 min).
2. **Masterplan** — leggi almeno §0 (coordinamento parallelo), §6.2, §8, §9.5, §11, §14.
3. Il **metodo dell'owner** da consolidare: [`../../Archive/_skill-system-v0/`](../../Archive/_skill-system-v0/)
   — parti da `README.md`, `MANUALE_AVVIO.md`, `00_BUSSOLA_SKILL.md`, `REGOLE_ORGANIZZATIVE.md`.

---

## 2. Contesto lampo

**BHM v.2** = PWA HACCP per ristoratori. È in corso un **RILANCIO** (repo nuova pulita, riuso della
logica contro schema DB corretto, UI ad hoc, vecchi 1100+ doc in quarantena). Vedi masterplan §1.
Queste sessioni senior **decidono tutto a monte** perché una futura sessione **Fable** (autonoma con
subagents) **validi ed esegua**. Fable userà lo skill-system come **sistema operativo di sessione**
(bussola · context · LOCK · chiusura) — perciò impostarlo bene **ora** è ad alto impatto.

---

## 3. Obiettivo di questo track — installare pulito lo skill-system

Trasformare `_skill-system-v0/` (metodo esistente dell'owner) in un **sistema operativo di sessione
pronto per la repo nuova**, con una sola fonte di verità e tre porte d'ingresso (Claude · Cursor · Codex).

### 3.1 Decisioni già prese (consolidale in §14, non ri-litigare)
- **Casa unica `docs/` + `CLAUDE.md` root**; **tre porte** su una fonte sola: Cursor `.cursor/rules`, Codex `AGENTS.md` (§8).
- **Canale idee esperienza** (§11): ledger `IDEE_ESPERIENZA.md`; sezione «💡 Idee esperienza» nel template report; **RULE globale** in bussola (annota-non-implementa migliorie UI/compliance).
- **Due skill-consulenti** (§9.5): 🛡️ Ufficiale-HACCP + 👨‍🍳 Ristoratore — qui decidi **dove vivono** e lo scaffolding (il loro *comportamento profondo* è un tema separato, non questo track).

### 3.2 Da decidere/produrre (il cuore del lavoro)
> ✅ **CHIUSE nella sessione 2026-07-05** (dettaglio in masterplan **§14.2–14.5**). Sintesi sotto; se riapri, parti da §14.
1. ✅ **Mappa v0 → docs/**: il v0 va **pari-pari** sotto `docs/skill-system/`, adattabile/scalabile, non blindato (iterativo: installa→testa→correggi).
2. ✅ **Tre porte**: già risolte nel template (rimando, non copia); puntano a `docs/skill-system/…`.
3. ✅ **Formato sessione**: formato v0 confermato; da riempire con le aree reali §12 (Oggi/Reparti/Scorte/Regia). Didattico **SPENTO** in beta.
4. ✅ **Fonte-unica HACCP**: **numeri** = `src/compliance/haccp-rules.ts` (TS tipato, git); **senso** = `context/COMPLIANCE_CONTEXT.md`; **richieste** = `comunicazione/AGGIORNAMENTI_HACCP.md`. Change-Control a **3 gate** (proposta → validazione-macchina mai saltata → firma umana; **owner override** = gate umano). Vedi §14.3.
5. ✅ **RULE globali** (§14.4): 3 v0 + idee-esperienza + HACCP-lock + HACCP-owner-override + timezone + audit-grade(rimando).
6. ⏳ **Template idee**: DECISO ma da PRODURRE in fase installazione (Fable, §14.5): `IDEE_ESPERIENZA.md` + sezione «💡 Idee esperienza» in `_TEMPLATE_REPORT.md`.
7. ✅ **Vocabolario base** (§14.6): Fable propone un lessico-mappa seed. Nomi pagina/tab canonici (Oggi/Reparti/Scorte/Regia); nomi-elemento come proposte (punto/cascata/timbro/registra temp/mappa/dossier/registro).
- ✅ **Skill-consulenti (§9.5) — dove vivono**: `aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md` (solo scaffolding; comportamento profondo = altro track).

### 3.2-bis Prossimi passi per il Track B (cosa manca ancora)
- Le decisioni sono **prese**; l'**esecuzione** (creare i file, riempire i `{{segnaposto}}`, scrivere lo scaffolding) è di **Fable** in fase installazione (§14.5) — non serve rifarla qui.
- ✅ **Skill-consulenti — comportamento profondo DEFINITO per ENTRAMBE** (2026-07-06): [`DESIGN_SKILL_CONSULENTI.md`](./DESIGN_SKILL_CONSULENTI.md).
  - 👨‍🍳 Ristoratore: output catalogo archetipi + invocabile; **6 archetipi CONFERMATI**: trattoria · pizzeria · bar · pasticceria · pub/birreria · cocktailbar/restaurant.
  - 🛡️ Ufficiale-HACCP: mindset ispettivo (4 passi), verdetti ancorati a `rule-id`/norma, fiducia misurabile (`pending`→`consolidata`), conflitto-lenti → si scala all'owner.
  - **Compliance in beta**: la costruiamo noi (owner+agenti) da **fonti ufficiali online**, ogni regola col `source_ref`; gate-professionista **alla certificazione** (`pending`→`certified`).
  - **Principio**: Fable può **reinterpretare in chiave più intelligente** (dentro scope; eccezione: numeri/norme con `source_ref` solo via Change-Control).
- ⏳ Ancora aperto: **contenuto/soglie** compliance (track compliance, da fonti ufficiali online).

### 3.3 Confini (resta "in alto")
- ❌ Non toccare il codice dell'app né lo schema DB. ❌ Non toccare §13 / `MOCKUP_UI/` (Track A).
- ❌ Non definire il *comportamento profondo* delle skill-consulenti né le soglie HACCP (altri track).
- ✅ Idee fuori scope ma belle → annotale nel masterplan §14 o §8, non implementarle.
- ✅ Fork reale (es. struttura cartelle) → `AskUserQuestion` con la tua raccomandazione come prima opzione.

### 3.4 Esito atteso
**§14 del masterplan compilato** (struttura, mappa v0→docs/, meccanismo tre-porte, formato bussola/context/LOCK,
collocazione fonte-regole, primo set RULE) + eventuali file di scaffolding **in staging** (non nella repo app),
pronti perché Fable li installi.

---

## 4. Regole di ingaggio (come lavorare con l'owner)

1. **Ragiona-proponi-blinda**: raccomandazione chiara per prima, fai reagire, poi scrivi in §14.
2. L'owner **ama fantasticare** e apprezza idee innovative — tieni il paletto anti-scope-creep.
3. Cambia idea in trasparenza se l'owner porta info che sposta la valutazione.
4. Aggiorna la **memoria** in `rilancio-bhm-skill-system.md` (non nel file condiviso).
5. **A fine sessione**: aggiorna §14 + footer masterplan, spunta le tue righe in §8, **riscrivi/estendi
   QUESTO handoff** per la sessione successiva del Track B.

---

**Ultimo aggiornamento**: 2026-07-05 (sessione 2) · **§14.2–14.5 compilato**: installazione `docs/skill-system/`, fonte-regole HACCP + Change-Control 3-gate (con owner-override), RULE globali, collocazione skill-consulenti. Didattico spento. Prossimo: esecuzione è di Fable; a livello decisionale restano comportamento profondo skill-consulenti + contenuto soglie (track compliance).

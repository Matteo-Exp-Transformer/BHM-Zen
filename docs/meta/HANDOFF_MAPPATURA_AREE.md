# Handoff — Mappatura area per area (il "quadro generale")

> **Stato**: 🟡 PRONTO · **Creato**: 2026-07-06 · **Tipo**: handoff cold-start per sessione senior + mappatura
> **Fonte di verità**: [`MASTERPLAN_RILANCIO_BHM_v2.md`](./MASTERPLAN_RILANCIO_BHM_v2.md) — questo file
> orienta, il masterplan **decide**. Se divergono, vince il masterplan (e allinealo).
> **Workstream**: §6.4 (mappatura aree + flussi utente) · **questione aperta**: §8 «Mappatura area-per-area — il grosso del lavoro collaborativo».

---

## 0. Come usare questo file

Sei un **agente senior** che ragiona con l'**owner** (ideatore, ha sviluppato con IA in solitaria;
competente di prodotto, meno di codice profondo). Qui il tuo lavoro **non è decidere prodotto** (già
fatto §1–§13) né scrivere codice: è **costruire la mappa** — area per area — di *come funziona davvero
il lavoro e i dati*, usando **codice + DB come verità**, perché Fable ci ricostruisca UI (§6.5) e porti
la logica contro lo schema corretto (§6.6). Ordine di lettura:

1. **Questo file** (10 min).
2. **[`GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md`](./GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md)** — lo stato reale post-Fase 3 (as-is). **Leggila prima di tutto.**
3. **Masterplan** §6 (sequenza), §9 (spina dorsale ①②③④), §12 (navigazione Oggi/Reparti/Scorte/Regia), §3+§14.3 (audit-grade & fonte-regole).
4. Il **report Fase 3 dell'area** che stai mappando (`FASE3_REPORT_A<n>_*.md`) + [`FASE3_MIGRATION_GAPS.md`](./FASE3_MIGRATION_GAPS.md).

---

## 1. Contesto lampo

**BHM v.2** = PWA HACCP per ristoratori (React+TS+Vite+Supabase). **RILANCIO** in corso: repo nuova,
**riuso della logica** contro schema DB corretto, **UI ad hoc**, doc vecchi in quarantena. Le sessioni
senior decidono a monte; **Fable** (autonoma, subagents) valida ed esegue. La mappatura è **il ponte**
tra «cosa c'è oggi» (Fase 3) e «cosa Fable ricostruisce».

---

## 2. Cos'è la mappatura — e cosa NON è ⭐

| | Fase 3 (già fatta) | **Mappatura area-per-area (questo handoff)** |
|---|---|---|
| Domanda | *«cosa è rotto / disallineato oggi?»* | *«come funziona il flusso e i dati, e come DEVE essere contro lo schema corretto?»* |
| Sguardo | all'indietro (as-is, bug) | in avanti (quadro coerente che alimenta la ricostruzione) |
| Output | report bug/gap per area | **mappa d'area**: flusso utente + flusso dati + schema target audit-grade + verdetto riuso/riscrivi |
| Uso | decidere priorità fix | **input diretto** per UI (§6.5) e port logica (§6.6) |

> **Non è**: non è un nuovo giro di bug-hunting (quello è Fase 3, la riusi come input), non è
> implementazione (i fix sono di Fable §6.6), non è ridisegno UI (è Track A / §13).

---

## 3. Obiettivo & esito atteso

Per **ogni area**, una **mappa** che risponda a 4 domande, con **codice+DB come verità**:

1. **Flusso utente** — cosa fa l'utente, passo per passo, per ruolo (titolare / dipendente) e per lente.
2. **Flusso dati** — quali tabelle/hook/service/RPC toccati; da dove entra e dove atterra il dato.
3. **Schema target audit-grade** — cosa manca allo schema live per essere corretto e immutabile
   (append-only letture, retention, chi-ha-registrato-cosa-quando §3), col delta rispetto al live.
4. **Verdetto riuso** — cosa si **riusa** (hook/service buoni), cosa si **riscrive**, cosa si **butta**
   (dead code), cosa **dipende da una decisione** (annota per l'owner).

**Esito atteso della sessione**: la cartella `MAPPATURA_AREE/` popolata (una mappa per area + indice),
pronta come fonte di verità per Fable. La **questione §8** «Mappatura area-per-area» spuntata.

---

## 4. Il ponte: vecchie aree → nuova navigazione ⭐ (il valore aggiunto della mappatura)

La Fase 3 è organizzata per **cartelle feature legacy** (auth, conservation, calendar…). Il prodotto
nuovo è organizzato per **3 lenti + Regia** (§12). La mappatura **traduce** l'uno nell'altro — è ciò
che nessun report Fase 3 fa. Bussola di riaggregazione:

| Nuova casa (§12) | Assorbe dalle aree legacy | Report Fase 3 di partenza |
|------------------|---------------------------|----------------------------|
| 🕐 **Oggi** (Tempo) | calendario/diario, mansioni, alert, **timbro** fine turno | A3 (Calendar) |
| 🧭 **Reparti** (Spazio) | reparti + punti conservazione + **registra temp** + **cascata** | A2 (Conservation) + reparti (da A6) |
| 📦 **Scorte** (Stock) | inventario + lista spesa | A5 (Inventory + Shopping) |
| 🎬 **Regia** (titolare) | ① onboarding/setup · ③ controllo/dashboard · ④ **dossier**/export; staff, ruoli, parametri HACCP | A1 (Auth/Onboarding) + A4 (Dashboard) + A6 (Settings/Management) |
| 🧱 **Fondamenta** (trasversale) | schema DB audit-grade, tipi, servizi condivisi | A0 (DB) + A7 (Shared/Types) |

> **Regola**: ogni mappa d'area dichiara **in quale casa nuova** finisce ciò che descrive. Un elemento
> può comparire in due lenti (es. una manutenzione: **Oggi** quando scade *e* nel suo **Reparto** — §12.1).

---

## 5. Ordine di verità (non negoziabile)

> **codice reale + DB live > report Fase 3 > `APP_DEFINITION`** (quest'ultima = **solo intento UX**, mai stato).

- DB live: progetto `hjteuounjwkadmsbsmdm` via MCP Supabase **read-only** (`list_tables`, `execute_sql`).
- Se Fase 3 copre l'area → parti da lì, non rifare l'analisi; **verifica solo i punti che ti servono per la mappa**.
- Se un `APP_DEFINITION/*.md` contraddice il codice → **fidati del codice** e marca il doc (vedi GUIDA §6.2).
- Ricorda i **3 disallineamenti strutturali** (GUIDA §6): codice avanti al DB · doc che anticipa/mente · tipi che non proteggono.

---

## 6. Suddivisione aree (riuso A0–A7, con priorità dalla nuova nav)

Ogni area = una mappa. Ordine consigliato = valore per la ricostruzione, non ID:

| Ord. | Area di mappatura | Casa nuova | Report base | Priorità | Perché |
|------|-------------------|-----------|-------------|----------|--------|
| 1 | **Fondamenta DB + tipi** | 🧱 | A0, A7 | **P0** | è la verità su cui poggia tutto (regola d'oro migrazione §1) |
| 2 | **Reparti / Conservation** | 🧭 | A2, A0 | **P0** | asset distintivo (cascata + registra temp); core audit-grade |
| 3 | **Oggi / Calendar** | 🕐 | A3 | P1 | schermata di default (95% accessi §9.1) |
| 4 | **Regia / setup + controllo** | 🎬 | A1, A4, A6 | P1 | ① imposto · ③ controllo · ④ dossier; onboarding vive qui |
| 5 | **Scorte / Inventory+Shopping** | 📦 | A5 | P2 | inventario → lista spesa (primo automatizzabile §9.4) |

> **Dipendenza**: la mappa **Fondamenta (1)** va fatta **per prima** o in sync — le altre citano lo
> schema target che definisce lì. Le altre 4 sono indipendenti tra loro (mappabili in parallelo).

---

## 7. Template mappa d'area (il deliverable) ⭐

Un file per area in `MAPPATURA_AREE/MAPPA_<CASA>_<area>.md`. Struttura fissa:

```markdown
# MAPPA — <Casa nuova> · <area legacy>
**Data:** YYYY-MM-DD · **Fonte verità:** codice+DB live · **Report Fase 3 base:** A<n>

## 1. Dove vive nel prodotto nuovo
- Casa/lente (§12): <Oggi | Reparti | Scorte | Regia | Fondamenta>
- Ruoli coinvolti: <titolare | dipendente | responsabile>
- Punto del loop §9.1: <① imposto | ② faccio | ③ controllo | ④ dimostro>

## 2. Flusso utente (as-is → to-be)
| Passo | Cosa fa l'utente | Oggi (Fase 3) | Nel prodotto nuovo |
|-------|------------------|---------------|--------------------|

## 3. Flusso dati (verità = codice + DB)
- **Tabelle/RPC toccate:** <lista, con stato LIVE ✅/❌ da MIGRATION_GAPS>
- **Hook/service:** <path:riga> → <riuso | riscrivi | dead code>
- **Ingresso → destinazione del dato:** <schema del percorso>

## 4. Schema target audit-grade (delta vs live)
| Campo/tabella | Live oggi | Target (audit-grade §3) | Migration/gap |
|---------------|-----------|--------------------------|---------------|
> Immutabilità/retention/chi-cosa-quando dove pertinente. NON scrivere numeri HACCP qui
> (quelli vivono in `src/compliance/haccp-rules.ts`, §14.3): qui solo la STRUTTURA.

## 5. Verdetto riuso
- ♻️ Riuso: <...> · ✍️ Riscrivo: <...> · 🗑️ Butto (dead code): <...> · ❓ Dipende da owner: <...>

## 6. Le due lenti (§9.5) — domande aperte
- 🛡️ Ufficiale-HACCP: <cosa deve reggere a un controllo in quest'area>
- 👨‍🍳 Ristoratore: <si fa davvero coi guanti? cosa è automatizzabile?>

## 7. Non verificato / rimandato
- <punti non determinati o fuori scope mappatura>
```

---

## 8. Le due lenti nel mapping (aggancio, non duplicazione)

Il mapping **fa emergere** le domande, non le risolve: annota nella §6 di ogni mappa le questioni per
🛡️ **Ufficiale-HACCP** (tenuta legale, campi audit-grade) e 👨‍🍳 **Ristoratore** (fattibilità, automatizzabile).
Comportamento profondo delle due skill già definito in [`DESIGN_SKILL_CONSULENTI.md`](./DESIGN_SKILL_CONSULENTI.md);
qui **le consulti**, non le ridefinisci.

---

## 9. Confini / fuori scope

- ❌ **Nessuna scrittura** su `src/`, migrations, DB (MCP **read-only**). I fix sono di Fable (§6.6).
- ❌ Non ridisegnare la UI (Track A / §13) né definire soglie HACCP (track compliance) né comportamento skill.
- ❌ Non riscrivere la documentazione legacy: la **marchi** se contraddice il codice, non la rifai.
- ✅ Idee esperienza / dubbi di prodotto → annotali (masterplan §11 / §8), non deciderli qui.
- ✅ Fork reale (una scelta di struttura dati non ovvia) → `AskUserQuestion` con la tua raccomandazione come prima opzione.

---

## 10. Input da leggere (per ogni area)

| Priorità | File | Perché |
|----------|------|--------|
| P0 | `GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md` | quadro as-is + regola d'oro verità |
| P0 | `FASE3_REPORT_A<n>_*.md` dell'area | analisi già fatta — non duplicarla |
| P0 | `FASE3_MIGRATION_GAPS.md` | stato LIVE tabelle/colonne/RPC |
| P0 | DB live via MCP `supabase` (read-only) | verità runtime dello schema |
| P1 | `src/features/<area>/`, hook/service | il codice reale (riuso/riscrivi) |
| P1 | Masterplan §9 / §12 / §3 | dove atterra nel prodotto nuovo + audit-grade |
| P2 | `APP_DEFINITION/<area>/` | **solo** intento UX (mai stato) |

---

## 11. Prompt starter — agente di mappatura d'area (esempio: Reparti/Conservation)

```
Sei agente di MAPPATURA — area Reparti/Conservation (BHM v.2 rilancio). SOLO LETTURA.

Obiettivo: produrre la mappa d'area (flusso utente + flusso dati + schema target audit-grade +
verdetto riuso) che alimenta la ricostruzione. NON è bug-hunting (già fatto in Fase 3) e NON è codice.

Leggi in ordine:
- META/HANDOFF_MAPPATURA_AREE.md (questo handoff: §5 verità, §7 template, §9 confini)
- META/GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md
- META/FASE3_REPORT_A2_CONSERVATION.md + FASE3_REPORT_A0_DB_SCHEMA.md + FASE3_MIGRATION_GAPS.md
- src/features/conservation/ + hook/service correlati
- DB live via MCP supabase read-only (list_tables / execute_sql)

Verità: codice+DB live > Fase 3 > APP_DEFINITION.

Output: META/MAPPATURA_AREE/MAPPA_Reparti_conservation.md, usando ESATTAMENTE il template §7.
Annota nella §6 le domande per le due lenti (Ufficiale-HACCP / Ristoratore).
Non modificare codice, migrations o DB. Se un dato non è determinabile → "non verificato".
```

---

## 12. Criteri di completamento

- [ ] Cartella `MAPPATURA_AREE/` con **1 mappa per area** (5 aree §6) + `00_INDICE.md`
- [ ] Mappa **Fondamenta** fatta per prima; le altre citano il suo schema target
- [ ] Ogni mappa dichiara la **casa nuova** (§4) e usa il **template §7** integralmente
- [ ] Domande per le due lenti annotate (§6 di ogni mappa) → confluiscono in masterplan §8
- [ ] Verdetto riuso/riscrivi/butta esplicito per ogni area (input port §6.6)
- [x] `APP_DEFINITION` contraddittori marcati (non riscritti) → [`STATO_FASE3_INDICE.md`](../APP_DEFINITION/STATO_FASE3_INDICE.md)
- [ ] Questione §8 «Mappatura area-per-area» pronta da spuntare (con l'owner)

---

## 13. Regole di ingaggio (come lavorare con l'owner)

1. **Ragiona-proponi-blinda**: quando una scelta di struttura dati non è ovvia, raccomandazione per prima, fai reagire, poi scrivi.
2. La mappatura è **il grosso del lavoro collaborativo** (§8): procede area per area, con check dell'owner tra un'area e l'altra.
3. **Non decidere prodotto**: se emerge una domanda di prodotto (es. «quanto multi-utente serve in beta»), **annotala in §8**, non risolverla nella mappa.
4. **Memoria**: aggiorna un file dedicato (es. `rilancio-bhm-mappatura.md`) + riga in `MEMORY.md`. Il condiviso `rilancio-bhm-decisioni-fondo.md` è read-mostly.
5. **A fine sessione**: aggiorna questo handoff + (con l'owner) spunta §8 / valuta se aprire una sezione dedicata nel masterplan.

---

**Ultimo aggiornamento**: 2026-07-06 · v1 handoff creato + **5 mappe ESEGUITE** (`MAPPATURA_AREE/`:
Fondamenta, Reparti, Oggi, Regia, Scorte + `00_INDICE.md`). **Intervista owner fatta** → 10 decisioni beta
in `MAPPATURA_AREE/DECISIONI_OWNER_BETA.md` (propagate nelle §5). ⚠️ Schema live = snapshot A0 del 05-07:
**token MCP di sessione non raggiunge `hjteuounjwkadmsbsmdm`** (da ripristinare prima che Fable scriva migration).
Pendenti: ~~marcare doc `APP_DEFINITION` contraddittori~~ ✅ fatto 2026-07-06 (`APP_DEFINITION/STATO_FASE3_INDICE.md`); riflettere in masterplan §8 le decisioni
+ il **[NUOVO SCOPE] timbro fine turno** (dec.7).

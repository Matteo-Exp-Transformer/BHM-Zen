# Masterplan Rilancio — BHM v.2

> **Stato**: 🟡 BOZZA IN COSTRUZIONE (sessione allineamento owner ↔ agente senior)
> **Creato**: 2026-07-05
> **Scopo**: documento unico di decisioni prodotto + tecniche, da consegnare a una sessione
> **Fable** (esecuzione autonoma con subagents). Fable prima **valida** questa proposta, poi la
> **esegue** e la **migliora** restando nello scope prodotto qui definito.
> **Regola per Fable**: puoi migliorare struttura e scelte tecniche; NON allargare lo scope prodotto
> oltre quanto qui deciso senza chiedere. Migliorie fuori scope "di poco" → ok; "di molto" → chiedi.

---

## ⚙️ Sessioni parallele attive — regole di coordinamento (dal 2026-07-05)

Due sessioni senior lavorano **in parallelo** su questo masterplan. Per non sovrascriversi, ogni track
**possiede** sezioni disgiunte e lavora primariamente nel proprio handoff. **Fonte di verità unica** resta
questo file; cambiano solo le *mani* che scrivono dove.

> **Stato al 2026-07-06**: ✅ **Track B (skill-system / processo) è CONCLUSO** — §14 compilato (14.1–14.6) + `DESIGN_SKILL_CONSULENTI.md`.
> 🟢 **Track A (UI) resta attivo**. Non essendoci più due mani in scrittura contemporanea, le regole anti-collisione
> qui sotto sono **rilassate**: il Track A può toccare le sezioni condivise quando serve (annotando nel proprio handoff).

| Track | Handoff cold-start | Possiede (scrive qui) | NON tocca |
|-------|--------------------|-----------------------|-----------|
| **A · UI** | [`HANDOFF_SESSIONE_SENIOR_UI.md`](./HANDOFF_SESSIONE_SENIOR_UI.md) | **§13** + cartella [`MOCKUP_UI/`](./MOCKUP_UI/) | tutto il resto |
| **B · Skill-system / processo** | [`HANDOFF_SESSIONE_SENIOR_SKILL_SYSTEM.md`](./HANDOFF_SESSIONE_SENIOR_SKILL_SYSTEM.md) | **§14** + file skill-system (staging `_skill-system-v0/`, `IDEE_ESPERIENZA.md`, template report, entry Cursor/Codex) | §13, `MOCKUP_UI/` |
| **C · Team & delega** | — (kit auto-contenuto) | **§15** + cartella [`COLLABORAZIONE_TEAM/`](./COLLABORAZIONE_TEAM/) | §13, §14, `MOCKUP_UI/` |

**Regole anti-collisione:**
1. Ognuno modifica **solo le sezioni che possiede**. Le sezioni condivise "di lettura" (§1–§12) si
   toccano solo se strettamente necessario e **una riga alla volta**, annotando nel proprio handoff.
2. **§8 (questioni aperte)**: ciascun track spunta **solo le proprie** righe.
3. **Memoria**: ogni track usa **file di memoria distinti** (`rilancio-bhm-ui.md` per A, `rilancio-bhm-skill-system.md` per B); il file condiviso `rilancio-bhm-decisioni-fondo.md` è **read-mostly** (evitare scritture simultanee).
4. **Sync**: a fine sessione ogni track aggiorna **solo il proprio** handoff. Una sessione Meta/owner ricompone se serve.

---

## 0. Come è nato questo documento

Sessione di allineamento tra owner (ideatore, ha sviluppato con IA in solitaria) e agente senior.
Fonti lette: `GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md` (stato reale post-Fase 3),
`_skill-system-v0/` (metodo di lavoro dell'owner), `APP_VISION_CAPTURE.md`,
`BETA_PRODUCTION_SPEC.md`.

---

## 1. Decisione di fondo — direzione tecnica

**Scelta: repo nuova pulita, riuso del "cervello", UI ripensata ad hoc.**

Il taglio NON è "continuo vs ricomincio", ma passa **tra i due layer** del progetto:

| Layer | Stato attuale | Decisione |
|-------|---------------|-----------|
| **Codice / logica** (hooks, services, modelli, integrazione Supabase) | Recuperabile; bug per lo più = DB indietro sul codice + tipi non rigenerati + ~6 stub | **Riuso**, portato in repo pulita e corretto *contro lo schema DB giusto* |
| **UI / presentazione** (componenti, pagine, navigazione) | Da ripensare | **Ricostruzione ad hoc** dopo sedute UI dedicate |
| **Layer documentale** (1100+ file, report contraddittori) | Disastro cognitivo | **Quarantena** come archivio storico; verità = Fase 3 + BUG_TRACKER finché non rimappiamo |
| **Processo / conoscenza agenti** | Assente/caotico | **Skill-system-v0 installato pulito** nella repo nuova |

**Regola d'oro della migrazione** (uccide la classe di bug "codice avanti al DB"):
> Fondamenta prima: lo **schema DB corretto è la verità**. Si definisce lo schema giusto (audit-grade),
> si generano i tipi, poi la logica si porta/riscrive *contro quello schema*.

**Rischio noto dell'opzione repo-nuova**: si perde linkage Supabase/Vercel/CI e storia git →
vanno riconfigurati (voce nel piano fondamenta).

---

## 2. Fondamenta prodotto (decise)

- **Cos'è**: PWA HACCP per ristoratori — pratica (usabile coi guanti), educativa (ti dice *cosa va dove*), economica.
- **Concept guida**: *diario di lavoro* (cosa fare oggi/domani, cosa non è stato fatto ieri, chi ha fatto cosa) + istruzione HACCP integrata. → **Modello mentale d'insieme e principi di design: §9 (spina dorsale prodotto).**
- **Asset distintivo**: form conservazione **a cascata** (elimina opzioni non compatibili, insegna la conservazione corretta).
- **Target beta**: **singolo ristorante / piccola attività** (1 sede, ruoli semplici: admin, responsabile, dipendente). Codice mantenuto **scalabile** per espansione futura (catene/multi-sede).
- **Mercato**: **Italia**. Normative HACCP coerenti su mercato singolo.
- **Business**: **gratis in beta** (raccolta feedback/utenti) → **canone SaaS dopo**. In beta **nessun provider pagamenti**.
- **Tracciamento sessione**: **solo orario** (login/logout, tempo lavoro). **Niente geolocalizzazione né accelerometro** (evita mina art.4 Statuto Lavoratori + GDPR monitoraggio). Posizione eventualmente in futuro con base legale.

---

## 3. Postura legale HACCP + workstream compliance ⭐ (cuore strategico)

**Postura scelta: registro HACCP con valore (ambizione "registro ufficiale"), costruito audit-grade.**

**Target implicito reale**: un **ente HACCP** che valuti la beta come *metodo* per monitorare le
aziende italiane. Fallback: strumento utente che rende un controllo indolore (export dati live).

**Principio di scope** (tiene la beta sana):
> L'ente-HACCP è il **livello di qualità**, non una feature separata. Un tool utente con dati
> **audit-grade** (coerenti, immutabili, tracciati, esportabili) È già ciò che lo rende interessante
> a un ente. Stesso build.

**Decoupling critico** (non bloccare la beta sulla certificazione legale):
> Costruiamo ORA le **fondamenta dati audit-grade** (deterministico). Validiamo IN PARALLELO la
> **certificazione come registro ufficiale** con professionisti umani. La base è progettata perché
> *possa* diventare registro ufficiale senza rifacimenti.

**La skill "Ufficiale HACCP" va spezzata in 3 (mai mescolate):**

1. **Regole di compliance = UNA fonte di verità** (versionata, aggiornabile): soglie temperature per
   categoria alimento, regole scadenze, retention, vincoli numerici. Consumata da: app runtime +
   export + agente-ufficiale. **Mai duplicare le norme.**
2. **Skill agente-ufficiale (governance/dev-time)**: si comporta come ufficiale HACCP; valuta
   compliance dell'utente, vincoli normativi, decisioni strutturali per rendere il prodotto
   appetibile a un ente; aggiorna le regole per restare allineato alle norme. Alimentata da
   ricerca-agenti + **verifiche umane con professionisti** (pianificate).
3. **Validazione in-app (runtime)**: l'app garantisce che i parametri siano settati coerentemente e
   che i dati siano coerenti per l'export in caso di controllo. Legge dalla fonte #1.

**Implicazione fondamenta** (perché "registro ufficiale"): lo schema DB deve nascere audit-grade →
letture immutabili / tamper-evident, retention, *chi-ha-registrato-cosa-quando*, export coerente con
valore probatorio.

---

## 4. Provider stack (beta) — proposta

| Bisogno | Provider proposto | Note |
|---------|-------------------|------|
| DB / Auth / RLS / Realtime | **Supabase** | già in uso |
| Hosting PWA | **Vercel** | già in uso |
| Email (inviti, alert) | **Rimandato** → Supabase Auth (auth/inviti) in beta | provider dedicato (Resend) quando servono email prodotto |
| Notifiche | **Web Push** (PWA) + alert in-app | coprono gli alert in beta senza provider email |
| Export controllo | **PDF audit-grade** (react-pdf / jsPDF) + export strutturato (CSV/JSON) | valore probatorio |
| Error tracking | **Sentry** | già in uso |
| Agente-ufficiale (dev-time) | **Anthropic API** | NON runtime |
| Pagamenti | **Stripe** | **rimandato** (beta gratis) |

---

## 5. Scope beta — dentro / fuori

**Dentro (core, dalla visione):**
- Form conservazione a cascata + validazione temperature (asset distintivo)
- Calendario "diario di lavoro" (attività, assegnazione ruolo/reparto/dipendente, completamento)
- Inventario → lista spesa (filtri, checkbox, export)
- Alert scadenze/manutenzioni
- Timestamp sessione **solo orario**
- Export "inspection-ready" audit-grade
- Auth/onboarding multi-ruolo, multi-tenant (1 sede)
- **3 gesti-firma d'esperienza** (fatti benissimo — vedi §10.3): temperatura che "atterra", form a cascata che si "scioglie", timbro di fine turno

**Fuori beta / fase 2:**
- IA per automazioni inserimento dati (runtime)
- Geolocalizzazione/accelerometro sessione
- Pagamenti / fatturazione
- Multi-sede / catene / reportistica aggregata cross-sede
- Sincronizzazione multi-utente avanzata (conflict resolution complessa) — *da valutare quanto minimo serve in beta*

---

## 6. Sequenza di lavoro (workstream, tutti a monte di Fable dove possibile)

1. **Fondamenta prodotto** ✅ (questa sessione)
2. **Skill-system + regole compliance (fonte di verità)** — installare skill-system pulito; impostare la fonte-unica delle regole HACCP; bozza delle due skill-consulenti: **Ufficiale-HACCP** e **Ristoratore** (§9.5)
3. **Fondamenta DB audit-grade** — schema corretto (immutabilità/retention/audit), tipi generati; riconfig linkage Supabase/Vercel/CI nella repo nuova
4. **Mappatura aree + flussi utente** (il "quadro generale") — area per area, codice+DB come verità
5. **Sedute UI** — prima IA (cosa-va-dove), poi estetica
6. **Port + fix logica** contro schema corretto; ricostruzione UI
7. **Stabilizzazione + inspection-ready export**
8. **Beta release IT (gratis)**

*In parallelo continuo*: verifica compliance coi professionisti umani → aggiorna fonte regole.

---

## 7. Cosa dovrà fare Fable

1. **Validare** questo masterplan (segnalare rischi/incoerenze prima di eseguire).
2. **Eseguire** con subagents la sequenza §6, rispettando lo scope §5.
3. **Migliorare** scelte tecniche/strutturali senza uscire dallo scope prodotto.
4. Usare il **skill-system-v0** come sistema operativo di sessione (bussola, context, LOCK, chiusura).

---

## 8. Questioni aperte (da sciogliere insieme, prossime sedute)

Risolte in sessione 2026-07-05:
- [x] Provider email → **rimandato** (Supabase Auth + Web Push + alert in-app in beta)
- [x] IA automazioni runtime → **fase 2** (fuori beta)
- [x] Casa skill-system → **`docs/` casa unica** + `CLAUDE.md` root; **predisporre entry anche per Cursor (`.cursor/rules`) e Codex (`AGENTS.md`)** — una fonte di verità, tre porte d'ingresso

Risolte anche:
- [x] Modello mentale d'insieme + ruoli + principi di design → **§9** (spina dorsale prodotto)
- [x] Skill "Ristoratore" come gemella della Ufficiale-HACCP → **§9.5**
- [x] Esperienza: North-Star + principi di delizia + 3 gesti-firma beta → **§10**
- [x] Canale idee esperienza (ogni agente annota migliorie UI/compliance nel report + ledger) → **§11**
- [x] **Scheletro di navigazione** (3 lenti Oggi/Reparti/Scorte + Regia; lente-spazio = reparti assegnati) → **§12**

Risolte in seduta UI 2026-07-05:
- [x] Naming ingresso gestionale → **Regia** (§13.7)
- [x] Device → **responsive-everywhere**: desktop/tablet come banco sempre-acceso, mobile perfetto ovunque (§13.3)
- [x] Direzione visiva/interazione → §13 (clinico-caldo · terracotta · card-focus · pattern gesti-firma)

Risolte in workstream **Mappatura area-per-area** (2026-07-06 — 5 mappe + intervista owner):
- [x] **Mappatura area-per-area** (workstream §6.4) → **fatta**: 5 mappe in [`MAPPATURA_AREE/`](./MAPPATURA_AREE/00_INDICE.md) (Fondamenta · Reparti · Oggi · Regia · Scorte), codice+DB come verità, verdetto riuso per area
- [x] **Dettaglio "audit-grade"** → deciso via decisioni beta 1 e 8 (immutabilità/append-only da subito, storno invece di cancellazione, lettura temp con metadato obbligatorio + foto/note opzionali); campi in [`MAPPATURA_AREE/MAPPA_Fondamenta_DB-tipi.md`](./MAPPATURA_AREE/MAPPA_Fondamenta_DB-tipi.md)

**Decisioni beta owner** (intervista 2026-07-06 — dettaglio e impatto per-mappa in [`MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`](./MAPPATURA_AREE/DECISIONI_OWNER_BETA.md)):
1. **Registro immutabile/append-only da subito** — nessuna cancellazione fisica; `uncomplete` = **storno** tracciato (non DELETE).
2. **Dashboard ricca con dati reali** — no dati fabbricati; `/dashboard` monta la vista vera.
3. **Liste spesa in beta** — deploy delle 4 RPC shopping + unificazione dual-stack.
4. **`companies` snella** — solo P.IVA + ragione sociale, **niente** gestione licenza in beta.
5. **Notifiche = solo alert in-app** — niente tabella `notification_preferences`/canali esterni in beta.
6. **HACCP in Settings = sola lettura** — le soglie vivono in `src/compliance/haccp-rules.ts` (§14.3), non editabili da UI.
7. **🆕 Timbro di fine turno = feature dedicata «sigilla la giornata»** (definito 2026-07-06) — orario apertura/chiusura turno **+** attestazione «tutto registrato» che **chiude i record del turno** (chi/quando, immutabile). È la **firma audit-grade** che rende il registro difendibile a un controllo. Schema + UI da progettare (Track A + Fondamenta). *Vedi nota scope sotto.*
8. **Lettura temperatura** — temperatura + metodo **obbligatori**; foto e note **opzionali**.
9. **3 ruoli attivi** — titolare / responsabile / dipendente (risolve il modello ruoli doppio legacy).
10. **Ciclo scadenze completo** — `expired_at` + reinserimento (`previous_product_id`, `reinsertion_count`, `archived_at`) + storico.

> 🆕 **Nota scope (dec. 7, definita 2026-07-06)**: il *timbro di fine turno* passa da semplice "timestamp sessione solo orario" (§5) a **feature con schema e UI dedicati**: un record **shift-seal append-only** (apertura/chiusura turno + attestazione di completezza) che **sigilla** i registri del turno — la firma che chiude la giornata. Unico ampliamento di scope dalla mappatura; resta dentro i 3 gesti-firma (§10.3), non introduce nuove aree.

> **Decisioni aggiuntive post-mappatura** (dettaglio in [`DECISIONI_OWNER_BETA.md`](./MAPPATURA_AREE/DECISIONI_OWNER_BETA.md)): **dec.11** sincronizzazione multi-utente = *live-refetch conflict-free* (vedi «Ancora aperte»). **dec.12 — Scorte riformulata** (seduta UI): **«Inventario» = nuovo tipo di mansione ricorrente assegnabile** (giro dei punti → conta rimanenze → reminder → catalogo fresco → spesa auto-compilata); `products.par_level` («dovrei avere N»); **scadenza catturata all'inserimento** (nel giro = conferma; ultima scadenza + alert unità prossima); **spesa flessibile senza avanzamento/completamento**. Note UI annotate: pezzo non in catalogo → chiedi scadenza; accordion categorie.

Ancora aperte:
- [ ] Editor mappa ristorante: builder strutturato (beta) vs disegno libero (roadmap) — §12.3, confermato decoupling
- [ ] Definire come opera la skill "Ristoratore" (generazione azienda-X, output = mansioni ricorrenti) e la lista dei procedimenti automatizzabili
- [x] Quanto minimo di sincronizzazione multi-utente serve in beta — **risolto** 2026-07-06: livello **«live-refetch, conflict-free»** (dec. 11 in [`MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`](./MAPPATURA_AREE/DECISIONI_OWNER_BETA.md)). L'append-only (dec. 1) rende la concorrenza conflict-free per costruzione: nessun lock/merge/presence. Si riusa **solo** il pattern `useConservationRealtime` (invalidate-on-change), esteso a Oggi/Scorte; realtime = UX non correttezza (floor: refetch-on-focus). 🗑️ da non portare: `CollaborativeEditing`, presence/`onlineUsers`, `HACCPAlertSystem`/`TemperatureMonitor` legacy (~2.700 righe)
- [x] Mappatura → **marcare** i doc `APP_DEFINITION` contraddittori (non riscriverli) — fase separata · **fatto** 2026-07-06 → [`APP_DEFINITION/STATO_FASE3_INDICE.md`](../APP_DEFINITION/STATO_FASE3_INDICE.md)
- [ ] **⚠️ Ripristinare il token MCP** sul progetto BHM `hjteuounjwkadmsbsmdm` e **ri-verificare lo schema live** prima che Fable scriva migration (le mappe usano lo snapshot A0 del 05-07)
- [ ] Sedute UI: dopo lo scheletro, prima IA poi estetica
- [ ] Piano verifiche con professionisti HACCP (chi, quando, cosa validare)

---

## 9. Modello mentale d'insieme, ruoli e principi di design ⭐ (spina dorsale prodotto)

### 9.1 La spina dorsale: un loop, non un menu

L'app è il **ciclo di vita del lavoro** in un'attività ristorativa, che si ripete ogni giorno:

```
① IMPOSTO  →  ② FACCIO  →  ③ CONTROLLO  →  ④ DIMOSTRO ─┐
   ↑ titolare   ↑ tutti      ↑ titolare/resp  ↑ on-demand │
   └───────────────────────────────────────────────────────┘
```

- **① IMPOSTO** (titolare): codifica struttura fisica (frigo, banconi, reparti) + chi lavora + cosa/come/dove/quando + parametri HACCP. → diventa il **manuale operativo eseguibile**.
- **② FACCIO** (tutti, ogni giorno): il *diario* — cosa fare ora, registro temperature, spunto mansioni, uso automazioni (lista spesa…). **Schermata di default.** 95% degli accessi.
- **③ CONTROLLO** (titolare/responsabile): chi ha fatto cosa, cosa manca, note delle eccezioni, stato compliance. Una *lente*, non una casa.
- **④ DIMOSTRO** (on-demand): export audit-grade "ho tutto sotto controllo". **Premio** di aver fatto bene ②.

> **Punto invisibile ma cruciale**: ogni azione in ② alimenta in silenzio il registro audit-grade che produce ④. La prova legale è il *sottoprodotto* del fare, non una feature a parte.

### 9.2 Il target è il TITOLARE (non la cucina)

Chi compra, imposta ed è responsabile davanti a un controllo = il **proprietario** dell'azienda ristorativa. I dipendenti sono gli *operatori quotidiani*. Stessa app, due baricentri:

- **admin**: «ho impostato e detto tutto, compliance quasi automatica (pochi click + verifica umana reale), tranquillo in caso di controllo — ora sta ai dipendenti».
- **dipendente**: «vedo cosa devo fare; se è infattibile voglio poterlo dire; non è il mio esattore; mi serve perché so che il titolare è contento se faccio ciò che dice l'app».

### 9.3 L'app come MANUALE OPERATIVO eseguibile

Il titolare codifica una volta la struttura reale; l'app risponde alle **domande implicite del nuovo dipendente**: dove sta cosa, quando scade, cos'è previsto. → onboarding operativo del personale come sottoprodotto del setup.

### 9.4 Principi di design (LOCK di prodotto — non negoziabili)

- **Zero attrito** in ②: il dipendente non ha tempo/voglia di stare dietro all'app; compilazione facilitata, "oggi" davanti.
- **Diario di bordo dignitoso, non punitivo**: non è un controllore. Il dipendente deve poter *staccare la spina* sapendo che il suo lavoro è registrato e visibile.
- **Voce per le eccezioni**: note sulle mansioni → comunicare eventi straordinari.
- **Compliance quasi-automatica**: pochi click umani + verifica reale.
- **Automatizza il ripetibile**: individuare i procedimenti strutturali ricorrenti (lista spesa = primo caso; altri da immaginare) e automatizzarli. Motore di crescita oltre la beta.

### 9.5 Le DUE lenti di requisiti (i due consulenti dell'app)

Due skill gemelle che generano e pressano i requisiti da due lati opposti. Una feature è buona **solo se entrambe la approvano**.

- 🛡️ **Skill "Ufficiale HACCP"** (lente compliance, dettaglio §3): «passerebbe un controllo? è a norma? parametri coerenti?»
- 👨‍🍳 **Skill "Ristoratore"** (lente operativa, NUOVA): immagina la **giornata-tipo di un'azienda X** generata con casistica variabile (N clienti, N dipendenti, fatturato, nazione…), fa emergere mansioni/attività ricorrenti, indica **cosa è automatizzabile**. Motore di scoperta dei bisogni operativi reali.

> Le due lenti sono il **motore di requisiti** del prodotto: legale × reale. Fable (e l'owner) le consulta prima di validare una feature.
> **Comportamento profondo** delle due skill: [`DESIGN_SKILL_CONSULENTI.md`](./DESIGN_SKILL_CONSULENTI.md) (Track B, 2026-07-06).

---

## 10. Esperienza — North-Star, principi di delizia, gesti-firma ⭐

### 10.1 Bussola dell'innovazione: **delizia come ricompensa, mai come attrito**

La delizia arriva **dopo** l'azione (premio), mai **prima** (attesa). Per il dipendente ogni azione resta **istantanea** (UI ottimistica: sembra già fatto); la magia sta nel **feedback**, non nel processo. Nessuna animazione può costare tempo in ② (il "fare").

### 10.2 North-Star — le due "prime volte"

- **Dipendente, primo giorno**: apre e vede **la sua cucina** (mappa viva di stazioni/frigo/reparti codificati dal titolare), accoglienza calda, **scoperta** non wizard. Le domande implicite ("dove sta cosa, cosa scade, è previsto?") hanno già risposta.
- **Titolare, fine giornata**: vede il **respiro** dell'azienda (indicatore calmo, verde = tranquillo/pronto al controllo); tocca *"Genera dossier"* e il documento **si costruisce da solo** dai gesti quotidiani. **Climax emotivo** del prodotto.

### 10.3 Gesti-firma BETA (3, fatti benissimo — non venti a metà)

1. 🌡️ **La temperatura che "atterra"** — tastierone da guanti; il numero atterra con un colore che *è già* il verdetto (verde ok / ambra attento); sapere HACCP come **sussurro**, non muro.
2. 💧 **Il form a cascata che si "scioglie"** — le opzioni incompatibili **svaniscono** mentre scegli; *vedi* la logica HACCP accadere → impari senza accorgertene. (asset distintivo)
3. 🔖 **Il timbro di fine turno** — la giornata si **sigilla**; *"il tuo l'hai fatto"*, puoi staccare la spina. Dignità, non controllo.

### 10.4 Gesti-firma ROADMAP (post-beta)

- 🫧 L'**azienda che respira** (compliance viva e onesta, non cruscotto; emerge con gentilezza, non urla)
- 📦 Il **dossier che si assembla** (in beta è l'export; elevato a momento-eroe dopo)
- 🧠 App che **impara il ritmo** di *questa* cucina (opt-in, mai insistente) — motore skill Ristoratore §9.5

### 10.5 Tocco d'artigiano (juice, trasversale)

- **Aptico > sonoro** (cucina rumorosa): vibrazione breve sul task completato.
- **Voce umana da cucina**: *"Fatto!"*, non *"Operazione completata con successo"*.
- **Sapere che si rivela e poi sparisce**: micro-tip HACCP alla prima volta, poi si dissolve (progressive disclosure dell'expertise).
- **Modalità turno / focus**: all'inizio turno l'app mostra solo le poche cose di oggi, grandi, che scorrono. Carico mentale ~0.

---

## 11. Canale idee esperienza — governance continua di design ⭐

Meccanismo perché **ogni agente che tocca un componente** contribuisca a renderlo più bello/innovativo, **senza scope creep**. Volontà dell'owner: sfruttare ogni agente operativo come piccolo designer che lascia semi.

### 11.1 Principio: **annota, non implementare**

Ogni agente che opera su un elemento si chiede attivamente: *«esiste un modo più bello, più fluido, più innovativo per la navigazione o per l'esperienza di compliance?»* Se sì → **lo annota**. **Non** lo implementa (salvo sia il suo task). Cattura idea ≠ sforare lo scope.

### 11.2 Dove vanno le idee — ledger vivo

File nello skill-system: **`comunicazione/IDEE_ESPERIENZA.md`**. Ogni voce:
`componente/area · idea (1-3 righe, gusto personale ESPLICITAMENTE invitato) · perché migliora (navigazione | compliance) · stato (💡 grezza → 🔬 da valutare → ✅ adottata → 📦 archiviata) · autore-sessione`.

### 11.3 Nel report — obbligo leggero

`sessioni/_TEMPLATE_REPORT.md` guadagna una sezione: **«💡 Idee esperienza (gusto personale)»** — l'agente annota le idee UI/navigazione/compliance avute *mentre lavorava sull'elemento*. Anche **"nessuna"** è valida. Basso attrito: 1-3 righe. Le idee non banali finiscono anche nel ledger §11.2.

### 11.4 Calibrazione (idee on-brand)

L'agente calibra su §10: delizia = ricompensa non attrito · voce umana · sapere che si rivela e sparisce · i 3 gesti-firma come lingua di riferimento. Idee fuori da questa lingua → si annotano comunque, marcate 🔬.

### 11.5 Chi decide (no auto-adozione)

Le idee 💡 **non si auto-adottano**. Una sessione Meta/owner le rivede periodicamente (come le `PROPOSTE.md` del vocabolario) e promuove a ✅ le giuste. Coerente col principio **chi esegue ≠ chi affina**.

> **Per Fable**: all'installazione dello skill-system, creare `IDEE_ESPERIENZA.md`, aggiungere la sezione «💡 Idee esperienza» al template report, e una **RULE globale** in bussola: *«su ogni componente, valuta attivamente se esiste una versione più bella/innovativa; se sì, annotala nel ledger — non implementarla fuori task»*.

---

## 12. Scheletro di navigazione ⭐

### 12.1 Tre lenti sullo stesso lavoro (mondo del dipendente)

Il dipendente non naviga "pagine": guarda lo **stesso lavoro** da tre angoli complementari.

- 🕐 **Oggi** (lente **TEMPO**): il diario di bordo — cosa fare ora; scorri ieri (*non fatto*)/domani (*mi porto avanti*)/settimana, ma "ora" è casa; **timbro di fine turno**.
- 🧭 **Reparti** (lente **SPAZIO**): i reparti **assegnati** all'utente dall'admin; navigabile se più d'uno. Dentro ogni reparto: struttura + punti di conservazione + **registra temperatura** + **form a cascata**. La "cucina" è solo **UNO** dei reparti possibili (sala, bar, bancone, magazzino, pasticceria, pizzeria…).
- 📦 **Scorte** (lente **STOCK**): inventario + lista spesa, filtrabile per reparto.

> Stesso item, due lenti: una manutenzione appare in **Oggi** quando scade *e* sul suo punto nel suo **Reparto** (vista-tempo vs vista-spazio).

### 12.2 La barra si trasforma col ruolo

```
DIPENDENTE (baricentro ②)            TITOLARE / RESPONSABILE (② + ①③④)
[ Oggi · Reparti · Scorte ]   -->    [ Oggi · Reparti · Scorte · 🎬 Regia ]
```

- **🎬 Regia** (nome provvisorio, vedi §12.5) = unico ingresso gestionale del titolare: **① Imposto** (azienda, staff, reparti, punti, parametri HACCP; l'onboarding vive qui) · **③ Controllo** (chi ha fatto cosa, cosa manca, note-eccezioni, "respiro" azienda) · **④ Dimostro** ("Genera dossier"/export).
- **Tab centrale dinamica**: 1 solo reparto assegnato → mostra il nome del reparto (es. "Cucina"); più reparti → "Reparti" con **mappa navigabile**.

### 12.3 La mappa del ristorante + editor (idea forte)

Il titolare **codifica** la struttura reale: reparti, e dentro ciascuno i punti (frigo, banconi, stazioni). Renderizzata come **mappa/schematico navigabile** = il manuale operativo visivo (North-Star nuovo dipendente §10.2).

- **Beta → builder strutturato** (non CAD): crei reparti, aggiungi punti come **card/zone ordinabili** in uno schematico pulito. ~80% del valore di orientamento, dati audit-friendly, tempi umani.
- **Roadmap → editor a disegno libero** ("disegna il tuo ristorante"): asset di vendita/demo potentissimo, **non** beta-critico.
- **Decoupling**: i DATI sono gli stessi (reparti → punti). Schematico ora, planimetria disegnata dopo, **senza rifacimenti**.
- **Fondamenta**: **reparti = cittadini di prima classe** con FK vere → risolve il bug Fase 3 "reparto stringhe hardcoded che viola la FK". Punti, prodotti, mansioni **appartengono** a un reparto.

### 12.4 Collocazioni

| Elemento | Posto |
|----------|-------|
| 🌡️ Temperatura che "atterra" | **Reparti** (tocchi il punto → registri) |
| 💧 Form a cascata | **Reparti** (uso) + **Regia/①** (setup) |
| 🔖 Timbro fine turno | **Oggi** |
| 🗺️ Mappa reparti (orientamento nuovo dipendente) | **Reparti** |
| 🫧 Azienda che "respira" (roadmap) | **Regia/③** |
| 🔔 Alert (scadenze/manutenzioni) | in cima a **Oggi** + campanella (emergono con gentilezza, non una tab) |
| 👤 Account / sessione / logout | avatar in un angolo |
| ➕ Programmazione/assegnazione attività | **Regia/①** (gesto del titolare) |

### 12.5 Naming (aperto)

- Ingresso gestionale titolare: **Regia** vs **Gestione** — *da decidere* (Regia = più carattere/voce; Gestione = più chiaro).
- Tab centrale: nome-reparto se singolo, "Reparti" se multipli.

---

## 13. Direzione UI ⭐ (seduta reasoning senior, 2026-07-05)

Decisa con l'owner. **Vincola** i mockup HTML di esempio e la futura ricostruzione UI ad hoc.
Temperamento e interazione scelti per tenere insieme la tensione-identità del prodotto:

> **Serietà nella struttura** (credibile a un ufficiale HACCP) × **calore nel feedback** (umano per
> chi lavora coi guanti). Base professionale, anima calda.

### 13.1 Temperamento visivo: **Clinico-caldo**
- **Base**: neutro **caldo** (avorio / grigio-sabbia leggerissimo), non bianco clinico freddo-azzurrino. Tanto respiro, poche linee.
- **Inchiostro**: quasi-nero **caldo**, mai nero puro.
- **Colore = verdetto, non decorazione**: il colore compare quasi solo per *significare* → 🟢 verde ok · 🟠 ambra attento · 🔴 rosso (raro) fuori-norma. Colore ovunque = colore che non dice niente.
- **Tipografia**: una sola famiglia sobria e moderna; gerarchia per **peso e dimensione**, non per colori.

### 13.2 Accento di brand: **Terracotta / arancio bruciato**
- Usato **con parsimonia**: brand + azioni primarie. Caldo/cibo/artigianale ma sobrio; **non collide** col verde semantico del verdetto.

### 13.3 Device: **responsive-everywhere** ("il banco di lavoro")
- **Copertura completa obbligatoria.** App pensata per **restare aperta su desktop/tablet** al banco (compagno sempre-acceso) ma deve girare **perfettamente su mobile** in *ogni* funzione. Nessuna schermata "solo desktop".
- **Stessa architettura informativa** ovunque; la UI **si dispiega**: bottom tab bar (mobile) → **side-rail** (desktop); card 1-colonna → 2-colonne; la Regia usa la larghezza per il setup pesante.

### 13.4 Schermata **Oggi**: flusso a **card-focus**
- **Modalità-turno**: poche card grandi, gerarchia *ora / a breve / fatto*, che scorrono. Carico mentale ~0 (§10.5). Non una tabella densa.
- **Card = una cosa sola**: verbo grande in cima ("Registra temperatura — Frigo 2"), minimo indispensabile, **azione a tutta larghezza in fondo** (pollice, guanti). Le card *fatte* scivolano giù e desaturano.
- **Alert** in cima come **nastro gentile**, non una tab (§12.4). **Avatar/account** in un angolo.

### 13.5 I 3 gesti-firma — pattern di micro-interazione
1. 🌡️ **Temperatura che atterra**: tastierone mezzo schermo; al conferma il numero **cade** con micro-rimbalzo e lo sfondo diventa il **verdetto-colore** (il colore *È* la frase, niente "conforme"); sussurro HACCP grigio che si **dissolve** dopo ~2s.
2. 💧 **Form che si scioglie**: le opzioni incompatibili **svaniscono** (fade + collapse), non si disabilitano; lo spazio si stringe attorno alla scelta corretta. **Unica animazione con diritto di durare** — perché *insegna*. **Ritmo obbligato** (feedback owner): *mostra le possibilità (tempo per vederle) → scioglimento lento e scaglionato → scelta giusta evidenziata*. Mai veloce, altrimenti si perde il senso didattico.
3. 🔖 **Timbro di fine turno**: un **sigillo si imprime** (scale-down rapido + aptico secco), la lista di oggi si **acquieta/desatura**; *"Il tuo l'hai fatto"* — **dignità, non controllo**.

### 13.6 Regole di micro-interazione (juice, trasversali)
- **⏱️ Tempo = pulizia nitida e tranquilla, non fretta** (feedback owner, 2026-07-06) — **regola GLOBALE di sistema**: le animazioni non devono dare sensazione di urgenza/scatto, ma di calma ordinata. Durate più lunghe, easing morbido, le pause fanno parte del gesto. Vale per **tutte** le coreografie (onboarding, cascata, rivelazione passi, micro-feedback). _(Nota: il default va tarato in fase di implementazione; i mockup attuali sono ancora troppo rapidi.)_
- **UI ottimistica**: l'azione sembra già fatta; la magia è nel **feedback**, mai nell'attesa (§10.1). Nessuna animazione costa tempo in ② (il fare).
- **Aptico > sonoro** (cucina rumorosa): vibrazione breve sul completato.
- **Voce umana da cucina**: *"Fatto!"*, non *"Operazione completata"*.
- **Sapere che si rivela e poi sparisce**: micro-tip HACCP alla prima volta, poi si dissolve (progressive disclosure).

### 13.7 Naming (chiuso)
- Ingresso gestionale titolare = **Regia** ✅ (più carattere, coerente con la voce; il titolare "dirige").
- Tab centrale: **nome-reparto** se singolo · **"Reparti"** se multipli (§12.2).

### 13.8 Mockup HTML — fonte di verità visiva + asset marketing
Mockup HTML self-contained in [`MOCKUP_UI/`](./MOCKUP_UI/00_INDICE_MOCKUP.md) — **doppio uso deciso dall'owner**:
(1) fonte unica di verità per ricostruire la UI ad hoc; (2) materiale marketing/demo/video (navigabili, mobile→desktop, light/dark). Ordine §3.2 handoff, ogni mockup dimostra un principio §10 (delizia nel feedback):

| # | Schermata | Stato |
|---|-----------|-------|
| 1 | **Oggi** (card-focus · 🌡️ atterra · 🔖 timbro) — [`01_OGGI_dipendente.html`](./MOCKUP_UI/01_OGGI_dipendente.html) | ✅ approvato owner ("mi piace molto") |
| 2 | **un Reparto** (mappa punti + 🌡️ dallo spazio + 💧 assaggio) — [`02_REPARTO_cucina.html`](./MOCKUP_UI/02_REPARTO_cucina.html) | ✅ approvato owner |
| 3 | **Form a cascata** (💧 che si scioglie) — [`03_FORM_CASCATA.html`](./MOCKUP_UI/03_FORM_CASCATA.html) | ✅ approvato owner ("molto bello") · ritmo cascata rallentato |
| 4 | **Regia** overview (🫧 respiro + 📦 "Genera dossier", su tablet) — [`04_REGIA_titolare.html`](./MOCKUP_UI/04_REGIA_titolare.html) | ✅ approvato owner ("bellissimo") |
| 5 | **Onboarding titolare** v2 (barra cantiere chiudibile/navigabile · 🌡️ temperatura dal profilo read-only · card che si raggruppa e vola nella sidebar) — [`05_ONBOARDING_admin.html`](./MOCKUP_UI/05_ONBOARDING_admin.html) | 🟢 owner: "il resto va bene ottimo" — **polish pendente: rallentare le animazioni** (§13.6) |
| 6 | **Scheletro di navigazione** (le 4 case Oggi/Reparti/Scorte/Regia su mobile **e** desktop, sincronizzati; barra che si trasforma col ruolo; tab Reparti dinamica; "stesso item, due lenti") — [`06_NAVIGAZIONE_shell.html`](./MOCKUP_UI/06_NAVIGAZIONE_shell.html) | 🔄 **proposto — attesa ok navigazione**; rende toccabile §12 (nessuna scelta nuova, visualizza il deciso) |
| 7 | **Scorte** v2 (📦 **Inventario = mansione**: giro punti → conta rimanenze → conferma scadenza; ingredienti per categoria; par «dovrei avere N»; spesa auto-compilata ma **libera, senza completamento**) — [`07_SCORTE.html`](./MOCKUP_UI/07_SCORTE.html) | 🔄 **proposto** (riformulato con owner, dec.12). Note aperte annotate: pezzo non-in-catalogo → chiedi scadenza; accordion categorie. *Onboarding dipendente: no mockup — carta bianca a Fable.* |

**Serie base completa** (4/4 approvati) + **mockup 5 Onboarding v2** (impianto approvato, resta il polish del tempo animazioni).
Prima del mockup 5 è stata scritta la **mappa dei 7 step onboarding** ([`MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md`](./MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md), fonte legacy: cosa chiediamo + scrittura DB).
Note interazione da applicare in produzione: rivelazione progressiva **più lenta e in dissolvenza** senza auto-scroll brusco **e** il **tempo calmo globale** (§13.6) — vedi `MOCKUP_UI/00_INDICE_MOCKUP.md` → Note di interazione.
**Residuo Track A**: replicare il «profilo punto di conservazione» anche nel **modal della pagina Conservazione** (mockup a sé).

---

## 14. Skill-system & processo agenti ⭐ (Track B — in definizione)

> **Proprietà**: Track B (`HANDOFF_SESSIONE_SENIOR_SKILL_SYSTEM.md`). Il Track A (UI) non scrive qui.
> **Scopo**: decidere come installare **pulito** lo skill-system nella repo nuova, così che Fable lo usi
> come sistema operativo di sessione (bussola · context · LOCK · chiusura). Base di partenza: metodo
> dell'owner in [`../../Archive/_skill-system-v0/`](../../Archive/_skill-system-v0/) (già decisioni sparse in §6.2, §8, §11).

### 14.1 Decisioni ereditate (già prese altrove, da consolidare qui)
- **Casa unica `docs/` + `CLAUDE.md` root**; **tre porte d'ingresso** su una sola fonte di verità: Cursor (`.cursor/rules`) e Codex (`AGENTS.md`) oltre a Claude (§8).
- **Canale idee esperienza** (§11): ledger `IDEE_ESPERIENZA.md`; sezione «💡 Idee esperienza» nel `_TEMPLATE_REPORT.md`; **RULE globale** in bussola ("su ogni componente valuta se esiste una versione più bella/innovativa; se sì annota, non implementare fuori task").
- **Due skill-consulenti** (§9.5): Ufficiale-HACCP + Ristoratore — qui si definisce **dove vivono** e lo scaffolding; il *comportamento profondo* è tema separato.

### 14.2 Installazione nella repo nuova (decisa)

- **Casa**: il v0 va **pari-pari** sotto `docs/skill-system/` (niente più `_v0`/`Archive`), ma **adattabile** — si espande/snellisce su misura di BHM, scalabile, **non blindato**. Approccio iterativo: si installa, si testa, si corregge.
- **Tre porte in root** puntano tutte a `docs/skill-system/…` (rimando, non copia — già nel template):
  Claude → `CLAUDE.md` · Cursor → `.cursor/rules/comandi-base.mdc` (`alwaysApply: true`) · Codex → `AGENTS.md` (rimanda a `CLAUDE.md`, non duplica).
- **Sottosistema didattico**: **SPENTO** per la beta (non creare i file vivi privati; ignorare passo 8-bis del `MANUALE_AVVIO.md`). Riattivabile in futuro senza toccare il resto.
- **Aree/skill da riempire** con la mappa reale del prodotto (§12): Oggi / Reparti / Scorte / Regia + le due skill-consulenti (sotto).
- **Skill-consulenti (§9.5) — dove vivono**: scaffolding in `aree/` — `aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md`. Qui solo *collocazione + scaffolding*; il **comportamento profondo** è di un altro track.

### 14.3 Fonte-unica regole HACCP + Change-Control (decisa) ⭐

Separazione **numeri ↔ senso**, ognuno con una sola casa, nessun dato scritto due volte:

| Cosa | Dove | Formato |
|------|------|---------|
| **NUMERI** (soglie, retention, vincoli) | `src/compliance/haccp-rules.ts` (**codice app**, non skill-system) | modulo **TS tipato**, git-versionato |
| **SENSO** (fonte normativa, razionale, chi ha validato) | `docs/skill-system/context/COMPLIANCE_CONTEXT.md` | MD; **linka ogni `rule-id`**, non riscrive i numeri |
| **Richieste di aggiornamento** (input umano/normativo) | `docs/skill-system/comunicazione/AGGIORNAMENTI_HACCP.md` | ledger; l'agente-ufficiale lo traduce in modifica strutturata |

**Perché TS in git e non DB**: git = registro tamper-evident *chi-cosa-quando* (gratis, coerente audit-grade §3); tipi forti = l'agente non inventa struttura; "aggiornabile" = PR con review, **non** una query al volo. Il DB sarebbe la mossa post-beta (norme editabili a runtime da non-dev), rischiosa per l'audit.

**Ogni regola porta la sua identità**: `id · version · effective_from · min/max/unit · source_ref (→ COMPLIANCE_CONTEXT) · validated_by`.

**Procedura Change-Control (3 gate — chi propone ≠ chi valida ≠ chi blinda):**

| Gate | Chi | Cosa |
|------|-----|------|
| **1 · Proposta** | agente-ufficiale | traduce `AGGIORNAMENTI_HACCP.md` in modifica: **bumpa `version` + `effective_from`**, mai sovrascrive la storia |
| **2 · Blindatura macchina** | test/schema | valida il file (id unici, range plausibili, `source_ref` presente, campi obbligatori). Fallisce → **il cambio non entra**. È la rete contro l'errore accidentale — **mai saltata** |
| **3 · Approvazione umana** | **professionista** *oppure* **owner** (autorizzazione esplicita) | la regola nasce `validated_by: pending`; l'app tratta le `pending` con cautela. L'**autorizzazione diretta dell'owner soddisfa questo gate** (l'owner È l'autorità umana); il gate-2 resta comunque attivo |

`haccp-rules.ts` è **LOCK** in bussola. Nessun agente lo tocca "di passaggio".

> Scope Track B: definiti **collocazione + formato + procedura**. **NON** i numeri/soglie né il comportamento profondo dell'agente-ufficiale (track compliance). Fable crea il file; noi lasciamo lo stampo e le regole del gioco.

> **Come si costruisce la compliance in beta** (deciso 2026-07-06): la fonte-regole la costruiamo **noi** (owner + agenti) da **materiale ufficiale online aggiornato** — ogni regola col `source_ref` alla fonte. Le regole nascono `pending` ma **usabili** (dati audit-grade); diventano `certified` quando le proponiamo al **gate umano professionale al momento della certificazione**. Dettaglio: [`DESIGN_SKILL_CONSULENTI.md`](./DESIGN_SKILL_CONSULENTI.md) §2.4-bis.

### 14.4 Primo set di RULE globali (per la bussola §2)

Le 3 generiche del v0 (leggi-intero-prima-di-editare · anti-duplicazione · logger) **+**:
- **idee-esperienza** (§11): su ogni componente valuta se esiste una versione più bella/innovativa → se sì **annota** in `IDEE_ESPERIENZA.md`, non implementare fuori task.
- **HACCP-lock**: `src/compliance/haccp-rules.ts` è LOCK; si cambia solo via Change-Control §14.3. Numeri solo lì, senso solo in `COMPLIANCE_CONTEXT.md` — **mai un numero due volte**.
- **HACCP-owner-override**: autorizzazione esplicita dell'owner = gate umano soddisfatto → l'agente procede; **gate-2 macchina mai saltato**.
- **timezone** (BHM-specifica, bug ricorrente): mai `date.toISOString().split('T')[0]` per una data locale (Italia CET) → usa formattazione locale.
- **audit-grade** (rimando): registri temp/timbri append-only/immutabili → invariante di **schema DB**, proprietà del track DB; qui solo il puntatore.
- **file-footer** (tracciabilità doc — *owner, 2026-07-06*): ogni file **LOCK**, **skill** o documento importante porta in fondo un footer `**Ultimo aggiornamento**: <data> · <cosa è cambiato> · → <report>` **agganciato al report di lavoro svolto** che documenta quella modifica. Il footer è il capo del filo (leggibile a colpo d'occhio); il **report** tiene il *perché/come*; **git** tiene il *chi/quando*. Nessuna modifica importante resta senza traccia. È l'**audit-grade §3 applicato alla documentazione stessa** — coerente col perché-TS-in-git di §14.3 (registro tamper-evident). L'aggancio è **bidirezionale**: il report elenca i file toccati, il file punta al report.

### 14.5 Cosa resta per Fable (installazione)

1. Copiare `docs/skill-system/` nella repo nuova; rinominare le 3 porte in root; riempire i `{{segnaposto}}` (comandi, stack, id ambienti prod/test).
2. Compilare bussola/context con le aree reali (§12) + creare `IDEE_ESPERIENZA.md` e la sezione «💡 Idee esperienza» nel `_TEMPLATE_REPORT.md` (§11).
3. Creare `src/compliance/haccp-rules.ts` (stampo tipato, numeri dal track compliance) + `COMPLIANCE_CONTEXT.md` + `AGGIORNAMENTI_HACCP.md` + il test di validazione (gate-2).
4. Scaffolding `aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md` (comportamento profondo = altro track).
5. Installare le RULE §14.4 nella bussola §2. Didattico: **non** attivare.
6. **Seed del vocabolario base** (§14.6): popolare `comunicazione/VOCABOLARIO.md` con un lessico-mappa iniziale, così gli agenti non ripetono frasi lunghe («punto di conservazione»…) e chiamano ogni elemento con **un nome solo**.
7. **Convenzione footer-tracciabilità** (RULE `file-footer` §14.4): definire **una volta** il formato del footer «Ultimo aggiornamento · cosa · → report» e stamparlo su tutti i file **LOCK/skill/context**; nel `_TEMPLATE_REPORT.md` aggiungere il **doppio aggancio** report ⇄ file toccati (il report elenca i file, ogni file linka il report). Chiusura sessione (passo di chiusura bussola): l'agente aggiorna i footer dei file che ha toccato prima di consegnare.

> **Licenza di reinterpretazione (Fable)**: gli stampi qui definiti (skill, archetipi, formati) non sono gabbie. Fable può **reinterpretare in chiave più intelligente** ciò che legge se trova una lettura migliore, dentro lo scope prodotto (migliorie «di poco» ok, «di molto» chiedi). **Eccezione dura**: numeri/norme con `source_ref` si cambiano solo via Change-Control §14.3.

### 14.6 Vocabolario base — seed per Fable (decisa) ⭐

Fable, all'installazione, **propone un vocabolario base** invece di partire da zero. Obiettivo dell'owner: **un linguaggio unico per gli elementi** che l'app crea, per non ripetere ogni volta termini lunghi e per identificare a colpo d'occhio pagine/tab/sezioni.

**Lessico-mappa — nomi di pagine/tab/sezioni (già CANONICI, decisi §12/§13 — non sono proposte):**

| Nome canonico | Cos'è | Lente |
|---------------|-------|-------|
| **Oggi** | il diario di bordo (cosa fare ora; timbro fine turno) | Tempo |
| **Reparti** | tab centrale (nome-reparto se singolo); struttura + punti + registra temp + cascata | Spazio |
| **Scorte** | inventario + lista spesa | Stock |
| **Regia** | ingresso gestionale titolare: ① Imposto · ③ Controllo · ④ Dimostro | — |

**Lessico-mappa — nomi corti degli ELEMENTI (Fable li propone in `PROPOSTE.md`, l'owner approva; questi sono il seed suggerito):**

| Termine lungo attuale | Nome corto proposto |
|-----------------------|---------------------|
| punto di conservazione | **punto** (dentro un reparto; sigla `PdC` nei doc) |
| form conservazione a cascata | **cascata** |
| timbro di fine turno | **timbro** |
| registrazione temperatura (gesto «che atterra») | **registra temp** |
| mappa/schematico dei reparti | **mappa** |
| export audit-grade («Genera dossier») | **dossier** |
| registro immutabile che alimenta il dossier | **registro** |

> **Regola del seed**: i **nomi di pagina/tab** sono canonici (decisi dall'owner) → entrano diretti. I **nomi-elemento** restano **proposte** finché l'owner non li conferma (chi esegue ≠ chi affina). Il **lessico-comando** (prepara / implementa / revisiona / lavoro ok / ragioniamo…) è già ereditato dal v0 (`comandi-base` + `VOCABOLARIO`), non va reinventato.

---

## 15. Team & delega ⭐ (Track C — kit collaborazione)

> **Proprietà**: Track C. Kit auto-contenuto in [`COLLABORAZIONE_TEAM/`](./COLLABORAZIONE_TEAM/).
> **Scopo**: dare all'owner un metodo professionale per **delegare, supervisionare, controllare e
> contro-verificare** il lavoro di **max 2 collaboratori** su più branch, senza perdere il controllo di
> `main`. È materiale **per l'owner umano**, non codice runtime.

### 15.1 ⚠️ Attivazione — on-demand, NON prassi di default (decisione owner)
Questo kit è una **feature che si attiva solo quando l'owner delega**: contesto caricato **su richiesta**,
non una RULE always-on. **Owner che lavora da solo → non si carica** (nessun overhead). L'unico aggancio
always-on ammesso è una voce nel `VOCABOLARIO` («delego»/«modalità team» → carica il kit). Per Fable:
installarlo tra le skill/aree **caricabili**, non tra le RULE globali della bussola §2 (dettaglio in
`COLLABORAZIONE_TEAM/01_DESIGN_METODO.md` §6.1).

### 15.2 Impianto (deciso, eredita il DNA del progetto)
- **Topologia a canale sicuro**: `feature/<task>` (collaboratore pusha) → **`integrazione`** (pre-main,
  integra l'owner; un merge di troppo atterra qui) → **`main`** (sacro, **solo owner + suoi modelli**
  promuovono; branch protetto). Invariante non negoziabile.
- **Due modalità di delega** (scelte **per task**, non per persona): **Ordine di Lavoro** (prescrittivo,
  «cosa e come» — per il collaboratore-prompt e per ogni task 🔴) · **Mandato** (a obiettivo, «cosa e
  confini» — per il collaboratore-autonomo su task 🟢/🟠).
- **3 gate d'accettazione** (ricalcano il Change-Control §14.3): ① macchina (build/type/lint/test) · ②
  **controverifica visiva** del collaboratore (checklist visiva guidata dal suo agente — sostituisce lo
  screenshot) · ③ owner (4 controlli della `CONTROVERIFICA.md` sul diff+report).
- **Chi esegue ≠ chi integra ≠ chi promuove** (§11.5/§14.3 applicato agli umani).

### 15.3 Cosa resta a Fable
Configurare la topologia sulla repo nuova (`main`+`integrazione` protetti, collaboratori solo su
`feature/*`); portare il kit in `docs/`; installarlo come contesto **on-demand** (§15.1). **Licenza di
miglioramento** come §14.5, **tranne** l'invariante «`main` protetto, solo owner promuove».

---

**Ultimo aggiornamento**: 2026-07-06 · **Track C aggiunto** (§15 + `COLLABORAZIONE_TEAM/`: topologia
canale sicuro, 2 modalità di delega, 3 gate, kit on-demand) · **Track B concluso** (§14 completo +
`DESIGN_SKILL_CONSULENTI.md`) · Track A: §13 direzione UI + **mockup 5 Onboarding v2** + mappa 7 step
onboarding + **regola globale tempo animazioni §13.6** (polish rallentamento pendente) · **Mappatura
aree conclusa** (§8: 5 mappe `MAPPATURA_AREE/` + 10 decisioni beta owner; nuovo scope = timbro fine
turno feature dedicata) · **RULE `file-footer`** aggiunta a §14.4/§14.5 (cross-cut owner: footer
«ultimo aggiornamento → report» su file LOCK/skill/importanti — audit-grade applicato ai doc)

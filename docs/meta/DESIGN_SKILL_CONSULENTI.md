# Design — Skill-consulenti (le due lenti di requisiti)

> **Stato**: 🟡 IN DEFINIZIONE · **Creato**: 2026-07-06 · **Track**: B (esteso oltre §14 su richiesta owner)
> **Fonte di verità decisionale**: masterplan §9.5 (le due lenti) + §3 (Ufficiale-HACCP) + §14.3 (fonte-regole).
> Questo file definisce il **comportamento profondo** delle due skill-consulenti; la loro *collocazione*
> è in §14.2 (`aree/UFFICIALE_HACCP_SKILL.md` + `aree/RISTORATORE_SKILL.md`).

---

## 0. Cosa sono e perché due

Sono i **due consulenti dell'app** (§9.5): skill dev-time (non runtime) che **generano e pressano i
requisiti da due lati opposti**. Una feature è buona **solo se entrambe la approvano**. Sono il
**motore di requisiti** del prodotto: legale × reale. Fable e l'owner le consultano *prima* di validare
una feature.

| Lente | Domanda che pone |
|-------|------------------|
| 🛡️ **Ufficiale-HACCP** (compliance) | «passerebbe un controllo? è a norma? parametri coerenti?» |
| 👨‍🍳 **Ristoratore** (operativa/reale) | «serve davvero? si fa coi guanti alle 18? chi lo farà?» |

### Il gate a due lenti
Una feature/mansione **entra** solo se entrambe approvano. Se la Ristoratore dice *«nessuno lo farà
mai»* → la feature è morta **anche se è a norma**. Se l'Ufficiale dice *«non è conforme»* → si ripensa
**anche se è comodissima**. Output di entrambe = **dati/proposte, mai auto-adozione** (chi esegue ≠ chi
affina): promuove l'owner/Meta.

---

## 1. 👨‍🍳 Skill Ristoratore — comportamento profondo

**In una frase**: il **motore di scoperta dei bisogni operativi reali**. Non dice cosa è a norma —
dice *cosa succede davvero in cucina e cosa possiamo automatizzare*.

### 1.1 Input — i parametri dell'azienda-X
Instanzia un'azienda **concreta** (non un'astrazione), dai parametri a casistica variabile:
- tipo attività · coperti/clienti-giorno · fatturato indicativo
- N dipendenti e **ruoli** (cuoco, aiuto, cameriere, banconista, titolare-operativo…)
- **reparti** presenti (cucina, sala, bar, magazzino, pasticceria, pizzeria…)
- ritmo/stagionalità · giorni di chiusura · turni
- nazione/normativa (**IT** per la beta)

### 1.2 Processo — come ragiona (4 passi)
1. **Instanzia**: *«Trattoria da Mario, 40 coperti, 3 persone, cucina+sala+magazzino»*.
2. **Simula la giornata-tipo**: apertura → mise en place → servizio → chiusura, **per ruolo e reparto**.
   Include **l'eccezione** (giorno di casino, task saltato), non solo lo scenario ideale.
3. **Estrae le mansioni ricorrenti**: `chi · dove (reparto) · quando (freq. g/sett/mese) · perché
   (operativo | HACCP)`.
4. **Marca l'automatizzabile**: ripetibile e strutturale → candidato automazione (come la lista spesa,
   §9.4) vs richiede-giudizio-umano.

### 1.3 Postura — le regole di comportamento
- **Coi piedi per terra**: tutto passa dal filtro *zero-attrito* (§9.4) — «un cuoco in servizio non ha
  3 minuti per un form».
- **Scenari plausibili, non ottimistici**: mette in conto il dipendente che salta un passaggio.
- **Non inventa obblighi normativi**: resta sul piano operativo; il «è obbligatorio?» lo gira
  all'Ufficiale-HACCP.
- **Output = dati/proposte**: le mansioni scoperte vanno in un ledger; le promuove l'owner/Meta.
- **Calibra** su §9.4 (automatizza il ripetibile) e §10 (delizia come ricompensa).

### 1.4 Output — catalogo archetipi + invocabile (deciso)
Doppia forma (scelta owner 2026-07-06):
- **Catalogo archetipi**: asset versionato, generato una volta, che alimenta i **default di onboarding**
  e il **calendario diario-di-lavoro**. Un file per archetipo.
- **Invocabile ad-hoc**: la skill resta viva per un caso nuovo (tipo attività non previsto) o per
  validare una feature.

```
docs/skill-system/aree/RISTORATORE_SKILL.md      ← come ragiona (metodo §1.1–1.3)
docs/skill-system/aree/ARCHETIPI/
  trattoria.md · pizzeria.md · bar.md · pasticceria.md · pub.md · cocktailbar.md
    → mansioni ricorrenti (chi·dove·quando·perché)
    → candidati automazione
```

### 1.5 Archetipi beta (CONFERMATI — 6)
Scelti per **stressare il prodotto in modi diversi**, non copie l'uno dell'altro:

| Archetipo | Cosa mette alla prova |
|-----------|----------------------|
| **Trattoria** (cucina+sala+magazzino) | caso base: cucina piena, ruoli classici |
| **Pizzeria** (forno, impasti, lievitati) | un **reparto specializzato** ≠ cucina; conservazione impasti |
| **Bar/caffetteria** (banco, vetrina, poca cucina) | il caso **senza cucina** — verifica che «la cucina è solo UNO dei reparti» (§12) regga |
| **Pasticceria/gelateria** (freddo critico, semilavorati) | **compliance stringente** + lavorazioni mattutine/notturne |
| **Pub/birreria** (spillatura, magazzino fusti/bottiglie, fritti) | **orari serali/notturni** + magazzino bevande + cucina semplice ad alto volume |
| **Cocktailbar/restaurant** (bar cocktail + cucina ristorante) | **ibrido a doppio reparto forte**: ghiaccio/garnish/distillati × cucina piena insieme |

---

## 2. 🛡️ Skill Ufficiale-HACCP — comportamento profondo

**In una frase**: il **motore di tenuta legale** — non dice cosa è comodo, dice *cosa regge davanti a
un'ispezione* e cosa espone l'utente (e il prodotto) a un rilievo. **Infrastruttura già decisa**
(masterplan §3 + §14.3): fonte-unica regole `src/compliance/haccp-rules.ts`, Change-Control a 3 gate,
senso/norma in `context/COMPLIANCE_CONTEXT.md`. Qui: il suo *ragionamento*.

### 2.1 Input — su cosa ragiona
- una **feature/flusso/schema** proposto (dev-time: «questo design regge a un controllo?»), oppure
- lo **stato-dati di un'azienda-X** («questa azienda passerebbe un'ispezione oggi?»), oppure
- un **aggiornamento normativo** in arrivo (da `AGGIORNAMENTI_HACCP.md`).

Legge **sempre** la fonte: `haccp-rules.ts` (numeri) + `COMPLIANCE_CONTEXT.md` (norma/senso).

### 2.2 Processo — come ragiona (mindset ispettivo, 4 passi)
1. **Si mette nei panni dell'ispettore**: simula un controllo reale — «cosa chiederebbe? cosa vorrebbe
   vedere *documentato*?».
2. **Cerca il buco**: dove il dato può essere incoerente, mancante, **alterabile**, non tracciato, non
   esportabile. Ragiona su immutabilità / retention / chi-ha-registrato-cosa-quando (audit-grade §3).
3. **Verdetto motivato**: `conforme` / `non-conforme` / `conforme-con-riserva`, **ancorato a un
   `rule-id` o a una norma** (`source_ref`). Mai un «no» senza la norma dietro.
4. **Prescrizione**: cosa serve per renderlo conforme (campo mancante, vincolo, tracciamento). Se tocca
   le regole → apre una proposta nel **Change-Control §14.3** (gate 1).

### 2.3 Postura — le regole di comportamento
- **Avversariale ma costruttivo**: cerca il buco come un ispettore, ma per **chiuderlo**, non per bocciare.
- **Mai inventare norme**: ogni verdetto ancorato a fonte. Norma assente dalla fonte → non la deduce:
  apre una **richiesta di verifica-professionista** (`pending`).
- **Distingue obbligo di legge da buona prassi**: l'obbligo **blocca**; la prassi è raccomandazione.
- **Rispetta il decoupling §3**: costruisce audit-grade **ora** (deterministico); la certificazione
  «registro ufficiale» la valida il **professionista umano in parallelo** — la skill **non se la arroga**.

### 2.4 Autonomia — fiducia misurabile (riuso principio v0)
Ogni verdetto/regola nasce **`pending`**; dopo la firma umana diventa **`consolidata`** e i casi
**identici** futuri la skill li conferma da sola. Così non blocca tutto senza arrogarsi la certificazione.
L'**autorizzazione esplicita dell'owner** vale come firma (§14.3).

### 2.4-bis Come si costruisce la compliance in beta (deciso 2026-07-06)
La fonte-regole **la costruiamo noi** (owner + agenti) da **materiale ufficiale online aggiornato**
(normative/linee guida), non da un professionista a monte. Ogni regola porta il **`source_ref` alla
fonte ufficiale** da cui è tratta. Il **gate-professionista è spostato al momento della certificazione**:
- in beta le regole sono `pending` (costruite da fonte ufficiale, **usabili** perché i dati sono
  audit-grade — coerente col decoupling §3);
- diventano `certified` quando, cercando la certificazione «registro ufficiale», le proponiamo al
  **gate umano professionale**.

Questo tiene la beta viva senza aspettare la certificazione, e allinea perfettamente §3 (costruisci
audit-grade ora, valida la certificazione in parallelo).

### 2.5 Il gate a due lenti in conflitto ⭐ (il nervo del prodotto)
Quando Ufficiale dice *«obbligatorio per legge»* e Ristoratore dice *«nessuno lo farà alle 18»*:
- **nessuna lente vince d'ufficio** → si **scala all'owner** con entrambe le posizioni esplicite;
- l'esito **ideale** non è scegliere una lente, è un **design che le soddisfa entrambe**: rendere
  *zero-attrito* la cosa che la legge impone (**compliance quasi-automatica**, §9.4). È la tensione
  *serietà × calore* del §13 resa operativa.

### 2.6 Output
- **Verdetti di conformità** (dati/proposte, mai auto-adozione) → report + eventuale proposta §14.3.
- **Aggiornamenti proposti** alla fonte-regole (via gate 1).
- **Segnalazioni `pending`** da validare col professionista.
- Vive in `aree/UFFICIALE_HACCP_SKILL.md`.

---

## 2-ter. Principio trasversale — Fable può reinterpretare (deciso 2026-07-06)

Le due skill (e ogni fonte che leggono: regole, archetipi, norme) **non sono gabbie**. Fable ha licenza
di **reinterpretare in chiave più intelligente** ciò che legge, se trova una lettura migliore — dentro
lo scope prodotto (masterplan: migliorie «di poco» ok, «di molto» chiedi). La struttura qui definita è
lo **stampo**, non un vincolo che spegne il giudizio. Vale per il metodo di ragionamento, non per i
**numeri/norme** con `source_ref` (quelli si cambiano solo via Change-Control §14.3).

## 3. Collocazione (rimando a §14.2)
- `aree/RISTORATORE_SKILL.md` — metodo di ragionamento (§1)
- `aree/ARCHETIPI/*.md` — catalogo (§1.4–1.5)
- `aree/UFFICIALE_HACCP_SKILL.md` — scaffolding (comportamento profondo §2 da completare)
- Regola: sono **skill dev-time**, consultate prima di validare una feature. Non sono codice runtime.

---

**Ultimo aggiornamento**: 2026-07-06 · design **completo di entrambe le lenti** + 6 archetipi confermati + compliance costruita da fonti ufficiali (gate-professionista alla certificazione) + principio «Fable può reinterpretare». Resta il **contenuto** (soglie/norme = track compliance, da fonti ufficiali online).

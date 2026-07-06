# Design del metodo — collaborazione di team (Track C)

> **Stato**: 🟢 v1 · **Creato**: 2026-07-06 · **Track**: C
> **Fonte di verità**: masterplan §15. Questo file spiega **perché** il metodo è così;
> gli altri file della cartella lo **eseguono**.

---

## 0. Il problema (dalle parole dell'owner)

L'owner deve, mentre Fable e le sessioni senior lavorano al prodotto, **delegare e supervisionare**
lavoro di sviluppo a **max 2 collaboratori**, ognuno con un profilo diverso, senza:
- perdere il controllo di ciò che finisce in produzione (`main`);
- dover scrivere lo stesso lavoro due volte;
- restare vago con chi ha bisogno di precisione, o soffocare chi lavora meglio libero.

I due collaboratori (profili dichiarati):

| Profilo | Come vuole ricevere il lavoro | Modalità di default |
|---------|-------------------------------|----------------------|
| **«dammi il prompt che eseguo»** | istruzione esatta, la esegue nel suo agente IA | **Ordine di Lavoro** (prescrittivo) |
| **«dimmi di cosa occuparmi, lo faccio a modo mio»** | un obiettivo + confini, sceglie lui il come | **Mandato** (a obiettivo) |

Entrambi lavorano con un **agente IA** (Cursor / Claude Code): questo è il perno del metodo — il
deliverable che l'owner produce è sempre **testo che diventa prompt**, e la qualità si controlla con
**gate** che l'agente del collaboratore sa eseguire.

---

## 1. Principio guida — ricalcare il DNA del progetto, non inventarne un altro

BHM ha già una cultura di processo fortissima (skill-system v0, masterplan §14, `CONTROVERIFICA.md`).
Il metodo di delega umana **eredita** quella cultura invece di crearne una parallela. Tre pilastri
riusati pari-pari:

| Pilastro del progetto | Dove nasce | Come lo riuso sugli umani |
|-----------------------|-----------|----------------------------|
| **Chi esegue ≠ chi affina ≠ chi blinda** | §11.5, §14.3, `VOCABOLARIO` | Collaboratore **esegue** → tu **integri** in `integrazione` → solo tu **promuovi** a `main` |
| **Il gate a 3 (proposta / macchina / umano)** | Change-Control §14.3 | Consegna a 3 gate: ① macchina · ② controverifica visiva collaboratore · ③ tu |
| **CONTROVERIFICA imparziale** (chi verifica ≠ chi ha fatto) | `comunicazione/CONTROVERIFICA.md` | Il report di consegna + i tuoi 4 controlli sul PR sono la CONTROVERIFICA applicata a un umano |

**Conseguenza pratica**: chi ha già visto lo skill-system del progetto ritrova gli stessi concetti.
Le stesse parole («lavoro ok», «report», «controverifica», «LOCK») valgono qui.

---

## 2. Le due modalità di delega ⭐

Il perno della domanda dell'owner (punti B e C) è: *«che workflow applico ogni volta che devo
delegare?»*. Risposta: **due modalità**, scelte **per task** in base a rischio e persona.

### 2.1 Modalità PRESCRITTIVA — l'Ordine di Lavoro (OdL)

> Per il collaboratore «dammi il prompt» **e** per ogni task ad alto rischio, chiunque lo faccia.

Dici **cosa e come**. Il documento è quasi un prompt finito: contesto, file da toccare, passi,
Definition of Done, gate, e i divieti espliciti. L'autonomia del collaboratore è **bassa**; il tuo
controllo a monte è **alto**. Si sbaglia poco perché hai già deciso tu il come.

- **Costo**: alto per te a monte (scrivi tanto), basso in revisione.
- **Quando**: aree fragili (auth, compliance, schema DB), collaboratore-prompt, task dove *il come*
  conta quanto *il cosa*.

### 2.2 Modalità A OBIETTIVO — il Mandato

> Per il collaboratore «a modo mio» **e** per task esplorativi/isolati a basso rischio.

Dici **cosa e i confini** (problema, risultato atteso, cosa NON toccare, i gate d'accettazione), e
lasci a lui **il come**. Non gli scrivi i passi: glieli fa fare al suo agente. Controlli l'**output**
attraverso i gate, non il processo.

- **Costo**: basso per te a monte, più alto in revisione (devi contro-verificare che il come regga).
- **Quando**: collaboratore autonomo affidabile, aree isolate, feature dove il *come* è indifferente
  purché passi i gate.

### 2.3 La regola d'oro delle due modalità

> **La modalità è del task, non della persona.** Un collaboratore ha una modalità *di default* (per
> indole), ma **il rischio del task può alzare la barra**: se tocca `haccp-rules.ts` o l'auth, anche
> il collaboratore-autonomo riceve un **Ordine di Lavoro**. La rubrica per decidere è nel §02, cap. 3.

---

## 3. Topologia branch — il canale sicuro pre-main ⭐

Richiesta esplicita dell'owner: un **gate di branch prima di `main`**, così che un merge di troppo
per sbaglio atterri in un'area di sicurezza e **solo l'owner (+ i suoi modelli)** tocchi `main`.

```
  collaboratore                     owner (+ modelli)              owner
  ─────────────                     ─────────────────              ─────
  feature/<task> ──push──▶  integrazione  ──review+verde──▶  main
     (scrive lui)          (pre-main: integri TU,          (SACRO: solo
                            un merge di troppo              tu promuovi;
                            atterra QUI)                    branch protetto)
```

- **`main`** — produzione. **Protetto al massimo**: nessuno pusha direttamente, solo l'owner promuove
  da `integrazione` quando è verde e convinto. È l'invariante non negoziabile.
- **`integrazione`** — il **canale sicuro pre-main**. Qui l'owner integra i lavori dei collaboratori,
  gira i gate sull'**insieme** (non solo sul singolo branch), può ancora intervenire. Un errore qui
  **non tocca la produzione**.
- **`feature/<task>`** — un branch corto per task, di proprietà del collaboratore. Lui **pusha**, non
  mergia niente a valle (scelta owner: «integri tu»).

> **Perché non le PR classiche collaboratore→main**: l'owner ha scelto il modello «push del branch,
> integro io». La PR resta uno **strumento di revisione opzionale ma consigliato** (la apri **tu**
> feature→integrazione come superficie di diff/commenti); l'**autorità di merge** però è sempre e solo
> tua. Fable può in seguito irrobustire in PR-per-task con branch protection formale (licenza §15).

Dettaglio operativo completo (comandi, branch protection GitHub, permessi) → [`06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md`](./06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md).

---

## 4. I 3 gate d'accettazione ⭐

Nessuna consegna entra in `integrazione` senza aver passato **in ordine**:

| Gate | Chi lo esegue | Cosa | Se fallisce |
|------|---------------|------|-------------|
| **① Macchina** | l'agente del collaboratore | `build` · `type-check` + `lint` · `test` **tutti verdi** | non si consegna nemmeno |
| **② Controverifica visiva** | il **collaboratore**, con gli occhi | il suo agente gli fornisce una **checklist visiva** (item per item) e lui conferma che *funziona davvero*, non solo che compila | non si consegna; l'agente rimette mano |
| **③ Owner** | **tu** | i 4 controlli sul diff+report (allineamento al mandato, scope creep, file correlati, gate ① e ② davvero verdi) → **integri** o **rilanci** | rilancio con prompt grezzo, o respinta |

- Il gate **①** è la «blindatura macchina» del §14.3, applicata a ogni task. **Mai saltato.**
- Il gate **②** è la novità voluta dall'owner: sostituisce lo screenshot con una **controverifica
  visiva umana guidata dall'agente**. Sposta la CONTROVERIFICA sull'esecutore, *prima* della consegna.
- Il gate **③** sei tu: è la CONTROVERIFICA imparziale del progetto, ridotta a 4 controlli veloci.

Dettaglio (checklist visiva, report di consegna, i 4 controlli) → [`05_GATE_E_CONTROVERIFICA.md`](./05_GATE_E_CONTROVERIFICA.md).

---

## 5. Documentazione allineata (punto A dell'owner)

Due soli artefatti tengono tutto allineato, senza burocrazia:

1. **Il documento di delega** (OdL o Mandato) è **anche** il contratto di quel branch: nome branch,
   cosa, gate, stato. Vive dove lo decidete (issue GitHub / file condiviso). Uno per task.
2. **Il report di consegna** (mirror Q1-Q6) chiude il branch: cosa è stato chiesto, cosa fatto,
   deviazioni, stato gate, idee-esperienza (§11). È ciò che leggi per contro-verificare.

> **Niente doc extra.** La verità del lavoro è il **diff** + il **report**. Come nel progetto: si
> aggiorna il file che c'è (BUG_TRACKER, report), non si creano nuovi documenti a ogni task.

---

## 6. Cosa resta a Fable

1. Configurare la topologia branch sulla **repo nuova** (`main` + `integrazione` protetti, permessi
   collaboratori solo su `feature/*`) — vedi §06.
2. Portare questo kit in `docs/` della repo nuova (accanto allo skill-system), adattando i
   `{{segnaposto}}` (nomi comandi reali, id ambienti, URL repo).
3. **Migliorare** il sistema se trova una lettura migliore (licenza §15), **tranne** l'invariante
   «`main` protetto, solo owner promuove».

### 6.1 ⚠️ Attivazione — questo kit è on-demand, NON prassi di default (decisione owner, 2026-07-06)

> **Per Fable — regola di installazione nello skill-system.** Questo kit **non** è una prassi sempre
> attiva. È un **contesto caricato su richiesta**, come una *feature/skill on-demand*, non una RULE
> always-on della bussola. Va attivato **solo quando l'owner sta delegando** a un collaboratore.
>
> - **Owner che lavora da solo (col suo agente)** → questo contesto **non serve e non si carica**.
>   Nessun overhead: niente branch `integrazione` obbligatorio, niente gate di consegna, niente template.
> - **Owner in modalità delega** → carica questo kit (una parola-comando dedicata nel `VOCABOLARIO`,
>   es. «delego» / «modalità team», da coniare con l'owner) → allora valgono topologia, modalità e gate.
>
> **Come installarlo**: mettilo tra le **skill/aree caricabili** (`docs/skill-system/aree/…` o una
> sezione dedicata), **non** tra le RULE globali della bussola §2. L'unico aggancio always-on ammesso
> è una riga nel `VOCABOLARIO` che dice: *«se l'owner nomina la delega/il team → carica il kit
> `COLLABORAZIONE_TEAM`»*. Fuori dalla delega, lo skill-system si comporta come se questo kit non esistesse.

---

**Ultimo aggiornamento**: 2026-07-06 · v1. Impianto = topologia a canale sicuro + 2 modalità + 3 gate,
tutto derivato dal DNA di processo del progetto (chi-esegue≠chi-blinda, gate a 3, controverifica).

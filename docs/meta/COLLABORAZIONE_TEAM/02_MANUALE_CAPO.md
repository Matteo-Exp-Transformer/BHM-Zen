# Manuale del capo — delegare, supervisionare, decidere

> **Stato**: 🟢 v1 · **Track**: C · Il tuo playbook operativo. Aprilo **ogni volta che deleghi**.
> Presuppone la topologia e i gate del [`01_DESIGN_METODO.md`](./01_DESIGN_METODO.md).

Questo file risponde alla tua domanda: *«che workflow applico ogni volta che devo delegare, e come
decido se implementare, lasciar fare, o essere esigente?»*. Tre capitoli: **prima** di delegare,
**durante**, **alla consegna**.

---

## 1. Il ciclo di delega in 1 colpo d'occhio

```
1. INQUADRA  → che task è? rischio alto o basso? (§2)
2. SCEGLI MODALITÀ → Ordine di Lavoro (prescrittivo) o Mandato (a obiettivo)? (§3)
3. CONSEGNA  → compili il template (03 o 04), assegni branch feature/<task>, fissi i gate
4. SUPERVISIONA → check-in leggero, nessun micromanagement (§4)
5. RICEVI     → report + branch pushato; giri i 4 controlli (05); decidi (§5)
6. INTEGRA    → merge in `integrazione`, giri i gate sull'insieme
7. TIRA LE FILA → quando `integrazione` è verde e sei convinto → promuovi a `main` (§6)
```

---

## 2. Passo 1 — inquadra il task: qual è il rischio?

Prima di scegliere *come* delegare, classifica il task. Il **rischio** è la variabile che comanda,
più della persona.

| Rischio | Segnali | Conseguenza |
|---------|---------|-------------|
| 🔴 **Alto** | tocca `src/compliance/haccp-rules.ts`, auth, schema DB, `main`, dati audit-grade, o un'area LOCK | **sempre Ordine di Lavoro**, chiunque lo faccia; gate stretti; contro-verifica accurata |
| 🟠 **Medio** | feature nuova su area viva, tocca file condivisi, UI di flusso importante | modalità di default della persona; gate pieni |
| 🟢 **Basso** | area isolata, refactor locale, componente nuovo senza dipendenze, spike/esplorazione | **Mandato** va benissimo anche col collaboratore-prompt; gate normali |

> **Regola LOCK**: ciò che il progetto marca LOCK (`haccp-rules.ts`, invarianti audit-grade, `main`)
> **non si delega mai a obiettivo**. Se proprio va toccato: Ordine di Lavoro dettagliato + tu presente
> in revisione riga per riga.

---

## 3. Passo 2 — scegli la modalità (la rubrica) ⭐

### 3.1 La tabella di scelta

| Situazione | Modalità | Perché |
|------------|----------|--------|
| Collaboratore-prompt, qualunque task | **Ordine di Lavoro** | è come vuole lavorare + ti dà controllo |
| Collaboratore-autonomo, task 🟢/🟠 | **Mandato** | rende al meglio libero; controlli l'output coi gate |
| Chiunque, task 🔴 alto rischio | **Ordine di Lavoro** | il *come* conta quanto il *cosa* |
| Task esplorativo / spike (capire se una strada regge) | **Mandato** | vuoi la sua testa, non la tua |
| Non sai ancora *tu* come si fa | **Mandato** (o prima ragioni tu/coi modelli) | non puoi prescrivere ciò che non hai deciso |

### 3.2 Le tre posture — «implemento / lascio fare / sono esigente» ⭐

La tua domanda diretta. Ecco quando applicare quale postura, **al momento della consegna**:

| Postura | Quando | Cosa fai in pratica |
|---------|--------|---------------------|
| 🟢 **Lascio fare** | task 🟢 basso rischio, area isolata, collaboratore affidabile | Mandato con gate; **non** guardi il *come*, guardi solo che i gate passino e l'output sia giusto |
| 🟠 **Sono esigente sull'output** | task 🟠, o area con invarianti | Mandato **ma** con gate d'accettazione stretti e contro-verifica accurata: non ti importa *come* l'ha fatto, ti importa che regga i 4 controlli |
| 🔴 **Sono esigente sul come** | task 🔴, LOCK, o quando una scelta di design a monte non è negoziabile | Ordine di Lavoro con i passi decisi da te; in revisione controlli che abbia seguito **quel** come |

> **Il default sano**: parti dalla postura **più leggera compatibile col rischio**, non dalla più
> pesante. Micromanagement su un task 🟢 brucia fiducia e tempo. Prescrizione mancante su un task 🔴
> ti esplode in produzione. La rubrica sopra ti tiene calibrato.

### 3.3 Segnale che hai sbagliato modalità
- Hai scritto un OdL e il collaboratore ti rimanda 10 domande «e se…?» → il task era esplorativo, andava a **Mandato**.
- Hai dato un Mandato e la consegna è fuori strada / fuori scope → il task andava **prescritto**, o i confini erano deboli. **Correggi il confine, non la persona** (§4.3).

---

## 4. Passo 4 — supervisiona senza soffocare

### 4.1 Il check-in leggero
- **Un solo punto di sincronizzazione** a metà per i task > mezza giornata: «a che punto sei, hai
  incontrato muri?». Non chiedi il codice: chiedi se il **confine** e i **gate** sono chiari.
- Per i task brevi: nessun check-in, si vede alla consegna.

### 4.2 Cosa NON fare
- Non entrare nel branch del collaboratore a «sistemare» mentre lavora: rompe la proprietà del task e
  la tracciabilità di chi-ha-fatto-cosa.
- Non cambiare il mandato a metà senza dirlo: se cambia lo scope, **riscrivi** il documento di delega e
  segnalalo. Uno scope che si muove in silenzio è la prima causa di consegne «sbagliate».

### 4.3 Quando il collaboratore è bloccato
- **Collaboratore-prompt**: gli mancava un pezzo di prompt → integra l'OdL, non improvvisare a voce.
- **Collaboratore-autonomo**: ha trovato un conflitto reale col flusso → è un **segnale prezioso**
  (come la CONTROVERIFICA che segnala «il prompt non sta in piedi nel flusso»). Ascolta, aggiorna il
  confine, non forzare la strada che non regge.

---

## 5. Passo 5 — ricevi e decidi

Alla consegna hai **report + branch pushato**. Giri i 4 controlli di [`05_GATE_E_CONTROVERIFICA.md`](./05_GATE_E_CONTROVERIFICA.md).
Poi **una** di tre decisioni:

| Esito | Quando | Azione |
|-------|--------|--------|
| ✅ **Integro** | 4 controlli ok, gate ①② verdi, allineato al mandato | merge `feature/<task>` → `integrazione`; giri i gate sull'insieme |
| ♻️ **Rilancio** | problema circoscritto e chiaro | scrivi un **prompt grezzo** (formato §05) → torna al collaboratore; il branch resta suo |
| ⛔ **Respingo / riprendo io** | fuori strada, o area 🔴 con errori di sostanza | non integri; o riassegni con OdL più stretto, o lo prendi tu/coi modelli |

> **Principio**: correggi **sul branch di chi ha fatto** (rilancio), non silenziosamente in
> `integrazione`. Così chi esegue impara e la tracciabilità resta pulita.

---

## 6. Passo 7 — tirare le fila (punto D dell'owner)

`integrazione` è il tavolo dove **tiri le fila** del lavoro dei collaboratori:

1. Man mano che integri i branch, `integrazione` accumula il lavoro combinato.
2. **Giri i gate sull'insieme** (build/type/lint/test sul combinato) — è qui che emergono i conflitti
   tra i lavori di due persone, non in produzione.
3. Quando `integrazione` è verde **e sei convinto** → **promuovi a `main`** (solo tu). Questo è
   l'unico momento in cui si tocca la produzione.
4. Se in `integrazione` qualcosa è rotto → **si aggiusta lì o si revert-a lì** (§06), `main` resta pulito.

> Ritmo consigliato in beta: promozioni a `main` **a lotti** (fine giornata / fine mini-milestone),
> non a ogni singolo branch. `main` cambia poche volte, in modo deliberato.

Gestione conflitti/ripristino/problemi di team → [`06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md`](./06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md).

---

## 7. Promemoria — le 5 frasi da ricordare

1. **La modalità è del task, non della persona** (ma la persona dà il default).
2. **Rischio alto ⇒ Ordine di Lavoro**, sempre, chiunque lo faccia.
3. **`main` lo tocco solo io**; tutto passa da `integrazione`.
4. **Correggo sul branch di chi ha fatto**, non in silenzio a valle.
5. **Se una consegna delude, guardo prima il mio confine** (mandato/OdL), poi la persona.

---

**Ultimo aggiornamento**: 2026-07-06 · v1. Rubrica implemento/lascio-fare/sono-esigente ancorata al
rischio del task; ciclo di delega in 7 passi; `integrazione` come tavolo per tirare le fila.

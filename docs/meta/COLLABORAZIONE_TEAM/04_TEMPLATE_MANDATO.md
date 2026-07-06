# Template — Mandato · modalità A OBIETTIVO

> **Usa questo** per il collaboratore «a modo mio» su task 🟢/🟠. Dici **cosa e i confini**, lasci a
> lui **il come**. Non scrivi i passi: li fa fare al suo agente. Controlli l'**output** coi gate, non
> il processo. Il tuo lavoro qui è definire **confini** e **gate** solidi — è lì che sta la qualità.

**Come si usa**: copia il blocco, riempi i `{{campi}}`, consegnalo. Un Mandato = un branch = un task.
Rispetto all'OdL: **niente §"passi"**, ma confini e gate d'accettazione più espliciti.

---

```markdown
# MANDATO — {{titolo breve del task}}

**Data:** {{GG-MM-AAAA}} · **A:** {{collaboratore}} · **Da:** owner
**Branch:** `feature/{{nome-branch-kebab}}`  ← crealo da `integrazione` aggiornato
**Rischio:** 🟢 basso | 🟠 medio (se 🔴 → NON usare il Mandato, usa l'Ordine di Lavoro)
**Modalità:** A OBIETTIVO (il COME è tuo; devi solo rientrare nei confini §3 e passare i gate §5)

## 1. Il problema (perché esiste questo task)
{{2-4 righe: qual è il bisogno reale, non la soluzione. Es. "L'utente non capisce quali punti di
conservazione sono fuori norma a colpo d'occhio nella pagina Reparti".}}

## 2. Risultato atteso (cosa deve essere vero alla fine)
{{Obiettivo osservabile, NON implementazione. Es. "Aprendo un reparto, i punti fuori norma sono
riconoscibili in <2 secondi senza leggere numeri". Come ci arrivi è affar tuo.}}

## 3. Confini (⛔ i paletti dentro cui sei libero) ⭐
- **Puoi toccare:** {{aree/cartelle dentro cui hai mano libera, es. `src/features/conservation/**`}}
- ⛔ **NON toccare:** {{aree fuori mandato, es. schema DB, auth, `src/compliance/**`, altri feature}}
- **Vincoli di prodotto da rispettare:** {{es. "resta on-brand §13: colore = verdetto, non decorazione";
  "zero attrito §9.4"; "responsive-everywhere"}}
- **Fuori scope esplicito:** {{cose che potresti essere tentato di fare ma NON vanno fatte ora}}

## 4. Cosa NON devo decidere io (le scelte già prese a monte)
{{Se ci sono decisioni non negoziabili — naming, un pattern, una libreria — elencale. Tutto il resto
è tua scelta.}}

## 5. Gate d'accettazione (come giudicherò l'output — vedi 05_GATE) ⭐
- [ ] **① Macchina**: `{{npm run build}}` · `{{npm run type-check}}` + `{{npm run lint}}` · `{{npm run test}}` → **tutti verdi**
- [ ] **② Controverifica visiva**: chiedi al tuo agente la **checklist visiva** e conferma con gli occhi che il risultato atteso §2 è raggiunto davvero. Riporta gli item nel report.
- [ ] **Rispetto dei confini §3** (niente file fuori dalle aree consentite)
- [ ] {{eventuale criterio di qualità specifico, es. "funziona anche su mobile 360px"}}

## 6. Consegna
- Pusha `feature/{{...}}`.
- Compila il **report di consegna** (template in 05_GATE §4). Nel report **spiega il COME scelto** in
  3-5 righe (così posso contro-verificare che la strada regga) e annota eventuali idee-esperienza.
```

---

## Note per l'owner (non entrano nel Mandato)

- **La qualità di un Mandato sta nei §3 e §5**, non nella lunghezza. Un confine debole = una consegna
  fuori strada che è **colpa tua**, non del collaboratore (vedi manuale §4.3).
- **Non prescrivere di nascosto**: se ti ritrovi a scrivere i passi nel Mandato, o vuoi davvero un OdL,
  o non ti fidi ancora del "a modo mio" per quest'area → alza il rischio a 🔴 e passa a OdL onestamente.
- **Il "come" nel report** è il tuo aggancio di controllo: lì contro-verifichi che la strada scelta non
  rompa un invariante del flusso (è il controllo n.3 della CONTROVERIFICA, §05).

---

**Ultimo aggiornamento**: 2026-07-06 · v1.

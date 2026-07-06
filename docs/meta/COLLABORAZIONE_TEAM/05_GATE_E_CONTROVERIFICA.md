# Gate & controverifica — come si accetta un lavoro

> **Stato**: 🟢 v1 · **Track**: C · Aprilo **a ogni consegna che ricevi**.
> È l'applicazione della `CONTROVERIFICA.md` del progetto al lavoro di un collaboratore umano.

Nessun lavoro entra in `integrazione` senza passare **in ordine** i 3 gate. Qui trovi cosa fa ciascuno,
la **checklist visiva** (gate ②), il **report di consegna** (il documento che leggi) e i **4 controlli**
che fai tu (gate ③).

---

## 1. Gate ① — Macchina (lo fa l'agente del collaboratore)

Prima ancora di consegnare, il collaboratore fa girare al suo agente:

| Check | Comando (adatta alla repo) | Deve |
|-------|----------------------------|------|
| Build | `{{npm run build}}` | passare senza errori |
| Tipi | `{{npm run type-check}}` | 0 errori TS |
| Lint | `{{npm run lint}}` | 0 errori |
| Test | `{{npm run test}}` (+ e2e se pertinente) | tutti verdi |

> **Mai saltato.** È la «blindatura macchina» del Change-Control §14.3. Se uno è rosso, **non si
> consegna**: l'agente rimette mano finché non è verde. L'esito va **riportato** (non basta dire
> "passa": incolla/riassumi l'output nel report).

---

## 2. Gate ② — Controverifica visiva (la fa il collaboratore, con gli occhi) ⭐

Il gate voluto dall'owner: **build verde ≠ funziona**. Il collaboratore deve **guardare** il risultato
e confermarlo, guidato da una **checklist visiva** che il suo agente gli fornisce.

### 2.1 Come funziona
1. Finito il lavoro, il collaboratore chiede al suo agente: *«dammi la checklist visiva per validare
   questo task»*.
2. L'agente produce una lista di **cose da vedere** (non da compilare a caso): stati, schermate,
   comportamenti osservabili derivati dalla Definition of Done / dal Risultato atteso.
3. Il collaboratore **apre l'app e verifica ogni item con gli occhi**, spuntandolo.
4. Se un item non passa → torna all'agente. Non si consegna con item rossi.

### 2.2 Esempio di checklist visiva (l'agente la genera così)
```
CHECKLIST VISIVA — {{task}}
- [ ] Apro {{schermata}} e vedo {{cosa deve esserci}}
- [ ] Faccio {{azione}} → succede {{effetto atteso}}, senza errori in console
- [ ] Caso limite: {{input strano}} → {{comportamento corretto}}
- [ ] Mobile 360px: {{la cosa non si rompe / resta usabile}}
- [ ] Nessuna regressione visibile su {{area adiacente toccata}}
```

> **Perché sostituisce lo screenshot**: uno screenshot mostra un istante; la checklist visiva obbliga a
> **esercitare** il comportamento. È la CONTROVERIFICA spostata su chi esegue, **prima** che il lavoro
> arrivi a te. Nel report il collaboratore dichiara: «controverifica visiva: ✅ tutti gli item» (o quali).

---

## 3. Gate ③ — Owner: i 4 controlli sul PR/diff ⭐

Quando ricevi **report + branch pushato**, giri i **4 controlli** della `CONTROVERIFICA.md`, adattati.
Bastano ~5-10 minuti su un task normale.

| # | Controllo | Domanda | Rosso se… |
|---|-----------|---------|-----------|
| 1 | **Dati = diff reale** | ciò che il report dice di aver fatto **c'è** nel diff, ed è quello giusto? | il report vanta cose che nel diff non ci sono |
| 2 | **File correlati allineati** | se ha cambiato un comportamento documentato (tipi, test, context, doc), li ha aggiornati **nello stesso branch**? | lascia un test/tipo/doc stale |
| 3 | **Allineamento al mandato** ⭐ | il lavoro rispetta OdL/Mandato? **Scope creep** (roba non chiesta)? **Reinterpretazione** di una parola/valore? Il *come* scelto **regge nel flusso** o rompe un invariante? | c'è roba extra, o il come sfonda un invariante |
| 4 | **Gate ① e ② davvero verdi** | l'output macchina è riportato e verde; la checklist visiva è spuntata? | "passa" dichiarato senza prova |

**Esito** → una delle tre decisioni del manuale §5:
- ✅ **Integro** (merge in `integrazione`)
- ♻️ **Rilancio** con un **prompt grezzo** (formato sotto)
- ⛔ **Respingo / riprendo io**

### 3.1 Prompt grezzo per il rilancio (formato dal progetto)
Quando rilanci, non riscrivere tu la soluzione: descrivi il problema e l'atteso, che sia l'agente del
collaboratore a raffinarlo.
```
PROMPT GREZZO
Problema:  {{cosa non torna, 1-2 frasi}}
Dove:      {{file / punto del report / commit}}
Atteso:    {{cosa dovrebbe essere invece}}
Nota:      {{invariante/vocabolario/gate coinvolto}}
```

---

## 4. Il report di consegna (mirror Q1-Q6) — cosa il collaboratore ti manda

Ogni consegna chiude con questo report (una versione umana del `_TEMPLATE_REPORT.md` del progetto).
È **ciò che leggi** per i 4 controlli. Il collaboratore lo compila (o lo fa compilare al suo agente).

```markdown
# REPORT DI CONSEGNA — {{titolo task}}
**Branch:** `feature/{{...}}` · **Data:** {{GG-MM-AAAA}} · **Modalità:** OdL | Mandato

## Q1 — Cosa mi è stato chiesto
{{link/testo dell'OdL o Mandato + obiettivo in 1 riga}}

## Q2 — Cosa ho fatto
{{sintesi del lavoro; file toccati}}

## Q3 — Come (solo se Mandato) / eventuali scelte
{{3-5 righe sul come scelto e perché — serve all'owner per il controllo n.3}}

## Q4 — Deviazioni / cose NON fatte
{{tutto ciò che si discosta dall'OdL/Mandato, o è stato lasciato fuori. "Nessuna" è valido.}}

## Q5 — Stato gate
- ① Macchina: build {{✅/❌}} · type-check {{✅/❌}} · lint {{✅/❌}} · test {{✅/❌}}
- ② Controverifica visiva: {{✅ tutti gli item / quali no}}

## Q6 — 💡 Idee esperienza (gusto personale, §11)
{{idee UI/navigazione/compliance avute lavorando — o "nessuna". Non implementate: annotate.}}
```

> **Perché il report conta**: senza, contro-verifichi leggendo tutto il diff a freddo. Col report,
> confronti *ciò che dice* con *ciò che il diff mostra* → i 4 controlli diventano rapidi e imparziali.

---

## 5. Riepilogo del flusso di una consegna

```
collaboratore: lavora → gate ① (macchina verde) → gate ② (checklist visiva, occhi) → report + push
       owner: legge report → 4 controlli sul diff (gate ③) → ✅ integro / ♻️ rilancio / ⛔ respingo
```

---

**Ultimo aggiornamento**: 2026-07-06 · v1. Gate ② = controverifica visiva guidata (sostituisce lo
screenshot, scelta owner); gate ③ = i 4 controlli della CONTROVERIFICA del progetto ridotti all'osso.

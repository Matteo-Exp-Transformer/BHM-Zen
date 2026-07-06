# Template — Ordine di Lavoro (OdL) · modalità PRESCRITTIVA

> **Usa questo** per il collaboratore «dammi il prompt» **o** per qualunque task 🔴 alto rischio.
> Dici **cosa e come**. Il documento è quasi un prompt finito: il collaboratore lo passa al suo agente
> e l'agente ha tutto per eseguire. Più è preciso, meno domande ricevi.

**Come si usa**: copia il blocco qui sotto, riempi i `{{campi}}`, cancella le note `(…)`, consegnalo
(issue GitHub o messaggio). Un OdL = un branch = un task.

---

```markdown
# ORDINE DI LAVORO — {{titolo breve del task}}

**Data:** {{GG-MM-AAAA}} · **A:** {{collaboratore}} · **Da:** owner
**Branch:** `feature/{{nome-branch-kebab}}`  ← crealo da `integrazione` aggiornato
**Rischio:** 🟢 basso | 🟠 medio | 🔴 alto
**Modalità:** PRESCRITTIVA (segui i passi; se un passo non regge, FERMATI e chiedi, non improvvisare)

## 1. Contesto (perché)
{{2-4 righe: a cosa serve, dove si inserisce nel prodotto. Link ai file/mockup rilevanti.}}

## 2. Obiettivo (cosa deve esistere alla fine)
{{1-3 righe, risultato osservabile. Es. "Il modal profilo-punto salva la temperatura letta dal
profilo (read-only) e non digitata a mano".}}

## 3. File da toccare (e SOLO questi)
- `{{path/file1}}` — {{cosa cambia}}
- `{{path/file2}}` — {{cosa cambia}}
> Se serve toccare un file non elencato → **fermati e chiedi**. Fuori da questa lista = fuori scope.

## 4. Passi (il COME — seguili in ordine)
1. {{passo 1 concreto}}
2. {{passo 2}}
3. {{…}}
> Dettaglio pensato per essere passato all'agente IA come istruzione. Includi convenzioni del progetto
> se rilevanti (naming, path alias `@/`, pattern React Query, timezone locale — mai `toISOString().split`).

## 5. Definition of Done (quando è "fatto")
- [ ] {{criterio funzionale 1 — osservabile}}
- [ ] {{criterio funzionale 2}}
- [ ] Nessun file fuori dalla lista §3 è stato toccato

## 6. Gate obbligatori prima di consegnare (vedi 05_GATE)
- [ ] **① Macchina**: `{{npm run build}}` · `{{npm run type-check}}` + `{{npm run lint}}` · `{{npm run test}}` → **tutti verdi**
- [ ] **② Controverifica visiva**: chiedi al tuo agente la **checklist visiva** di questo task e conferma con gli occhi che funziona (non solo che compila). Riporta gli item nel report.

## 7. Divieti espliciti (⛔)
- ⛔ Non toccare `src/compliance/haccp-rules.ts` né altri file marcati LOCK.
- ⛔ Non mergiare niente: **pusha solo** `feature/{{...}}`. L'integrazione la fa l'owner.
- ⛔ Non allargare lo scope (niente "già che c'ero ho anche…"). Idee extra → annotale nel report.
- {{altri divieti specifici del task}}

## 8. Consegna
- Pusha `feature/{{...}}`.
- Compila il **report di consegna** (template in 05_GATE §4) e mandalo all'owner.
```

---

## Note per l'owner (non entrano nell'OdL)

- **Il livello di dettaglio del §4 è la leva**: task 🔴 → passi minuti; task 🟢 dato in prescrittivo →
  bastano 2-3 passi. Non scrivere più del rischio che il task merita.
- **Se ti accorgi di non saper scrivere il §4** (il "come"), il task non è pronto per essere prescritto:
  o lo ragioni prima (tu/coi modelli), o passa a **Mandato** (template 04).
- **Riuso**: un OdL ben fatto è riutilizzabile. Tieni i migliori come esempi.

---

**Ultimo aggiornamento**: 2026-07-06 · v1.

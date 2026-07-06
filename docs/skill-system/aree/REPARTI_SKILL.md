---
name: reparti
description: >-
  Skill per qualsiasi lavoro sulla casa «Reparti» (lente SPAZIO): reparti assegnati, punti di
  conservazione, registrazione temperatura, form a cascata, mappa del ristorante. Caricala
  quando il task nomina reparti, punti, frigo, temperature, cascata, conservazione.
---

# 🧭 REPARTI — Skill di area (lente SPAZIO)

> Verità di dettaglio: [`MAPPA_Reparti_conservation.md`](../../meta/MAPPATURA_AREE/MAPPA_Reparti_conservation.md)
> · mockup [`02_REPARTO_cucina.html`](../../meta/MOCKUP_UI/02_REPARTO_cucina.html) + [`03_FORM_CASCATA.html`](../../meta/MOCKUP_UI/03_FORM_CASCATA.html) (✅ approvati).
> Legacy: area conservation (report A2) — hook/logica riusabili, UI no.

## 1. A che serve (il senso)

I reparti **assegnati** all'utente: dentro ogni reparto la struttura reale (frigo, banconi,
stazioni = **punti di conservazione**), la **registrazione temperatura** e il **form a cascata**.
La «cucina» è solo UNO dei reparti possibili (sala, bar, magazzino, pasticceria…). La mappa dei
reparti è il **manuale operativo visivo**: il nuovo dipendente vi trova «dove sta cosa».
Qui vivono 2 dei 3 gesti-firma: 🌡️ la temperatura che atterra · 💧 la cascata che si scioglie.

## 2. Chi fa cosa

- **Dipendente**: naviga i suoi reparti → tocca un punto → registra la temperatura (tastierone
  da guanti; il colore È il verdetto) → inserisce prodotti con la cascata.
- **Titolare** (da Regia/①): codifica reparti e punti; qui li usa come tutti.

## 3. Flusso (sintesi)

Tab centrale dinamica: 1 reparto assegnato → nome reparto; più reparti → «Reparti» con mappa
navigabile. Punto → registra temp: il numero **atterra** col verdetto-colore (verde ok / ambra
attento / rosso raro), sussurro HACCP che si dissolve (~2s). Cascata: le opzioni incompatibili
**svaniscono** con ritmo obbligato lento — è l'unica animazione col diritto di durare, perché
*insegna* (§13.5.2).

## 4. Limiti e regole VOLUTE — NON «aggiustarle»

- **Temperatura + metodo OBBLIGATORI; note e foto opzionali** (dec. 8).
- **Letture temperature = append-only** (dec. 1): mai UPDATE/DELETE su una lettura registrata.
- **Il verdetto viene da `haccp-rules.ts`** (validazione runtime legge la fonte-unica §14.3) —
  MAI soglie hardcoded nei componenti.
- **Reparti = cittadini di prima classe** con FK vere (§12.3) — mai stringhe hardcoded.
- **Cascata: ritmo lento obbligato** (feedback owner §13.5): mostra possibilità → scioglimento
  scaglionato → scelta evidenziata. Mai velocizzarla «per ottimizzare».
- **Creazione punto+manutenzioni = RPC transazionale** (decisione default, no rollback client).

## 5. Questioni aperte

| Questione | Decisione | Stato |
|-----------|-----------|-------|
| Colonne lettura (method, notes, photo_evidence, recorded_by) | migration tipo-015 | ✅ applicata CP5 (`20260706040000`), usata dal port CP8 |
| Editor mappa | builder strutturato in beta; disegno libero = roadmap (§12.3) | schematico CP8 = slot deterministici; posizioni vere col builder Regia |
| Realtime | pattern invalidate-on-change (dec. 11); floor refetch-on-focus attivo | FU-010 (subscriptions non portate) |
| Metodo lettura | obbligatorio (dec. 8) — beta: default `digital_thermometer`, la UI non chiede | selettore metodo = da valutare con owner |

## 6. LOCK di area

```
LOCK  src/compliance/haccp-rules.ts — il verdetto temperatura legge SOLO da qui (Bussola §2)
RULE  temperature_readings: INSERT-only; storno per annullare (dec. 1)
```

## 7. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| il codice reale dell'area | `src/features/reparti/` (hooks · KeypadSheet · RepartiPage) |
| il ponte punto→regola (verdetto) | `src/compliance/point-verdict.ts` (zero numeri: legge il LOCK) |
| dettaglio flussi/dati legacy | `docs/meta/MAPPATURA_AREE/MAPPA_Reparti_conservation.md` |
| soglie/categorie conservazione | `context/COMPLIANCE_CONTEXT.md` + `src/compliance/haccp-rules.ts` |
| schema DB (letture, punti, profili) | `aree/DB_SKILL.md` |

---

**Ultimo aggiornamento**: 2026-07-06 · CP8: port area completato (punti+letture oggi, registra append-only con auto-complete, schematico marker-verdetto) · → Report-port-fu002-fable

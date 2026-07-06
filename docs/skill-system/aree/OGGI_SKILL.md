---
name: oggi
description: >-
  Skill per qualsiasi lavoro sulla casa «Oggi» (lente TEMPO): diario di bordo, mansioni del
  giorno, completamenti, alert, timbro di fine turno. Caricala quando il task nomina Oggi,
  diario, mansioni di oggi, timbro, alert scadenze.
---

# 🕐 OGGI — Skill di area (lente TEMPO)

> Verità di dettaglio (finché il codice non esiste): [`MAPPA_Oggi_calendar.md`](../../meta/MAPPATURA_AREE/MAPPA_Oggi_calendar.md)
> · mockup [`01_OGGI_dipendente.html`](../../meta/MOCKUP_UI/01_OGGI_dipendente.html) (✅ approvato owner).
> Legacy da cui si porta logica: area calendario/tasks (report A3). UI: MAI copiare dal legacy.

## 1. A che serve (il senso)

Il **diario di lavoro**: cosa fare ora, cosa non è stato fatto ieri, cosa mi porto avanti domani.
È la **schermata di default** — il 95% degli accessi vive qui (loop §9.1, fase ② FACCIO).
Ogni azione qui alimenta **in silenzio** il registro audit-grade che produce il dossier (④).

## 2. Chi fa cosa

- **Dipendente**: apre l'app → vede le card di oggi (gerarchia *ora / a breve / fatto*), spunta
  mansioni, scrive note per le eccezioni, chiude col **timbro di fine turno**.
- **Titolare/responsabile**: stesso diario + le assegnazioni che ha programmato in Regia.

## 3. Flusso (as-is → to-be, sintesi)

Card-focus (§13.4): poche card grandi che scorrono, verbo in cima («Registra temperatura —
Frigo 2»), azione a tutta larghezza in fondo (pollice, guanti). Le card fatte scivolano giù e
desaturano. Alert in cima come **nastro gentile**, non una tab.
Il **timbro** (dec. 7): apertura/chiusura turno + attestazione «tutto registrato» → record
**shift-seal append-only** che sigilla i registri del turno. Gesto-firma: il sigillo si imprime,
la lista si acquieta — *«il tuo l'hai fatto»*.

## 4. Limiti e regole VOLUTE — NON «aggiustarle»

- **Zero attrito** (§9.4 LOCK di prodotto): niente step aggiuntivi nel fare quotidiano.
- **Diario dignitoso, non punitivo**: nessuna feature che «sorveglia»; niente geolocalizzazione.
- **`uncomplete` = storno tracciato, mai DELETE** (dec. 1 append-only).
- **Tracciamento sessione SOLO orario** (§2 masterplan — mina legale art.4 St. Lavoratori).
- **Alert = in-app soltanto** (dec. 5): niente notification_preferences, niente canali esterni.

## 5. Questioni aperte

| Questione | Decisione | Stato |
|-----------|-----------|-------|
| Schema `shift_seals` (campi esatti) | tabella append-only company/user/opened/closed/attestation | da progettare (Fondamenta + Track A) |
| Metadati `[END_DATE:]` in description | diventa colonna vera | da migrare |
| Realtime | pattern invalidate-on-change esteso a Oggi (dec. 11) | da implementare |

## 6. LOCK di area

```
RULE  completamenti/timbri = INSERT-only; l'annullo è una riga di storno (dec. 1)
RULE  date locali Italia: mai toISOString().split (RULE timezone, Bussola §2)
```

## 7. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| dettaglio flussi/dati legacy | `docs/meta/MAPPATURA_AREE/MAPPA_Oggi_calendar.md` |
| il timbro (schema DB) | `aree/DB_SKILL.md` + mappa Fondamenta §4 |
| l'aspetto/interazione | mockup 01 + masterplan §13.4-13.6 |

---

**Ultimo aggiornamento**: 2026-07-06 · scaffolding iniziale (installazione §14.5) · → sessione Fable CP3 (git log)

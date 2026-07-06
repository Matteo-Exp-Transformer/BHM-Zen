---
name: regia
description: >-
  Skill per qualsiasi lavoro sulla casa «Regia» (ingresso gestionale del titolare):
  ① Imposto (onboarding, azienda, staff, reparti, punti, parametri HACCP) · ③ Controllo
  (chi ha fatto cosa, stato compliance) · ④ Dimostro (dossier/export). Caricala quando il
  task nomina Regia, onboarding, setup, staff, inviti, ruoli, dashboard, export, dossier.
---

# 🎬 REGIA — Skill di area (ingresso gestionale titolare)

> Verità di dettaglio: [`MAPPA_Regia_setup-controllo.md`](../../meta/MAPPATURA_AREE/MAPPA_Regia_setup-controllo.md)
> · mockup [`04_REGIA_titolare.html`](../../meta/MOCKUP_UI/04_REGIA_titolare.html) (✅) +
> [`05_ONBOARDING_admin.html`](../../meta/MOCKUP_UI/05_ONBOARDING_admin.html) (🟢, polish tempi §13.6)
> + [`MAPPATURA_ONBOARDING_STEP.md`](../../meta/MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md) (7 step).
> Legacy: onboarding/settings/dashboard (report A1+A4+A6).

## 1. A che serve (il senso)

L'unico ingresso gestionale del **titolare** (il target che compra, §9.2): qui codifica la
struttura reale (① IMPOSTO → il manuale operativo eseguibile), controlla il lavoro (③) e genera
la prova (④ «Genera dossier» — il **climax emotivo** del prodotto: il documento si costruisce
da solo dai gesti quotidiani). Visibile **solo** a titolare/responsabile (barra che si trasforma
col ruolo, §12.2).

## 2. Chi fa cosa

- **Titolare (admin)**: onboarding 7 step, azienda, reparti/punti, staff+inviti, mansioni,
  parametri HACCP (sola lettura, dec. 6), controllo, export.
- **Responsabile**: ③ Controllo (perimetro da definire con RLS dec. 9).
- **Dipendente**: NON vede Regia.

## 3. Flusso (sintesi)

Onboarding = «cantiere» con barra chiudibile/navigabile (mockup 05): non un wizard-prigione.
Controllo = dashboard con **dati reali** (dec. 2: mai dati fabbricati). Dossier = export
audit-grade PDF/CSV (workstream 7).

## 4. Limiti e regole VOLUTE — NON «aggiustarle»

- **`companies` snella** (dec. 4): solo P.IVA + ragione sociale; NIENTE licenza in beta.
- **HACCP in Settings = SOLA LETTURA** (dec. 6): le soglie vivono in `haccp-rules.ts`, non
  editabili da UI. Non «aggiungere l'editing per completezza».
- **Niente pannello preferenze notifiche** (dec. 5): non creare `notification_preferences`.
- **3 ruoli: titolare / responsabile / dipendente** (dec. 9); fonte unica ruolo =
  `company_members.role` (mai doppio binario con user_profiles).
- **`/sign-up` pubblica chiusa**: design solo-invito (decisione default confermata).
- **Dashboard: mai dati finti** (dec. 2) — meglio vuoto onesto che numero inventato.

## 5. Questioni aperte

| Questione | Decisione | Stato |
|-----------|-----------|-------|
| `onboarding_completed` server-side su companies | aggiungere | migration da fare |
| RLS ruolo `responsabile` | verificare sul live | da verificare |
| Forma esatta vat_number/ragione sociale | da progettare | aperta |
| Onboarding dipendente | carta bianca a Fable (nessun mockup) | da disegnare |

## 6. LOCK di area

```
RULE  parametri HACCP in UI = read-only, fonte src/compliance/haccp-rules.ts (dec. 6)
RULE  ruolo = company_members.role, unica fonte (dec. 9)
RULE  auth/inviti/ruoli = trigger DEEP (Bussola §6)
```

## 7. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| dettaglio flussi/dati legacy | `docs/meta/MAPPATURA_AREE/MAPPA_Regia_setup-controllo.md` |
| i 7 step onboarding | `docs/meta/MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md` |
| export/dossier | mappa Regia §④ + masterplan §4 (react-pdf/jsPDF + CSV/JSON) |
| schema DB (companies, members, inviti) | `aree/DB_SKILL.md` |

---

**Ultimo aggiornamento**: 2026-07-06 · scaffolding iniziale (installazione §14.5) · → sessione Fable CP3 (git log)

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
da solo dai gesti quotidiani). **Dossier** = export singolo; **prova haccp** = pacchetto completo
multi-periodo (giorno/settimana/mese/anno) per ispezioni — oggi parziale (CSV giorno).
Visibile **solo** a titolare/responsabile (barra che si trasforma col ruolo, §12.2).

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

## 5. Implementazione beta (CP12 + blindatura 08-07)

Viva in `src/features/regia/`: **③ Controllo** (`useRespiro` — numeri dal DB, tono ok/warn/alarm),
**④ Dimostro** (dossier CSV del giorno da registri append-only), **① parziale**:
- **Staff**: aggiungi persona + **modifica** (nome, ruolo, email, reparti assegnati,
  in servizio/non più in staff) — tap sulla riga nello sheet (owner 08-07).
- **Reparti & punti** (`StrutturaSheet.tsx`): crea/rinomina/spegni reparto; crea/modifica pdc
  (nome, tipo, reparto, temperatura di esercizio). Il tipo **propone il setpoint dal LOCK**
  (`setpointSuggerito` deriva dalla regola, mai numeri hardcoded) e il sussurro mostra il range
  atteso via `ruleRangeLabel`; fuori range = avviso, non blocco. RLS: `has_management_role`
  (policy baseline, verificate live 08-07).
- Parametri HACCP in sheet sola lettura (dec. 6).

**08-07 pomeriggio — ① IMPOSTO chiuso:**
- **Inviti staff (FU-001)**: `features/auth/invites.ts` (token `invite_tokens`, RLS `is_admin`;
  email opzionale via edge function `send-invite-email` già attiva) + `/accept-invite`
  (password da link email o signUp da link condiviso) + **claim al primo login** in
  SessionProvider. In Regia: tap sulla persona → «Accesso all'app» (invita / copia link /
  annulla — solo titolare). Kill-switch email: `VITE_INVITE_EMAIL_ENABLED=false` (resta il
  link manuale). Verifica: `npm run verify:invite`.
- **Onboarding «cantiere»** (`/onboarding`, mockup 05 v2, FU-013): 7 passi full-screen con
  rail collassabile e anteprima azienda; **ripetibile già compilato** (card «La tua azienda»
  in Regia); gate d'avvio solo per azienda vuota (0 reparti + cantiere mai chiuso);
  passo 5 = generatore manutenzioni obbligatorie per punto + creazione mansioni;
  chiusura → `companies.onboarding_completed = true`.

**Restano**: profili frigo nella fonte-unica (FU-005), cascata per il passo 6 (FU-014),
SMTP custom email (FU-017), hardening RLS inviti (FU-016).

## 6. Questioni aperte

| Questione | Decisione | Stato |
|-----------|-----------|-------|
| `onboarding_completed` server-side su companies | esiste già in baseline — usato dal cantiere (08-07) | ✅ chiusa |
| RLS ruolo `responsabile` | verificare sul live (nota: creare inviti = solo `is_admin`) | da verificare |
| Forma esatta vat_number/ragione sociale | campi in passo 1 cantiere; validazioni fini da rifinire | in corso |
| Onboarding dipendente | carta bianca a Fable (nessun mockup) — oggi: accept-invite → app | da disegnare |

## 7. LOCK di area

```
RULE  parametri HACCP in UI = read-only, fonte src/compliance/haccp-rules.ts (dec. 6)
RULE  ruolo = company_members.role, unica fonte (dec. 9)
RULE  auth/inviti/ruoli = trigger DEEP (Bussola §6)
```

## 8. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| dettaglio flussi/dati legacy | `docs/meta/MAPPATURA_AREE/MAPPA_Regia_setup-controllo.md` |
| i 7 step onboarding | `docs/meta/MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md` |
| export/dossier | mappa Regia §④ + masterplan §4 (react-pdf/jsPDF + CSV/JSON) |
| schema DB (companies, members, inviti) | `aree/DB_SKILL.md` |

---

**Ultimo aggiornamento**: 2026-07-08 pom. · ① IMPOSTO chiuso: inviti staff (FU-001) + onboarding cantiere (FU-013) · → `sessioni/08-07-26/Report-esecuzione-inviti-onboarding.md`

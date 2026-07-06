# Prompt senior — blindatura impronta Fable (mappatura + test)

> Incolla il blocco sotto in una **nuova chat** con agente **Meta senior** (modello capace).
> Non è profilo Esecuzione: niente feature prodotto nuove finché non chiude la fase di audit.

---

```
Profilo: Meta senior
Modalità: deep
Skill da leggere (in ordine):
  1. docs/skill-system/00_BUSSOLA_SKILL.md
  2. docs/skill-system/comunicazione/REVISIONE.md
  3. docs/skill-system/comunicazione/EVOLUZIONE_SKILLS.md (Playbook senior)
  4. docs/guide/SCOPE_PRODOTTO_BETA.md
  5. docs/guide/PRATICHE_INGEGNERIA.md
  6. docs/FABLE_CHECKPOINT.md
  7. docs/guide/HEALTH_CHECK_POST_FABLE.md
  8. docs/skill-system/aree/TESTING_SKILL.md
  9. docs/skill-system/sessioni/06-07-26/Report-skill-lessico-playwright.md
  10. docs/skill-system/sessioni/FOLLOW_UP.md
Non caricare: codice feature per patch — prima AUDIT e MAPPA. BHM-v.2 solo lettura.

Output attesi (SOLO questi — niente output in più senza chiedere Sì/No prima):
  A) MATRICE BLINDATURA — tabella gap: per ogni area (Oggi, Calendario, Reparti, Scorte, Regia,
     Fondamenta DB, Compliance, skill-system, test) colonne: «stato Fable (codice live)» ·
     «doc/skill di verità» · «allineato sì/no» · «drift riscontrato» · «azione blindatura»
     (aggiorna doc / aggiorna footer / nuovo test / LOCK esplicito / follow-up FU-NNN).
  B) MAPPA SISTEMA COMPLETA — un diagramma o indice navigabile: impronta Fable (4 case + loop
     ①→④), file canonici per verità (codice > HEALTH_CHECK > mappe > skill), catena agente
     (bussola → skill area → context), catena test (validate → test:e2e → verify:flows → QA §5).
  C) COPERTURA TEST — inventario reale: cosa copre oggi (53 unit, 4 e2e Playwright, verify:flows
     Oggi+Reparti) vs piramide in PRATICHE_INGEGNERIA §3 (gesti-firma, append-only, RLS). Lista
     priorizzata P0/P1 test mancanti SENZA implementarli ancora.
  D) DEBITO DOCUMENTALE — elenco file con footer obsoleto, mappe meta non allineate a CP12,
     sezioni CHECKPOINT/DB_SKILL stale, HEALTH_CHECK da aggiornare — con patch proposte (diff
     descritto, non necessariamente applicato in questa sessione).
  E) PIANO BLINDATURA 3 fasi — (1) allineare verità doc↔codice senza cambiare comportamento app
     (2) chiudere gap test smoke su aree non coperte (3) solo dopo ok owner: nuove feature (FU-001…).
  F) Report in docs/skill-system/sessioni/06-07-26/Report-senior-blindatura-fable.md + aggiornamento
     FOLLOW_UP con nuovi FU numerati + riga SESSION_LOG.

Obiettivo
---------
La sessione Fable (CP1–CP12 + commit 62a8f98 skill-lessico + 35b5926 Playwright) ha lasciato
un'IMPRONTA: 4 case navigabili, DB audit-grade, skill-system, lessico owner (pdc, timbro, regtemp,
piantina, dossier, prova haccp). NON cancellare né rifare nulla di quella impronta.

Devi capire cosa MANCA per BLINDARE documentazione, contesto e codice fino a quel punto —
così la base resta solida prima che il team vada avanti e si disallinei.

Vincoli non negoziabili (SCOPE + PRATICHE)
------------------------------------------
- Scope prodotto: docs/guide/SCOPE_PRODOTTO_BETA.md — dentro/fuori beta; niente scope creep.
- Pratiche: docs/guide/PRATICHE_INGEGNERIA.md — DB verità, append-only, validate gate, doc come
  codice (una casa per verità), footer-tracciabilità, piramide test.
- Numeri HACCP solo src/compliance/haccp-rules.ts (LOCK). Migration append-only. NO MCP Supabase.
- DB hjteuounjwkadmsbsmdm = unico DB — cautela PROD; niente db push senza owner.
- UI = mockup docs/meta/MOCKUP_UI/; visione struttura/prodotto = masterplan legacy (read-only).

Metodo senior
-------------
1. Leggi HEALTH_CHECK come fotografia «cosa c'è davvero oggi»; confronta con skill d'area e mappe
   docs/meta/MAPPATURA_AREE/*. Segna drift esplicito (es. DB_SKILL gap table pre-CP5, cascata non in codice).
2. Per ogni casa: verifica catena mockup → skill → codice src/features/* → test (unit/e2e/verify).
3. Valuta skill-system: bussola, vocabolario 11 trigger (4 case + 7 elemento), PREPARA_PROMPT,
   TESTING_SKILL — cosa manca per orientare un agente nuovo senza esplorare a caso?
4. «Blindare» = rendere espliciti LOCK/RULE già impliciti, allineare doc, proporre test minimo che
   impedisca regressione dell'impronta — NON riscrivere l'architettura Fable.
5. Due lenti su ogni proposta che tocchi prodotto: UFFICIALE_HACCP × RISTORATORE (solo se proponi
   cambio scope/comportamento; per blindatura pura doc/test spesso non serve).

Criterio di fatto
-----------------
Owner può leggere MATRICE + PIANO e dire «sì, questa è la base blindata» prima di aprire FU-001 o
nuove feature. Report consegnato con domande di chiusura CHIUSURA_SESSIONE §11 compilate.

Chiusura sessione
-----------------
Alla fine: CHIUSURA_SESSIONE.md Parte A; footer file toccati; NON commit/push senza «fai report
finale» esplicito owner (in questa chat il commit lo fa l'agente senior solo se owner conferma).
```

---

**Ultimo aggiornamento**: 06-07-26 · prompt per agente senior blindatura impronta Fable · → Report-skill-lessico-playwright

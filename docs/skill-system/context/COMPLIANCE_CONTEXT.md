# COMPLIANCE_CONTEXT — il SENSO delle regole HACCP (fonte normativa e razionale)

> **Separazione numeri ↔ senso (masterplan §14.3, non negoziabile):**
> - i **NUMERI** (soglie, retention, vincoli) vivono SOLO in `src/compliance/haccp-rules.ts`
>   (modulo TS tipato, git-versionato, **LOCK**);
> - il **SENSO** (fonte normativa, razionale, chi ha validato) vive QUI — questo file **linka
>   ogni `rule-id`, non riscrive mai i numeri**;
> - le **richieste di aggiornamento** entrano da `comunicazione/AGGIORNAMENTI_HACCP.md`.
>
> Perché TS in git e non DB: git = registro tamper-evident chi-cosa-quando; tipi forti = l'agente
> non inventa struttura; «aggiornabile» = PR con review, non una query al volo.

---

## 1. Identità di una regola (contratto con haccp-rules.ts)

Ogni regola in `haccp-rules.ts` porta: `id · version · effective_from · min/max/unit ·
source_ref (→ ancora in questo file) · validated_by`.

- `validated_by: 'pending'` = costruita da fonte ufficiale online, **usabile in beta**
  (decisione 2026-07-06, `DESIGN_SKILL_CONSULENTI.md` §2.4-bis); l'app tratta le pending con
  cautela (mai spacciarle per certificate).
- `validated_by: 'owner'` = autorizzazione esplicita owner (soddisfa il gate umano §14.3).
- `validated_by: 'professionista:<nome>'` = firma professionale (percorso certificazione).

## 2. Change-Control (3 gate — chi propone ≠ chi valida ≠ chi blinda)

| Gate | Chi | Cosa |
|------|-----|------|
| 1 · Proposta | agente-ufficiale | traduce `AGGIORNAMENTI_HACCP.md` in modifica: bumpa `version` + `effective_from`, MAI sovrascrive la storia |
| 2 · Blindatura macchina | test (`src/compliance/haccp-rules.test.ts`) | id unici, range plausibili, `source_ref` presente, campi obbligatori. Fallisce → il cambio NON entra. **Mai saltato** |
| 3 · Approvazione umana | professionista **oppure** owner | la regola nasce `pending`; l'ok owner soddisfa il gate (gate-2 resta attivo) |

## 3. Fonti normative (ancore per i source_ref)

> Si compilano man mano che le regole entrano. Ogni `source_ref` in `haccp-rules.ts` DEVE
> puntare a un'ancora qui sotto, con link alla fonte ufficiale e data di consultazione.

### `reg-ce-852-2004`
- **Fonte**: Regolamento (CE) n. 852/2004 sull'igiene dei prodotti alimentari (base HACCP UE).
- **Consultato**: da compilare al primo uso con link EUR-Lex e data.

### `reg-ce-853-2004`
- **Fonte**: Regolamento (CE) n. 853/2004 (norme specifiche alimenti di origine animale).
- **Consultato**: da compilare al primo uso.

*(altre ancore — linee guida ministeriali IT, DPR/DLgs, manuali di corretta prassi — si
aggiungono qui quando una regola le cita)*

## 4. Razionali per rule-id

*(vuoto — si popola insieme a `haccp-rules.ts`: una voce per `rule-id`, con il perché della
soglia e il contesto normativo; MAI il numero, che vive solo nel TS)*

---

**Ultimo aggiornamento**: 2026-07-06 · creazione stampo (installazione §14.5; numeri arriveranno con `haccp-rules.ts`) · → sessione Fable CP3 (git log)

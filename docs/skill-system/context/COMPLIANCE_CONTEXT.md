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

### `dpr-327-1980`
- **Fonte**: D.P.R. 26 marzo 1980, n. 327 (regolamento di esecuzione L. 283/1962, igiene
  alimenti) — in particolare Allegato C (temperature di conservazione/trasporto) e le
  disposizioni sul mantenimento a caldo dei cibi cotti da consumarsi caldi.
- **Consultato**: 2026-07-06 (seed; da ri-verificare con link Normattiva dal track compliance).

### `dlgs-110-1992`
- **Fonte**: D.Lgs. 27 gennaio 1992, n. 110 (attuazione dir. 89/108/CEE, alimenti surgelati) —
  temperatura degli alimenti surgelati in ogni punto del prodotto.
- **Consultato**: 2026-07-06 (seed; da ri-verificare con link Normattiva dal track compliance).

*(altre ancore — linee guida ministeriali IT, DPR/DLgs, manuali di corretta prassi — si
aggiungono qui quando una regola le cita)*

## 4. Razionali per rule-id

> Una voce per `rule-id`; il PERCHÉ della soglia e il contesto, MAI il numero (vive nel TS).

### `frigo-carni-fresche` (v1, pending)
Conservazione refrigerata delle carni fresche: la catena del freddo positiva è il controllo
critico più frequente in cucina. Fonte: `dpr-327-1980`. Seed 2026-07-06; il track compliance
dovrà articolare le categorie per tipo carne (avicole/bovine/preparazioni) che il DPR distingue.

### `congelatore-surgelati` (v1, pending)
Surgelati: la norma fissa la temperatura massima in ogni punto del prodotto; il limite è aperto
verso il basso (più freddo = ok). Fonte: `dlgs-110-1992`. Tolleranze di trasporto/scongelamento
parziale = tema del track compliance, non di questo seed.

### `mantenimento-caldo` (v1, pending)
Cibi cotti da consumare caldi: mantenimento sopra soglia fino al servizio (legame caldo).
Fonte: `dpr-327-1980`. Limite aperto verso l'alto.

> **Nota di prodotto (non normativa)**: il margine «ambra» del verdetto colore
> (`WARN_MARGIN_C` nel TS) è una scelta UX §13.5 — avvisare PRIMA di sforare — da tarare con
> l'owner. Non ha `source_ref` perché non è una norma.

---

**Ultimo aggiornamento**: 2026-07-06 · creazione stampo (installazione §14.5; numeri arriveranno con `haccp-rules.ts`) · → sessione Fable CP3 (git log)

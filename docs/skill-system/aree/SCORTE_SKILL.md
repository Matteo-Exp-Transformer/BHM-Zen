---
name: scorte
description: >-
  Skill per qualsiasi lavoro sulla casa «Scorte» (lente STOCK): inventario come mansione
  ricorrente, conteggi rimanenze, par level, scadenze prodotti, lista spesa flessibile.
  Caricala quando il task nomina scorte, inventario, spesa, prodotti, scadenze, par level.
---

# 📦 SCORTE — Skill di area (lente STOCK)

> Verità di dettaglio: [`MAPPA_Scorte_inventory-shopping.md`](../../meta/MAPPATURA_AREE/MAPPA_Scorte_inventory-shopping.md)
> · mockup [`07_SCORTE.html`](../../meta/MOCKUP_UI/07_SCORTE.html) (🔄 proposto, riformulato dec. 12).
> Legacy: area inventory/shopping (report A5) — dual-stack da unificare su RPC.

## 1. A che serve (il senso)

Inventario + lista spesa, filtrabili per reparto. **Riformulata dalla dec. 12**: «Inventario» è
una **mansione ricorrente assegnabile** (come le manutenzioni) — l'admin la assegna → giro dei
punti del reparto → conta rimanenze → il catalogo resta aggiornato e la spesa si auto-compila
dai sotto-scorta. Appare in **Oggi** come reminder (stesso item, due lenti).

## 2. Chi fa cosa

- **Dipendente/responsabile assegnato**: fa il giro d'inventario, conta, conferma scadenze.
- **Titolare**: imposta `par_level` («dovrei avere N»), assegna la mansione, usa la spesa.

## 3. Flusso (sintesi, dec. 12)

- Ingrediente: `par_level` (N) vs rimanenza (M); `M < par` → **sotto scorta** → suggerito in spesa.
- **Scadenza catturata all'inserimento** del prodotto, NON nel giro; nel giro = check di conferma.
  Mostrata l'ultima scadenza (lotto più longevo); unità in scadenza a breve = alert (anche Oggi).
- **Pezzo non in catalogo nel giro** → è un inserimento nuovo → chiedi la scadenza.
- Spesa: auto-compilata ma **editabile**, liste multiple; **NIENTE avanzamento/completamento**
  (la spesa varia — mai sensazione di «incompleta»).
- UI: ingredienti per categoria con **accordion** (click sul nome → apre/chiude).

## 4. Limiti e regole VOLUTE — NON «aggiustarle»

- **Niente stato di completamento sulla spesa** (dec. 12.4) — è una scelta, non una mancanza.
- **Liste spesa via le 4 RPC** (dec. 3): unificare il dual-stack legacy; niente doppio percorso.
- **Ciclo scadenze completo** (dec. 10): `expired_at` + reinserimento (`previous_product_id`,
  `reinsertion_count`, `archived_at`, status `archived`) + storico. Mai DELETE fisico del prodotto.

## 5. Implementazione beta (CP11, 2026-07-06)

Viva in `src/features/scorte/`: `stock.ts` puro (sotto-scorta par/rimanenza, stato scadenza,
suggerimenti — 10 unit test), hooks (inventario per categoria + accordion dec. 12.6, giro
d'inventario su `stock_counts` append-only con rimanenza aggiornata, liste spesa SOLO via le
4 RPC dec. 3), `ScortePage` (stepper da guanti, filtro reparto, voce libera, spesa senza
avanzamento dec. 12.4). **Verificato live CP11**: conteggio +/− → `stock_counts`, lista via RPC,
voce libera, spunta via RPC.

## 5-bis. Questioni aperte

| Questione | Decisione | Stato |
|-----------|-----------|-------|
| 4 RPC shopping sul live | migration `20260706040600` | ✅ applicata CP5, usate da CP11 |
| `par_level` + storico conteggi (`stock_counts`) | migration `20260706040400` | ✅ applicata CP5, usati da CP11 |
| Tipo mansione «Inventario» nel sistema tasks | nuovo tipo + generatore ricorrenze (dec. 12) | **FU-015** — il giro CP11 è manuale, non mansione assegnabile |
| Scadenza per lotto vs flat · cattura scadenza all'inserimento | da valutare con la cascata (FU-014) | aperta |

## 6. LOCK di area

```
RULE  products: mai DELETE fisico — archivio/storno (dec. 1 + dec. 10)
RULE  spesa senza avanzamento/completamento (dec. 12) — non «aggiungerlo per completezza»
```

## 7. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| dettaglio flussi/dati legacy | `docs/meta/MAPPATURA_AREE/MAPPA_Scorte_inventory-shopping.md` |
| la mansione ricorrente in Oggi | `aree/OGGI_SKILL.md` |
| schema DB (products, RPC, stock_counts) | `aree/DB_SKILL.md` |

---

**Ultimo aggiornamento**: 2026-07-08 · blindatura Fase 1: sezione «Implementazione beta CP11» + questioni aperte allineate (RPC/par_level applicate; mansione Inventario = FU-015) · → `sessioni/08-07-26/Report-senior-blindatura-fable.md`

# 00 · Indice — Mappatura area per area

> **Cos'è**: la mappa (flusso utente + flusso dati + schema target audit-grade + verdetto riuso) di
> ogni area, con **codice+DB come verità**, che alimenta la ricostruzione di Fable (§6.5 UI, §6.6 port logica).
> **Handoff di riferimento**: [`../HANDOFF_MAPPATURA_AREE.md`](../HANDOFF_MAPPATURA_AREE.md) · **decide**: masterplan §8.
> **Non è** bug-hunting (quello è Fase 3, riusata come input) né implementazione né ridisegno UI.

## Ordine di verità (§5, non negoziabile)
`codice reale + DB live > report Fase 3 > APP_DEFINITION` (quest'ultima = solo intento UX, mai stato).

> ⚠️ **Accesso DB live**: i token MCP di questa sessione **non raggiungono** il progetto BHM
> `hjteuounjwkadmsbsmdm` (vedono altri progetti — un'app prenotazioni/menu). Lo schema live usato
> nelle mappe = **snapshot A0 del 2026-07-05**. **To-do owner**: ripristinare il token MCP sul
> progetto BHM prima che Fable usi queste mappe per scrivere migration.

## Stato mappe (5 aree §6 — Fondamenta per prima)

| Ord. | Mappa | Casa | Report base | Priorità | Stato |
|------|-------|------|-------------|----------|-------|
| 1 | [`MAPPA_Fondamenta_DB-tipi.md`](./MAPPA_Fondamenta_DB-tipi.md) | 🧱 Fondamenta | A0, A7 | **P0** | ✅ **Fatta** (2026-07-06) |
| 2 | [`MAPPA_Reparti_conservation.md`](./MAPPA_Reparti_conservation.md) | 🧭 Reparti | A2, A0 | **P0** | ✅ **Fatta** (2026-07-06) |
| 3 | [`MAPPA_Oggi_calendar.md`](./MAPPA_Oggi_calendar.md) | 🕐 Oggi | A3 | P1 | ✅ **Fatta** (2026-07-06) |
| 4 | [`MAPPA_Regia_setup-controllo.md`](./MAPPA_Regia_setup-controllo.md) | 🎬 Regia | A1, A4, A6 | P1 | ✅ **Fatta** (2026-07-06) |
| 5 | [`MAPPA_Scorte_inventory-shopping.md`](./MAPPA_Scorte_inventory-shopping.md) | 📦 Scorte | A5 | P2 | ✅ **Fatta** (2026-07-06) |
| — | [`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md) | ⭐ trasversale | intervista | — | ✅ **10 decisioni** (2026-07-06) |

## Ponte legacy → nuova navigazione (§4)

| Casa nuova (§12) | Assorbe dalle aree legacy | Report Fase 3 |
|------------------|---------------------------|----------------|
| 🕐 **Oggi** | calendario/diario, mansioni, alert, timbro fine turno | A3 |
| 🧭 **Reparti** | reparti + punti conservazione + registra temp + cascata | A2 (+ reparti da A6) |
| 📦 **Scorte** | inventario + lista spesa | A5 |
| 🎬 **Regia** | onboarding/setup · controllo/dashboard · dossier/export; staff, ruoli, HACCP | A1 + A4 + A6 |
| 🧱 **Fondamenta** | schema DB audit-grade, tipi, servizi condivisi | A0 + A7 |

## Criteri di completamento (§12 handoff)
- [x] Cartella `MAPPATURA_AREE/` con `00_INDICE.md`
- [x] Mappa **Fondamenta** fatta per prima (le altre citano il suo schema target §4)
- [x] 1 mappa per ciascuna delle altre 4 aree, template §7 integrale
- [x] Domande due lenti annotate (§6 di ogni mappa) → confluiscono in masterplan §8
- [x] Verdetto riuso/riscrivi/butta esplicito per ogni area
- [x] `APP_DEFINITION` contraddittori marcati (non riscritti) — [`STATO_FASE3_INDICE.md`](../APP_DEFINITION/STATO_FASE3_INDICE.md) (2026-07-06)
- [x] Questione masterplan §8 pronta da spuntare con l'owner — **intervista fatta**: 10 decisioni in [`DECISIONI_OWNER_BETA.md`](./DECISIONI_OWNER_BETA.md)

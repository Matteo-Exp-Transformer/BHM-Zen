# SCOPE PRODOTTO BETA — carta di riferimento rapido

> **Cos'è**: la carta che ogni agente/collaboratore consulta PRIMA di proporre o costruire
> qualsiasi cosa. Non è la fonte delle decisioni (quella è il masterplan + `DECISIONI_OWNER_BETA`):
> è il **riassunto operativo** con i link. Se questo file contraddice il masterplan, vince il
> masterplan — e questo file va corretto.

---

## Cos'è il prodotto (una riga)

**PWA HACCP per ristoratori italiani**: il *diario di lavoro* del ristorante che, mentre lavori,
scrive da solo il registro difendibile a un controllo. Pratica (coi guanti), educativa, economica.

## Il loop (spina dorsale, §9.1)

`① IMPOSTO (Regia)` → `② FACCIO (Oggi/Reparti/Scorte — 95% degli accessi)` → `③ CONTROLLO (Regia)`
→ `④ DIMOSTRO (dossier)` — ogni azione in ② alimenta in silenzio il registro che produce ④.

## Le 4 case (nomi CANONICI, §12) e i 3 gesti-firma (§10.3)

| Casa | Lente | Gesto-firma che ci vive |
|------|-------|-------------------------|
| **Oggi** | tempo | 🔖 timbro di fine turno |
| **Reparti** | spazio | 🌡️ temperatura che atterra · 💧 cascata che si scioglie |
| **Scorte** | stock | — (inventario = mansione, dec. 12) |
| **Regia** | gestione (solo titolare/responsabile) | 📦 «Genera dossier» (roadmap: momento-eroe) |

## DENTRO la beta (§5)

Cascata + validazione temperature · diario/calendario con assegnazioni e completamenti
(+ **vista completa `/calendario` con completamento anticipato**, dec. 13) ·
inventario→lista spesa · alert scadenze/manutenzioni · timbro (shift-seal append-only, dec. 7) ·
export inspection-ready · auth multi-ruolo solo-invito (3 ruoli, dec. 9) · multi-tenant 1 sede ·
i 3 gesti-firma fatti benissimo.

## FUORI dalla beta (§5 — NON costruire, NON predisporre "già che ci siamo")

IA runtime · geolocalizzazione/accelerometro · pagamenti · multi-sede/catene · sync avanzata
(la dec. 11 fissa il livello: live-refetch conflict-free, niente presence/lock/merge) ·
editor mappa a disegno libero (beta = builder strutturato) · provider email dedicato ·
pannello preferenze notifiche (dec. 5).

## Le 12+ decisioni owner vincolanti

Dettaglio: [`../meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md`](../meta/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md).
Le più violate potenzialmente: **1** append-only/storno (mai DELETE) · **5** solo alert in-app ·
**6** HACCP in UI sola lettura · **8** temp+metodo obbligatori · **12** spesa senza completamento.

## Vincoli di costruzione (sempre)

- **UI dai mockup** (`docs/meta/MOCKUP_UI/` = verità visiva), MAI copiare componenti legacy.
- **Numeri HACCP solo in** `src/compliance/haccp-rules.ts` (LOCK, change-control §14.3).
- **Schema DB = verità**: migration incrementali via CLI, tipi rigenerati, mai MCP.
- Direzione visiva: **clinico-caldo** §13 (colore = verdetto; terracotta con parsimonia;
  tempo = calma, mai fretta §13.6).

## Come si cambia lo scope

1. La proposta passa le **due lenti** (🛡️ `UFFICIALE_HACCP_SKILL` × 👨‍🍳 `RISTORATORE_SKILL`).
2. Migliorie «di poco» → ok dentro la licenza Fable (§14.5); «di molto» → **si chiede all'owner**.
3. L'esito si annota (masterplan §8 / DECISIONI / PROPOSTE) — mai scope cambiato "in silenzio".

---

**Ultimo aggiornamento**: 2026-07-06 · prima stesura (richiesta owner) · → `docs/meta/REVISIONE_FONDAMENTA_2026-07-06.md`

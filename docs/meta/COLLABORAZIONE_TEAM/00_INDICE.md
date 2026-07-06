# Collaborazione di team — indice

> **Stato**: 🟢 v1 ATTIVO · **Creato**: 2026-07-06 · **Track**: C (team & delega)
> **Fonte di verità decisionale**: [`MASTERPLAN_RILANCIO_BHM_v2.md`](../MASTERPLAN_RILANCIO_BHM_v2.md) §15.
> **Autore**: sessione senior (ragiona-proponi-blinda). **Esecutore futuro**: Fable installa/adatta.

Questa cartella è il **kit operativo** con cui l'owner delega, supervisiona, controlla e
contro-verifica il lavoro di **max 2 collaboratori**, lavorando su più branch senza perdere il
controllo di `main`. È materiale **per l'owner umano**, non codice runtime.

> 🔌 **Attivazione — on-demand, NON prassi di default.** Questo kit è una **feature che si attiva solo
> quando deleghi**: caricalo come contesto quando entri in «modalità team». **Se lavori da solo (col
> tuo agente) non serve e non si carica** — niente branch `integrazione` obbligatorio, niente gate di
> consegna. Istruzione d'installazione per Fable in [`01_DESIGN_METODO.md`](./01_DESIGN_METODO.md) §6.1.

> ⚙️ **Licenza a Fable**: gli stampi qui definiti (topologia branch, template, gate) **non sono gabbie**.
> Fable può reinterpretarli/migliorarli in chiave più intelligente dentro lo scope prodotto
> (migliorie «di poco» ok, «di molto» chiedi) — stessa licenza del masterplan §14.5. **Eccezione dura**:
> l'invariante «`main` protetto, solo owner promuove» non si tocca senza autorizzazione esplicita.

---

## Ordine di lettura

| # | File | A cosa serve | Quando lo apri |
|---|------|--------------|----------------|
| 01 | [`01_DESIGN_METODO.md`](./01_DESIGN_METODO.md) | **Perché** questo metodo (il ragionamento, la mappa sul DNA del progetto) | una volta, per capire l'impianto |
| 02 | [`02_MANUALE_CAPO.md`](./02_MANUALE_CAPO.md) | Il **tuo** playbook: come delegare, supervisionare, **decidere** | ogni volta che deleghi |
| 03 | [`03_TEMPLATE_ORDINE_DI_LAVORO.md`](./03_TEMPLATE_ORDINE_DI_LAVORO.md) | Consegna **prescrittiva** (collaboratore «dammi il prompt») | quando deleghi al collaboratore-prompt |
| 04 | [`04_TEMPLATE_MANDATO.md`](./04_TEMPLATE_MANDATO.md) | Consegna **a obiettivo** (collaboratore «a modo mio») | quando deleghi al collaboratore-autonomo |
| 05 | [`05_GATE_E_CONTROVERIFICA.md`](./05_GATE_E_CONTROVERIFICA.md) | I **3 gate**, la checklist visiva, il report di consegna, come contro-verifichi | a ogni consegna che ricevi |
| 06 | [`06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md`](./06_PLAYBOOK_GIT_INTEGRAZIONE_RIPRISTINO.md) | Topologia branch, integrazione, **revert/ripristino**, conflitti, problemi di team | setup iniziale + quando qualcosa va storto |

---

## Il metodo in 6 righe

1. **Topologia**: `feature/*` (collaboratore) → **`integrazione`** (pre-main, integri tu) → **`main`** (sacro, solo tu + i tuoi modelli).
2. **Due modalità di delega**: **Ordine di Lavoro** (prescrittivo, dici cosa *e* come) · **Mandato** (a obiettivo, dici cosa e i confini, lui sceglie il come).
3. **Un collaboratore = una modalità di default** (vedi §02), ma la modalità si sceglie **per task**, non per persona.
4. **3 gate d'accettazione**: ① macchina (build/type/lint/test) · ② controverifica visiva del collaboratore · ③ tu (integri o rilanci).
5. **Chi esegue ≠ chi integra ≠ chi promuove**: il collaboratore consegna, tu integri in `integrazione`, solo tu promuovi a `main`.
6. **Ogni consegna porta un report** (mirror dei report Q1-Q6 del progetto) — così contro-verifichi in 5 minuti.

---

**Ultimo aggiornamento**: 2026-07-06 · v1 impianto completo (design + manuale capo + 2 template + gate + playbook git). Da testare sul campo e affinare all'uso.

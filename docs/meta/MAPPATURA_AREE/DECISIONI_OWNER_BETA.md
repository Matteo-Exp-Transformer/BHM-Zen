# Decisioni owner — intervista post-mappatura (scope beta)
**Data:** 2026-07-06 · **Contesto:** intervista al termine delle 5 mappe d'area · **Alimenta:** masterplan §8, port logica §6.6, UI §6.5

> Queste 10 decisioni **risolvono** le domande "❓ dipende da owner" accumulate nelle 5 mappe.
> Dove una decisione aggiunge feature/scope nuovo → segnalato **[NUOVO SCOPE]** per masterplan §8/§11.

---

## Le 10 decisioni

| # | Tema | Decisione | Impatto sulle mappe |
|---|------|-----------|---------------------|
| 1 | **Immutabilità audit-grade** | **Immutabile da subito**: letture temperatura e completamenti **append-only**; annullare = **riga di storno tracciata**, mai DELETE fisico | Reparti (§4 letture) · Oggi (`uncompleteTask` DELETE → storno) · Fondamenta (policy no-UPDATE/DELETE) |
| 2 | **Dashboard** | **Dashboard ricca con dati reali**: collega `DashboardPage`, elimina i dati fabbricati (`turnover_rate:85`, split 60/30/10) | Regia (③ controllo) |
| 3 | **Liste spesa** | **In beta**: deploy 4 RPC shopping (migration 007) + unifica il dual-stack legacy/RPC | Scorte · Fondamenta (RPC target) |
| 4 | **Dati azienda** | **Solo P.IVA + ragione sociale**; **rimuovere** numero licenza e campi non necessari (telefono/tipo/data da valutare come opzionali) | Regia (companies) · Fondamenta (schema companies) |
| 5 | **Notifiche** | **Solo alert in-app, nessun pannello preferenze**: **non** creare `notification_preferences`; rimuovere la sezione Settings | Regia (Settings) · Fondamenta (tabella tagliata) |
| 6 | **HACCP Settings UI** | **Niente editing libero**: le soglie vivono in `src/compliance/haccp-rules.ts` (Track B); la UI al massimo le **mostra in sola lettura** | Regia (Settings HACCP) · coerente con [[rilancio-bhm-skill-system]] |
| 7 | **Timbro fine turno** | **[NUOVO SCOPE]** **«sigilla la giornata»** (def. 2026-07-06): orario apertura/chiusura **+** attestazione «tutto registrato» → record **shift-seal append-only** che chiude i registri del turno (chi/quando). **Firma audit-grade**. Schema + UI da progettare | Oggi (§4/§6) · Fondamenta (nuova tabella) · masterplan §8/§11 |
| 8 | **Lettura temperatura** | **Temperatura + metodo obbligatori**; **note e foto entrambe opzionali** | Reparti (§4 temperature_readings, §6) |
| 9 | **Multi-utente** | **Tutti e 3 i ruoli** (titolare/responsabile/dipendente) + inviti staff attivi in beta | Regia (ruoli/RLS) · trasversale |
| 10 | **Ciclo scadenze** | **Completo**: scadenza + `expired_at` + reinserimento (`previous_product_id`, `reinsertion_count`, `archived_at`, status `archived`) + storico | Scorte (§4 products) · Fondamenta (schema products) |

---

## Conseguenze schema (delta target aggiornato)

Migration/DDL che le decisioni **confermano necessari** (ordine indicativo):

1. **Immutabilità** (dec. 1): policy/trigger append-only su `temperature_readings`, `task_completions`, `maintenance_completions`; `uncompleteTask`/annulli riscritti come storno.
2. **Migration 015** (già P0): `method`, `notes`, `photo_evidence`, `recorded_by` su `temperature_readings` — con `method` obbligatorio, `notes`/`photo_evidence` opzionali (dec. 8).
3. **RPC shopping ×4** + RLS (dec. 3, migration 007).
4. **companies**: aggiungi `vat_number` (+ ragione sociale se distinta da `name`); **rimuovi** `license_number` dalla UI (dec. 4).
5. **products**: aggiungi `expired_at`, `previous_product_id`, `reinsertion_count`, `archived_at`; estendi CHECK status con `archived` (dec. 10).
6. **notification_preferences**: **NON** creare; rimuovere la sezione Settings (dec. 5).
7. **haccp_configurations**: la UI diventa sola-lettura; nessun payload flat di scrittura (dec. 6).
8. **timbro fine turno** (dec. 7, «sigilla la giornata»): nuova tabella **`shift_seals`** (o `work_shifts`) **append-only** — `company_id`, `user_id`, `opened_at`, `closed_at`, `attestation` (tutto-registrato), immutabile come i registri (dec. 1). Campi/comportamento esatti = design Track A + Fondamenta.
9. **onboarding_completed** su `companies` (da mappa Regia, indipendente dall'intervista ma coerente): stato completamento server-side.
10. **companies.onboarding** + ruoli: RLS per 3 ruoli già in gran parte live; verificare `responsabile` (dec. 9).

---

## Decisioni minori assunte come default (recommended) — correggere se sbagliato

Non chieste in intervista; assunte per non bloccare, allineate ai vincoli del rilancio:

- **Creazione punto+manutenzioni** → **RPC transazionale** (non rollback client-side): coerente con audit-grade dec. 1. *(Reparti §4)*
- **`/sign-up` pubblica** → **chiudere** (design solo-invito, dec. 9 multi-utente via invito). *(Regia)*
- **Staff CRUD UI** → **collegare** `StaffManagement`↔`useStaff` (non è un bivio, è un fix; DB/RLS pronti). *(Regia)*
- **Ruoli**: fonte unica **`company_members.role`**; `UserManagement` smette di scrivere `user_profiles.role`. *(Regia, dec. 9)*
- **Metadati `[END_DATE:]`** in `description` → **colonna** vera. *(Oggi §4)*
- **Dead code** B.9/B.10 + modal/hook duplicati → **rimuovere** (elenco nelle mappe). *(Fondamenta, tutte)*

---

## Decisione 11 — Sincronizzazione multi-utente (seduta 2026-07-06, post-intervista)

> Scioglie la questione §8 «quanto minimo di sincronizzazione multi-utente serve in beta».
> Alimenta **port §6.6** (cosa riusare/buttare del layer realtime) e **Fondamenta** (publication realtime).

**Decisione owner: livello «live-refetch, conflict-free».**

- **Concorrenza = conflict-free per costruzione** grazie alla dec. 1 (append-only, annullo = storno, mai UPDATE/DELETE distruttivo): ogni azione è un INSERT, due utenti non possono sovrascriversi. → **nessun lock, merge, last-write-wins, CRDT**.
- **Sync = invalidate-on-change**: si riusa **solo** il pattern `useConservationRealtime.ts` (subscribe `postgres_changes` → `queryClient.invalidateQueries`), esteso alle superfici condivise **Oggi** (task/completamenti) e **Scorte** (liste spesa); **Reparti** già coperto.
- **Realtime = UX, non correttezza**: la verità è il DB append-only, quindi se un canale cade la beta regge → **floor = refetch-on-focus**. Sgancia la beta dalla fragilità dei canali.
- **Niente** presence / awareness / "chi è online" in beta.

**Verdetto riuso layer realtime legacy** (verità = codice, luglio 2026):

| File | Righe | Stato | Verdetto |
|------|-------|-------|----------|
| `hooks/useConservationRealtime.ts` | 115 | cablato in `ConservationPage` | ♻️ **riuso — pattern di riferimento** |
| `hooks/useRealtime.ts` + `services/realtime/RealtimeConnectionManager.ts` | 822 | presence/`onlineUsers`, non cablato | 🗑️ butto |
| `services/realtime/CollaborativeEditing.ts` | 772 | dead code, zero import esterni | 🗑️ butto |
| `services/realtime/HACCPAlertSystem.ts` + `TemperatureMonitor.ts` | 1.095 | orfani; ridondanti con `haccp-rules.ts` (Track B) + dec. 5 | 🗑️ butto |

→ **~2.700 righe da NON portare**; ~115 da riusare + estendere a 2 superfici.

**Conseguenza schema/infra (per Fable)**: abilitare la publication `supabase_realtime` (+ `REPLICA IDENTITY`) sulle tabelle condivise beta — `temperature_readings`, `maintenance_completions`, `maintenance_tasks` (già), `task_completions`, `generic_tasks`, tabelle shopping — e agganciare un hook `useXxxRealtime` per lente. RLS `company_id` già filtra i canali.

---

## Decisione 12 — Inventario come mansione + spesa flessibile (seduta UI 2026-07-06)

> Riformula la casa **Scorte** durante il mockup 7. Alimenta **port §6.6**, **Fondamenta** (schema) e **UI**.
> Dettaglio + mockup: [`MAPPA_Scorte_inventory-shopping.md`](./MAPPA_Scorte_inventory-shopping.md) §1-bis · `MOCKUP_UI/07_SCORTE.html` (v2).

1. **Inventario = mansione ricorrente assegnabile** (nuovo tipo, accanto alle manutenzioni): l'admin la assegna a responsabile/dipendente → giro dei **punti di conservazione del reparto/frigo assegnato** → **conta le rimanenze**. Genera **reminder**, tiene il catalogo aggiornato, appare in **Oggi**.
2. **Ingrediente-level**: `par_level` («dovrei avere N») vs rimanenza (M); `M < par` → **sotto scorta** → suggerito in spesa.
3. **Scadenza catturata all'inserimento del prodotto**, non nel giro; nel giro = **check di conferma**. Mostrata l'**ultima scadenza** (lotto più longevo); unità in scadenza a breve = **alert** (anche Oggi) → doppia lente.
4. **Spesa flessibile**: auto-compilata dai sotto-scorta ma **editabile**, liste multiple/personalizzate; **NIENTE avanzamento/completamento** (la spesa varia — niente sensazione di "incompleta").

**Conseguenze schema (per Fable)**: `products.par_level`; storicizzare i conteggi (`stock_counts` o `counted_at`/`counted_by`); nuovo tipo mansione «Inventario» nel sistema tasks + generatore ricorrenze/reminder; valutare scadenza per **lotto** vs flat.

**Note UI/logica annotate (owner 2026-07-06, da implementare — non ancora nel mockup):**
- **Pezzo non in catalogo → chiedi scadenza**: se aggiungo un'unità che l'app non conosceva, è un inserimento nuovo → richiedi la data di scadenza (nel giro su prodotti esistenti = solo conferma).
- **Accordion categorie**: click sul nome categoria chiude/apre la sezione (alleggerisce la vista con molti ingredienti).

---

## Per il masterplan §8
- Le domande "Mappatura area-per-area" e le "due lenti" delle 5 mappe hanno ora **risposte owner** su 10 bivi → §8 spuntabile.
- **[NUOVO SCOPE] Timbro fine turno** (dec. 7) **definito 2026-07-06**: «sigilla la giornata» (orario + attestazione «tutto registrato» → `shift_seals` append-only, firma audit-grade). Design comportamento/UI = prossima seduta Track A.
- Restano da progettare: schema timbro; forma esatta `vat_number`/ragione sociale; profondità storico riordini.

# Revisione generale fondamenta — Fable, 2026-07-06

> **Cos'è**: auto-revisione critica del lavoro CP1→CP5 (ambiente, baseline DB, skill-system,
> scaffold, compliance, 8 migration applicate), con verifiche puntuali, perplessità oneste e
> migliorie proposte. Le proposte **non si auto-adottano**: decide l'owner (o si applicano nei
> prossimi checkpoint se puramente tecniche e dentro scope).

---

## 1. Verifiche puntuali fatte in revisione

| Verifica | Esito |
|----------|-------|
| `is_company_member()` / `has_management_role()` (riusate nelle mie policy senza averle lette) | ✅ **Solide**: SECURITY DEFINER con `search_path` bloccato, controllano `is_active = true`; la seconda limita a `admin`/`responsabile` |
| Copertura RLS su tutte le 37 tabelle | ⚠️ **2 tabelle SENZA RLS**: `admin_users`, `restaurant_settings` (relitti legacy; coi GRANT default sono leggibili/scrivibili da qualunque authenticated) → fix pronto in migration `20260706050000` |
| Tabelle con RLS attiva ma zero policy | `user_activity_logs` (deny-all per i client: probabilmente voluto, le scritture passano da RPC definer — da confermare al port) · `task_completions` era così sul live → **già fixata** in 040100 |

## 2. Cosa reggerà bene (fiducia alta)

- **Schema-first**: baseline dal live + tipi rigenerati + gate `validate` uccide alla radice la
  classe di bug «codice avanti al DB» che ha affossato il legacy.
- **Append-only a livello di schema** (trigger, non convenzione client): l'invariante audit-grade
  vale anche per service_role e per bug futuri dell'app. È il fondamento del valore legale.
- **Fonte-unica HACCP con gate-2 macchina**: nessun agente può più spargere numeri.
- **Canale migration unico e tracciato** (history 9/9): risolto il caos a doppio canale del legacy.

## 3. Perplessità (oneste, in ordine di peso)

1. **Un solo DB, condiviso con l'app legacy deployata.** Ogni `db push` è di fatto un deploy in
   produzione senza staging. Regge per la beta-solo-owner, ma è il rischio strutturale n.1.
   → *Proposta*: appena c'è un utente pilota reale, ambiente di sviluppo separato (branch
   Supabase o progetto dedicato) + backup pre-push automatizzato. Nel frattempo: dry-run
   obbligatorio (già prassi) + autorizzazione owner per ogni push (già enforcement).
2. **L'append-only ora rompe due flussi del legacy** (uncomplete task, edit/delete letture) —
   voluto (dec. 1), ma finché la nuova app non implementa lo **storno**, l'owner non deve usare
   quei gesti nella vecchia app (FU-007). Finestra di incoerenza da chiudere presto (il port di
   Oggi/Reparti è la priorità giusta anche per questo).
3. **`registro_append_only` blocca anche le correzioni legittime da migration**: un data-fix
   futuro richiederà `ALTER TABLE … DISABLE TRIGGER` dentro la migration (con motivazione nel
   commit). Documentato in `docs/guide/PRATICHE_INGEGNERIA.md` §1 — se non lo si sa, sembra un bug.
4. **Drift ruoli**: `staff.role` sul live ammette 4 ruoli (`admin, responsabile, dipendente,
   collaboratore`) vs dec. 9 «3 ruoli» e fonte unica `company_members.role`. Da riconciliare al
   port di Regia (migration di allineamento CHECK + pulizia doppio binario `user_profiles.role`).
5. **`WARN_MARGIN_C = 1`** (verdetto ambra): scelta di prodotto messa da me come default —
   va tarata con l'owner nelle sedute UI (annotato anche in COMPLIANCE_CONTEXT §4).
6. **PWA senza icone**: manifest minimale → l'app non è ancora «installabile» da mobile.
   Serve il set icone col lavoro UI (task naturale del FU-001).
7. **Relitti legacy nel DB** (`restaurant_settings`, `booking_requests`, `events`, `meetings`,
   `notes`, `admin_users`): appartengono a un'altra vita del progetto. Oltre al fix RLS, andrà
   decisa la **rimozione** post-beta (migration di drop, con export di sicurezza).
8. **Legacy CSRF/user_sessions custom**: macchinario di sessione fatto a mano nel legacy.
   Perplessità: da NON portare ciecamente — probabilmente Supabase Auth (PKCE, refresh) basta
   per la beta. Decisione da prendere al port auth (FU-001), con le due lenti.
9. **RPC shopping**: ritornano anche liste `is_template` (filtro solo su status) e
   `complete_shopping_list` convive con la dec. 12 «spesa senza completamento» — le RPC
   restano (dec. 3), ma la nuova UI Scorte non userà il completamento. Coerenza da mantenere
   consapevolmente al port.
10. **Migration legacy 016 (`next_due` alias) e 010 (categorie estese)**: deliberatamente non
    portate (P2/P3, il codice nuovo non le richiede ancora). Rivalutare al port di Scorte.

## 4. Migliorie proposte (annotate, non implementate)

| # | Proposta | Perché | Quando |
|---|----------|--------|--------|
| M1 | **CI GitHub Actions**: `npm run validate` su ogni PR verso `integrazione`/`main` | il gate oggi gira solo in locale | subito (5 min, alto valore) |
| M2 | Backup pre-push: `supabase db dump` automatico nello script prima di ogni `db push` | rete di sicurezza sul DB unico | col prossimo push |
| M3 | Seed script dati demo (azienda fittizia da archetipo) | sviluppo UI e demo vendita senza toccare dati owner | con FU-001/FU-003 |
| M4 | Sentry attivo al primo deploy Vercel | error tracking già previsto (§4 masterplan) | workstream 8 |
| M5 | Bump Supabase CLI ≥ 2.109 + nota Docker in FABLE_AVVIO (FU-006) | igiene strumenti | prossima sessione owner |

## 5. Idee esperienza emerse in revisione

Annotate nel ledger (`docs/skill-system/comunicazione/IDEE_ESPERIENZA.md`): margine-ambra
per-categoria che spiega *perché* è ambra; «storno» raccontato in UI come gesto dignitoso
(non «errore») — coerente con §10.

---

**Ultimo aggiornamento**: 2026-07-06 · revisione generale post-CP5 · → `docs/skill-system/sessioni/06-07-26/Report-fondamenta-fable.md`

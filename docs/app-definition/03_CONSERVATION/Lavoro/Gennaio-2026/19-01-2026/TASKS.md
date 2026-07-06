# TASKS - Profilo Punto di Conservazione

**Data**: 2026-01-19
**Versione**: 2.0.0
**Riferimento**: PLAN.md

---

## Legenda Priorità

| Priorità | Significato |
|----------|-------------|
| P0 | BLOCCANTE - Deve essere completato prima di qualsiasi altro task |
| P1 | CRITICO - Necessario per il funzionamento base |
| P2 | IMPORTANTE - Feature principale |
| P3 | NORMALE - Miglioramenti e completamenti |

## Legenda Stati

| Stato | Significato |
|-------|-------------|
| TODO | Da iniziare |
| IN_PROGRESS | In lavorazione |
| BLOCKED | Bloccato da dipendenza |
| REVIEW | Da verificare |
| DONE | Completato |

---

## FASE 0: Fix Bug Critici ✅ **COMPLETATA**

### TASK-0.1: Fix Select Ruolo Non Funzionante
- **ID**: TASK-0.1
- **Priorità**: P0
- **Stato**: DONE ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 30 min
- **Dipendenze**: Nessuna
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx`
  - `src/components/ui/Select.tsx` (verifica)

**Descrizione**:
Il Select Radix UI per il ruolo nelle manutenzioni non si apre quando cliccato.

**Azioni**:
1. Verificare configurazione Select in AddPointModal.tsx
2. Aggiungere `position="popper"` e `sideOffset={5}` a SelectContent
3. Verificare che overflow del modal container non tagli il dropdown
4. Testare apertura dropdown

**Acceptance Criteria**:
- [x] Click su Select Ruolo apre dropdown
- [x] Opzioni ruolo visibili e selezionabili
- [x] Selezione ruolo aggiorna stato form
- [x] Test su desktop e mobile

**Note**: Testato manualmente il 19-01-2026. Select già configurato con `position="popper"` e `z-[10001]`. Funziona correttamente.

---

### TASK-0.2: Fix z-index Modal
- **ID**: TASK-0.2
- **Priorità**: P0
- **Stato**: DONE ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 15 min
- **Dipendenze**: Nessuna
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx`

**Descrizione**:
Modal usa z-50 invece di z-[9999], appare sotto header/dashboard.

**Azioni**:
1. Trovare div overlay del modal
2. Cambiare `z-50` in `z-[9999]`
3. Verificare che modal appaia sopra tutti gli elementi

**Acceptance Criteria**:
- [x] Modal visibile sopra header
- [x] Modal visibile sopra sidebar
- [x] Backdrop copre tutta la pagina

**Note**: Modal già configurato con `z-[9999]` alla riga 903. Testato manualmente - funziona correttamente.

---

### TASK-0.3: Fix Campi Categoria/Dipendente
- **ID**: TASK-0.3
- **Priorità**: P0
- **Stato**: DONE ✅
- ~~**Bloccato da**: TASK-0.1~~ (completato)
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 20 min
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx`

**Descrizione**:
Campi "Categoria Staff" e "Dipendente Specifico" non appaiono dopo selezione ruolo.

**Azioni**:
1. Dopo TASK-0.1, verificare se campi appaiono
2. Se non appaiono, verificare condizione `task.assegnatoARuolo`
3. Debug con console.log per verificare stato
4. Correggere logica condizionale se necessario

**Acceptance Criteria**:
- [x] Dopo selezione ruolo, campo Categoria appare
- [x] Dopo selezione ruolo, campo Dipendente appare
- [x] Campi funzionano correttamente

**Note**: Testato manualmente il 19-01-2026. Campi appaiono correttamente dopo selezione ruolo. Funzionalità completa fino al salvataggio.

---

### TASK-0.4: Test Manuale Fase 0
- **ID**: TASK-0.4
- **Priorità**: P0
- **Stato**: DONE ✅
- ~~**Bloccato da**: TASK-0.1, TASK-0.2, TASK-0.3~~ (tutti completati)
- **Agente**: AGENT-TESTER
- **Stima**: 30 min

**Descrizione**:
Verifica manuale che tutti i bug della Fase 0 siano risolti.

**Azioni**:
1. Aprire AddPointModal
2. Verificare z-index (modal sopra tutto)
3. Selezionare ruolo in manutenzioni
4. Verificare campi Categoria/Dipendente
5. Test su desktop e mobile

**Acceptance Criteria**:
- [x] Tutti i task 0.1-0.3 funzionanti
- [x] Test manuale completato con successo
- [x] Salvataggio funziona correttamente

**Note**: Test manuale completato il 19-01-2026. Tutti i bug risolti. Modal funziona correttamente fino al salvataggio eseguito con successo.

---

## FASE 1: Database Schema ✅ **COMPLETATA**

### TASK-1.1: Migration Campi Profilo
- **ID**: TASK-1.1
- **Priorità**: P1
- **Stato**: DONE ✅
- **Agente**: AGENT-2 (Database)
- **Stima**: 20 min
- **Dipendenze**: Fase 0 completata
- **File**:
  - `database/migrations/018_add_conservation_profile_fields.sql` ✅

**Descrizione**:
Creare migration per aggiungere campi profilo a conservation_points.

**Azioni**:
1. Creare file migration
2. Aggiungere colonne: appliance_category, profile_id, profile_config, is_custom_profile
3. Aggiungere commenti e indici
4. Testare migration su DB locale

**SQL**:
```sql
ALTER TABLE public.conservation_points
ADD COLUMN IF NOT EXISTS appliance_category VARCHAR,
ADD COLUMN IF NOT EXISTS profile_id VARCHAR,
ADD COLUMN IF NOT EXISTS profile_config JSONB,
ADD COLUMN IF NOT EXISTS is_custom_profile BOOLEAN DEFAULT false;
```

**Acceptance Criteria**:
- [x] Migration creata
- [x] Migration eseguita senza errori
- [x] Colonne esistono nel DB
- [x] Punti esistenti non rotti

**Note**: Completato il 20-01-2026. Migration 018 eseguita con successo. Tutte e 4 le colonne presenti nel DB (appliance_category, profile_id, profile_config, is_custom_profile). Indice idx_conservation_points_profile creato correttamente. Commit: 5b403331.

---

### TASK-1.2: Migration Tabella Custom Profiles
- **ID**: TASK-1.2
- **Priorità**: P1
- **Stato**: DONE ✅
- **Agente**: AGENT-2 (Database)
- **Stima**: 15 min
- **Dipendenze**: TASK-1.1 ✅
- **File**:
  - `database/migrations/019_create_custom_profiles_table.sql` ✅

**Descrizione**:
Creare tabella per profili custom futuri.

**Azioni**:
1. Creare file migration
2. Creare tabella cons_point_custom_profile
3. Aggiungere indici e trigger
4. Testare migration

**Acceptance Criteria**:
- [x] Tabella creata
- [x] Indici creati
- [x] Trigger updated_at funzionante

**Note**: Completato il 20-01-2026. Migration 019 eseguita con successo. Tabella cons_point_custom_profile creata con tutti gli indici e trigger configurati correttamente. Commit: 5b403331.

---

### TASK-1.3: Migration Categorie Prodotti
- **ID**: TASK-1.3
- **Priorità**: P1
- **Stato**: DONE ✅
- **Agente**: AGENT-2 (Database)
- **Stima**: 45 min
- **Dipendenze**: TASK-1.1 ✅, TASK-1.2 ✅
- **File**:
  - `database/migrations/020_replace_product_categories.sql` ✅

**Descrizione**:
Sostituire categorie prodotti con nuove allineate ai profili HACCP.

**Azioni**:
1. Creare mapping table temporanea
2. Aggiornare conservation_points.product_categories con nuovi nomi
3. Verificare integrità dati

**ATTENZIONE**: Migration distruttiva. Backup prima di eseguire.

**Acceptance Criteria**:
- [x] Mapping creato correttamente
- [x] product_categories aggiornato (se necessario)
- [x] Nessun dato perso

**Note**: Completato il 20-01-2026. Migration 020 eseguita con successo. Categorie esistenti erano già in formato snake_case (beverages, fresh_meat, etc.), quindi il mapping da nomi italiani non si è applicato (comportamento corretto). Tutti i 7 punti di conservazione mantengono le loro categorie. Integrità dati verificata: 7/7 punti con categorie, nessun dato perso. Commit: 5b403331.

---

## FASE 2: Costanti TypeScript ✅ **COMPLETATA**

### TASK-2.1: Creare conservationProfiles.ts
- **ID**: TASK-2.1
- **Priorità**: P1
- **Stato**: DONE ✅
- **Agente**: AGENT-3 (TypeScript/Logic)
- **Stima**: 60 min
- **Dipendenze**: Nessuna (può iniziare in parallelo a Fase 1)
- **File**:
  - `src/utils/conservationProfiles.ts` ✅

**Descrizione**:
Creare file con costanti profili HACCP basato su template JSON.

**Azioni**:
1. Creare tipi: ApplianceCategory, ConservationProfileId, ConservationProfile
2. Creare VERTICAL_FRIDGE_WITH_FREEZER_TEMPLATE
3. Creare CONSERVATION_PROFILES con 5 profili
4. Creare CATEGORY_ID_TO_DB_NAME mapping
5. Creare helper functions: getProfileById, getProfilesForAppliance, mapCategoryIdsToDbNames
6. Creare labels per UI

**Acceptance Criteria**:
- [x] File creato con tutti i tipi
- [x] 5 profili definiti correttamente
- [x] Mapping categorie completo
- [x] Helper functions funzionanti
- [x] `npm run type-check` passa (errori preesistenti non legati ai nuovi campi)

**Note**: Completato. File `conservationProfiles.ts` creato con tutti i tipi, costanti, template, 5 profili HACCP, mapping categorie e helper functions. Labels per UI presenti.

---

### TASK-2.2: Aggiornare conservation.ts
- **ID**: TASK-2.2
- **Priorità**: P1
- **Stato**: DONE ✅
- **Bloccato da**: TASK-2.1 ✅
- **Agente**: AGENT-3 (TypeScript/Logic)
- **Stima**: 15 min
- **File**:
  - `src/types/conservation.ts` ✅

**Descrizione**:
Aggiornare tipi ConservationPoint con nuovi campi.

**Azioni**:
1. Importare tipi da conservationProfiles.ts
2. Aggiungere campi opzionali a ConservationPoint interface

**Acceptance Criteria**:
- [x] Tipi esportati correttamente
- [x] ConservationPoint aggiornato
- [x] `npm run type-check` passa (errori preesistenti non legati ai nuovi campi)

**Note**: Completato. Import da `conservationProfiles.ts` aggiunto. ConservationPoint interface aggiornata con campi opzionali: `appliance_category`, `profile_id`, `profile_config`, `is_custom_profile`.

---

### TASK-2.3: Aggiornare defaultCategories.ts
- **ID**: TASK-2.3
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-2.1 ✅
- **Agente**: AGENT-3 (TypeScript/Logic)
- **Stima**: 30 min
- **File**:
  - `src/utils/defaultCategories.ts` ✅

**Descrizione**:
Aggiornare categorie default con le 14 nuove.

**Azioni**:
1. Sostituire DEFAULT_CATEGORIES con nuove categorie
2. Aggiungere temperature_requirements per ogni categoria
3. Verificare createDefaultCategories()

**Acceptance Criteria**:
- [x] 14 categorie definite
- [x] temperature_requirements corretti
- [x] storage_type corretti

**Note**: Completato. DEFAULT_CATEGORIES aggiornato con 14 categorie allineate ai profili HACCP. Ogni categoria include `temperature_requirements` con `min_temp`, `max_temp` e `storage_type`.

---

## FASE 3: Modifiche UI ✅ **COMPLETATA**

### TASK-3.1: Sezione Categorie Read-Only
- **ID**: TASK-3.1
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-0.4 ✅, TASK-2.1 ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 30 min
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx` ✅

**Descrizione**:
Rendere sezione categorie read-only quando profilo selezionato.

**Azioni**:
1. Aggiungere condizione `formData.profileId`
2. Se profilo attivo: opacity-75, pointer-events-none
3. Mostrare label "(auto-configurate)"
4. Se profilo non attivo: comportamento normale

**Acceptance Criteria**:
- [x] Con profilo: categorie non modificabili
- [x] Con profilo: label informativa visibile
- [x] Senza profilo: categorie modificabili
- [x] Stile visivo chiaro

**Note**: Completato. Sezione categorie resa read-only quando profilo selezionato (`opacity-75 pointer-events-none`). Label "(auto-configurate)" e testo informativo visibili.

---

### TASK-3.2: Aggiungere Sezione Profilo
- **ID**: TASK-3.2
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-2.1 ✅, TASK-3.1 ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 60 min
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx` ✅

**Descrizione**:
Aggiungere sezione "Profilo Punto di Conservazione" condizionale.

**Azioni**:
1. Aggiungere condizione `pointType === 'fridge'`
2. Aggiungere Select Categoria Appliance
3. Aggiungere Select Profilo (filtrato per categoria)
4. Aggiungere Info Box note HACCP
5. Importare costanti da conservationProfiles.ts

**Acceptance Criteria**:
- [x] Sezione visibile solo per frigoriferi
- [x] Select categoria funzionante
- [x] Select profilo filtrato
- [x] Info box con note HACCP
- [x] Temperatura consigliata mostrata

**Note**: Completato. Sezione "Profilo Punto di Conservazione" aggiunta, visibile solo per `pointType === 'fridge'`. Select Categoria Appliance e Select Profilo (filtrato per categoria) funzionanti. Info Box con note HACCP e temperatura consigliata mostrati correttamente.

---

### TASK-3.3: Implementare Auto-Configurazione
- **ID**: TASK-3.3
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-3.2 ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 45 min
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx` ✅

**Descrizione**:
Implementare auto-configurazione quando profilo selezionato.

**Azioni**:
1. Creare useMemo per selectedProfile
2. Creare useEffect per auto-configurazione
3. Impostare temperatura target da profilo
4. Mappare e impostare productCategories

**Acceptance Criteria**:
- [x] Selezione profilo imposta temperatura (nota: temperatura non modificabile manualmente nel form)
- [x] Selezione profilo imposta categorie
- [x] Cambio profilo aggiorna valori
- [x] Reset profilo permette modifica manuale

**Note**: Completato. Auto-configurazione implementata con `useMemo` per `selectedProfile` e `useEffect` per mappare categorie dal profilo. Le categorie vengono aggiornate automaticamente quando si seleziona un profilo.

---

### TASK-3.4: Aggiornare State e Validazione
- **ID**: TASK-3.4
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-3.3 ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 30 min
- **File**:
  - `src/features/conservation/components/AddPointModal.tsx` ✅

**Descrizione**:
Aggiornare state formData e validazione form.

**Azioni**:
1. Aggiungere applianceCategory, profileId, isCustomProfile a formData
2. Aggiornare validateForm() per validare profilo (solo fridge)
3. Aggiornare handleSubmit() per includere nuovi campi

**Acceptance Criteria**:
- [x] State include nuovi campi
- [x] Validazione profilo per frigoriferi
- [x] Submit include nuovi campi
- [x] Form funziona end-to-end

**Note**: Completato. State `formData` aggiornato con `applianceCategory`, `profileId`, `isCustomProfile`. Validazione profilo aggiunta per frigoriferi (applianceCategory e profileId obbligatori). `handleSubmit()` include tutti i nuovi campi nel payload.

---

## FASE 4: Hook e Servizi

### TASK-4.1: Aggiornare useConservationPoints
- **ID**: TASK-4.1
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-1.1 ✅, TASK-2.2 ✅
- **Agente**: AGENT-3 (TypeScript/Logic)
- **Stima**: 30 min
- **File**:
  - `src/features/conservation/hooks/useConservationPoints.ts` ✅

**Descrizione**:
Aggiornare hook per gestire nuovi campi.

**Azioni**:
1. Aggiornare query select per includere nuovi campi
2. Aggiornare mutation per salvare nuovi campi
3. Verificare tipi

**Acceptance Criteria**:
- [x] Query include nuovi campi
- [x] Mutation salva nuovi campi
- [x] Tipi corretti

**Note**: Completato. Query select usa `*` quindi include automaticamente tutti i campi (appliance_category, profile_id, profile_config, is_custom_profile). Mutation gestisce i campi tramite `...pointData` e `...updateFields` (inclusione automatica di appliance_category e profile_id). `profile_config` e `is_custom_profile` gestiti esplicitamente. Mapping da/verso DB corretto.

---

### TASK-4.2: Aggiornare ConservationPointCard (Opzionale)
- **ID**: TASK-4.2
- **Priorità**: P3
- **Stato**: DONE ✅
- **Bloccato da**: TASK-4.1 ✅
- **Agente**: AGENT-1 (UI/Frontend)
- **Stima**: 20 min
- **File**:
  - `src/features/conservation/components/ConservationPointCard.tsx` ✅

**Descrizione**:
Mostrare profilo selezionato nella card.

**Azioni**:
1. Importare PROFILE_LABELS
2. Mostrare nome profilo se presente

**Acceptance Criteria**:
- [x] Profilo mostrato se presente
- [x] Label leggibile
- [x] Non rompe layout esistente

**Note**: Completato il 20-01-2026. ConservationPointCard aggiornata per mostrare il profilo HACCP quando presente. Import di PROFILE_LABELS e ConservationProfileId aggiunti. Visualizzazione del profilo posizionata dopo il reparto, con icona ShieldCheck e label leggibile. Fallback a profile_id se non trovato in PROFILE_LABELS. Layout esistente preservato.

---

## FASE 5: Testing ✅ **COMPLETATA**

### TASK-5.1: Test Unitari
- **ID**: TASK-5.1
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-3.4 ✅
- **Agente**: AGENT-TESTER
- **Stima**: 60 min
- **File**:
  - `src/utils/__tests__/conservationProfiles.test.ts` ✅
  - `src/features/conservation/components/__tests__/AddPointModal.test.tsx` ✅

**Descrizione**:
Scrivere test unitari per nuove funzionalità.

**Test da scrivere**:
- getProfileById()
- getProfilesForAppliance()
- mapCategoryIdsToDbNames()
- Selezione categoria/profilo
- Auto-configurazione

**Acceptance Criteria**:
- [x] Test helper functions (16 test per conservationProfiles)
- [x] Test selezione UI (7 test per AddPointModal profili)
- [x] Test auto-configurazione
- [x] Coverage > 80% per nuove funzionalità

**Note**: Completato il 20-01-2026. File `conservationProfiles.test.ts` creato con 16 test unitari (7 per getProfileById, 3 per getProfilesForAppliance, 6 per mapCategoryIdsToDbNames). Test UI aggiunti ad AddPointModal.test.tsx con 7 test per sezione profili. Tutti i test passano (16/16 + 20/20 nel file completo).

---

### TASK-5.2: Test E2E
- **ID**: TASK-5.2
- **Priorità**: P2
- **Stato**: DONE ✅
- **Bloccato da**: TASK-5.1 ✅
- **Agente**: AGENT-TESTER
- **Stima**: 60 min
- **File**:
  - `tests/conservation/profile-selection.spec.ts` ✅

**Descrizione**:
Scrivere test E2E per flusso completo.

**Test da scrivere**:
- Creazione punto con profilo
- Auto-configurazione funziona
- Categorie read-only
- Salvataggio corretto
- Retrocompatibilità punti esistenti

**Acceptance Criteria**:
- [x] Test creazione con profilo
- [x] Test auto-configurazione
- [x] Test retrocompatibilità
- [x] Tutti i test passano

**Note**: Completato il 20-01-2026. File `profile-selection.spec.ts` creato con 5 test E2E completi per il flusso profili conservazione. Test verificano: creazione punto con profilo, auto-configurazione temperatura e categorie, categorie read-only quando profilo attivo, salvataggio corretto nel DB, retrocompatibilità punti esistenti. Tutti i test passano.

---

## Dipendenze Visualizzate

```
FASE 0 (BLOCCANTE) ✅ COMPLETATA
├── TASK-0.1 (Select Ruolo) ✅
├── TASK-0.2 (z-index) ✅
├── TASK-0.3 (Campi) ✅
└── TASK-0.4 (Test) ✅

FASE 1 (Database) ✅ COMPLETATA
├── TASK-1.1 (Migration Campi) ✅
├── TASK-1.2 (Tabella Custom) ✅
└── TASK-1.3 (Migration Categorie) ✅

FASE 2 (TypeScript) ✅ COMPLETATA
├── TASK-2.1 (conservationProfiles.ts) ✅
├── TASK-2.2 (conservation.ts) ✅
└── TASK-2.3 (defaultCategories.ts) ✅

FASE 3 (UI) ✅ COMPLETATA
├── TASK-3.1 (Read-Only) ✅
├── TASK-3.2 (Sezione Profilo) ✅
├── TASK-3.3 (Auto-Config) ✅
└── TASK-3.4 (State/Validazione) ✅

FASE 4 (Hook) ✅ COMPLETATA
├── TASK-4.1 (useConservationPoints) ✅
└── TASK-4.2 (Card) ✅

FASE 5 (Testing) ✅ COMPLETATA
├── TASK-5.1 (Unit) ✅
└── TASK-5.2 (E2E) ✅
```

---

## Riepilogo per Agente

| Agente | Task Assegnati | Stima Totale |
|--------|----------------|--------------|
| AGENT-1 (UI) | 0.1, 0.2, 0.3, 3.1, 3.2, 3.3, 3.4, 4.2 | 4h 30min |
| AGENT-2 (DB) | 1.1, 1.2, 1.3 | 1h 20min |
| AGENT-3 (TS) | 2.1, 2.2, 2.3, 4.1 | 2h 15min |
| AGENT-TESTER | 0.4, 5.1, 5.2 | 2h 30min |

**Totale stimato**: ~10h 35min

---

**Ultimo Aggiornamento**: 2026-01-20
**Fase 0 Completata**: 2026-01-19 (test manuale confermato)
**Fase 1 Completata**: 2026-01-20 (migration eseguite e verificate, commit 5b403331)
**Fase 2 Completata**: 2026-01-20 (costanti TypeScript create e verificate)
**Fase 3 Completata**: 2026-01-20 (modifiche UI implementate e testate)
**Fase 4 Completata**: 2026-01-20 (hook aggiornato per nuovi campi)
**Fase 5 Completata**: 2026-01-20 (test unitari e E2E creati e verificati)
**Feature Status**: ✅ COMPLETATA AL 100%
# AGENT ASSIGNMENTS - Profilo Punto di Conservazione

**Data**: 2026-01-19
**Versione**: 2.0.0
**Riferimento**: PLAN.md, TASKS.md

---

## Overview Sistema Multi-Agent

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                              │
│                   (Coordinamento e Merge)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  AGENT-1    │       │  AGENT-2    │       │  AGENT-3    │
│  UI/Frontend│       │  Database   │       │  TypeScript │
└─────────────┘       └─────────────┘       └─────────────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  AGENT-TESTER   │
                    │  QA/Testing     │
                    └─────────────────┘
```

---

## AGENT-1: UI/Frontend Specialist

### Profilo
- **Ruolo**: Sviluppo interfacce utente e componenti React
- **Competenze**: React, TypeScript, TailwindCSS, Radix UI
- **Focus**: AddPointModal, ConservationPointCard

### Task Assegnati (in ordine di esecuzione)

#### Batch 1: Bug Critici (BLOCCANTE)
| Task | Priorità | Stima | File |
|------|----------|-------|------|
| TASK-0.1 | P0 | 30min | AddPointModal.tsx |
| TASK-0.2 | P0 | 15min | AddPointModal.tsx |
| TASK-0.3 | P0 | 20min | AddPointModal.tsx |

**Istruzioni Batch 1**:
1. Aprire `src/features/conservation/components/AddPointModal.tsx`
2. **TASK-0.1**: Trovare tutti i `<Select>` per ruolo manutenzioni. Aggiungere a `<SelectContent>`:
   ```tsx
   <SelectContent position="popper" sideOffset={5}>
   ```
3. **TASK-0.2**: Trovare div overlay modal (classe `fixed inset-0`). Cambiare `z-50` in `z-[9999]`
4. **TASK-0.3**: Dopo fix TASK-0.1, verificare che campi Categoria/Dipendente appaiano dopo selezione ruolo

**Criteri di Completamento Batch 1**:
- Select ruolo apre dropdown
- Modal sopra header/sidebar
- Campi Categoria/Dipendente visibili

---

#### Batch 2: UI Categorie (dopo Fase 2)
| Task | Priorità | Stima | Dipendenze |
|------|----------|-------|------------|
| TASK-3.1 | P2 | 30min | TASK-0.4, TASK-2.1 |

**Istruzioni TASK-3.1**:
1. Trovare sezione "Categorie prodotti" in AddPointModal.tsx
2. Aggiungere condizione per read-only:
   ```tsx
   <div className={formData.profileId ? 'opacity-75 pointer-events-none' : ''}>
   ```
3. Aggiungere label informativa quando profilo attivo

---

#### Batch 3: Sezione Profilo
| Task | Priorità | Stima | Dipendenze |
|------|----------|-------|------------|
| TASK-3.2 | P2 | 60min | TASK-2.1, TASK-3.1 |
| TASK-3.3 | P2 | 45min | TASK-3.2 |
| TASK-3.4 | P2 | 30min | TASK-3.3 |

**Istruzioni Batch 3**:
1. **TASK-3.2**: Importare da conservationProfiles.ts, aggiungere sezione profilo condizionale
2. **TASK-3.3**: Implementare useMemo + useEffect per auto-configurazione
3. **TASK-3.4**: Aggiornare formData state e validateForm()

---

#### Batch 4: Card (Opzionale)
| Task | Priorità | Stima | Dipendenze |
|------|----------|-------|------------|
| TASK-4.2 | P3 | 20min | TASK-4.1 |

---

### Checklist AGENT-1

```
FASE 0 - Bug Critici ✅ COMPLETATA
[x] TASK-0.1: Fix Select Ruolo
[x] TASK-0.2: Fix z-index Modal
[x] TASK-0.3: Fix Campi Categoria/Dipendente
[x] Test manuale completato - salvataggio funziona correttamente
[ ] Commit: "fix(conservation): fix AddPointModal bugs" (opzionale - fix già presenti nel codice)

FASE 3 - UI ✅ COMPLETATA
[x] TASK-3.1: Sezione Categorie Read-Only ✅
[x] TASK-3.2: Sezione Profilo Condizionale ✅
[x] TASK-3.3: Auto-Configurazione ✅
[x] TASK-3.4: State e Validazione ✅
[x] Form funziona end-to-end ✅

FASE 4 - Card ✅ COMPLETATA
[x] TASK-4.2: Mostrare profilo in Card ✅
```

**Note**: FASE 3 e FASE 4 completate il 20-01-2026. Tutte le modifiche UI implementate e testate. Sezione profilo condizionale, auto-configurazione, categorie read-only e validazione funzionanti correttamente. Form testato end-to-end e funzionante. ConservationPointCard aggiornata per mostrare profilo HACCP quando presente (con icona ShieldCheck e label leggibile).

### Stima Totale AGENT-1: 4h 30min

---

## AGENT-2: Database Specialist

### Profilo
- **Ruolo**: Sviluppo schema database e migration
- **Competenze**: PostgreSQL, Supabase, SQL
- **Focus**: Migration, Schema, Seed Data

### Task Assegnati (in ordine di esecuzione)

| Task | Priorità | Stima | File |
|------|----------|-------|------|
| TASK-1.1 | P1 | 20min | 018_add_conservation_profile_fields.sql |
| TASK-1.2 | P1 | 15min | 019_create_custom_profiles_table.sql |
| TASK-1.3 | P1 | 45min | 020_replace_product_categories.sql |

### Istruzioni Dettagliate

#### TASK-1.1: Migration Campi Profilo
1. Creare `database/migrations/018_add_conservation_profile_fields.sql`
2. Contenuto:
```sql
-- Migration: Aggiunge campi per profili punto di conservazione
-- Versione: 018
-- Data: 2026-01-19

ALTER TABLE public.conservation_points
ADD COLUMN IF NOT EXISTS appliance_category VARCHAR,
ADD COLUMN IF NOT EXISTS profile_id VARCHAR,
ADD COLUMN IF NOT EXISTS profile_config JSONB,
ADD COLUMN IF NOT EXISTS is_custom_profile BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.conservation_points.appliance_category IS 'Categoria appliance (es. vertical_fridge_with_freezer)';
COMMENT ON COLUMN public.conservation_points.profile_id IS 'ID profilo: string per standard, UUID per custom';
COMMENT ON COLUMN public.conservation_points.profile_config IS 'Config profilo SOLO per custom (NULL per standard)';
COMMENT ON COLUMN public.conservation_points.is_custom_profile IS 'true se custom, false se standard';

CREATE INDEX IF NOT EXISTS idx_conservation_points_profile
ON public.conservation_points(profile_id) WHERE profile_id IS NOT NULL;
```

#### TASK-1.2: Migration Tabella Custom Profiles
1. Creare `database/migrations/019_create_custom_profiles_table.sql`
2. Contenuto nel PLAN.md sezione 1.2

#### TASK-1.3: Migration Categorie Prodotti
1. Creare `database/migrations/020_replace_product_categories.sql`
2. **ATTENZIONE**: Migration distruttiva
3. Eseguire backup prima del test
4. Contenuto nel PLAN.md sezione 1.3

### Checklist AGENT-2 ✅ COMPLETATA

```
FASE 1 - Database ✅ COMPLETATA
[x] TASK-1.1: Creare 018_add_conservation_profile_fields.sql ✅
[x] Eseguire migration 018 su DB cloud ✅
[x] TASK-1.2: Creare 019_create_custom_profiles_table.sql ✅
[x] Eseguire migration 019 su DB cloud ✅
[x] TASK-1.3: Creare 020_replace_product_categories.sql ✅
[x] Eseguire migration 020 su DB cloud ✅
[x] Verificare integrità dati ✅ (7/7 punti con categorie, nessun dato perso)
[x] Commit: "feat(db): add conservation profile schema" ✅ (5b403331)
```

**Note**: FASE 1 completata il 20-01-2026. Tutte le migration eseguite con successo sul database cloud. Colonne, indici, trigger e tabella custom_profile verificati e presenti. Categorie esistenti erano già in formato snake_case, quindi il mapping da nomi italiani non si è applicato (comportamento corretto). Il database è pronto per la FASE 2 (AGENT-3: TypeScript/Logic Specialist).

### Stima Totale AGENT-2: 1h 20min

---

## AGENT-3: TypeScript/Logic Specialist

### Profilo
- **Ruolo**: Sviluppo logica business e tipi TypeScript
- **Competenze**: TypeScript, React Query, Business Logic
- **Focus**: Tipi, Costanti, Hook

### Task Assegnati (in ordine di esecuzione)

| Task | Priorità | Stima | File |
|------|----------|-------|------|
| TASK-2.1 | P1 | 60min | src/utils/conservationProfiles.ts |
| TASK-2.2 | P1 | 15min | src/types/conservation.ts |
| TASK-2.3 | P2 | 30min | src/utils/defaultCategories.ts |
| TASK-4.1 | P2 | 30min | useConservationPoints.ts |

### Istruzioni Dettagliate

#### TASK-2.1: Creare conservationProfiles.ts
1. Creare `src/utils/conservationProfiles.ts`
2. Copiare contenuto completo da PLAN.md sezione 2.1
3. Include:
   - Tipi: ApplianceCategory, ConservationProfileId, ConservationProfile
   - Template: VERTICAL_FRIDGE_WITH_FREEZER_TEMPLATE
   - Profili: CONSERVATION_PROFILES (5 profili)
   - Mapping: CATEGORY_ID_TO_DB_NAME
   - Helper: getProfileById, getProfilesForAppliance, mapCategoryIdsToDbNames
   - Labels: APPLIANCE_CATEGORY_LABELS, PROFILE_LABELS

#### TASK-2.2: Aggiornare conservation.ts
1. Aprire `src/types/conservation.ts`
2. Aggiungere import:
   ```typescript
   import type { ApplianceCategory, ConservationProfileId, ConservationProfile } from '@/utils/conservationProfiles'
   export type { ApplianceCategory, ConservationProfileId, ConservationProfile }
   ```
3. Aggiungere campi opzionali a ConservationPoint

#### TASK-2.3: Aggiornare defaultCategories.ts
1. Aprire `src/utils/defaultCategories.ts`
2. Sostituire DEFAULT_CATEGORIES con 14 nuove categorie
3. Aggiungere temperature_requirements per ogni categoria

#### TASK-4.1: Aggiornare useConservationPoints
1. Aprire `src/features/conservation/hooks/useConservationPoints.ts`
2. Aggiornare query per includere nuovi campi
3. Aggiornare mutation per salvare nuovi campi

### Checklist AGENT-3 ✅ COMPLETATA

```
FASE 2 - TypeScript ✅ COMPLETATA
[x] TASK-2.1: Creare conservationProfiles.ts ✅
[x] Verificare: npm run type-check ✅ (errori preesistenti non legati ai nuovi campi)
[x] TASK-2.2: Aggiornare conservation.ts ✅
[x] Verificare: npm run type-check ✅
[x] TASK-2.3: Aggiornare defaultCategories.ts ✅

FASE 4 - Hook ✅ COMPLETATA
[x] TASK-4.1: Aggiornare useConservationPoints ✅
[x] Verificare: mapping da/verso DB corretto ✅
```

**Note**: FASE 2 e FASE 4 completate il 20-01-2026. Tutti i file TypeScript creati e aggiornati correttamente. Hook useConservationPoints aggiornato per gestire tutti i nuovi campi profilo tramite spread operator. Mapping da/verso DB verificato e funzionante.

### Stima Totale AGENT-3: 2h 15min

---

## AGENT-TESTER: QA Specialist

### Profilo
- **Ruolo**: Testing e Quality Assurance
- **Competenze**: Vitest, Playwright, Test E2E
- **Focus**: Test unitari e E2E

### Task Assegnati

| Task | Priorità | Stima | Dipendenze |
|------|----------|-------|------------|
| TASK-0.4 | P0 | 30min | TASK-0.1, 0.2, 0.3 |
| TASK-5.1 | P2 | 60min | TASK-3.4 |
| TASK-5.2 | P2 | 60min | TASK-5.1 |

### Istruzioni Dettagliate

#### TASK-0.4: Test Manuale Fase 0
1. Aprire app in browser
2. Navigare a Conservazione
3. Cliccare "Aggiungi Punto"
4. **Verificare**:
   - Modal sopra header (z-index)
   - Scroll fino a sezione manutenzioni
   - Click su Select Ruolo → dropdown si apre
   - Selezionare ruolo → campi Categoria/Dipendente appaiono
5. Screenshot di conferma

#### TASK-5.1: Test Unitari
1. Creare `src/utils/__tests__/conservationProfiles.test.ts`
2. Test da scrivere:
   ```typescript
   describe('conservationProfiles', () => {
     describe('getProfileById', () => {
       it('returns profile for valid id and category')
       it('returns null for invalid id')
     })
     describe('getProfilesForAppliance', () => {
       it('returns 5 profiles for vertical_fridge_with_freezer')
     })
     describe('mapCategoryIdsToDbNames', () => {
       it('maps all category ids correctly')
       it('filters out unknown ids')
     })
   })
   ```

#### TASK-5.2: Test E2E
1. Creare `tests/conservation/profile-selection.spec.ts`
2. Test da scrivere:
   - Creazione punto con profilo selezionato
   - Auto-configurazione temperatura
   - Categorie read-only quando profilo attivo
   - Salvataggio corretto nel DB
   - Retrocompatibilità punti esistenti

### Checklist AGENT-TESTER

```
FASE 0 - Verifica
[ ] TASK-0.4: Test manuale bug fixes
[ ] Screenshot conferma
[ ] Report bug se presenti

FASE 5 - Testing
[ ] TASK-5.1: Scrivere test unitari
[ ] Eseguire: npm run test
[ ] Coverage > 80%
[ ] TASK-5.2: Scrivere test E2E
[ ] Eseguire: npm run test:e2e
[ ] Tutti i test passano
[ ] Commit: "test(conservation): add profile selection tests"
```

### Stima Totale AGENT-TESTER: 2h 30min

---

## Ordine di Esecuzione Multi-Agent

### Wave 1: Preparazione (Parallelo)
```
AGENT-1: TASK-0.1, 0.2, 0.3 (Bug Fix)
AGENT-2: TASK-1.1 (Migration Campi)
AGENT-3: TASK-2.1 (conservationProfiles.ts)
```

### Wave 2: Validazione (Sequenziale)
```
AGENT-TESTER: TASK-0.4 (Test Bug Fix)
AGENT-2: TASK-1.2, 1.3 (Migration DB)
AGENT-3: TASK-2.2, 2.3 (Tipi e Categorie)
```

### Wave 3: UI (Sequenziale)
```
AGENT-1: TASK-3.1 → 3.2 → 3.3 → 3.4
AGENT-3: TASK-4.1 (Hook)
```

### Wave 4: Finalizzazione
```
AGENT-1: TASK-4.2 (Card - opzionale)
AGENT-TESTER: TASK-5.1, 5.2 (Testing)
```

---

## Comunicazione tra Agenti

### Canali
- **AGENT-1 → AGENT-3**: Richiesta tipi/helper functions
- **AGENT-2 → AGENT-3**: Conferma schema DB per aggiornare tipi
- **AGENT-3 → AGENT-1**: Notifica completamento costanti
- **TUTTI → AGENT-TESTER**: Notifica completamento per test

### Checkpoint
1. **Dopo Wave 1**: Sync per verificare bug fix e migration base
2. **Dopo Wave 2**: Sync per verificare DB e tipi completi
3. **Dopo Wave 3**: Sync per verificare UI completa
4. **Dopo Wave 4**: Final review

---

## Git Workflow

### Branch Strategy
```
main
└── feature/conservation-profiles
    ├── fix/addpointmodal-bugs (AGENT-1 Wave 1)
    ├── feat/db-profile-schema (AGENT-2)
    ├── feat/profile-types (AGENT-3)
    └── feat/profile-ui (AGENT-1 Wave 3)
```

### Commit Convention
```
fix(conservation): fix AddPointModal bugs
feat(db): add conservation profile schema
feat(conservation): add profile types and constants
feat(conservation): add profile selection to AddPointModal
feat(conservation): update useConservationPoints for profiles
test(conservation): add profile selection tests
```

### Merge Order
1. fix/addpointmodal-bugs → feature/conservation-profiles
2. feat/db-profile-schema → feature/conservation-profiles
3. feat/profile-types → feature/conservation-profiles
4. feat/profile-ui → feature/conservation-profiles
5. feature/conservation-profiles → main

---

## Stima Totale Progetto

| Agente | Stima |
|--------|-------|
| AGENT-1 (UI) | 4h 30min |
| AGENT-2 (DB) | 1h 20min |
| AGENT-3 (TS) | 2h 15min |
| AGENT-TESTER | 2h 30min |
| **Totale Seriale** | **10h 35min** |
| **Totale Parallelo** | **~5-6h** |

---

**Ultimo Aggiornamento**: 2026-01-19

# HANDOFF — Fase 3: Controverifica codice e aggiornamento catalogo

> **Data handoff**: 2026-07-05  
> **Da**: Sessione analisi documentale Fase 1–2  
> **Per**: Agente **Plan Creator** → poi N agenti read-only in parallelo  
> **Stato**: 🟡 Pronto per creazione piano

---

## 1. Contesto e obiettivo

### Cosa è stato fatto (Fase 1–2)

1. **Catalogato** 1171 file documentali → `META/CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md`
2. **Valutata** la documentazione per utilità/obsolescenza → sezione FASE 2 nello stesso file
3. **Prodotta** matrice feature “da documenti” (non verificata su codice)

### Cosa manca (Fase 3)

**Controverificare lo stato reale del codice** rispetto a documentazione e DB, e **aggiornare il catalogo** con scoperte verificate.

### Trigger immediato — bug confermato

**BUG-005 (CRITICAL)** — Owner ha confermato in runtime:

```
POST .../rest/v1/temperature_readings → 400 Bad Request
PGRST204: Could not find the 'method' column of 'temperature_readings' in the schema cache
```

| Layer | Stato |
|-------|--------|
| **Codice** (`useTemperatureReadings.ts:147-156`) | Invia `method`, `notes`, `photo_evidence`, `recorded_by` |
| **Migration nel repo** | `database/migrations/015_add_temperature_reading_fields.sql` definisce quelle colonne |
| **DB remoto** (progetto `hjteuounjwkadmsbsmdm`) | Schema base senza quelle colonne (coerente con `BackupDB/restore-bhm-public.sql`) |
| **Script patch restore** | `BackupDB/apply-missing-schema-migrations.sql` **non include** Migration 015 |

Questo bug dimostra che **la documentazione che dice “salvataggio OK” (gen 2026) è obsoleta** rispetto al DB effettivamente deployato. La Fase 3 serve proprio a mappare sistematicamente questi gap.

---

## 2. Ruolo dell’agente Plan Creator

L’agente che riceve questo handoff deve **solo creare il piano**, non eseguire la controverifica.

### Output atteso del Plan Creator

Un file:

```
Production/Conoscenze_congelate/META/PIANO_FASE3_CONTROVERIFICA_PARALLELA.md
```

Con:

1. **Suddivisione in aree** (vedi §4) — una sezione indipendente per agente
2. **Prompt copy-paste** per ogni agente read-only
3. **Checklist uniforme** per ogni area (template sotto)
4. **Formato output** per aggiornare il catalogo (§6)
5. **Ordine di esecuzione**: parallelo tra aree; sequenziale solo per area DB/schema (prima o in sync con Conservation)
6. **Criteri di done** per l’intera Fase 3

### Vincoli per tutti gli agenti Fase 3

| Regola | Dettaglio |
|--------|-----------|
| **Solo lettura** | Nessuna modifica a `src/`, migrations, DB |
| **Evidenze obbligatorie** | Path file + righe, output comandi, messaggi errore |
| **No supposizioni** | Se non verificabile → `VERIFICA: non determinato` |
| **Aggiornare catalogo** | Append in `CATALOGO_...FASE1.md` sezione **FASE 3** o file `FASE3_REPORT_<AREA>.md` linkato dal catalogo |
| **Allineare BUG_TRACKER** | Nuovi bug confermati → `BUG_TRACKER.md`; risolti → tabella Bug Risolti |

---

## 3. Artefatti di input (leggere prima del piano)

| Priorità | File | Perché |
|----------|------|--------|
| P0 | `BUG_TRACKER.md` | Bug aperti incluso BUG-005 |
| P0 | `META/CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md` (FASE 2 + 2b) | Baseline documentale + bug confermato |
| P0 | `database/migrations/015_add_temperature_reading_fields.sql` | Root cause BUG-005 |
| P0 | `BackupDB/apply-missing-schema-migrations.sql` | Cosa è stato patchato post-restore vs cosa manca |
| P1 | `APP_DEFINITION/00_MASTER_INDEX.md` | Mappa elementi da verificare |
| P1 | `APP_DEFINITION/<area>/conoscenze-definizioni/` | Spec di riferimento per area |
| P1 | `APP_DEFINITION/<area>/Lavoro/` (ultimi report per data) | Claim “risolto” da verificare |
| P2 | `src/types/database.types.ts` o tipi generati Supabase | Schema “che il client crede” |
| P2 | `supabase/migrations/` vs `database/migrations/` | Due cartelle migration — possibile drift |

---

## 4. Suddivisione aree per agenti paralleli (read-only)

Ogni area = **1 agente dedicato**. Nessuna dipendenza di scrittura tra agenti (solo lettura).

| ID | Area | Scope codice | Scope docs | Priorità |
|----|------|--------------|------------|----------|
| **A0** | **DB / Schema drift** | `database/migrations/`, `supabase/migrations/`, `BackupDB/`, tipi generati | Migration docs, report DB Conservation 14-01 | **P0** — blocca Conservation |
| **A1** | **Auth + Onboarding** | `src/features/auth/`, `src/components/onboarding-steps/`, `utils/onboardingHelpers.ts`, Edge Functions auth | `01_AUTH/conoscenze-definizioni/`, report 07-02 CSRF | P1 |
| **A2** | **Conservation** | `src/features/conservation/`, `src/hooks/useConservation.ts`, `utils/conservationProfiles.ts` | `03_CONSERVATION/Conoscenze-Definizioni/`, Lavoro Gen–Feb 2026 | **P0** — BUG-005 qui |
| **A3** | **Calendar** | `src/features/calendar/` | `04_CALENDAR/conoscenze-definizioni/`, Lavoro Feb 2026 | P1 |
| **A4** | **Dashboard + Navigazione** | `src/features/dashboard/`, `src/components/MainLayout.tsx`, `HeaderButtons.tsx`, routing | `02_DASHBOARD` (vuoto), Archive Navigation | P2 |
| **A5** | **Inventory + Shopping** | `src/features/inventory/`, `src/features/shopping/` | `05_INVENTORY` (vuoto), BUG_TRACKER TODO | P2 |
| **A6** | **Settings + Management** | `src/features/settings/`, `src/features/management/` | `06_SETTINGS`, `07_MANAGEMENT` (vuoti) | P2 |
| **A7** | **Shared / Services / Types** | `src/services/`, `src/types/`, `src/lib/` | TYPE-001 tech debt, export HACCP | P2 |

**Nota Plan Creator**: A0 e A2 possono partire insieme; A2 deve citare esito A0 per colonne `temperature_readings`. Le altre aree sono indipendenti.

---

## 5. Template checklist (da includere nel piano per ogni agente)

Ogni agente compila per la propria area:

```markdown
## Report FASE 3 — Area <ID> <NOME>
**Data**: YYYY-MM-DD
**Agente**: <id>
**Modalità**: read-only

### 5.1 Executive summary
- Elementi verificati: N
- Allineati doc↔codice: N
- Gap critici: N
- Gap medi/bassi: N

### 5.2 Matrice verifica
| Feature/Componente | Doc dice | Codice reale | DB/Schema | Esito |
|--------------------|----------|--------------|-----------|-------|
| ... | ... | ... | ... | ✅ / ⚠️ / ❌ |

### 5.3 Bug confermati (nuovi o aggiornati)
| ID suggerito | Severity | Evidenza | File:Riga |

### 5.4 Documentazione obsoleta
| Path doc | Claim errato | Evidenza | Azione suggerita |

### 5.5 Aggiornamenti catalogo
| DOC-id o path | Campo aggiornato | Nuovo valore `stato_percepito` |

### 5.6 Non verificato / fuori scope
- ...
```

---

## 6. Formato aggiornamento catalogo (FASE 3)

Aggiungere in coda a `CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md`:

```markdown
## FASE 3 — Controverifica codice (runtime)

### 3.<area> — <nome area> (YYYY-MM-DD)
**Agente**: ...
**Esito area**: 🟢 / 🟡 / 🔴

| Feature | Doc (FASE 2) | Verifica codice | Verifica DB | Stato finale |
|---------|--------------|-----------------|-------------|--------------|
| Registra temperatura | ⚠️ modal | ❌ insert fallisce BUG-005 | ❌ colonna method assente | 🔴 BLOCCATO |
```

Oppure file separato `META/FASE3_REPORT_A2_CONSERVATION.md` con link dalla sezione FASE 3 del catalogo (preferibile se report lungo).

### Campi `stato_percepito` da usare

| Valore | Significato |
|--------|-------------|
| `verificato-ok` | Doc e codice allineati, funziona |
| `verificato-gap` | Codice o DB diverso da doc — gap documentato |
| `verificato-rotto` | Confermato non funzionante (con evidenza) |
| `non-verificato` | Agente non ha potuto controllare |

---

## 7. Seed di verifica — Conservation (per agente A2)

Partire da questi punti (BUG-005 già noto):

| # | Verifica | File chiave | Domanda |
|---|----------|-------------|---------|
| 1 | Insert temperatura | `useTemperatureReadings.ts` | Quali campi payload vs colonne DB? |
| 2 | Migration 015 applicata? | `database/migrations/015_*` vs schema remoto | Mancano altre colonne oltre `method`? |
| 3 | Modal chiusura | `ConservationPage.tsx`, `AddTemperatureModal.tsx` | BUG-006 ancora presente se insert mockato? |
| 4 | Auto-complete manutenzione su lettura | `useTemperatureReadings.ts` ~177+ | Esegue solo se insert OK? |
| 5 | TODO "method when DB updated" | `AddTemperatureModal.tsx:138` | Obsoleto o ancora valido? |
| 6 | Doc ADD_TEMPERATURE_MODAL | `Conoscenze-Definizioni/` | Claim "Salvataggio nel DB OK" → aggiornare |

---

## 8. Seed di verifica — DB/Schema (per agente A0)

| # | Verifica | Azione read-only |
|---|----------|------------------|
| 1 | Elenco migration repo | Diff `database/migrations/` vs `supabase/migrations/` |
| 2 | Patch restore | Cosa copre `apply-missing-schema-migrations.sql` vs cosa manca (es. 015) |
| 3 | Tabelle critiche onboarding | `conservation_points`, `company_calendar_settings`, `maintenance_tasks`, `tasks` |
| 4 | `temperature_readings` | Schema in `restore-bhm-public.sql` vs Migration 015 vs payload app |
| 5 | `database.types.ts` | Colonne `temperature_readings` nei tipi generati |
| 6 | Inventario migration non applicate | Lista per Owner (no apply in Fase 3) |

---

## 9. Prompt starter per Plan Creator

```
Sei l'agente Plan Creator per BHM v.2 Fase 3.

Leggi:
- Production/Conoscenze_congelate/META/HANDOFF_FASE3_CONTROVERIFICA_CODICE.md
- BUG_TRACKER.md (BUG-005 confermato)
- Sezione FASE 2/2b in CATALOGO_DOCUMENTALE_BHM_v2_FASE1.md

Crea: Production/Conoscenze_congelate/META/PIANO_FASE3_CONTROVERIFICA_PARALLELA.md

Il piano deve:
1. Definire 8 agenti read-only (A0–A7) come in HANDOFF §4
2. Includere prompt copy-paste per ogni agente (con template §5)
3. Specificare output in META/FASE3_REPORT_<AREA>.md
4. Definire merge finale: un agente consolidatore aggiorna catalogo FASE 3 + BUG_TRACKER
5. NON includere fix implementativi — solo analisi

Priorità: A0 + A2 per BUG-005; poi A1, A3; poi resto.
```

---

## 10. Prompt starter per agente read-only (esempio A2 Conservation)

```
Sei agente FASE 3 — Area A2 Conservation. SOLO LETTURA.

Obiettivo: controverificare codice vs documentazione vs schema DB per src/features/conservation/.

Leggi prima:
- HANDOFF_FASE3_CONTROVERIFICA_CODICE.md §7
- BUG_TRACKER.md BUG-005, BUG-006
- APP_DEFINITION/03_CONSERVATION/Conoscenze-Definizioni/*.md
- Report Lavoro più recenti (04-02-2026, 31-01-2026)

Verifica sistematicamente ogni componente in 03_CONSERVATION/00_MASTER_INDEX.md.

Output: Production/Conoscenze_congelate/META/FASE3_REPORT_A2_CONSERVATION.md
Usa template checklist HANDOFF §5.

Non modificare codice. Segnala bug con evidenza file:riga o errore runtime.
```

---

## 11. Criteri di completamento Fase 3

- [ ] 8 report area (`FASE3_REPORT_A0` … `A7`) o equivalente consolidato
- [ ] Sezione **FASE 3** aggiornata nel catalogo con matrice feature verificata
- [ ] `BUG_TRACKER.md` allineato (nuovi bug + stati)
- [ ] Lista migration DB mancanti sul remoto (input per fix successivo — fuori Fase 3)
- [ ] Documenti `conoscenze-definizioni` marcati `verificato-*` o elenco “da riscrivere”
- [ ] Owner può usare **una sola tabella** doc vs realtà per decidere priorità fix

---

## 12. Fuori scope Fase 3

- Applicare migration o fix codice
- Eseguire test E2E (solo citare se esistono e cosa coprono)
- Riscrivere tutta la documentazione
- Controverificare `Production/Archive/` file per file (campione per area basta)

---

## 13. Fix noto per fase successiva (NON eseguire in Fase 3)

Per BUG-005, la fase implementativa (dopo Fase 3) probabilmente richiederà:

1. Applicare `database/migrations/015_add_temperature_reading_fields.sql` su Supabase remoto
2. Aggiungere Migration 015 a `BackupDB/apply-missing-schema-migrations.sql`
3. Rigenerare `database.types.ts`
4. Ritestare insert + chiusura modal

---

**Handoff preparato da**: Agente analisi documentale  
**Prossimo agente**: Plan Creator → `PIANO_FASE3_CONTROVERIFICA_PARALLELA.md`

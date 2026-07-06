# Indice stato Fase 3 — APP_DEFINITION

> **Data marcatura**: 2026-07-06 · **Metodo**: banner in testa ai doc (non riscritti) · **Fonte verità**: report Fase 3 A0–A7 + [`DECISIONI_OWNER_BETA`](../META/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md)
>
> **Regola**: `codice + DB live > Fase 3 > APP_DEFINITION` — questi doc descrivono **intento UX**, non stato implementazione.

## Legenda

| Stato | Significato |
|-------|-------------|
| `verificato-ok` | Allineato a codice/DB (Fase 3) |
| `verificato-gap` | Parziale, incompleto o doc interna contraddittoria |
| `verificato-rotto` | Claim falso o flusso bloccato |

---

## 01_AUTH

| File | Stato | Motivo breve |
|------|-------|--------------|
| `conoscenze-definizioni/LOGIN_FLOW.md` | `verificato-gap` | Remember Me non collegato; STATO ATTUALE obsoleto |
| `conoscenze-definizioni/ONBOARDING_FLOW.md` | `verificato-gap` | Licenza in UI assente su DB; acceptance aperti |
| `conoscenze-definizioni/BLINDATURA_PLAN.md` | `verificato-gap` | Piano ott 2025, non stato attuale |
| `conoscenze-definizioni/ONBOARDING_TO_MAIN_MAPPING.md` | `verificato-gap` | «Completato» — parziale |

---

## 03_CONSERVATION

| File | Stato | Motivo breve |
|------|-------|--------------|
| `Conoscenze-Definizioni/ADD_TEMPERATURE_MODAL.md` | `verificato-rotto` | BUG-005: insert fallisce, migration 015 non live |
| `Conoscenze-Definizioni/TEMPERATURE_READINGS_SECTION.md` | `verificato-rotto` | Stesso claim campi migration 015 |
| `Conoscenze-Definizioni/CONSERVATION_PAGE.md` | `verificato-gap` | Auto-complete OK ma bloccato da BUG-005 |
| `Conoscenze-Definizioni/ADD_POINT_MODAL.md` | `verificato-ok` | Profili HACCP allineati |
| `Conoscenze-Definizioni/CONSERVATION_POINT_CARD.md` | `verificato-ok` | Check-up card verificato |
| `Conoscenze-Definizioni/SCHEDULED_MAINTENANCE_SECTION.md` | `verificato-ok` | Trigger/manutenzioni live |
| `SCHEDULED_MAINTENANCE_SECTION.md` (root) | `verificato-ok` | Copia legacy v1.1 — vedere Conoscenze-Definizioni |
| `00_MASTER_INDEX.md` | `verificato-rotto` | Claim «Migration 015 APPLICATA» falso |
| `Lavoro/.../DB_VERIFICATION_RESULT.md` | `verificato-rotto` | «10 campi presenti» falso su DB live |

---

## 04_CALENDAR

| File | Stato | Motivo breve |
|------|-------|--------------|
| `00_MASTER_INDEX.md` | `verificato-gap` | Weekend «parzialmente» vs report «risolto» |
| `conoscenze-definizioni/00_MASTER_INDEX_CALENDAR.md` | `verificato-gap` | PRODUCTION-READY eccessivo; editing stub |
| `conoscenze-definizioni/CALENDAR_PAGE.md` | `verificato-gap` | Metriche righe obsolete |
| `conoscenze-definizioni/GENERIC_TASK_FORM.md` | `verificato-gap` | Link rotto; recurrence_config vs frequency |
| `conoscenze-definizioni/FILTERS_AND_PERMISSIONS.md` | `verificato-ok` | OK; nota filtri stato in MacroCategoryModal |
| `conoscenze-definizioni/EVENT_AGGREGATION.md` | `verificato-ok` | 6 fonti aggregate implementate |
| `conoscenze-definizioni/MACRO_CATEGORY_SYSTEM.md` | `verificato-ok` | Macro-categorie + modal OK |

---

## Meta / indici

| File | Stato | Motivo breve |
|------|-------|--------------|
| `00_MASTER_INDEX.md` (root) | `verificato-gap` | ~8/150 doc; cartelle 02/05/06/07 assenti |
| `README.md` | `verificato-gap` | Struttura ideale vs filesystem reale |

---

## Aree senza `conoscenze-definizioni` (buco doc)

| Area prevista | Cartella esiste? | Report Fase 3 |
|---------------|------------------|---------------|
| Dashboard | ❌ | A4 — `verificato-gap` |
| Inventory / Scorte | ❌ | A5 — CRUD OK, gap DB/UI |
| Settings | ❌ | A6 — 3/4 sezioni rotte vs schema |
| Management | ❌ | A6 — staff CRUD stub |

---

## Report di riferimento

- [`FASE3_REPORT_A0_DB_SCHEMA.md`](../META/FASE3_REPORT_A0_DB_SCHEMA.md)
- [`FASE3_REPORT_A1_AUTH.md`](../META/FASE3_REPORT_A1_AUTH.md)
- [`FASE3_REPORT_A2_CONSERVATION.md`](../META/FASE3_REPORT_A2_CONSERVATION.md)
- [`FASE3_REPORT_A3_CALENDAR.md`](../META/FASE3_REPORT_A3_CALENDAR.md)
- [`FASE3_REPORT_A4_DASHBOARD.md`](../META/FASE3_REPORT_A4_DASHBOARD.md)
- [`FASE3_REPORT_A5_INVENTORY.md`](../META/FASE3_REPORT_A5_INVENTORY.md)
- [`FASE3_REPORT_A6_SETTINGS.md`](../META/FASE3_REPORT_A6_SETTINGS.md)
- [`FASE3_REPORT_A7_SHARED_TYPES.md`](../META/FASE3_REPORT_A7_SHARED_TYPES.md)
- [`BUG_TRACKER.md`](../../../BUG_TRACKER.md)

**Ultimo aggiornamento**: 2026-07-06 · Marcatura fase separata post-mappatura (masterplan §8)

# Report: Filtri Per Reparto Visibili Solo ad Admin

**Data**: 05-02-2026  
**Sessione**: Restrizione visibilità filtri calendario per ruolo  
**Componente**: NewCalendarFilters

---

## Obiettivo

Rendere la sezione **"Per Reparto"** dei filtri calendario visibile e utilizzabile **solo da utenti con ruolo admin**. Gli utenti dipendenti, responsabili e collaboratori non devono vedere né modificare il filtro reparto.

---

## Motivazione

Il filtro per reparto permette di filtrare gli eventi del calendario per dipartimento/reparto aziendale. Per motivi organizzativi e di privacy, questa capacità di filtraggio cross-reparto è riservata agli amministratori.

---

## Modifiche Implementate

### 1. File: `src/features/calendar/components/NewCalendarFilters.tsx`

#### Import aggiunti
- `useEffect` da React
- `useAuth` da `@/hooks/useAuth`

#### Hook e stato
```typescript
const { hasRole } = useAuth()
const isAdmin = hasRole('admin')
```

#### useEffect per azzeramento filtro
Se l’utente non è admin e sono presenti reparti selezionati, il filtro viene azzerato:

```typescript
useEffect(() => {
  if (!isAdmin && filters.departments.length > 0) {
    onFiltersChange({ ...filters, departments: [] })
  }
}, [isAdmin, filters.departments.length])
```

#### Rendering condizionale
L’intera sezione "Per Reparto" è wrappata in:

```tsx
{isAdmin && (
  <div>
    {/* ... contenuto sezione reparto ... */}
  </div>
)}
```

#### Conteggio filtri attivi
Il conteggio dei filtri attivi non considera più `departments` per i non-admin:

```typescript
const activeFiltersCount = useMemo(() => {
  const deptCount = isAdmin ? filters.departments.length : 0
  return deptCount + filters.types.length
}, [filters, isAdmin])
```

---

## Comportamento

| Utente     | Sezione "Per Reparto" | Filtro reparto applicato |
|-----------|------------------------|---------------------------|
| Admin     | Visibile               | Sì                        |
| Responsabile | Nascosta            | No (departments = [])     |
| Dipendente   | Nascosta            | No (departments = [])     |
| Collaboratore | Nascosta           | No (departments = [])     |
| Guest     | Nascosta               | No (departments = [])     |

Per non-admin:
1. La sezione non viene renderizzata.
2. Se `filters.departments` era popolato (es. cambio ruolo da admin), viene azzerato tramite `useEffect`.

---

## Verifica

- **Build**: `npm run build` eseguito con successo
- **Browser**: Pagina Attività/Calendario caricata; con utente non-admin la sezione "Per Reparto" non compare; "Per Tipo" resta visibile
- **Test**: Test calendario eseguiti (nessuna regressione legata a questa modifica)

---

## Documentazione Aggiornata

| File | Modifiche |
|------|-----------|
| `conoscenze-definizioni/00_MASTER_INDEX_CALENDAR.md` | Layer 2 aggiornato: Reparto (solo admin); nuova voce in LAVORO SVOLTO |
| `conoscenze-definizioni/FILTERS_AND_PERMISSIONS.md` | Sezione Filtro Reparto: visibilità admin-only; nuovi acceptance criteria; versione 1.1.0 |

---

## Riferimenti

- **Hook auth**: `src/hooks/useAuth.ts` — `hasRole('admin')`
- **Tipi ruoli**: `UserRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore' | 'guest'`
- **Types filtri**: `src/types/calendar-filters.ts` — `CalendarFilters.departments`

---

**Autore**: Agente AI  
**Ultimo aggiornamento**: 2026-02-05

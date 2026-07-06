# ERRORE: Export AddPointModal Non Trovato
## Data: 2026-01-15
## Severità: CRITICA - Blocca l'applicazione

---

## 🔴 ERRORE COMPLETO

```
Uncaught SyntaxError: The requested module '/src/features/conservation/components/AddPointModal.tsx?t=1768512394230' 
does not provide an export named 'AddPointModal' (at ConservationPage.tsx:15:10)
```

---

## 📋 MAPPA ERRORE

### 1. **Posizione Errore**
- **File che causa errore**: `src/features/conservation/components/AddPointModal.tsx`
- **File che importa**: `src/features/conservation/ConservationPage.tsx` (riga 15)
- **Tipo errore**: SyntaxError - Errore di parsing/sintassi che impedisce l'export del modulo

### 2. **Stack Trace**
```
ConservationPage.tsx:15:10
  → import { AddPointModal } from './components/AddPointModal'
  → Vite cerca di caricare il modulo
  → Modulo non può essere parsato/exportato
  → Errore: "does not provide an export named 'AddPointModal'"
```

### 3. **Component Tree Affetto**
```
App
└── Router
    └── ProtectedRoute
        └── ConservationPage ❌ (non può caricare AddPointModal)
            └── AddPointModal ❌ (non può essere importato)
```

---

## 🔍 ANALISI CAUSE POSSIBILI

### ❌ CAUSA 1: Errore di Sintassi nel File (PIÙ PROBABILE)
**Problema**: Un errore di sintassi JavaScript/TypeScript impedisce al parser di raggiungere l'export.

**Verifica effettuata**:
- ✅ Parentesi graffe bilanciate: 322 aperte = 322 chiuse
- ✅ Export presente: `export function AddPointModal` alla riga 494
- ⚠️ **Possibile problema**: Modifiche recenti potrebbero aver introdotto errore

**Modifiche recenti sospette**:
- Riga 253-264: Modifica `onChange` handler per TASK M2
- Uso di `defaultDailyWeekdays` che potrebbe non essere in scope corretto

### ❌ CAUSA 2: Import Circular (POSSIBILE)
**Problema**: Dipendenza circolare tra moduli.

**Verifica**: Da fare - controllare se `AddPointModal` importa qualcosa che importa `ConservationPage`.

### ❌ CAUSA 3: Errore Runtime Durante Import (POSSIBILE)
**Problema**: Un errore viene lanciato durante l'esecuzione del modulo (es. hook chiamato fuori da componente).

**Verifica**: Da fare - controllare che tutti gli hook siano dentro componenti React.

### ❌ CAUSA 4: Problema Vite Cache (POSSIBILE)
**Problema**: Cache di Vite corrotta che causa problemi di parsing.

**Soluzione**: `npm run dev -- --force` o eliminare `node_modules/.vite`

---

## 🔧 DIAGNOSI DETTAGLIATA

### Verifica 1: Export Presente ✅
```typescript
// AddPointModal.tsx riga 494
export function AddPointModal({ ... }: AddPointModalProps) {
  // ...
}
```
**Stato**: ✅ Export presente e corretto

### Verifica 2: Import Corretto ✅
```typescript
// ConservationPage.tsx riga 15
import { AddPointModal } from './components/AddPointModal'
```
**Stato**: ✅ Import corretto (named import corrisponde a named export)

### Verifica 3: Sintassi File ✅
```bash
# Verifica parentesi bilanciate
Open braces: 322
Close braces: 322
Match: true
```
**Stato**: ✅ Parentesi bilanciate

### Verifica 4: Type Check ❌
```bash
# Errori TypeScript trovati in altri file, ma nessuno specifico per AddPointModal
# che impedisce l'export
```
**Stato**: ⚠️ Nessun errore TypeScript specifico per AddPointModal

---

## 🎯 POSSIBILE CAUSA SPECIFICA

### Modifiche TASK M2 (Riga 253-264)

**Codice modificato**:
```typescript
onChange={e => {
  const newFrequency = e.target.value as MaintenanceFrequency
  if (newFrequency === 'giornaliera') {
    onUpdate(index, {
      ...task,
      frequenza: newFrequency,
      giorniSettimana: defaultDailyWeekdays, // ⚠️ POSSIBILE PROBLEMA
    })
  } else {
    updateTask('frequenza', newFrequency)
  }
}}
```

**Possibile problema**:
- `defaultDailyWeekdays` è definito come `useMemo` alla riga 203
- È nel scope del componente `MaintenanceTaskForm`
- Dovrebbe essere accessibile, MA...
- ⚠️ **Se c'è un errore nel calcolo di `defaultDailyWeekdays`**, potrebbe causare errore runtime durante l'import

**Verifica necessaria**: Controllare se `defaultDailyWeekdays` viene calcolato correttamente e se `availableWeekdays` è sempre definito.

---

## 🔧 SOLUZIONI PROPOSTE

### SOLUZIONE 1: Verifica e Fix Modifiche TASK M2 (IMMEDIATA)

**Passi**:
1. Verificare che `defaultDailyWeekdays` sia sempre definito
2. Aggiungere fallback se `availableWeekdays` è undefined
3. Verificare che `useCalendarSettings` non causi errore durante import

**Codice da verificare**:
```typescript
// Riga 203-205
const defaultDailyWeekdays = useMemo(() => {
  return availableWeekdays  // ⚠️ Se availableWeekdays è undefined, questo fallisce
}, [availableWeekdays])
```

**Fix proposto**:
```typescript
const defaultDailyWeekdays = useMemo(() => {
  return availableWeekdays || ALL_WEEKDAYS  // Fallback sicuro
}, [availableWeekdays])
```

### SOLUZIONE 2: Clear Vite Cache (RAPIDA)

```bash
# Elimina cache Vite
rm -rf node_modules/.vite
# Oppure su Windows PowerShell
Remove-Item -Recurse -Force node_modules/.vite

# Riavvia dev server
npm run dev
```

### SOLUZIONE 3: Verifica Errori Console Completi

1. Aprire DevTools Console
2. Cercare errori PRIMA di "does not provide an export"
3. Potrebbero esserci errori durante l'import che causano questo problema

### SOLUZIONE 4: Rollback Modifiche TASK M2 (TEMPORANEO)

Se le altre soluzioni non funzionano:
1. Ripristinare il codice dell'`onChange` prima delle modifiche TASK M2
2. Testare se l'errore scompare
3. Se sì, reimplementare TASK M2 con maggiore attenzione

---

## 📝 CHECKLIST DEBUG

- [ ] Verificare console browser per errori PRIMA dell'errore export
- [ ] Verificare che `useCalendarSettings` non causi errori
- [ ] Verificare che `defaultDailyWeekdays` abbia fallback
- [ ] Clear cache Vite
- [ ] Verificare import circolari
- [ ] Testare file isolato (import solo AddPointModal in file di test)
- [ ] Verificare che tutti gli hook siano dentro componenti

---

## 🚨 PRIORITÀ

**URGENTE**: Questo errore blocca completamente l'applicazione. La pagina Conservation non può essere caricata.

**Prossimi passi**:
1. ✅ Verificare console browser per errori nascosti
2. ✅ Aggiungere fallback a `defaultDailyWeekdays`
3. ✅ Clear cache Vite
4. ✅ Se persiste, rollback temporaneo modifiche TASK M2

---

**Documento creato**: 2026-01-15  
**Stato**: Da risolvere immediatamente

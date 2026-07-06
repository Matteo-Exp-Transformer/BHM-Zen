# 📋 TEMPLATE STANDARD - DOCUMENTAZIONE ELEMENTO APP

> **Usa questo template per documentare ogni elemento dell'applicazione**

---

# [NOME_ELEMENTO] - DOCUMENTAZIONE COMPLETA

**Data Creazione**: YYYY-MM-DD  
**Ultima Modifica**: YYYY-MM-DD  
**Versione**: 1.0.0  
**File Componente**: `src/path/to/Component.tsx`  
**Tipo**: [Pagina | Componente | Form | Modale | Pulsante | Layout | Altro]

---

## 🎯 SCOPO

### Scopo Business
**Descrivi PERCHÉ questo elemento esiste nell'app. Quale problema risolve? Quale bisogno soddisfa?**

Esempio:
- Permette agli utenti di...
- Risolve il problema di...
- Soddisfa il bisogno di...

### Scopo Tecnico
**Descrivi COSA fa tecnicamente questo elemento.**

Esempio:
- Gestisce l'autenticazione utente
- Visualizza dati in formato tabella
- Valida input form

---

## 📝 UTILIZZO

### Quando Viene Utilizzato
**Descrivi QUANDO e DOVE questo elemento viene mostrato/utilizzato.**

- In quale pagina/contesto appare?
- Quali condizioni devono essere soddisfatte?
- Quali ruoli utente possono accedervi?

### Casi d'Uso Principali
**Lista i principali casi d'uso con esempi concreti.**

1. **Caso d'uso 1**: Descrizione + esempio
2. **Caso d'uso 2**: Descrizione + esempio
3. **Caso d'uso 3**: Descrizione + esempio

### Flusso Utente
**Descrivi il flusso passo-passo di come l'utente interagisce con questo elemento.**

1. Utente fa X
2. Elemento risponde con Y
3. Utente può fare Z
4. Risultato finale: ...

---

## ⚠️ CONFLITTI E GESTIONE

### Conflitti Possibili
**Descrivi tutti i possibili conflitti che questo elemento può generare o risolvere.**

#### Conflitto 1: [Nome Conflitto]
- **Quando si verifica**: Descrizione scenario
- **Cosa succede**: Comportamento attuale
- **Come viene gestito**: Soluzione implementata
- **Esempio**: Scenario concreto

#### Conflitto 2: [Nome Conflitto]
- **Quando si verifica**: Descrizione scenario
- **Cosa succede**: Comportamento attuale
- **Come viene gestito**: Soluzione implementata
- **Esempio**: Scenario concreto

### Conflitti Multi-Utente
**Se applicabile, descrivi come vengono gestiti i conflitti quando più utenti interagiscono simultaneamente.**

- Cosa succede se due utenti modificano lo stesso elemento?
- Come viene risolto il conflitto?
- Quale utente ha priorità?

### Conflitti di Sincronizzazione
**Se applicabile, descrivi conflitti di sincronizzazione offline/online.**

- Cosa succede se l'utente è offline?
- Come vengono risolti i conflitti al ripristino della connessione?
- Quale versione viene mantenuta?

---

## 🔧 MODO IN CUI VIENE GENERATO

### Generazione Automatica
**Se l'elemento viene generato automaticamente, descrivi COME e QUANDO.**

- Viene generato da quale processo?
- Quali trigger lo attivano?
- Quali dati vengono utilizzati per la generazione?

### Generazione Manuale
**Se l'utente crea questo elemento, descrivi il processo.**

- Quale azione dell'utente lo crea?
- Quali dati sono necessari?
- Quali validazioni vengono eseguite?

### Condizioni di Generazione
**Descrivi tutte le condizioni che devono essere soddisfatte.**

- Condizione 1: ...
- Condizione 2: ...
- Condizione 3: ...

---

## 💻 SCRITTURA DEL CODICE

### Struttura Componente
**Descrivi la struttura del componente e come deve essere scritto.**

```typescript
// Esempio struttura
interface ComponentProps {
  // Props necessarie
}

const Component: React.FC<ComponentProps> = ({ ... }) => {
  // State management
  // Hooks utilizzati
  // Funzioni principali
  // Render
}
```

### Props Richieste
**Lista tutte le props con descrizione.**

| Prop | Tipo | Obbligatoria | Default | Descrizione |
|------|------|--------------|---------|-------------|
| `prop1` | `string` | ✅ | - | Descrizione |
| `prop2` | `number` | ❌ | `0` | Descrizione |

### State Management
**Descrivi come viene gestito lo stato.**

- Quali state vengono utilizzati?
- Quali hook vengono usati?
- Come viene sincronizzato con il database?

### Hooks Utilizzati
**Lista tutti gli hook custom utilizzati.**

- `useHook1`: Scopo
- `useHook2`: Scopo

### Funzioni Principali
**Descrivi le funzioni principali del componente.**

#### `handleFunction1()`
- **Scopo**: Cosa fa
- **Parametri**: Cosa riceve
- **Ritorna**: Cosa ritorna
- **Logica**: Come funziona

#### `handleFunction2()`
- **Scopo**: Cosa fa
- **Parametri**: Cosa riceve
- **Ritorna**: Cosa ritorna
- **Logica**: Come funziona

### Validazioni
**Descrivi tutte le validazioni implementate.**

- Validazione 1: Cosa valida, quando, messaggio errore
- Validazione 2: Cosa valida, quando, messaggio errore

### Gestione Errori
**Descrivi come vengono gestiti gli errori.**

- Cosa succede in caso di errore?
- Come viene mostrato all'utente?
- Come viene loggato?

---

## 🎨 LAYOUT

### Struttura Layout
**Descrivi la struttura visiva dell'elemento.**

```
┌─────────────────────────────────┐
│ Header / Titolo                  │
├─────────────────────────────────┤
│ Contenuto Principale             │
│ ┌──────────┐  ┌──────────┐      │
│ │ Sezione1 │  │ Sezione2 │      │
│ └──────────┘  └──────────┘      │
├─────────────────────────────────┤
│ Footer / Azioni                  │
└─────────────────────────────────┘
```

### Responsive Design
**Descrivi come si adatta a diverse dimensioni schermo.**

- **Mobile** (< 640px): Come appare
- **Tablet** (640px - 1024px): Come appare
- **Desktop** (> 1024px): Come appare

### Styling
**Descrivi le classi CSS/Tailwind utilizzate.**

- Colori principali
- Spaziature
- Tipografia
- Effetti hover/focus

### Accessibilità
**Descrivi le caratteristiche di accessibilità.**

- ARIA labels utilizzati
- Keyboard navigation
- Screen reader support
- Contrasto colori

---

## ⚙️ FUNZIONAMENTO

### Flusso di Funzionamento
**Descrivi passo-passo come funziona l'elemento.**

1. **Inizializzazione**: Cosa succede al mount
2. **Interazione Utente**: Cosa succede quando l'utente interagisce
3. **Elaborazione**: Come vengono processati i dati
4. **Aggiornamento**: Come viene aggiornato lo stato/UI
5. **Finalizzazione**: Cosa succede al completamento

### Integrazione Database
**Descrivi come interagisce con il database.**

- Quali tabelle vengono utilizzate?
- Quali operazioni CRUD vengono eseguite?
- Come vengono gestite le transazioni?

### Integrazione Servizi
**Descrivi come interagisce con servizi esterni.**

- Quali API vengono chiamate?
- Quali servizi vengono utilizzati?
- Come vengono gestite le risposte?

### Real-time Updates
**Se applicabile, descrivi come vengono gestiti gli aggiornamenti real-time.**

- Quali eventi vengono ascoltati?
- Come vengono propagati gli aggiornamenti?
- Come viene gestita la sincronizzazione?

---

## 🔗 INTERAZIONI

### Componenti Collegati
**Lista tutti i componenti che interagiscono con questo elemento.**

- `Component1`: Tipo di interazione
- `Component2`: Tipo di interazione

### Dipendenze
**Lista tutte le dipendenze (componenti, hook, servizi, ecc.).**

- Dipendenza 1: Scopo
- Dipendenza 2: Scopo

### Eventi Emessi
**Se applicabile, lista gli eventi che questo elemento emette.**

- `event1`: Quando viene emesso, payload
- `event2`: Quando viene emesso, payload

### Eventi Ascoltati
**Se applicabile, lista gli eventi che questo elemento ascolta.**

- `event1`: Cosa fa quando riceve l'evento
- `event2`: Cosa fa quando riceve l'evento

---

## 📊 DATI

### Struttura Dati Input
**Descrivi i dati in input.**

```typescript
interface InputData {
  field1: string
  field2: number
  // ...
}
```

### Struttura Dati Output
**Descrivi i dati in output.**

```typescript
interface OutputData {
  result1: string
  result2: number
  // ...
}
```

### Mapping Database
**Descrivi come i dati vengono mappati al database.**

- Campo form → Campo database
- Trasformazioni applicate
- Validazioni database

---

## ✅ ACCEPTANCE CRITERIA

**Lista i criteri di accettazione per questo elemento.**

- [ ] Criterio 1: Descrizione
- [ ] Criterio 2: Descrizione
- [ ] Criterio 3: Descrizione

---

## 🧪 TESTING

### Test da Eseguire
**Lista i test che devono essere eseguiti.**

1. Test 1: Cosa testa
2. Test 2: Cosa testa
3. Test 3: Cosa testa

### Scenari di Test
**Descrivi scenari specifici da testare.**

- Scenario 1: Input → Output atteso
- Scenario 2: Input → Output atteso

---

## 📚 RIFERIMENTI

### File Correlati
- **Componente**: `src/path/to/Component.tsx`
- **Hook**: `src/hooks/useHook.ts`
- **Servizio**: `src/services/service.ts`
- **Tipo**: `src/types/type.ts`

### Documentazione Correlata
- Link a documentazione correlata
- Link a pattern utilizzati

---

## 📝 NOTE SVILUPPO

### Performance
**Note su performance e ottimizzazioni.**

- Ottimizzazioni implementate
- Considerazioni performance

### Sicurezza
**Note su sicurezza.**

- Validazioni sicurezza
- Sanitizzazione input
- Autorizzazioni

### Limitazioni
**Note su limitazioni conosciute.**

- Limitazione 1: Descrizione
- Limitazione 2: Descrizione

### Future Miglioramenti
**Note su possibili miglioramenti futuri.**

- Miglioramento 1: Descrizione
- Miglioramento 2: Descrizione

---

**Ultimo Aggiornamento**: YYYY-MM-DD  
**Versione**: 1.0.0

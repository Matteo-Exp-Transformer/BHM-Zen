# PULSANTI SVILUPPO - MAPPATURA COMPLETA

**Data**: 2025-10-22 01:38
**Componente**: Development Buttons
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## STATO ATTUALE
- ✅ **HeaderButtons**: Pulsanti sviluppo nel header principale
- ✅ **DevButtons**: Pulsanti sviluppo nell'onboarding
- ✅ **Controllo ambiente**: `showDevButtons={import.meta.env.DEV}`
- ✅ **Funzionalità**: Debug, reset, precompila, sync

## COMPORTAMENTO DESIDERATO

### **PULSANTI DA RIMUOVERE IN PRODUCTION**

#### **HEADER BUTTONS (Main App)**
- **Debug Auth**: Debug stato autenticazione
- **Sync Host**: Sincronizzazione multi-porta
- **Reset Tot+Utenti**: Reset completo dati
- **Cancella Dati**: Reset dati operativi
- **Riapri Onboarding**: Riapertura onboarding

#### **DEV BUTTONS (Onboarding)**
- **Precompila**: Precompila onboarding con dati test
- **Completa Onboarding**: Completa onboarding automaticamente

### **PULSANTI DA MANTENERE**
- **Alert Badge**: Notifiche attività (sempre visibile)
- **Attività**: Link al calendario (sempre visibile)

---

## SPECIFICA TECNICA

### **HeaderButtons.tsx**
```typescript
interface HeaderButtonsProps {
  onOpenOnboarding: () => void
  showDevButtons?: boolean // Controlla visibilità pulsanti dev
}

// Pulsanti DEV (da rimuovere in production)
{showDevButtons && (
  <>
    <button onClick={() => debugAuthState()}>Debug Auth</button>
    <button onClick={manualSyncWithOtherPorts}>Sync Host</button>
    <button onClick={() => resetTotAndUsers()}>Reset Tot+Utenti</button>
  </>
)}
```

### **DevButtons.tsx**
```typescript
interface DevButtonsProps {
  onPrefillOnboarding: () => void
  onCompleteOnboarding: () => void
  isDevMode?: boolean // Controlla visibilità pulsanti dev
}

// Pulsanti DEV (da rimuovere in production)
<button onClick={onPrefillOnboarding}>Precompila</button>
<button onClick={onCompleteOnboarding}>Completa Onboarding</button>
```

### **Controllo Ambiente**
```typescript
// MainLayout.tsx
<HeaderButtons
  onOpenOnboarding={handleOpenOnboarding}
  showDevButtons={import.meta.env.DEV} // Solo in sviluppo
/>

// OnboardingWizard.tsx
<DevButtons
  onPrefillOnboarding={handlePrefillOnboarding}
  onCompleteOnboarding={handleCompleteOnboarding}
  isDevMode={import.meta.env.DEV} // Solo in sviluppo
/>
```

---

## ACCEPTANCE CRITERIA

### **RIMOZIONE PRODUCTION**
- [ ] HeaderButtons: showDevButtons = false in production
- [ ] DevButtons: isDevMode = false in production
- [ ] Pulsanti debug non visibili in production
- [ ] Pulsanti reset non visibili in production
- [ ] Pulsanti precompila non visibili in production

### **MANTENIMENTO FUNZIONALITÀ**
- [ ] Alert Badge sempre visibile
- [ ] Link Attività sempre visibile
- [ ] Funzionalità core non compromesse

### **TESTING**
- [ ] Verificare che pulsanti dev non appaiano in production build
- [ ] Verificare che funzionalità core funzionino senza pulsanti dev
- [ ] Testare transizione sviluppo → production

---

## INTERAZIONI
- **Con ambiente**: `import.meta.env.DEV`
- **Con componenti**: `MainLayout`, `OnboardingWizard`
- **Con servizi**: `onboardingHelpers`, `multiHostAuth`

---

## NOTE SVILUPPO
- **Build process**: Verificare che `import.meta.env.DEV` sia false in production
- **Testing**: Testare sia modalità sviluppo che production
- **Security**: Pulsanti dev non devono essere accessibili in production
- **Performance**: Rimozione pulsanti dev non deve impattare performance




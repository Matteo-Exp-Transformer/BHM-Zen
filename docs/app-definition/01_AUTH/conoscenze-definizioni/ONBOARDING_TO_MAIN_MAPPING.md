> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A1`](../../META/FASE3_REPORT_A1_AUTH.md) §5.1  
> **Motivo**: claim «Onboarding completato» — implementazione parziale; flusso core OK, hardening incompleto.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# MAPPATURA ONBOARDING → MAIN APP

**Data**: 2025-10-22 01:38
**Componente**: Data Flow Onboarding to Main
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## STATO ATTUALE
- ✅ Onboarding completato
- ✅ Dati salvati in database
- ✅ Transizione a main app funzionante
- ✅ Dati popolano le pagine principali

## COMPORTAMENTO DESIDERATO

### **MAPPATURA DATI ONBOARDING → MAIN APP**

#### **STEP 1 → IMPOSTAZIONI**
- **Destinazione**: `SettingsPage` → `CompanyConfiguration`
- **Dati**: Nome azienda, tipo attività, data apertura, indirizzo, telefono, email, partita IVA
- **Collapse Card**: "Informazioni Azienda"

#### **STEP 2 → GESTIONI**
- **Destinazione**: `ManagementPage` → `DepartmentsManagement`
- **Dati**: Reparti creati con associazioni
- **Collapse Card**: "Reparti"

#### **STEP 3 → GESTIONI**
- **Destinazione**: `ManagementPage` → `StaffManagement`
- **Dati**: Personale inserito con ruoli, categorie, reparti, certificazioni
- **Collapse Card**: "Gestione Personale"

#### **STEP 4 → CONSERVAZIONE**
- **Destinazione**: `ConservationPage` → `ConservationManager`
- **Dati**: Punti di conservazione configurati
- **Collapse Card**: Punti di conservazione per reparto

#### **STEP 5 → ATTIVITÀ**
- **Destinazione**: `CalendarPage` → `ActivityManager`
- **Dati**: Manutenzioni e attività generiche
- **Tab**: "Attività" nel main app

#### **STEP 6 → INVENTARIO**
- **Destinazione**: `InventoryPage` → `ProductManager`
- **Dati**: Categorie prodotti e prodotti inseriti
- **Tab**: "Inventario" nel main app

#### **STEP 7 → CALENDARIO**
- **Destinazione**: `CalendarPage` → `CalendarSettings`
- **Dati**: Configurazione anno lavorativo, orari, giorni chiusura
- **Tab**: "Attività" nel main app

---

## SPECIFICA TECNICA

### **Data Flow Service**
```typescript
interface OnboardingDataFlow {
  // Mappa dati onboarding alle pagine main
  mapStep1ToSettings(data: CompanyData): void
  mapStep2ToManagement(data: DepartmentData[]): void
  mapStep3ToManagement(data: StaffData[]): void
  mapStep4ToConservation(data: ConservationPointData[]): void
  mapStep5ToCalendar(data: ActivityData[]): void
  mapStep6ToInventory(data: ProductData[]): void
  mapStep7ToCalendar(data: CalendarSettingsData): void
}
```

### **Database Relations**
```sql
-- Relazioni tra dati onboarding e main app
companies → settings.company_configuration
departments → management.departments
staff → management.staff
conservation_points → conservation.points
maintenance_tasks → calendar.maintenance
activities → calendar.activities
product_categories → inventory.categories
products → inventory.products
calendar_settings → calendar.settings
```

### **Component Mapping**
```typescript
interface ComponentMapping {
  'onboarding.step1' → 'settings.CompanyConfiguration'
  'onboarding.step2' → 'management.DepartmentsManagement'
  'onboarding.step3' → 'management.StaffManagement'
  'onboarding.step4' → 'conservation.ConservationManager'
  'onboarding.step5' → 'calendar.ActivityManager'
  'onboarding.step6' → 'inventory.ProductManager'
  'onboarding.step7' → 'calendar.CalendarSettings'
}
```

---

## ACCEPTANCE CRITERIA

### **MAPPATURA DATI**
- [ ] Step 1 → Impostazioni funzionante
- [ ] Step 2 → Gestioni Reparti funzionante
- [ ] Step 3 → Gestioni Personale funzionante
- [ ] Step 4 → Conservazione funzionante
- [ ] Step 5 → Attività funzionante
- [ ] Step 6 → Inventario funzionante
- [ ] Step 7 → Calendario funzionante

### **VALIDAZIONE DATI**
- [ ] Tutti i dati onboarding presenti nelle pagine main
- [ ] Relazioni tra dati mantenute
- [ ] Collapse Card popolate correttamente
- [ ] Tab principali funzionanti

### **PERFORMANCE**
- [ ] Caricamento dati ottimizzato
- [ ] Transizione fluida onboarding → main
- [ ] Dati sincronizzati in tempo reale

---

## INTERAZIONI
- **Con database**: Tutte le tabelle coinvolte
- **Con servizi**: `dataMappingService`, `onboardingService`
- **Con componenti**: Tutte le pagine main app

---

## NOTE SVILUPPO
- **Validazione**: Verificare che tutti i dati siano mappati correttamente
- **Testing**: Testare transizione completa onboarding → main
- **Performance**: Ottimizzare caricamento dati tra pagine
- **UX**: Feedback visivo durante mappatura dati




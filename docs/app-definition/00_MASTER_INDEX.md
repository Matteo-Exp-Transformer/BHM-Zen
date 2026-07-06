> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`GUIDA_INTRODUTTIVA_AGENTE_SENIOR`](../META/GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md) §8 · [`STATO_FASE3_INDICE.md`](./STATO_FASE3_INDICE.md)  
> **Motivo**: checklist ~8/150 completata; cartelle `02_DASHBOARD`, `05_INVENTORY`, `06_SETTINGS`, `07_MANAGEMENT` **non esistono**. Usare report Fase 3 per stato reale.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# 📚 MASTER INDEX - MAPPATURA COMPLETA ELEMENTI APP BHM v.2

**Data Creazione**: 2026-01-16  
**Versione**: 1.0.0  
**Scopo**: Mappare ogni singolo elemento dell'applicazione per documentazione completa

---

## 🎯 SCOPO DEL DOCUMENTO

Questo documento mappa **ogni singolo elemento** dell'applicazione BHM v.2:
- Pagine
- Componenti
- Pulsanti
- Form
- Modali
- Layout
- Navigazione
- Interazioni

Ogni elemento deve essere documentato con:
- ✅ Scopo
- ✅ Utilizzo
- ✅ Conflitti
- ✅ Modo in cui viene generato
- ✅ Scrittura del codice
- ✅ Layout
- ✅ Funzionamento

---

## 📋 STRUTTURA DOCUMENTAZIONE

Ogni elemento ha un file dedicato nella struttura:
```
APP_DEFINITION/
├── 00_MASTER_INDEX.md (questo file)
├── 00_TEMPLATE_STANDARD.md (template per ogni elemento)
├── 01_AUTH/ (Autenticazione)
├── 02_DASHBOARD/ (Dashboard)
├── 03_CONSERVATION/ (Conservazione)
├── 04_CALENDAR/ (Calendario)
├── 05_INVENTORY/ (Inventario)
├── 06_SETTINGS/ (Impostazioni)
├── 07_COMPONENTS/ (Componenti UI)
└── 08_INTERACTIONS/ (Interazioni)
```

---

## 🗺️ MAPPA COMPLETA ELEMENTI

### 🔐 01_AUTH - AUTENTICAZIONE

#### **Pagine**
- [x] `LOGIN_FLOW.md` - LoginPage + LoginForm
- [ ] `REGISTER_PAGE.md` - RegisterPage (solo via invito)
- [ ] `FORGOT_PASSWORD_PAGE.md` - ForgotPasswordPage
- [ ] `ACCEPT_INVITE_PAGE.md` - AcceptInvitePage
- [ ] `AUTH_CALLBACK_PAGE.md` - AuthCallbackPage
- [ ] `HOMEPAGE.md` - HomePage (Dashboard redirect)

#### **Componenti**
- [ ] `LOGIN_FORM.md` - LoginForm component
- [ ] `INVITE_ACCEPT_FORM.md` - InviteAcceptForm
- [ ] `RECOVERY_REQUEST_FORM.md` - RecoveryRequestForm
- [ ] `RECOVERY_CONFIRM_FORM.md` - RecoveryConfirmForm

#### **Sistemi**
- [x] `BLINDATURA_PLAN.md` - Piano sicurezza
- [ ] `PERMISSIONS_SYSTEM.md` - Sistema permessi RBAC
- [ ] `SESSION_MANAGEMENT.md` - Gestione sessioni

---

### 🏠 02_DASHBOARD - DASHBOARD PRINCIPALE

#### **Pagine**
- [ ] `HOMEPAGE_LAYOUT.md` - HomePage layout completo
- [ ] `DASHBOARD_PAGE.md` - DashboardPage component

#### **Componenti Dashboard**
- [ ] `TASK_SUMMARY.md` - TaskSummary card
- [ ] `COMPLIANCE_CHART.md` - ComplianceChart
- [ ] `TEMPERATURE_TREND.md` - TemperatureTrend
- [ ] `KPI_CARD.md` - KPICard
- [ ] `SCHEDULED_MAINTENANCE_CARD.md` - ScheduledMaintenanceCard

#### **Navigazione**
- [ ] `MAIN_LAYOUT.md` - MainLayout (header + bottom nav)
- [ ] `HEADER_BUTTONS.md` - HeaderButtons component
- [ ] `COMPANY_SWITCHER.md` - CompanySwitcher
- [ ] `BOTTOM_NAVIGATION.md` - Bottom navigation tabs
- [ ] `PROTECTED_ROUTE.md` - ProtectedRoute guard
- [ ] `ONBOARDING_GUARD.md` - OnboardingGuard

---

### ❄️ 03_CONSERVATION - CONSERVAZIONE

#### **Pagine**
- [x] `CONSERVATION_PAGE.md` - ConservationPage principale
- [ ] `CONSERVATION_MANAGER.md` - ConservationManager

#### **Sezioni Pagina**
- [x] `TEMPERATURE_READINGS_SECTION.md` - Sezione "Letture Temperature" (statistiche, dropdown, lista letture)
- [x] `SCHEDULED_MAINTENANCE_SECTION.md` - Sezione "Manutenzioni Programmate" (stato settimanale, prossima scadenza, assegnazione)

#### **Componenti**
- [x] `CONSERVATION_POINT_CARD.md` - ConservationPointCard
- [ ] `TEMPERATURE_READING_CARD.md` - TemperatureReadingCard
- [ ] `MAINTENANCE_TASK_CARD.md` - MaintenanceTaskCard
- [ ] `CONSERVATION_FILTERS.md` - ConservationFilters
- [ ] `CONSERVATION_STATS.md` - ConservationStats

#### **Form e Modali**
- [ ] `CREATE_CONSERVATION_POINT_MODAL.md` - CreateConservationPointModal
- [x] `ADD_POINT_MODAL.md` - AddPointModal
- [x] `ADD_TEMPERATURE_MODAL.md` - AddTemperatureModal (registrazione temperatura)
- [ ] `TEMPERATURE_READING_MODAL.md` - TemperatureReadingModal (alternativo/legacy)
- [ ] `MAINTENANCE_TASK_MODAL.md` - MaintenanceTaskModal
- [ ] `FORM_CASCADE_LOGIC.md` - Logica form a cascata (onboarding + main)

---

### 📅 04_CALENDAR - CALENDARIO ATTIVITÀ

#### **Pagine**
- [ ] `CALENDAR_PAGE.md` - CalendarPage principale

#### **Componenti Calendario**
- [ ] `CALENDAR_VIEW.md` - Calendar component (vista mensile/settimanale)
- [ ] `VIEW_SELECTOR.md` - ViewSelector (mese/settimana/giorno)
- [ ] `CALENDAR_FILTERS.md` - CalendarFilters / NewCalendarFilters
- [ ] `FILTER_PANEL.md` - FilterPanel
- [ ] `HORIZONTAL_CALENDAR_FILTERS.md` - HorizontalCalendarFilters
- [ ] `CALENDAR_LEGEND.md` - CalendarLegend / CalendarEventLegend
- [ ] `CALENDAR_STATS_PANEL.md` - CalendarStatsPanel
- [ ] `QUICK_ACTIONS.md` - QuickActions

#### **Form e Modali**
- [x] `Generic-Task-creation_assignation/GENERIC_TASK_FORM_DEFINITION.md` - GenericTaskForm
- [ ] `CREATE_EVENT_MODAL.md` - CreateEventModal
- [ ] `EVENT_DETAILS_MODAL.md` - EventDetailsModal
- [ ] `EVENT_MODAL.md` - EventModal
- [ ] `CATEGORY_EVENTS_MODAL.md` - CategoryEventsModal
- [ ] `MACRO_CATEGORY_MODAL.md` - MacroCategoryModal
- [ ] `PRODUCT_EXPIRY_MODAL.md` - ProductExpiryModal
- [ ] `CALENDAR_CONFIG_MODAL.md` - CalendarConfigModal
- [ ] `ALERT_MODAL.md` - AlertModal

#### **Sistemi**
- [ ] `TASK_MANAGEMENT.md` - Sistema gestione task
- [ ] `ASSIGNMENT_SYSTEM.md` - Sistema assegnazione
- [ ] `COMPLETION_TRACKING.md` - Tracciamento completamento

---

### 📦 05_INVENTORY - INVENTARIO

#### **Pagine**
- [ ] `INVENTORY_PAGE.md` - InventoryPage principale

#### **Componenti**
- [ ] `PRODUCT_CARD.md` - ProductCard
- [ ] `SHOPPING_LIST_MANAGER.md` - ShoppingListManager
- [ ] `SHOPPING_LIST_CARD.md` - ShoppingListCard
- [ ] `EXPIRY_ALERT.md` - ExpiryAlert
- [ ] `EXPIRED_PRODUCTS_MANAGER.md` - ExpiredProductsManager
- [ ] `ALLERGEN_BADGE.md` - AllergenBadge
- [ ] `CATEGORY_FILTER.md` - CategoryFilter
- [ ] `PRODUCT_SELECTOR.md` - ProductSelector

#### **Form e Modali**
- [ ] `ADD_PRODUCT_MODAL.md` - AddProductModal
- [ ] `ADD_CATEGORY_MODAL.md` - AddCategoryModal
- [ ] `TRANSFER_PRODUCT_MODAL.md` - TransferProductModal
- [ ] `CREATE_LIST_MODAL.md` - CreateListModal

#### **Liste Spesa**
- [ ] `SHOPPING_LISTS_PAGE.md` - ShoppingListsPage
- [ ] `SHOPPING_LIST_DETAIL_PAGE.md` - ShoppingListDetailPage
- [ ] `CREATE_SHOPPING_LIST_MODAL.md` - CreateShoppingListModal
- [ ] `PRODUCT_FILTERS.md` - ProductFilters (per liste spesa)
- [ ] `PRODUCT_SELECT_GRID.md` - ProductSelectGrid

---

### ⚙️ 06_SETTINGS - IMPOSTAZIONI

#### **Pagine**
- [ ] `SETTINGS_PAGE.md` - SettingsPage

#### **Componenti**
- [ ] `COMPANY_CONFIGURATION.md` - CompanyConfiguration
- [ ] `USER_MANAGEMENT.md` - UserManagement
- [ ] `HACCP_SETTINGS.md` - HACCPSettings
- [ ] `NOTIFICATION_PREFERENCES.md` - NotificationPreferences

---

### 👥 07_MANAGEMENT - GESTIONE

#### **Pagine**
- [ ] `MANAGEMENT_PAGE.md` - ManagementPage

#### **Componenti**
- [ ] `STAFF_MANAGEMENT.md` - StaffManagement
- [ ] `STAFF_CARD.md` - StaffCard
- [ ] `ADD_STAFF_MODAL.md` - AddStaffModal
- [ ] `DEPARTMENT_MANAGEMENT.md` - DepartmentManagement
- [ ] `DEPARTMENT_CARD.md` - DepartmentCard
- [ ] `ADD_DEPARTMENT_MODAL.md` - AddDepartmentModal

---

### 🧩 08_COMPONENTS - COMPONENTI UI BASE

#### **Layout**
- [ ] `MAIN_LAYOUT.md` - MainLayout completo
- [ ] `STEP_NAVIGATOR.md` - StepNavigator (onboarding)

#### **Navigazione**
- [ ] `HEADER_BUTTONS.md` - HeaderButtons
- [ ] `COMPANY_SWITCHER.md` - CompanySwitcher
- [ ] `SYNC_STATUS_BAR.md` - SyncStatusBar

#### **Form e Input**
- [ ] `BUTTON.md` - Button component
- [ ] `INPUT.md` - Input component
- [ ] `TEXTAREA.md` - Textarea component
- [ ] `SELECT.md` - Select component
- [ ] `TIME_INPUT.md` - TimeInput component
- [ ] `FORM_FIELD.md` - FormField component
- [ ] `LABEL.md` - Label component
- [ ] `SWITCH.md` - Switch component

#### **Display**
- [ ] `MODAL.md` - Modal component
- [ ] `ALERT.md` - Alert component
- [ ] `BADGE.md` - Badge component
- [ ] `CARD.md` - Card component
- [ ] `COLLAPSIBLE_CARD.md` - CollapsibleCard
- [ ] `TABS.md` - Tabs component
- [ ] `TABLE.md` - Table component
- [ ] `TOOLTIP.md` - Tooltip component
- [ ] `PROGRESS.md` - Progress component
- [ ] `LOADING_SPINNER.md` - LoadingSpinner
- [ ] `OPTIMIZED_IMAGE.md` - OptimizedImage

#### **Onboarding**
- [ ] `ONBOARDING_WIZARD.md` - OnboardingWizard
- [ ] `BUSINESS_INFO_STEP.md` - BusinessInfoStep
- [ ] `DEPARTMENTS_STEP.md` - DepartmentsStep
- [ ] `STAFF_STEP.md` - StaffStep
- [ ] `CONSERVATION_STEP.md` - ConservationStep
- [ ] `TASKS_STEP.md` - TasksStep
- [ ] `INVENTORY_STEP.md` - InventoryStep
- [ ] `CALENDAR_CONFIG_STEP.md` - CalendarConfigStep

#### **Altri**
- [ ] `ERROR_BOUNDARY.md` - ErrorBoundary
- [ ] `NOT_FOUND_PAGE.md` - NotFoundPage
- [ ] `HOME_REDIRECT.md` - HomeRedirect
- [ ] `DEV_BUTTONS.md` - DevButtons (solo sviluppo)

---

### 🔄 09_INTERACTIONS - INTERAZIONI

#### **Flussi Utente**
- [ ] `USER_FLOWS.md` - Flussi utente principali
- [ ] `DATA_FLOWS.md` - Flussi dati
- [ ] `STATE_MANAGEMENT.md` - Gestione stato
- [ ] `ERROR_HANDLING.md` - Gestione errori

#### **Conflitti**
- [ ] `SYNC_CONFLICTS.md` - Conflitti sincronizzazione
- [ ] `TASK_CONFLICTS.md` - Conflitti task/mansioni
- [ ] `MULTI_USER_CONFLICTS.md` - Conflitti multi-utente

---

## 📊 STATO DOCUMENTAZIONE

**Totale Elementi**: ~150+  
**Documentati**: ~8  
**Da Documentare**: ~142+

### Priorità Documentazione

#### **PRIORITÀ 1 - Core App**
1. MainLayout
2. CalendarPage + GenericTaskForm (già fatto)
3. ConservationPage ✅ (completata)
4. InventoryPage
5. LoginPage + LoginForm (già fatto)

#### **PRIORITÀ 2 - Componenti Chiave**
1. Tutti i form principali
2. Tutti i modali principali
3. Sistema navigazione
4. Sistema permessi

#### **PRIORITÀ 3 - Componenti UI**
1. Componenti base (Button, Input, Modal, ecc.)
2. Componenti display (Card, Badge, Alert, ecc.)
3. Componenti onboarding

---

## 🎯 PROSSIMI PASSI

1. ✅ Creare template standard completo
2. ⏳ Documentare elementi Priorità 1
3. ⏳ Documentare elementi Priorità 2
4. ⏳ Documentare elementi Priorità 3
5. ⏳ Validare con Owner

---

**Ultimo Aggiornamento**: 2026-01-16  
**Versione**: 1.0.0

> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A4`](../META/FASE3_REPORT_A4_DASHBOARD.md) §5.4 · [`GUIDA_INTRODUTTIVA_AGENTE_SENIOR`](../META/GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md) §4  
> **Motivo**: struttura cartelle ideale — molte aree (`02_DASHBOARD`, `05_INVENTORY`, `06_SETTINGS`) **non esistono** nel repo.  
> **Verità**: codice + DB live > questo documento.

# SISTEMA DI DOCUMENTAZIONE DETTAGLIATA - BHM v.2

**Data**: 2025-10-22 01:38
**Sessione**: Definizione dettagliata app punto per punto
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## 🎯 SCOPO DEL SISTEMA

**Obiettivo**: Definire **ogni singolo aspetto** dell'app dal login al completamento di ogni funzione, con documentazione granulare e organizzata per garantire allineamento totale tra tutti gli agenti.

**Metodo**: Owner ha l'app aperta, descrive cosa vede, Agente 9 traduce le specifiche in documentazione tecnica actionable.

---

## 🗂️ STRUTTURA CARTELLE

```
APP_DEFINITION/
├── 01_AUTH/                    # Autenticazione e autorizzazione
│   ├── LOGIN_FLOW.md
│   ├── REGISTRATION_FLOW.md
│   ├── PERMISSIONS_SYSTEM.md
│   └── SESSION_MANAGEMENT.md
├── 02_DASHBOARD/                # Dashboard principale
│   ├── HOMEPAGE_LAYOUT.md
│   ├── STATS_DISPLAY.md
│   ├── NAVIGATION.md
│   └── QUICK_ACTIONS.md
├── 03_CONSERVATION/             # Sistema conservazione
│   ├── CONSERVATION_MANAGER.md
│   ├── FORM_CASCADE_LOGIC.md
│   ├── TEMPERATURE_MONITORING.md
│   └── HACCP_GUIDANCE.md
├── 04_CALENDAR/                 # Calendario attività
│   ├── CALENDAR_VIEW.md
│   ├── TASK_MANAGEMENT.md
│   ├── ASSIGNMENT_SYSTEM.md
│   └── COMPLETION_TRACKING.md
├── 05_INVENTORY/                # Inventario e prodotti
│   ├── PRODUCT_MANAGEMENT.md
│   ├── SHOPPING_LIST_SYSTEM.md
│   ├── FILTERS_AND_SEARCH.md
│   └── EXPORT_FUNCTIONALITY.md
├── 06_SETTINGS/                 # Impostazioni
│   ├── COMPANY_CONFIGURATION.md
│   ├── USER_MANAGEMENT.md
│   ├── HACCP_SETTINGS.md
│   └── NOTIFICATION_PREFERENCES.md
├── 07_COMPONENTS/               # Componenti UI
│   ├── BUTTONS_AND_ACTIONS.md
│   ├── FORMS_AND_INPUTS.md
│   ├── MODALS_AND_DIALOGS.md
│   └── NAVIGATION_ELEMENTS.md
└── 08_INTERACTIONS/             # Interazioni tra componenti
    ├── USER_FLOWS.md
    ├── DATA_FLOWS.md
    ├── STATE_MANAGEMENT.md
    └── ERROR_HANDLING.md
```

---

## 📋 METODOLOGIA DI LAVORO

### **1. ANALISI PUNTO PER PUNTO**
- Owner descrive cosa vede nell'app
- Agente 9 identifica componente/funzione
- Documentazione tecnica dettagliata
- Specifica comportamento attuale vs desiderato

### **2. DOCUMENTAZIONE GRANULARE**
- **Un file per componente/funzione**
- **Specifiche tecniche precise**
- **Comportamenti attuali vs desiderati**
- **Interazioni con altri componenti**

### **3. ALLINEAMENTO AGENTI**
- **Linguaggio tecnico preciso**
- **Riferimenti implementativi**
- **Acceptance criteria chiari**
- **Dependencies mappate**

---

## 🎯 TEMPLATE STANDARD

### **Per ogni componente:**
```markdown
# COMPONENT_NAME - SPECIFICA DETTAGLIATA

## STATO ATTUALE
- Cosa funziona
- Cosa non funziona
- Comportamento osservato

## COMPORTAMENTO DESIDERATO
- Come deve funzionare
- Interazioni specifiche
- Validazioni richieste

## SPECIFICA TECNICA
- Props/State necessari
- Event handlers
- Dependencies
- Database interactions

## ACCEPTANCE CRITERIA
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## INTERAZIONI
- Con componenti: X, Y, Z
- Con database: tabelle coinvolte
- Con servizi: API calls
```

---

## 🚀 PROCESSO DI LAVORO

### **STEP 1: IDENTIFICAZIONE**
- Owner: "Vedo questa pagina/form/pulsante"
- Agente 9: Identifica componente e cartella target

### **STEP 2: ANALISI**
- Owner: "Attualmente fa X, ma voglio che faccia Y"
- Agente 9: Documenta stato attuale vs desiderato

### **STEP 3: SPECIFICA**
- Agente 9: Crea specifica tecnica dettagliata
- Include: comportamento, validazioni, interazioni

### **STEP 4: VALIDAZIONE**
- Owner: Conferma specifica
- Agente 9: Aggiorna documentazione

---

**STATUS**: 🟢 SISTEMA PRONTO - In attesa di iniziare analisi punto per punto




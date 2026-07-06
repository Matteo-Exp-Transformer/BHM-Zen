> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A1`](../../META/FASE3_REPORT_A1_AUTH.md) §5.1  
> **Motivo**: piano blindatura ott 2025 — processo utile ma **non** riflette stato implementazione post-Fase 3.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# PIANO DI BLINDATURA - LOGIN E ONBOARDING

**Data**: 2025-10-22 01:38
**Sessione**: Pianificazione Blindatura Completa
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## 🎯 SCOPO BLINDATURA

**Obiettivo**: Definire **ogni singolo elemento** di Login e Onboarding per garantire:
- **Mappatura completa** di tutti i componenti UI
- **Specifiche tecniche dettagliate** per ogni elemento
- **Piano di blindatura** condiviso con tutti gli agenti
- **Metodo sistematico** per identificare e proteggere elementi critici

---

## 📊 STATO ATTUALE MAPPATURA

### **✅ COMPLETATO**
- ✅ **Login Flow**: Elementi principali mappati
- ✅ **Onboarding Steps**: Struttura generale definita
- ✅ **Pulsanti Sviluppo**: HeaderButtons e DevButtons identificati
- ✅ **Sistema Email**: Supabase configurato
- ✅ **Validazione**: Vincoli password definiti
- ✅ **Gestione Errori**: Messaggi laterali confermati

### **⚠️ DA COMPLETARE**
- ❌ **Mappatura dettagliata** di ogni campo form
- ❌ **Specifiche tecniche** per ogni componente UI
- ❌ **Validazioni specifiche** per ogni input
- ❌ **Interazioni tra componenti** non mappate
- ❌ **Stati e comportamenti** non documentati
- ❌ **Edge cases** non identificati

---

## 🔍 ELEMENTI DA MAPPARE DETTAGLIATAMENTE

### **LOGIN PAGE**
- [ ] **Campo Email**: Validazione, placeholder, errori
- [ ] **Campo Password**: Validazione, toggle visibilità, errori
- [ ] **Link Password Dimenticata**: Comportamento, validazione
- [ ] **Tasto Accedi**: Stati (loading, disabled, error)
- [ ] **Sezione "Oppure"**: Styling, comportamento
- [ ] **Layout Responsive**: Mobile, tablet, desktop
- [ ] **Accessibilità**: ARIA labels, keyboard navigation

### **ONBOARDING STEP 1 - INFORMAZIONI AZIENDALI**
- [ ] **Campo Nome Azienda**: Validazione, caratteri speciali, lunghezza
- [ ] **Menu Tipo Attività**: Opzioni, validazione, ricerca
- [ ] **Campo Data Apertura**: Formato, validazione, calendario
- [ ] **Campo Indirizzo**: Validazione, autocomplete, geocoding
- [ ] **Campo Telefono**: Formato, validazione internazionale
- [ ] **Campo Email**: Validazione, duplicati, formato
- [ ] **Campo Partita IVA**: Formato italiano, validazione
- [ ] **Pulsanti Navigazione**: Avanti, Indietro, Salva

### **ONBOARDING STEP 2 - REPARTI**
- [ ] **Form Nuovo Reparto**: Nome, descrizione, responsabile
- [ ] **Lista Reparti**: Visualizzazione, modifica, eliminazione
- [ ] **Validazioni**: Nome unico, caratteri speciali
- [ ] **Associazioni**: Mansioni, staff, punti conservazione

### **ONBOARDING STEP 3 - PERSONALE**
- [ ] **Form Precompilato Admin**: Dati preesistenti, modifica
- [ ] **Campi Obbligatori**: Nome, cognome, email, ruolo, categoria, reparto, scadenza HACCP
- [ ] **Campi Opzionali**: Telefono, note
- [ ] **Selezione Categorie Multiple**: Checkbox, validazione
- [ ] **Selezione Reparto**: Dropdown, validazione
- [ ] **Data Scadenza Certificazione**: Calendario, validazione futura
- [ ] **Pulsanti Azione**: Salva, Modifica, Elimina

### **ONBOARDING STEP 4 - CONSERVAZIONE**
- [ ] **Form a Cascata**: Sequenza nome → reparto → tipologia → temperatura → categorie
- [ ] **Campo Nome**: Validazione, unicità
- [ ] **Selezione Reparto**: Dropdown, validazione
- [ ] **Selezione Tipologia**: Dropdown, range temperature
- [ ] **Campo Temperatura**: Validazione range, tolleranza ±1°C
- [ ] **Selezione Categorie**: Solo compatibili con temperatura
- [ ] **Logica Tolleranza**: Calcolo automatico, validazione

### **ONBOARDING STEP 5 - ATTIVITÀ**
- [ ] **Assegnazione Manutenzioni**: Automatica ai punti conservazione
- [ ] **Form Manutenzioni**: Frequenza, ruolo, categoria, dipendente
- [ ] **Form Attività Generiche**: Nome, frequenza, ruolo, reparto, categorie, dipendente
- [ ] **Validazioni**: Almeno una attività generica obbligatoria
- [ ] **Pulsanti**: Conferma, Annulla, Modifica

### **ONBOARDING STEP 6 - INVENTARIO**
- [ ] **Categorie Prodotti**: Preconfigurate, visualizzazione
- [ ] **Form Nuova Categoria**: Nome, colore, descrizione, temperatura min/max, durata max
- [ ] **Selezione Prodotti**: Menu a tendina, visualizzazione
- [ ] **Form Nuovo Prodotto**: Nome, categoria, reparto, conservazione, date, quantità, unità
- [ ] **Unità di Misura**: kg, g, l, ml, confezione, buste, vaschette
- [ ] **Campi Rimossi**: SKU, BARCODE, URL, FOTO, ETICHETTA

### **ONBOARDING STEP 7 - CALENDARIO**
- [ ] **Data Inizio Anno**: Calendario, validazione, calcolo automatico fine
- [ ] **Giorni Apertura**: Checkbox settimanali, validazione
- [ ] **Giorni Chiusura**: Singolo giorno vs periodo, calendario
- [ ] **Orari Apertura**: Standard vs doppia fascia, validazione
- [ ] **Gestione Notturni**: 8:00-03:00, validazione
- [ ] **Calcolo Ore Settimanali**: Algoritmo, visualizzazione
- [ ] **Riepilogo**: Giorni totali, ore settimanali

---

## 🛡️ METODO DI BLINDATURA

### **FASE 1: MAPPATURA COMPLETA**
1. **Inventario Elementi**: Lista completa di ogni componente UI
2. **Specifiche Tecniche**: Props, state, validazioni per ogni elemento
3. **Interazioni**: Come gli elementi interagiscono tra loro
4. **Stati**: Tutti i possibili stati di ogni elemento

### **FASE 2: IDENTIFICAZIONE CRITICITÀ**
1. **Elementi Critici**: Componenti che non possono essere modificati
2. **Dipendenze**: Relazioni tra componenti
3. **Edge Cases**: Casi limite e comportamenti speciali
4. **Validazioni**: Regole di business critiche

### **FASE 3: BLINDATURA**
1. **Lock Files**: Protezione file critici
2. **Test Coverage**: Test completi per ogni elemento
3. **Documentazione**: Specifiche dettagliate
4. **Monitoring**: Controllo modifiche

---

## 🚀 PROMPT DI PARTENZA PER ALTRI AGENTI

### **AGENTE 1 - PRODUCT STRATEGY**
```
Analizza il sistema di Login e Onboarding per identificare:
- Obiettivi business di ogni step
- KPI di successo per ogni fase
- Rischi di abbandono utente
- Metriche di completamento onboarding
```

### **AGENTE 2 - SYSTEMS BLUEPRINT**
```
Mappa l'architettura tecnica di Login e Onboarding:
- Database schema per ogni step
- API endpoints necessari
- State management tra step
- Performance requirements
```

### **AGENTE 4 - BACK-END**
```
Implementa e valida il backend per Login e Onboarding:
- Validazioni server-side
- Sistema token inviti
- Email automation
- Data integrity
```

### **AGENTE 5 - FRONT-END**
```
Sviluppa e ottimizza l'UI/UX di Login e Onboarding:
- Componenti React ottimizzati
- Responsive design
- Accessibilità
- Performance client-side
```

### **AGENTE 6 - TESTING**
```
Crea test completi per Login e Onboarding:
- Unit tests per ogni componente
- Integration tests per ogni step
- E2E tests per flusso completo
- Test coverage 100%
```

### **AGENTE 7 - SECURITY**
```
Valida sicurezza di Login e Onboarding:
- Autenticazione e autorizzazione
- Validazione input
- Protezione dati sensibili
- Audit trail
```

---

## 📋 PROSSIMI PASSI

### **IMMEDIATI**
1. **Completare mappatura** di ogni elemento UI
2. **Definire specifiche tecniche** dettagliate
3. **Identificare elementi critici** per blindatura
4. **Creare piano di test** per ogni componente

### **A BREVE TERMINE**
1. **Implementare blindatura** con altri agenti
2. **Eseguire test completi** su ogni elemento
3. **Documentare edge cases** e comportamenti speciali
4. **Validare sicurezza** e performance

---

**STATUS**: 🟡 PIANIFICAZIONE COMPLETA - Pronto per esecuzione blindatura




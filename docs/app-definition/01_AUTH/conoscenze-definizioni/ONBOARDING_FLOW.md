> **Stato Fase 3** (2026-07-06): `verificato-gap` · Fonte: [`FASE3_REPORT_A1`](../../META/FASE3_REPORT_A1_AUTH.md) §5.5 · [`DECISIONI_OWNER_BETA`](../../META/MAPPATURA_AREE/DECISIONI_OWNER_BETA.md) dec. 4  
> **Motivo**: campo licenza ancora in UI ma colonna assente su DB; acceptance criteria aperti; completamento solo `localStorage`.  
> **Verità**: codice + DB live > questo documento (solo intento UX).

# ONBOARDING FLOW - SPECIFICA DETTAGLIATA

**Data**: 2025-10-22 01:38
**Componente**: Onboarding System
**Agente**: Agente 9 - Knowledge Brain Mapper

---

## STATO ATTUALE
- ✅ Onboarding multi-step implementato
- ✅ Form validazione funzionanti
- ✅ Pulsanti sviluppo presenti (da mappare per rimozione)
- ✅ Sistema conservazione con logica temperatura
- ✅ Sistema manutenzioni funzionante
- ✅ Sistema inventario base funzionante

## COMPORTAMENTO DESIDERATO

### **STEP 1: INFORMAZIONI AZIENDALI**
- **Nome azienda**: Obbligatorio
- **Tipo attività**: Menu a tendina, obbligatorio
- **Data apertura**: Opzionale
- **Indirizzo**: Obbligatorio
- **Telefono**: Opzionale
- **Email**: Obbligatorio
- **Numero licenza**: **DA RIMUOVERE**
- **Partita IVA**: Opzionale

### **STEP 2: CONFIGURAZIONE REPARTI**
- **Scopo**: Inserire reparti azienda
- **Associazioni**: Mansioni generiche, staff, punti conservazione
- **Form**: Nome reparto, descrizione, responsabile

### **STEP 3: PERSONALE**
- **Form precompilato**: Email admin già inserita
- **Campi obbligatori**: Nome, cognome, email, ruolo, categoria, reparto, scadenza certificazione HACCP
- **Campi opzionali**: Telefono, note
- **Categorie multiple**: Possibilità di assegnare più categorie
- **Pulsanti**: Salva modifiche, modifica, elimina

### **STEP 4: CONSERVAZIONE**
- **Form a cascata**: Nome → Reparto → Tipologia → Temperatura → Categorie
- **Temperatura target**: Obbligatoria, range preimpostato per tipologia
- **Categorie compatibili**: Solo quelle compatibili con temperatura
- **Tolleranza**: ±1°C rispetto al range categoria
- **Logica**: Bevande (2-12°C) accettate anche a 1°C per tolleranza

### **STEP 5: ATTIVITÀ**
- **Manutenzioni**: Assegnazione automatica ai punti conservazione
- **Form manutenzioni**: Frequenza, ruolo, categoria, dipendente specifico
- **Attività generiche**: Almeno una obbligatoria
- **Form attività**: Nome, frequenza, ruolo, reparto (obbligatori), categorie, dipendente (opzionali)

### **STEP 6: INVENTARIO**
- **Categorie prodotti**: Preconfigurate dall'app
- **Nuova categoria**: Nome, colore, descrizione, temperatura min/max, durata max giorni
- **Prodotti**: Nome, categoria, reparto, conservazione, data acquisto/scadenza, quantità, unità
- **Campi da rimuovere**: SKU, BARCODE, URL, FOTO, ETICHETTA
- **Unità**: kg, g, l, ml, confezione, buste, vaschette

### **STEP 7: CALENDARIO**
- **Data inizio anno lavorativo**: Obbligatorio
- **Calcolo automatico fine**: Data inizio + 365 giorni
- **Giorni apertura settimanale**: Selezione giorni della settimana
- **Giorni chiusura**: Singolo giorno o periodo (DAL-AL)
- **Orari apertura**: Standard (DA-A) o doppia fascia (DA-A + DA-A)
- **Gestione notturni**: 8:00-03:00 = 8:00-03:00 (non errore)
- **Calcolo ore settimanali**: 24h - ore chiusura per ogni giorno
- **Riepilogo**: Giorni totali, ore settimanali

---

## SPECIFICA TECNICA

### **Database Schema**
```sql
-- Tabelle coinvolte
companies (step 1)
departments (step 2)
staff (step 3)
conservation_points (step 4)
maintenance_tasks (step 5)
activities (step 5)
product_categories (step 6)
products (step 6)
calendar_settings (step 7)
```

### **Logica Temperatura**
```typescript
interface TemperatureLogic {
  tolerance: 1 // ±1°C
  validateRange(category: string, temperature: number): boolean
  getCompatibleCategories(temperature: number): string[]
  calculateTolerance(baseTemp: number): { min: number, max: number }
}
```

### **Calcolo Orari**
```typescript
interface TimeCalculation {
  handleOvernightHours(start: string, end: string): boolean
  calculateWeeklyHours(workDays: string[], workHours: TimeRange[]): number
  validateTimeRange(start: string, end: string): boolean
}
```

---

## ACCEPTANCE CRITERIA

### **STEP 1**
- [ ] Numero licenza rimosso
- [ ] Validazione campi obbligatori
- [ ] Salvataggio dati in companies table

### **STEP 2**
- [ ] Form reparti funzionante
- [ ] Associazione con mansioni/staff/conservazione

### **STEP 3**
- [ ] Form precompilato per admin
- [ ] Validazione scadenza certificazione HACCP
- [ ] Categorie multiple per dipendente

### **STEP 4**
- [ ] Form a cascata funzionante
- [ ] Logica temperatura con tolleranza ±1°C
- [ ] Categorie compatibili filtrate

### **STEP 5**
- [ ] Assegnazione automatica manutenzioni
- [ ] Almeno una attività generica obbligatoria
- [ ] Form modifica con precompilazione

### **STEP 6**
- [ ] SKU, BARCODE, URL, FOTO, ETICHETTA rimossi
- [ ] Unità di misura definite
- [ ] Calcolo durata per alert

### **STEP 7**
- [ ] Calcolo automatico fine anno lavorativo
- [ ] Gestione orari notturni
- [ ] Calcolo ore settimanali
- [ ] Riepilogo completo

---

## INTERAZIONI
- **Con database**: Tutte le tabelle principali
- **Con servizi**: `onboardingService`, `validationService`
- **Con componenti**: `FormStep`, `TemperatureInput`, `TimeRangePicker`

---

## NOTE SVILUPPO
- **Pulsanti sviluppo**: HeaderButtons e DevButtons mappati per rimozione production
- **Validazione**: Implementare validazione real-time per tutti i form
- **Performance**: Ottimizzare caricamento dati tra step
- **UX**: Feedback visivo per validazione e salvataggio
- **Sistema email**: Supabase già configurato per invii automatici
- **Gestione errori**: Messaggi laterali di avviso come già presenti

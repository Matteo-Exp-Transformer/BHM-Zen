# Sessione 31 Gennaio 2026

## Contenuto

| File | Descrizione |
|------|-------------|
| **REPORT_SESSIONE_COMPLETA_31-01-2026.md** | Report esaustivo: centralizzazione tolleranza ±1°C, badge cliccabile, nome utente, colori critico, sicurezza git |
| **REPORT_ABBATTITORE_E_UI_31-01-2026.md** | Report dettagliato: Abbattitore senza rilevamento temperatura, validazioni 2/4 manutenzioni, sezione Rilevamento senza Abbattitore, altezza uniforme card temperatura |
| **README.md** | Questo file – indice della cartella |

## Riepilogo

### Parte 1 – Tolleranza e UX (REPORT_SESSIONE_COMPLETA)
- Centralizzazione tolleranza ±1.0°C
- Stato punto basato su ultimo rilevamento per data/ora
- Badge Attenzione/Critico cliccabile con scroll e highlight
- Messaggi di azione per ogni stato
- Nome utente in Ultima lettura
- Colori critico più intensi
- Rimozione token da git history

### Parte 2 – Abbattitore e UI card (REPORT_ABBATTITORE_E_UI)
- **Abbattitore**: manutenzione "Rilevamento temperatura" non richiesta né assegnabile (AddPointModal, TasksStep, onboardingHelpers)
- **Card punto**: per Abbattitore nascosti temperatura target, badge regolazione, ultima lettura
- **Stato**: Abbattitore escluso da typesRequiringTemp; stato non basato su temperatura
- **Sezione Rilevamento temperature**: card Abbattitore non mostrate (filter blast)
- **Calendario**: nessun evento rilevamento temperatura per punti blast
- **Validazioni**: Ambiente e Abbattitore = 2 manutenzioni obbligatorie; testo dinamico 2/4
- **TemperaturePointStatusCard**: altezza uniforme (min-h 246px, area azioni min-h 40px)
- **Dettagli rilevamento**: tabella Storico con riga espandibile (metodo, note, foto evidenza; titoli distinti da contenuti); card Stato con sola riga "Metodo"

# Lavoro 29-01-2026: profilo HACCP "Bibite e Bevande alcoliche" e pulsante Calendario

## Contenuto cartella

- **MAPPATURA_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md** – Mappatura delle modifiche (scelte adottate e file toccati)
- **REPORT_PROFILO_BIBITE_BEVANDE_ALCOLICHE.md** – Report del lavoro svolto (implementazione, comportamento atteso, test)
- **REPORT_MACRO_CATEGORY_MODAL_SCADENZA_E_CARD.md** – Report: fix "Invalid Date" Scadenza, titolo manutenzione con nome punto, Reparto sulla card; completamento manutenzione (fix 400 / UUID), refresh ottimistico del modal dopo "Completa", rimozione scroll automatico alle completate
- **REPORT_PULSANTE_VISUALIZZA_CALENDARIO_E_FIX.md** – Report: pulsante "Visualizza nel Calendario" in card manutenzioni, navigazione a Attività con modal aperto ed evidenziazione; fix loop/406/GoTrue/modal vuoto

## Riepilogo

Aggiunto il profilo HACCP **"Bibite e Bevande alcoliche"** (ID `beverages_alcoholic`) con 5 categorie prodotti auto-assegnate (Frutta/Verdure, Acqua, Succhi, Bibite gassate, Bevande Alcoliche), disponibili solo per questo profilo e senza range di temperatura. Il profilo è presente nel form "Nuovo Punto di Conservazione" (pagina Conservazione) e nel form "Aggiungi punto di conservazione" (onboarding).

In sessione 29-01-2026 è stato inoltre implementato il pulsante **"Visualizza nel Calendario"** nella card manutenzioni (Dashboard/Conservazione): al click si naviga alla pagina Attività con il modal Manutenzioni aperto sulla data di scadenza e la manutenzione evidenziata (bordo animato). Sono stati applicati fix per loop React, errore "Cannot convert object to primitive value", 406 su `user_profiles`, log GoTrue in console e modal vuoto (uso di `displayEvents` invece di `viewBasedEvents`).

Sul **modal macro categoria** (Manutenzioni/Mansioni/Scadenze) sono stati risolti: **(1)** errore 400 al completamento manutenzione (uso di UUID da `metadata.maintenance_id` invece dell’ID composito calendario); **(2)** assenza di refresh dopo "Completa Manutenzione" (aggiornamento ottimistico con `maintenanceCompletedIds`, senza cambiare fonte dati); **(3)** scroll automatico indesiderato verso la sezione Completate (rimosso `useEffect` con `scrollIntoView`). Dettaglio in `REPORT_MACRO_CATEGORY_MODAL_SCADENZA_E_CARD.md`.

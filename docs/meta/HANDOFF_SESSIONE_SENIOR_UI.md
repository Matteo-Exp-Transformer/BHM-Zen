# Handoff — Track A · UI (continuazione)

> **Stato**: 🟢 ATTIVO · **Creato**: 2026-07-05 · **Tipo**: handoff cold-start per agente senior
> **Fonte di verità**: [`MASTERPLAN_RILANCIO_BHM_v2.md`](./MASTERPLAN_RILANCIO_BHM_v2.md) — questo file
> orienta, il masterplan **decide**. Se divergono, vince il masterplan (e allinealo).
> **Dove siamo (2026-07-06)**: direzione UI blindata (§13); **serie base 4/4 approvata**; **mockup 5
> Onboarding titolare v2** fatto e con impianto approvato dall'owner ("il resto va bene ottimo"). Prima del
> mockup 5 è stata scritta la **mappa dei 7 step** (`MOCKUP_UI/MAPPATURA_ONBOARDING_STEP.md`). **Polish
> pendente**: rallentare **tutte** le animazioni (tempo calmo, §13.6) — annotato, non ancora applicato.

> ⚙️ **Sei il Track A (UI).** ✅ **Track B (skill-system) è CONCLUSO** (§14 completo + `DESIGN_SKILL_CONSULENTI.md`,
> committato). Non ci sono più due mani in scrittura: le regole anti-collisione §0 sono **rilassate** — puoi
> toccare le sezioni condivise quando serve, annotando qui. **Tu possiedi** comunque **§13** + `MOCKUP_UI/`.
> **Non riscrivere** l'handoff/§14 del Track B (li mantiene la sua sessione).

---

## 0. Come usare questo file

Sei un **agente senior** che ragiona con l'**owner** (ideatore, ha sviluppato con IA in solitaria;
competente di prodotto/UX, meno di codice profondo). Il tuo lavoro **non è scrivere codice app di
produzione**: è **ragionare, proporre e blindare** decisioni, e produrre **mockup HTML** che l'owner
possa *vedere*. Ordine di lettura:

1. **Questo file** (5 min).
2. **Masterplan §13** (direzione UI decisa) + **§0** (coordinamento parallelo) + §9–§12 (spina dorsale, esperienza, navigazione).
3. **`MOCKUP_UI/00_INDICE_MOCKUP.md`** + i 4 mockup: sono la **fonte di verità visiva** e il tuo punto di partenza (design tokens, pattern, voce). Riusali, non ripartire da zero.
4. (Opzionale) [`GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md`](./GUIDA_INTRODUTTIVA_AGENTE_SENIOR.md) per lo stato del codice legacy.

---

## 1. Contesto lampo

**BHM v.2** = PWA HACCP per ristoratori (React + TS + Vite + Supabase). È in corso un **RILANCIO**
(repo nuova pulita, riuso della logica contro schema DB corretto, **UI ricostruita ad hoc**, doc vecchi
in quarantena, skill-system pulito). Le sessioni senior **decidono a monte** perché una futura sessione
**Fable** (autonoma con subagents) **validi ed esegua**. Vedi masterplan §1.

---

## 2. Cosa è GIÀ deciso (non ri-litigare — rimanda al masterplan)

| Tema | Decisione | Rif. |
|------|-----------|------|
| Spina dorsale | loop **①IMPOSTO→②FACCIO→③CONTROLLO→④DIMOSTRO**; target = **titolare**; app = manuale operativo eseguibile | §9 |
| Esperienza | **delizia = ricompensa, mai attrito**; voce umana; zero attrito coi guanti; **3 gesti-firma** | §10 |
| Navigazione | 3 lenti 🕐**Oggi** · 🧭**Reparti** (solo assegnati) · 📦**Scorte** + 🎬**Regia** (titolare) | §12 |
| **Direzione UI** | **clinico-caldo** · accento **terracotta** · **responsive-everywhere** · **card-focus** · naming **Regia** | **§13** |

**I 3 gesti-firma** (già resi protagonisti nei mockup): 🌡️ *temperatura che atterra* · 💧 *form a cascata
che si scioglie* · 🔖 *timbro di fine turno*. **Ritmo cascata**: lento e didattico (§13.5).

---

## 3. Serie base già fatta (4/4 approvati) — il tuo materiale di partenza

In [`MOCKUP_UI/`](./MOCKUP_UI/) — HTML self-contained, **doppio uso**: fonte di verità UI **+** asset marketing/video.

| # | Schermata | File | Note |
|---|-----------|------|------|
| 1 | Oggi (dipendente) | `01_OGGI_dipendente.html` | card-focus · 🌡️ atterra · 🔖 timbro |
| 2 | Reparto (Cucina) | `02_REPARTO_cucina.html` | mappa punti · registra dallo spazio · assaggio 💧 |
| 3 | Form a cascata | `03_FORM_CASCATA.html` | 💧 opzioni che si sciolgono (ritmo lento) · sussurro HACCP · parametri pre-compilati |
| 4 | Regia (titolare) | `04_REGIA_titolare.html` | vista **tablet** · 🫧 respiro · 📦 dossier che si assembla · side-rail (unfold desktop) |

> **Regola di continuità**: riusa i **design token** e i pattern di questi file (palette, tipografia,
> card, chip, keypad, side-rail, voce dei testi). La coerenza è parte del valore — anche per il marketing.

---

## 4. Obiettivo delle PROSSIME sessioni UI

### 4.1 Rifiniture d'interazione (feedback owner già annotato — `MOCKUP_UI` → Note di interazione)
- **Rivelazione progressiva più lenta e in dissolvenza**, **senza auto-scroll brusco** (l'effetto attuale è troppo caotico). Vale per la cascata e ovunque un contenuto emerga.
- Mantenere il **ritmo lento** dello scioglimento (didattico).

### 4.2 Schermate ancora da mockup-are (ordine consigliato)
- ✅ **Onboarding titolare** — fatto (mockup 5 v2). Resta: applicare il **tempo calmo** alle animazioni (§13.6).
- 🔜 **Modal «profilo punto di conservazione»** nella **pagina Conservazione** — replicare il concetto profilo (attrezzatura → profilo → temperatura fissa + categorie) fuori dall'onboarding. _(residuo emerso dal feedback owner sul mockup 5.)_
1. **Onboarding / prima-volta del dipendente** — la North-Star §10.2: apre e *vede la sua cucina* (accoglienza, scoperta non-wizard). Sarà una versione **più corta** dell'onboarding titolare.
2. **Scorte** (📦) — inventario → lista spesa (filtri per reparto, checkbox, export).
3. **① Setup flows** dentro **Regia** — builder reparti/punti (schematico §12.3), staff & ruoli, parametri HACCP.
4. **Stati di eccezione/alert** — nastro gentile, note-eccezione, come emergono senza urlare.
5. **Reparti multipli** — switcher + mappa navigabile quando l'utente ha più reparti assegnati.

### 4.3 Poi — verso i componenti
Da mockup approvati → **componenti React riusabili**, con i token del §13 come base del design system. (Ancora ragionamento/prototipo qui; l'implementazione vera è materia Fable.)

### 4.4 Confini
- ❌ Non toccare codice app / schema DB / §14 / file skill-system. ❌ Non allargare lo scope prodotto (§5).
- ✅ Mockup **self-contained** (la sandbox Artifact blocca host esterni). Mobile-first + dispiegamento desktop.
- ✅ Idee fuori scope ma belle → annotale (masterplan §11 / ledger idee), non implementarle.
- ✅ Fork visivo vero → `AskUserQuestion` con la tua raccomandazione come prima opzione.

---

## 5. Questioni aperte pertinenti alla UI (tienile presenti)
- Editor mappa ristorante: builder strutturato (beta) vs disegno libero (roadmap) — §12.3.
- Come si presentano i procedimenti automatizzabili (skill Ristoratore) dentro la lente **Oggi** — dipende dal Track "skill/automazioni".
- Dettaglio **audit-grade** (quali campi mostrare nel dossier) — dipende dal Track compliance/DB.

---

## 6. Regole di ingaggio (come lavorare con l'owner)

1. **Ragiona-proponi-blinda**: raccomandazione chiara per prima, fai reagire, poi scrivi in §13 / aggiorna `MOCKUP_UI/`.
2. L'owner **ama fantasticare** e apprezza idee innovative — tieni il paletto anti-scope-creep e "delizia = ricompensa, mai attrito".
3. Cambia idea in trasparenza se l'owner porta info che sposta la valutazione.
4. Ogni mockup nuovo: **pubblicalo** (Artifact), **copialo in `MOCKUP_UI/`** con nome progressivo, aggiorna l'**indice** + §13.8.
5. **Memoria**: usa il file `rilancio-bhm-ui.md` (Track A). Il condiviso `rilancio-bhm-decisioni-fondo.md` è read-mostly (non scriverlo insieme al Track B).
6. **A fine sessione**: aggiorna §13/§13.8 + footer masterplan, e **riscrivi/estendi QUESTO handoff**. Un solo file di handoff per track.

---

**Ultimo aggiornamento**: 2026-07-06 · mockup 5 Onboarding titolare v2 pubblicato (5 feedback risolti) + mappa 7 step onboarding scritta prima della UI · regola globale **tempo animazioni calmo** (§13.6, polish pendente) · **Track B concluso** (anti-collisione rilassata) · prossimo: rallentare animazioni + modal profilo pagina Conservazione

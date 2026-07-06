# Visione strategica — sviluppo, vendita, manutenzione (lettura di Fable)

> **Cos'è**: la mia lettura strategica della piattaforma, lasciata come traccia su richiesta
> dell'owner (2026-07-06). Non è un piano vincolante: **chi esegue ≠ chi affina** — decide
> l'owner. Dove contraddice il masterplan, vince il masterplan.

---

## 0. La tesi in una frase

BHM non vende un registro HACCP digitale: vende **la tranquillità del titolare** («in caso di
controllo sono pronto, sempre») come **sottoprodotto del lavoro quotidiano** — e la dignità
del dipendente che «stacca la spina» sapendo che il suo lavoro è registrato. I concorrenti
digitalizzano la burocrazia; BHM la fa **sparire dentro i gesti**.

## 1. Il moat (cosa difenderà il prodotto quando qualcuno lo copierà)

1. **Audit-grade by-design**: append-only a livello di schema + fonte-unica regole versionata
   con change-control. Un competitor può copiare la UI in un mese; rifare le fondamenta
   probatorie su un prodotto già vivo è molto più costoso. È anche il biglietto d'ingresso
   per il percorso «registro ufficiale» con un ente.
2. **Il linguaggio d'esperienza** (3 gesti-firma): la temperatura che atterra, la cascata che
   insegna, il timbro che dà dignità. È identità, non feature — difficilissimo da copiare senza
   copiarne l'anima.
3. **Gli archetipi Ristoratore** (FU-003): onboarding che precompila la giornata-tipo reale di
   una pizzeria/bar/pasticceria. Più aziende entrano, più gli archetipi si affinano → volano
   dati-prodotto che i competitor generici non hanno.

## 2. Sviluppo — come costruire da qui alla beta (e oltre)

**Principio: profondità prima di larghezza.** I 3 gesti-firma fatti da vendere valgono più di
venti schermate complete a metà (§10.3). Ordine che raccomando (già in FOLLOW_UP):

1. Shell + auth solo-invito (FU-001) → 2. port Reparti+Oggi contro lo schema nuovo (FU-002,
   include lo **storno** che chiude la finestra di incoerenza col legacy) → 3. Scorte/Regia →
   4. dossier/export → 5. beta pilota.

**Regole di sviluppo che tengono la rotta:**
- Ogni feature passa le **due lenti** (Ufficiale × Ristoratore) PRIMA di essere costruita.
- Il registro (append-only, storno, timbro) ha **priorità sui polish UI**: è il valore legale.
- **Beta stretta, non self-serve aperto**: 5–10 attività pilota scelte, feedback settimanale,
  patto esplicito «gratis in cambio di feedback». Il self-serve arriva col pricing.
- Post-beta (fase 2, già decisa fuori scope): multi-sede, IA runtime, editor disegno libero,
  pagamenti. Non anticiparle mai «perché è comodo adesso».

## 3. Vendita — come la porterei sul mercato (Italia)

**Chi compra**: il titolare (§9.2). Compra tranquillità e tempo, non software.

**Canali, in ordine di leva:**
1. **Consulenti HACCP come moltiplicatori** — il canale che sbloccherei per primo. Il consulente
   ha già la fiducia di decine di ristoratori e OGGI fa fatica a raccogliere registri cartacei.
   Il dossier BHM gli fa fare bella figura all'audit. Offerta: dashboard multi-cliente (fase 2)
   + eventuale revenue share. Vende lui, per noi.
2. **Demo «dossier in 30 secondi»**: il momento-wow è ④ DIMOSTRO — video/demo in cui da una
   giornata di lavoro normale esce il dossier pronto per l'ispettore. È l'asset di marketing
   n.1 (i mockup HTML sono già pensati anche per questo, §13.8).
3. **Associazioni di categoria** (FIPE/Confcommercio locali, CNA): workshop «il controllo ASL
   senza ansia» → lead qualificati a costo quasi zero.
4. **Il percorso ente/certificazione** (§3 masterplan): se un ente valuta BHM come *metodo*,
   diventa il fossato commerciale definitivo. Da coltivare in parallelo, mai bloccante.

**Pricing (proposta, decide l'owner):** beta gratis col patto-feedback → SaaS per sede,
fascia **29–49 €/mese** (ancoraggio: una frazione del consulente/multa; ben sopra la soglia
«giocattolo»). Tier futuro «ispezione-ready plus» (retention estesa, export certificato,
multi-sede) a prezzo maggiore. Niente pagamenti in beta (già deciso).

**Posizionamento contro i competitor** (registri digitali esistenti): loro dicono «compila più
veloce i moduli»; BHM dice «**il tuo l'hai fatto** — la prova si scrive da sola». Compliance
come dignità, non come modulo.

## 4. Manutenzione — cosa terrà in piedi la piattaforma negli anni

1. **Le norme sono manutenzione programmata**, non evento: revisione fonti 2×/anno +
   monitoraggio Normattiva/EUR-Lex, tutto via Change-Control §14.3 (le regole `pending` →
   `certified` col percorso professionale). Il costo di manutenzione normativa è il vero
   costo ricorrente del prodotto: il change-control lo rende **prevedibile**.
2. **Ambienti**: oggi un solo DB (rischio n.1 in revisione). Primo cliente reale ⇒ staging
   separato + backup automatici **con test di restore** (un backup mai ripristinato non è
   un backup). Budget: Supabase Pro (~25 $/m) + Vercel — infra < 50 €/mese in beta.
3. **Dipendenze snelle**: il dead code legacy (~30% dei servizi) è il monito. Regola: entra
   solo ciò che serve a una feature in scope; bump trimestrale con `validate`; `npm audit` a 0.
4. **Observability**: Sentry al primo deploy; il logger di progetto è già il punto d'aggancio.
   Runbook incidenti semplice: sintomo → dove guardare (Sentry/log Postgres/status Supabase) →
   chi decide (owner).
5. **Conoscenza**: il sistema documentale (skill-system, footer-tracciabilità, checkpoint,
   report) È la strategia di manutenzione della conoscenza — mantiene sostituibili gli agenti
   e ripartibili le sessioni. Va tenuto vivo come il codice (sessioni Meta periodiche).
6. **GDPR/dati**: minimizzazione già by-design (solo orario, niente geo). Al primo utente
   esterno servono: informativa privacy, DPA Supabase (già disponibile), registro trattamenti
   basico. Costo piccolo se fatto presto, grande se rimandato.

## 5. I tre rischi che sorveglierei

| Rischio | Mitigazione |
|---------|-------------|
| **Scope creep** (la tentazione di «già che ci siamo») | le due lenti + §5 fuori-beta + questa regola scritta ovunque |
| **Compliance percepita come «non ufficiale»** | trasparenza sullo stato `pending`/`certified` + percorso professionista avviato presto |
| **Il DB unico** finché non c'è staging | dry-run + autorizzazione owner a ogni push + backup pre-push (M2 revisione) |

---

**Ultimo aggiornamento**: 2026-07-06 · prima stesura (richiesta owner) · → `docs/meta/REVISIONE_FONDAMENTA_2026-07-06.md`

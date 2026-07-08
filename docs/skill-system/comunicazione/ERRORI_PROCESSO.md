# ERRORI_PROCESSO — pattern di errore ricorrenti

> Indice dei pattern di errore (non i singoli bug: quelli stanno nei report). Serve all'agente
> Meta per individuare cause sistemiche e proporre correzioni. Ogni report di sessione, nella
> sezione «Derivazione errori», appende qui i pattern che si ripetono.

---

## Tassonomia delle cause

Ogni errore/difficoltà va classificato in una di queste:

| Causa | Significato |
|-------|-------------|
| **bug preesistente** | C'era già nel codice prima del task (citare file). |
| **prompt ambiguo/incompleto** | La richiesta lasciava spazio a interpretazioni o conteneva intenti contraddittori. |
| **errore agente** | Interpretazione sbagliata, tentativo evitabile, scelta tecnica non ottimale. |
| **vincolo strutturale** | Un LOCK / comportamento / architettura preesistente ha bloccato un approccio. |

---

## Pattern ricorrenti

| # | Pattern | Causa tipica | × | Correzione adottata | Stato |
|---|---------|--------------|---|---------------------|-------|
| P1 | {{descrizione pattern}} | {{causa}} | {{n}} | {{come si è evitato}} | {{aperto/risolto}} |

> Quando un pattern si ripete, l'agente Meta valuta se serve una nuova regola nella Bussola o una
> voce di vocabolario per prevenirlo.

---

## Log (cronologia append dai report)

- 15-06-26 — **Apostrofi italiani in stringhe a singola virgoletta**: costanti esportate con `l'ora` / `un'altra` dentro `'...'` generano 26 errori TypeScript (unterminated string). Correzione: usare `"..."` o template literal per testo italiano con apostrofi. Causa: errore agente.
- 15-06-26 — **`not.toContain` su classi CSS vs contenuto body**: asserzione `expect(html).not.toContain('info-box')` fallisce perché la classe compare nel `<style>` di `BASE_STYLE` oltre che nel body. Correzione: scegliere token specifici del blocco che si vuole assente (es. `summary-block` invece di `info-box`). Causa: errore agente.
- 08-07-26 — **Timestamp client vs default server in un CHECK**: insert con `opened_at = new Date()` (client) e `closed_at DEFAULT now()` (server) viola `shift_seals_period_check` quando l'orologio client è avanti — un test passato «per caso» al primo giro (CP9) è fallito al secondo. Correzione: mai confrontare orologio client con default server; retrodatare o passare entrambi i lati. Causa: bug preesistente (script `verify-flows.mjs`).
- 08-07-26 — **Strict-mode Playwright coi Sheet montati fuori schermo**: `Sheet.tsx` resta nel DOM da chiuso (transizione) → `getByText` pesca testo di sheet «invisibili» (2 casi nella stessa sessione). Correzione: scopare i locator sul `getByRole('dialog', { name: … })` dello sheet aperto. Causa: vincolo strutturale.
- 08-07-26 (pom.) — **GoTrue valida i domini email**: signup/invito pubblici rifiutano indirizzi con dominio finto (`…@t.com` → `email_address_invalid`), mentre l'admin API li accetta — i flussi auth pubblici NON si testano con gli utenti-test fittizi; serve un'inbox vera (`INVITE_TEST_EMAIL`). Causa: vincolo strutturale.
- 08-07-26 (pom.) — **Spread di `options` dopo `headers` composti** (script fetch): `{ headers: {…default}, ...options }` fa vincere gli header di `options` e cancella l'apikey → 401 fuorviante «No API key». Correzione: destrutturare `headers` da `options` e fonderli esplicitamente. Causa: errore agente.

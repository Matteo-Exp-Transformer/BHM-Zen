# AGGIORNAMENTI_HACCP — ledger richieste di aggiornamento regole (input umano/normativo)

> **Ingresso unico** delle richieste di modifica alle regole HACCP (masterplan §14.3).
> Chiunque (owner, professionista, agente che scopre una norma nuova) **annota qui**;
> l'**agente-ufficiale** (gate 1) la traduce in modifica strutturata a
> `src/compliance/haccp-rules.ts` (bump `version` + `effective_from`, mai sovrascrivere la
> storia) → gate 2 (test macchina) → gate 3 (owner/professionista). Vedi
> `context/COMPLIANCE_CONTEXT.md` §2.

## Formato voce

```
### GG-MM-AAAA — <oggetto breve>
- **Richiesta:** cosa cambiare/aggiungere e perché
- **Fonte:** link/riferimento normativo (se c'è)
- **Richiesto da:** owner | professionista | agente (sessione)
- **Stato:** 📥 aperta → 🔧 proposta (gate 1) → ✅ entrata (gate 2+3 ok) | ❌ respinta
```

---

## Voci

*(ancora nessuna — il ledger si riempie dall'uso)*

---

**Ultimo aggiornamento**: 2026-07-06 · creazione ledger (installazione §14.5) · → sessione Fable CP3 (git log)

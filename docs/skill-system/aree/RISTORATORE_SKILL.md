---
name: ristoratore
description: >-
  Skill-consulente 👨‍🍳 (lente operativa, dev-time). Caricala per capire se una feature serve
  davvero in cucina: instanzia un'azienda-X concreta, simula la giornata-tipo, estrae mansioni
  ricorrenti e marca cosa è automatizzabile. Motore di scoperta dei bisogni operativi reali.
---

# 👨‍🍳 RISTORATORE — Skill-consulente (lente operativa)

> **Comportamento profondo (fonte unica):** [`docs/meta/DESIGN_SKILL_CONSULENTI.md`](../../meta/DESIGN_SKILL_CONSULENTI.md) §1
> — input azienda-X, processo in 4 passi, postura, output catalogo+invocabile, 6 archetipi beta.
> Questo file è la collocazione + il riassunto operativo; non duplica il design.

## 0. Quando caricare questa skill

| Il task riguarda… | Skill |
|-------------------|-------|
| validare una feature dal lato operativo («si fa coi guanti alle 18?») | **questa** (+ Ufficiale: gate a due lenti) |
| generare mansioni-tipo / default onboarding / calendario diario | **questa** (catalogo archetipi) |
| conformità normativa | `UFFICIALE_HACCP_SKILL.md` |

## 1. In una frase

Il **motore di scoperta dei bisogni operativi reali**: non dice cosa è a norma — dice *cosa
succede davvero in cucina e cosa possiamo automatizzare*.

## 2. Come opera (riassunto — dettaglio nel design §1.2)

1. **Instanzia** un'azienda concreta: *«Trattoria da Mario, 40 coperti, 3 persone, cucina+sala+magazzino»*.
2. **Simula la giornata-tipo** per ruolo e reparto: apertura → mise en place → servizio → chiusura.
   Include **l'eccezione** (giorno di casino, task saltato), non solo lo scenario ideale.
3. **Estrae le mansioni ricorrenti**: `chi · dove (reparto) · quando (freq.) · perché (operativo | HACCP)`.
4. **Marca l'automatizzabile**: ripetibile/strutturale → candidato automazione (es. lista spesa).

## 3. Limiti VOLUTI — non «aggiustarli»

- **Zero-attrito come filtro** (§9.4): «un cuoco in servizio non ha 3 minuti per un form».
- **Scenari plausibili, non ottimistici**: mette in conto il dipendente che salta un passaggio.
- **Non inventa obblighi normativi**: il «è obbligatorio?» lo gira all'Ufficiale-HACCP.
- **Output = dati/proposte in ledger, mai auto-adozione**: promuove l'owner/Meta.

## 4. Catalogo archetipi (asset versionato — da costruire)

Casa: `aree/ARCHETIPI/` — un file per archetipo, **6 confermati** (design §1.5):
trattoria · pizzeria · bar/caffetteria · pasticceria/gelateria · pub/birreria ·
cocktailbar/restaurant. Alimentano i **default di onboarding** e il **calendario diario-di-lavoro**.
Stato: cartella da popolare (track dedicato, non «di passaggio»).

## 5. LOCK di area

```
RULE  ogni mansione proposta passa il filtro zero-attrito §9.4 PRIMA di entrare nel catalogo
RULE  le mansioni scoperte vanno in ledger/archetipi come PROPOSTE; le promuove owner/Meta
```

## 6. Mappa

| Se il task tocca… | Apri |
|-------------------|------|
| un archetipo esistente | `aree/ARCHETIPI/<archetipo>.md` |
| conformità/norme | `aree/UFFICIALE_HACCP_SKILL.md` |
| il calendario/mansioni in app | `aree/OGGI_SKILL.md` |

---

**Ultimo aggiornamento**: 2026-07-06 · scaffolding iniziale (installazione §14.5; comportamento profondo già in DESIGN_SKILL_CONSULENTI §1) · → sessione Fable CP3 (git log)

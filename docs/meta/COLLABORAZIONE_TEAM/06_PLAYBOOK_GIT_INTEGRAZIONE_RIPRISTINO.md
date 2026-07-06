# Playbook git — integrazione, ripristino, conflitti, problemi di team

> **Stato**: 🟢 v1 · **Track**: C · Setup iniziale (una volta) + guida per quando qualcosa va storto.
> Scritto per **GitHub**. I comandi sono da adattare al nome reale della repo nuova.
> ⚙️ Fable può irrobustire (PR-per-task, CI, protezioni formali) — **tranne** l'invariante «`main`
> protetto, solo owner promuove».

---

## 1. Topologia (ricapitolo operativo)

```
feature/<task>  ──push (collaboratore)──▶  integrazione  ──promozione (SOLO owner)──▶  main
   usa e getta         canale sicuro pre-main: integri e verifichi tu     produzione, sacro
```

| Branch | Chi ci scrive | Protezione |
|--------|---------------|------------|
| `main` | **solo owner** (+ suoi modelli) | massima: no push diretto, no force-push, no delete |
| `integrazione` | **solo owner** integra qui (i collaboratori NON mergiano) | push diretto **owner-only** |
| `feature/*` | il collaboratore proprietario del task | libero (branch corto, usa e getta) |

---

## 2. Setup iniziale (una volta, sulla repo nuova) — per l'owner o per Fable

### 2.1 Creare i branch base
```bash
# partendo da main già esistente sulla repo nuova
git checkout main
git pull
git checkout -b integrazione     # crea il canale pre-main
git push -u origin integrazione
```

### 2.2 Proteggere `main` e `integrazione` (GitHub → Settings → Branches → Add rule)
Per **`main`**:
- ✅ Require a pull request before merging (così anche tu passi da una PR di promozione)
- ✅ Restrict who can push → **solo l'owner**
- ✅ Do not allow force pushes · ✅ Do not allow deletions
- (opzionale, quando c'è CI) ✅ Require status checks to pass

Per **`integrazione`**:
- ✅ Restrict who can push → **solo l'owner** (i collaboratori pushano `feature/*`, non qui)
- ✅ Do not allow force pushes

Comando equivalente via `gh` (esempio, adatta owner/repo):
```bash
gh api -X PUT repos/{{owner}}/{{repo}}/branches/main/protection \
  -f "required_pull_request_reviews[required_approving_review_count]=0" \
  -F "enforce_admins=false" -F "restrictions[users][]={{owner-github-login}}" \
  -F "allow_force_pushes=false" -F "allow_deletions=false"
```

### 2.3 Permessi collaboratori
- Ruolo GitHub: **Write** (possono creare `feature/*` e pushare), **non** Admin.
- Le protezioni su `main`/`integrazione` impediscono comunque loro di toccarli. **Un merge di troppo
  per sbaglio da parte loro atterra al massimo su `integrazione`** (o è bloccato), **mai su `main`**.

---

## 3. Ciclo di un task (comandi)

### 3.1 Il collaboratore apre il branch e lavora
```bash
git checkout integrazione && git pull          # parte SEMPRE da integrazione aggiornato
git checkout -b feature/<task>
# ...lavora, commit piccoli e frequenti...
git push -u origin feature/<task>              # consegna = push (NON mergia niente)
```

### 3.2 L'owner integra (dopo i 4 controlli, gate ③ ok)
Opzione A — **via PR** (consigliata, superficie di review/commenti; la apri **tu**):
```bash
gh pr create --base integrazione --head feature/<task> --title "<task>" --body "vedi report"
# leggi il diff, commenta; poi:
gh pr merge feature/<task> --squash --delete-branch
```
Opzione B — **locale** (più veloce, meno tracciabile):
```bash
git checkout integrazione && git pull
git merge --no-ff feature/<task>               # --no-ff tiene un commit di merge tracciabile
git push
git push origin --delete feature/<task>        # branch usa e getta: eliminalo
```

### 3.3 Verifica sull'insieme (in `integrazione`, non sul singolo)
```bash
git checkout integrazione && git pull
{{npm run build}} && {{npm run type-check}} && {{npm run lint}} && {{npm run test}}
```
È qui che emergono i conflitti tra i lavori di **due** persone. Si risolvono **qui**, non in produzione.

### 3.4 Promozione a `main` (SOLO owner, quando integrazione è verde e sei convinto)
```bash
gh pr create --base main --head integrazione --title "promozione <data/milestone>"
gh pr merge --merge                            # promozione deliberata, a lotti
```

---

## 4. Ripristino & recupero (punto D) ⭐

> Regola aurea: **`main` non si "aggiusta" a mano.** Se qualcosa è rotto, si **revert-a** (nuovo commit
> che annulla), non si riscrive la storia con force-push.

| Situazione | Cosa fai |
|------------|----------|
| Un merge in `integrazione` era sbagliato | `git revert -m 1 <hash-merge>` su `integrazione` + push. Il branch feature resta, lo si rilavora. |
| È finito qualcosa di rotto in `main` | `git revert -m 1 <hash>` su `main` (via PR di promozione). **Mai** `reset --hard`+force su main. |
| Voglio annullare più commit recenti in `integrazione` | `git revert <hash1> <hash2> …` (uno per uno, storia pulita) |
| `integrazione` è troppo incasinato | crea `integrazione-2` da `main` (l'ultimo stato buono) e re-integra i `feature/*` uno a uno |
| Ho perso un branch/commit | `git reflog` → trovi l'hash → `git checkout -b recupero <hash>` |
| Voglio un punto di ritorno sicuro prima di una promozione rischiosa | `git tag pre-promo-<data>` su `main` prima di promuovere → torni lì con un checkout se serve |

**Backup mentale**: `main` = l'ultimo stato buono conosciuto. Finché le promozioni sono deliberate e a
lotti (§3.4), `main` è sempre un porto sicuro a cui tornare.

---

## 5. Conflitti (di merge e di persone)

### 5.1 Conflitti git tra due branch
- Nascono quando due `feature/*` toccano le stesse righe. **Emergono in `integrazione`** (per questo
  esiste): risolvili lì con calma, `main` non è coinvolto.
- **Prevenzione**: task su **file disgiunti** quando possibile (i confini §3 del Mandato servono anche
  a questo). Branch **corti**: meno vive un branch, meno diverge.
- Se due task devono toccare lo stesso file → **serializzali** (prima uno, poi l'altro riparte da
  `integrazione` aggiornato), non parallelizzarli.

### 5.2 Conflitti tra persone
- **«Chi ha ragione» lo decide il diff + il flusso, non il tono.** Come la CONTROVERIFICA: si pesa il
  lavoro contro l'obiettivo e gli invarianti, non contro chi l'ha detto più forte.
- Se due consegne si contraddicono → **tu** sei l'integratore: decidi quale regge nel flusso, l'altra
  torna al mittente con un prompt grezzo (§05). La decisione è **tua e tracciata** (nel commit/PR).
- Se un collaboratore va ripetutamente fuori scope → non è un problema di persona, è un problema di
  **confine**: stringi il Mandato o passa a OdL (manuale §4.3).

---

## 6. Igiene continua

- **Branch corti e usa e getta**: cancella `feature/*` dopo il merge (`--delete-branch`).
- **Commit piccoli e frequenti** sul branch: rende revert e review chirurgici.
- **`integrazione` allineato a `main`**: dopo ogni promozione, riallinea (`git checkout integrazione &&
  git merge main`) così i nuovi branch partono da una base fresca.
- **Un task = un branch = un documento di delega = un report.** Non mescolare due task in un branch.

---

**Ultimo aggiornamento**: 2026-07-06 · v1. Topologia a canale sicuro `integrazione`, protezioni GitHub,
ripristino via revert (mai force su main), conflitti risolti in `integrazione`.

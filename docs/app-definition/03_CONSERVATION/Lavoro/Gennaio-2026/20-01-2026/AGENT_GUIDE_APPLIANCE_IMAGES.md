# GUIDA AGENTE: Debug & Implementazione Immagini Elettrodomestici
## Conservation Feature - Appliance Images System
**Creato**: 2026-01-20
**Ultima modifica**: 2026-01-20
**Status**: ATTIVO

---

## PANORAMICA SISTEMA

### Cos'è questa feature?

Quando un utente crea un punto di conservazione di tipo "Frigorifero" e seleziona un profilo HACCP, il form mostra un **layout split** con:
- **Colonna Sinistra**: Lista categorie prodotti del profilo HACCP selezionato
- **Colonna Destra**: Immagine dell'elettrodomestico (cliccabile per fullscreen)

### File coinvolti

```
src/
├── config/
│   └── applianceImages.ts               ← Config centralizzata paths immagini
├── utils/
│   └── conservationProfiles.ts          ← Tipi e profili HACCP
└── features/conservation/components/
    └── AddPointModal.tsx                ← UI form con layout split

public/
└── images/conservation/appliances/
    └── vertical-fridge-with-freezer/
        └── main.png                     ← Immagine frigorifero (445KB)
```

---

## ARCHITETTURA

### 1. Configurazione Centralizzata (`applianceImages.ts`)

**Perché esiste**: Evita path hardcoded sparsi nel codice.

```typescript
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
}

export function getApplianceImagePath(category: ApplianceCategory): string | null {
  return APPLIANCE_IMAGE_PATHS[category] ?? null
}

export function hasApplianceImage(category: ApplianceCategory): boolean {
  return category in APPLIANCE_IMAGE_PATHS
}
```

**Key Points**:
- `APPLIANCE_IMAGE_PATHS`: Mappa `ApplianceCategory` → path immagine
- `getApplianceImagePath()`: Ritorna path o `null` se non configurato
- `hasApplianceImage()`: Verifica se categoria ha immagine

### 2. Layout Split (`AddPointModal.tsx`)

**Condizione di visualizzazione** (linea 1283-1286):
```typescript
{formData.pointType === 'fridge' &&
 formData.applianceCategory &&
 formData.profileId &&
 selectedProfile && (
  // Layout split qui...
)}
```

**Layout a 2 colonne** (linea 1293-1355):
- Grid responsive: `grid-cols-1 md:grid-cols-2`
- Mobile: Stack verticale
- Desktop: Affiancate

**Preview Immagine** (linea 1315-1344):
- Usa `OptimizedImage` per lazy loading
- Click/Enter/Space → apre modal lightbox
- Hover → overlay "Clicca per ingrandire"
- Error handling → fallback UI

**Modal Lightbox** (linea 1331-1347):
- Usa `<img>` standard (NON `OptimizedImage`)
- **Motivo**: `OptimizedImage` ha `objectFit: cover` hardcoded
- `object-contain` necessario per mostrare immagine intera

### 3. State Management

```typescript
const [isImageModalOpen, setIsImageModalOpen] = useState(false)
const [imageError, setImageError] = useState(false)
```

**Reset errore quando cambia categoria** (linea 782-785):
```typescript
useEffect(() => {
  setImageError(false)
}, [formData.applianceCategory])
```

---

## COME AGGIUNGERE NUOVA CATEGORIA

### Esempio: Aggiungere "Frigorifero Monoporta"

#### STEP 1: Aggiornare tipo TypeScript

**File**: `src/utils/conservationProfiles.ts` (linea 3)

```diff
 export type ApplianceCategory =
   | 'vertical_fridge_with_freezer'
+  | 'single_door_fridge'
```

#### STEP 2: Aggiungere label UI

**File**: `src/utils/conservationProfiles.ts` (linea 240-242)

```diff
 export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
   vertical_fridge_with_freezer: 'Frigorifero Verticale con Freezer',
+  single_door_fridge: 'Frigorifero Monoporta',
 }
```

#### STEP 3: Creare cartella e immagine

```bash
# Crea cartella
mkdir -p public/images/conservation/appliances/single-door-fridge/

# Copia immagine (deve chiamarsi main.png)
cp path/to/your/image.png public/images/conservation/appliances/single-door-fridge/main.png
```

**Convenzioni naming**:
- Cartella: `kebab-case` (es. `single-door-fridge`, `chest-freezer`)
- File: SEMPRE `main.png`

**Formato immagine consigliato**:
- PNG con sfondo trasparente
- Dimensioni: 800x600px o simile (ratio 4:3)
- Peso: < 500KB

#### STEP 4: Aggiornare configurazione paths

**File**: `src/config/applianceImages.ts` (linea 12-17)

```diff
 export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
   vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
+  single_door_fridge: '/images/conservation/appliances/single-door-fridge/main.png',
 }
```

#### STEP 5: Aggiungere profili HACCP (opzionale)

**File**: `src/utils/conservationProfiles.ts` (linea 70-194)

```diff
 export const CONSERVATION_PROFILES: Record<ApplianceCategory, ConservationProfile[]> = {
   vertical_fridge_with_freezer: [...],
+  single_door_fridge: [
+    {
+      profileId: 'single_door_standard',
+      name: 'Profilo Standard Monoporta',
+      applianceType: 'Frigorifero Monoporta',
+      recommendedSetPointsC: { fridge: 4 },
+      allowedCategoryIds: ['rte', 'dairy', 'produce'],
+      compartmentFill: {
+        // ... configurazione scomparti ...
+      },
+      haccpNotes: [
+        'Note specifiche per frigorifero monoporta',
+      ],
+    }
+  ],
 }
```

**Nota**: Se non aggiungi profili HACCP, la categoria sarà selezionabile ma senza profili disponibili.

#### STEP 6: Verifica

```bash
# Type check
npm run type-check

# Build
npm run build

# Dev server
npm run dev
```

**Test manuale**:
1. Apri Conservation → "Aggiungi Punto"
2. Seleziona Tipologia: "Frigorifero"
3. Seleziona Categoria: "Frigorifero Monoporta"
4. Verifica immagine visibile nella colonna destra
5. Click immagine → verifica modal lightbox
6. Verifica responsive (mobile/desktop)

---

## DEBUG COMMON ISSUES

### ❌ Immagine non si carica (mostra fallback)

**Sintomi**: Vedi icona termometro e "Immagine non disponibile"

**Causa 1: Path sbagliato**
```typescript
// ❌ SBAGLIATO (path assoluto Windows)
vertical_fridge_with_freezer: 'C:/Users/.../public/images/...'

// ✅ CORRETTO (path relativo da public/)
vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png'
```

**Causa 2: File non esiste**
```bash
# Verifica file esista
ls -la public/images/conservation/appliances/vertical-fridge-with-freezer/main.png

# Output atteso: file da ~445KB
-rw-r--r-- 1 user group 445K Jan 20 23:34 main.png
```

**Causa 3: Nome file sbagliato**
```bash
# ❌ SBAGLIATO
main.jpg
image.png
fridge.png

# ✅ CORRETTO
main.png
```

**Fix**:
1. Verifica path in `applianceImages.ts` inizi con `/`
2. Verifica file esista in `public/images/...`
3. Rinomina file in `main.png` se necessario
4. Restart dev server

---

### ❌ Modal lightbox mostra immagine cropppata

**Sintomi**: Immagine tagliata ai bordi invece di essere visibile intera

**Causa**: Hai usato `OptimizedImage` nel modal invece di `<img>`

**Fix**:
```tsx
{/* ❌ SBAGLIATO - OptimizedImage ha objectFit: cover hardcoded */}
<OptimizedImage
  src={getApplianceImagePath(category)!}
  className="max-w-full max-h-[80vh] object-contain"
/>

{/* ✅ CORRETTO - img standard permette object-contain */}
<img
  src={getApplianceImagePath(category)!}
  alt="..."
  className="max-w-full max-h-[80vh] object-contain"
/>
```

**Perché**: `OptimizedImage.tsx` (linea 66-70) ha style inline:
```typescript
style={{
  width: '100%',
  height: '100%',
  objectFit: 'cover',  // ← Questo vince su className
}}
```

---

### ❌ Layout split non appare quando seleziono frigorifero

**Sintomi**: Continuo a vedere la sezione categorie standard

**Causa**: Condizione non soddisfatta

**Debug**:
```typescript
// Verifica tutte le condizioni siano true
console.log('pointType:', formData.pointType)              // deve essere 'fridge'
console.log('applianceCategory:', formData.applianceCategory)  // deve esistere
console.log('profileId:', formData.profileId)              // deve esistere
console.log('selectedProfile:', selectedProfile)           // deve essere oggetto
```

**Fix**:
1. Verifica di aver selezionato "Frigorifero" in Tipologia
2. Verifica di aver selezionato una categoria elettrodomestico
3. Verifica di aver selezionato un profilo HACCP
4. Se persiste, verifica `selectedProfile` useMemo (linea 667-673)

---

### ❌ TypeScript error: Type 'X' is not assignable to type 'ApplianceCategory'

**Sintomi**:
```
error TS2322: Type '"my_new_category"' is not assignable to type 'ApplianceCategory'.
```

**Causa**: Hai aggiunto path in `applianceImages.ts` ma non hai aggiornato il tipo in `conservationProfiles.ts`

**Fix**:
```typescript
// STEP 1: Aggiorna tipo PRIMA
// File: src/utils/conservationProfiles.ts
export type ApplianceCategory =
  | 'vertical_fridge_with_freezer'
  | 'my_new_category'  // ← Aggiungi qui

// STEP 2: Poi aggiungi path
// File: src/config/applianceImages.ts
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '...',
  my_new_category: '/images/...',  // ← TypeScript ora accetta
}
```

---

### ❌ Immagine non responsive su mobile

**Sintomi**: Immagine troppo grande su mobile

**Causa**: Grid non stack su mobile

**Verifica**:
```tsx
{/* Deve essere grid-cols-1 su mobile, md:grid-cols-2 su desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Fix**: Se manca `grid-cols-1`, aggiungerlo per stack su mobile.

---

## BEST PRACTICES

### 1. Naming Conventions

| Elemento | Convenzione | Esempio |
|----------|-------------|---------|
| Cartella immagini | `kebab-case` | `vertical-fridge-with-freezer/` |
| File immagine | `main.png` | `main.png` |
| Tipo TypeScript | `snake_case` | `vertical_fridge_with_freezer` |
| Label UI | Italiano Maiuscolo | `Frigorifero Verticale con Freezer` |

### 2. Workflow Aggiunta Categoria

**Ordine corretto**:
1. ✅ Aggiorna tipo `ApplianceCategory` PRIMA
2. ✅ Aggiungi label in `APPLIANCE_CATEGORY_LABELS`
3. ✅ Crea cartella e immagine
4. ✅ Aggiungi path in `applianceImages.ts`
5. ✅ (Opzionale) Aggiungi profili HACCP
6. ✅ Type check + Build + Test

**Ordine sbagliato** (causa errori TypeScript):
1. ❌ Aggiungi path in `applianceImages.ts` PRIMA
2. ❌ Poi aggiungi tipo → TypeScript errore su path già aggiunto

### 3. Gestione Immagini

**DO**:
- ✅ Usa PNG con sfondo trasparente
- ✅ Ottimizza peso < 500KB
- ✅ Ratio 4:3 o simile (800x600px)
- ✅ Nomi descrittivi per cartelle

**DON'T**:
- ❌ Non usare JPEG (perdita qualità su sfondo)
- ❌ Non usare immagini > 1MB (performance)
- ❌ Non usare nomi file diversi da `main.png`
- ❌ Non usare path assoluti in config

### 4. Accessibilità

**Keyboard navigation**:
```tsx
{/* ✅ Supporta Tab + Enter/Space */}
<div
  onClick={() => setIsImageModalOpen(true)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsImageModalOpen(true)
    }
  }}
  aria-label="Clicca per ingrandire l'immagine dell'elettrodomestico"
>
```

**Screen reader**:
- ✅ `alt` descrittivo su immagini
- ✅ `aria-label` su elementi interattivi
- ✅ `role="button"` su div cliccabili

---

## STRUTTURA DATI

### ApplianceCategory (Type)

```typescript
export type ApplianceCategory =
  | 'vertical_fridge_with_freezer'
  // Aggiungi nuove qui
```

**Dove usato**:
- `conservationProfiles.ts`: Tipo per profili
- `applianceImages.ts`: Record key
- `AddPointModal.tsx`: State `formData.applianceCategory`
- Database: Colonna `appliance_category` in `conservation_points`

### ConservationProfile (Interface)

```typescript
export interface ConservationProfile {
  profileId: ConservationProfileId        // ID univoco profilo
  name: string                            // Nome UI
  applianceType: string                   // Descrizione tipo
  recommendedSetPointsC: {                // Temperature consigliate
    fridge: number
    freezer?: number
  }
  allowedCategoryIds: string[]            // Categorie prodotti ammesse
  compartmentFill: Record<string, string[]>  // Mapping scomparti → categorie
  haccpNotes: string[]                    // Note HACCP per utente
}
```

### APPLIANCE_IMAGE_PATHS (Config)

```typescript
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  // Key: ApplianceCategory (snake_case)
  // Value: Path relativo da public/ (inizia con /)
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
}
```

---

## TESTING CHECKLIST

### Test Visuale

- [ ] Seleziona Frigorifero in Tipologia
- [ ] Seleziona categoria elettrodomestico
- [ ] Seleziona profilo HACCP
- [ ] Verifica layout split appare
- [ ] Verifica categorie profilo a sinistra
- [ ] Verifica immagine a destra
- [ ] Hover immagine → verifica overlay
- [ ] Click immagine → verifica modal apre
- [ ] Verifica immagine fullscreen in modal
- [ ] Esc chiude modal
- [ ] Click overlay chiude modal
- [ ] Click X chiude modal

### Test Keyboard

- [ ] Tab fino all'immagine
- [ ] Enter apre modal
- [ ] Tab fino all'immagine di nuovo
- [ ] Space apre modal
- [ ] Esc chiude modal
- [ ] Tab all'interno del modal (focus trap)

### Test Responsive

- [ ] Desktop (>768px): Layout affiancato
- [ ] Mobile (<768px): Layout stack verticale
- [ ] Tablet: Verifica breakpoint

### Test Error Handling

- [ ] Rinomina immagine temporaneamente
- [ ] Verifica fallback UI appare
- [ ] Ripristina immagine
- [ ] Refresh → verifica immagine riappare

### Test Performance

- [ ] Network throttling 3G → verifica lazy loading
- [ ] Verifica placeholder durante caricamento
- [ ] Verifica transizione opacità smooth

---

## PUNTI DI ATTENZIONE

### 1. OptimizedImage vs `<img>` Standard

| Contesto | Componente | Motivo |
|----------|-----------|--------|
| Preview (colonna destra) | `OptimizedImage` | Lazy loading, stati loading/error |
| Modal lightbox | `<img>` standard | `object-contain` necessario, immagine già caricata |

### 2. Path Immagini

**SEMPRE** inizia con `/` (path relativo da `public/`):
```typescript
// ✅ CORRETTO
'/images/conservation/appliances/vertical-fridge-with-freezer/main.png'

// ❌ SBAGLIATO
'images/conservation/appliances/...'         // Manca /
'./images/conservation/appliances/...'       // Manca /
'public/images/conservation/appliances/...'  // Include public
```

**Perché**: Vite serve `public/` come root. Path `/images/...` risolve a `public/images/...`.

### 3. Condizione Visibilità Layout Split

**Tutte e 4** devono essere `true`:
```typescript
formData.pointType === 'fridge'        // Tipo punto è frigorifero
formData.applianceCategory             // Categoria elettrodomestico selezionata
formData.profileId                     // Profilo HACCP selezionato
selectedProfile                        // Profilo trovato e caricato
```

**Quando manca anche solo una**, si vede la sezione categorie standard.

---

## ESTENSIONI FUTURE

### 1. Supporto Multiplo Immagini per Profilo

**Scenario**: Ogni profilo ha immagine diversa che mostra disposizione prodotti.

**Implementazione**:
```typescript
// Config estesa
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, Record<ConservationProfileId, string>> = {
  vertical_fridge_with_freezer: {
    max_capacity: '/images/.../max-capacity.png',
    meat_generic: '/images/.../meat-generic.png',
  }
}

// Getter aggiornato
export function getApplianceImagePath(
  category: ApplianceCategory,
  profileId?: ConservationProfileId
): string | null {
  const categoryPaths = APPLIANCE_IMAGE_PATHS[category]
  if (!profileId) return categoryPaths?.default ?? null
  return categoryPaths?.[profileId] ?? categoryPaths?.default ?? null
}
```

### 2. Image Gallery (Carousel)

**Scenario**: Mostrare multiple immagini (fronte/retro/interno).

**Implementazione**:
- Rinomina `main.png` → `01-front.png`, `02-back.png`, `03-inside.png`
- Config: `string` → `string[]`
- UI: Aggiungi carousel controls (< >)

### 3. Video Tutorial

**Scenario**: Mostrare video YouTube su come organizzare frigorifero.

**Implementazione**:
- Aggiungi field `videoUrl` in `ConservationProfile`
- Modal con tab "Immagine" / "Video Tutorial"
- Embed YouTube iframe

---

## FILE DI RIFERIMENTO

### Codice Completo

**applianceImages.ts** (33 righe):
```typescript
import type { ApplianceCategory } from '@/utils/conservationProfiles'

export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
}

export function getApplianceImagePath(category: ApplianceCategory): string | null {
  return APPLIANCE_IMAGE_PATHS[category] ?? null
}

export function hasApplianceImage(category: ApplianceCategory): boolean {
  return category in APPLIANCE_IMAGE_PATHS
}
```

**AddPointModal.tsx** (Sezioni rilevanti):
- Import: Linee 39-41
- State: Linee 549-550
- useEffect reset: Linee 782-785
- Condizione sezione categorie: Linea 1212
- Layout split: Linee 1282-1357
- Modal lightbox: Linee 1331-1347

**conservationProfiles.ts**:
- Tipo `ApplianceCategory`: Linea 3
- Labels: Linee 240-242
- Profili: Linee 70-194

---

## CHANGELOG

| Data | Versione | Modifiche |
|------|----------|-----------|
| 2026-01-20 | 1.0.0 | Creazione guida iniziale |

---

## SUPPORTO

**Per dubbi o problemi**:
1. Verifica [00_MASTER_INDEX_CONSERVATION.md](../00_MASTER_INDEX_CONSERVATION.md)
2. Controlla [Plan_Foto_PuntiConservazione.md](./Plan_Foto_PuntiConservazione.md)
3. Esegui debug checklist sopra

**In caso di bug**:
1. Crea issue in `/BUG_TRACKER.md`
2. Includi screenshot/console errors
3. Specifica browser/OS

---

**Fine AGENT_GUIDE_APPLIANCE_IMAGES.md**
**Ultimo aggiornamento**: 2026-01-20
**Status**: GUIDA COMPLETA E TESTATA

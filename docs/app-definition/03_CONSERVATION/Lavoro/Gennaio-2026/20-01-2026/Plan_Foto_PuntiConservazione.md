Piano: Immagine Elettrodomestico nel Form Conservazione
Obiettivo
Quando viene selezionato "Frigorifero" nel form AddPointModal, mostrare un layout split:

Sinistra: Categorie prodotti del profilo HACCP selezionato
Destra: Immagine dell'elettrodomestico (cliccabile per fullscreen)
Scope: Supportare 7-8 categorie di frigoriferi massimo.

Approccio: Ibrido Semplificato
Bilanciamento tra semplicità e manutenibilità professionale:

Elemento	Decisione	Motivazione
Config centralizzata	✅ SÌ	Evita paths hardcoded sparsi nel codice
Cartelle per categoria	✅ SÌ	Organizzato, facile trovare assets
Componente wrapper	❌ NO	Overengineering per 7-8 categorie
Error handling	✅ SÌ	Essenziale per debugging
Step 1: Organizzazione Assets
1.1 Creare struttura cartelle

public/images/conservation/appliances/
└── vertical-fridge-with-freezer/
    └── main.png
Convenzione naming cartelle: kebab-case (es. vertical-fridge-with-freezer/)

1.2 Copiare immagine esistente
Origine: Images/Punti di conservazione/FrigoriferoVerticaleConFreezer/Frigo_Verti_Freezer_Vuoto.png
Destinazione: public/images/conservation/appliances/vertical-fridge-with-freezer/main.png
Step 2: Configurazione Centralizzata
2.1 Creare file config
File: src/config/applianceImages.ts


import type { ApplianceCategory } from '@/utils/conservationProfiles'

/**
 * Configurazione immagini elettrodomestici per Conservation
 *
 * Per aggiungere una nuova categoria:
 * 1. Aggiungi la categoria in conservationProfiles.ts (ApplianceCategory type)
 * 2. Crea cartella: public/images/conservation/appliances/{categoria-kebab-case}/
 * 3. Aggiungi immagine main.png nella cartella
 * 4. Aggiungi entry in APPLIANCE_IMAGE_PATHS sotto
 */
export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
  // Aggiungi nuove categorie qui:
  // single_door_fridge: '/images/conservation/appliances/single-door-fridge/main.png',
  // chest_freezer: '/images/conservation/appliances/chest-freezer/main.png',
}

/**
 * Ottiene il path dell'immagine per una categoria di elettrodomestico
 * @returns path immagine o null se categoria non configurata
 */
export function getApplianceImagePath(category: ApplianceCategory): string | null {
  return APPLIANCE_IMAGE_PATHS[category] ?? null
}

/**
 * Verifica se una categoria ha un'immagine configurata
 */
export function hasApplianceImage(category: ApplianceCategory): boolean {
  return category in APPLIANCE_IMAGE_PATHS
}
Step 3: Modifiche AddPointModal.tsx
3.1 Nuovi import

import { Modal } from '@/components/ui/Modal'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { getApplianceImagePath, hasApplianceImage } from '@/config/applianceImages'
3.2 Nuovo state

const [isImageModalOpen, setIsImageModalOpen] = useState(false)
const [imageError, setImageError] = useState(false)
3.3 Condizionare sezione categorie esistente
Cercare la sezione "Categorie prodotti" (cerca Categorie prodotti nel file) e wrappare con:


{/* Sezione categorie standard - nascosta per frigoriferi con profilo */}
{!(formData.pointType === 'fridge' && formData.applianceCategory && formData.profileId) && (
  // ... sezione categorie esistente ...
)}
3.4 Nuova sezione layout split
Inserire dopo la condizione sopra, prima delle note HACCP:


{/* Layout Split: Categorie + Immagine Elettrodomestico */}
{formData.pointType === 'fridge' &&
 formData.applianceCategory &&
 formData.profileId &&
 selectedProfile && (
  <div className="space-y-4 border-t pt-6">
    <h3 className="text-lg font-medium flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-blue-600" />
      Configurazione Punto di Conservazione
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Colonna Sinistra: Categorie Profilo */}
      <div className="space-y-2">
        <Label>Categorie del Profilo</Label>
        <div className="border rounded-lg p-4 bg-gray-50 max-h-[350px] overflow-y-auto">
          <div className="space-y-2">
            {mapCategoryIdsToDbNames(selectedProfile.allowedCategoryIds).map((categoryName, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 bg-white rounded border border-blue-200"
              >
                <ShieldCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{categoryName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonna Destra: Immagine Elettrodomestico */}
      <div className="space-y-2">
        <Label>Immagine Elettrodomestico</Label>
        {hasApplianceImage(formData.applianceCategory as ApplianceCategory) && !imageError ? (
          <div
            className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100
                       transition-colors group relative min-h-[200px] flex items-center justify-center"
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
            <OptimizedImage
              src={getApplianceImagePath(formData.applianceCategory as ApplianceCategory)!}
              alt={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory]}
              className="max-w-full max-h-[280px] object-contain"
              onError={() => setImageError(true)}
            />
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10
                           transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity
                              text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                Clicca per ingrandire
              </span>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]
                         flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Thermometer className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Immagine non disponibile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
3.5 Modal Lightbox
Aggiungere prima del </form> finale:


{/* Modal Lightbox Immagine */}
<Modal
  isOpen={isImageModalOpen}
  onClose={() => setIsImageModalOpen(false)}
  title={APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory] || 'Elettrodomestico'}
  size="xl"
>
  <div className="flex items-center justify-center p-4 min-h-[400px]">
    {/* IMPORTANTE: Usare <img> standard, NON OptimizedImage */}
    {/* OptimizedImage ha objectFit: 'cover' hardcoded che non può essere sovrascritto */}
    <img
      src={getApplianceImagePath(formData.applianceCategory as ApplianceCategory)!}
      alt={`${APPLIANCE_CATEGORY_LABELS[formData.applianceCategory as ApplianceCategory]} - Vista ingrandita`}
      className="max-w-full max-h-[80vh] object-contain"
    />
  </div>
</Modal>
3.6 Reset imageError quando cambia categoria
Nel useEffect che gestisce i cambiamenti di applianceCategory:


useEffect(() => {
  setImageError(false) // Reset errore immagine
}, [formData.applianceCategory])
Step 4: Aggiungere Nuove Categorie (Guida Futura)
Per aggiungere una nuova categoria di frigorifero:

4.1 Aggiornare tipo ApplianceCategory
File: src/utils/conservationProfiles.ts


export type ApplianceCategory =
  | 'vertical_fridge_with_freezer'
  | 'single_door_fridge'  // NUOVO
4.2 Aggiungere label

export const APPLIANCE_CATEGORY_LABELS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: 'Frigorifero Verticale con Freezer',
  single_door_fridge: 'Frigorifero Monoporta',  // NUOVO
}
4.3 Creare cartella e immagine

public/images/conservation/appliances/single-door-fridge/
└── main.png
4.4 Aggiornare config immagini
File: src/config/applianceImages.ts


export const APPLIANCE_IMAGE_PATHS: Record<ApplianceCategory, string> = {
  vertical_fridge_with_freezer: '/images/conservation/appliances/vertical-fridge-with-freezer/main.png',
  single_door_fridge: '/images/conservation/appliances/single-door-fridge/main.png',  // NUOVO
}
4.5 Aggiungere profili HACCP (se necessario)

export const CONSERVATION_PROFILES: Record<ApplianceCategory, ConservationProfile[]> = {
  vertical_fridge_with_freezer: [...],
  single_door_fridge: [
    {
      profileId: 'single_door_standard',
      name: 'Profilo Standard Monoporta',
      // ...
    }
  ],
}
File da Modificare/Creare
File	Azione	Descrizione
public/images/conservation/appliances/vertical-fridge-with-freezer/main.png	CREARE	Copiare immagine esistente
src/config/applianceImages.ts	CREARE	Config centralizzata paths
src/features/conservation/components/AddPointModal.tsx	MODIFICARE	Layout split + modal
Verifica Implementazione
Visuale: Selezionare Frigorifero → Categoria → Profilo → verificare layout split
Click immagine: Verificare apertura modal fullscreen
Keyboard: Tab fino all'immagine, Enter per aprire, Esc per chiudere
Error handling: Rinominare temporaneamente immagine → verificare fallback
Responsive: Testare su viewport mobile (< 768px) → layout stack verticale
Accessibilità: Screen reader legge aria-label correttamente
Note Tecniche
OptimizedImage vs <img> Standard
Preview (colonna destra): Usa OptimizedImage per lazy loading e stati loading/error
Modal lightbox: Usa <img> standard perché:
OptimizedImage ha objectFit: 'cover' hardcoded (riga 68)
Inline style non sovrascrivibile con className
Nel modal serve object-contain per mostrare immagine intera
Immagine già caricata nella preview, non serve lazy loading
Altri Dettagli
Modal gestisce già focus trap, Esc, overlay click
Paths iniziano con / perché Vite serve public/ come root
max-h-[80vh] nel modal previene overflow su schermi piccoli
object-contain mantiene aspect ratio senza crop
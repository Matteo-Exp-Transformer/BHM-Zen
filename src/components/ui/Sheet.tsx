import { useEffect, type ReactNode } from 'react'

/**
 * Bottom sheet coi gesti dei mockup (scrim + pannello che sale dal fondo).
 * Resta montato per la transizione; su desktop si stringe e si centra.
 * Owner 08-07: su tablet/desktop il contenuto va a 2 colonne con font più
 * grande (mobile invariato); scroll interno con scrollbar integrata (CSS
 * in index.css, scopata su [role="dialog"]). `layout="stretto"` per i gesti
 * focalizzati (keypad, timbro) che restano a colonna singola.
 */
export function Sheet({
  open,
  onClose,
  label,
  layout = 'largo',
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  layout?: 'largo' | 'stretto'
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const largo = layout === 'largo'

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-30 mx-auto flex max-h-[86dvh] w-full flex-col gap-3.5 rounded-t-[26px] bg-surface px-[18px] pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5 shadow-lg2 transition-transform duration-[380ms] ease-calm ${
          largo ? 'max-w-[430px] md:max-w-[680px]' : 'max-w-[430px]'
        } ${open ? 'translate-y-0' : 'translate-y-[102%]'}`}
      >
        <div className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-hairline" />
        <div
          className={`-mr-2 flex min-h-0 flex-col gap-3.5 overflow-y-auto pr-2 md:[zoom:1.06] ${
            largo
              ? 'md:grid md:grid-cols-2 md:content-start md:items-start md:gap-x-7 md:[&>button]:col-span-2 md:[&>form]:col-span-2 md:[&>h3]:col-span-2 md:[&>p]:col-span-2'
              : ''
          }`}
        >
          {children}
        </div>
      </section>
    </>
  )
}

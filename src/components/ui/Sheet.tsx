import { useEffect, type ReactNode } from 'react'

/**
 * Bottom sheet coi gesti dei mockup (scrim + pannello che sale dal fondo).
 * Resta montato per la transizione; su desktop si stringe e si centra.
 */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
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
        className={`fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] flex-col gap-3.5 rounded-t-[26px] bg-surface px-[18px] pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5 shadow-lg2 transition-transform duration-[380ms] ease-calm ${
          open ? 'translate-y-0' : 'translate-y-[102%]'
        }`}
      >
        <div className="mx-auto h-[5px] w-10 rounded-full bg-hairline" />
        {children}
      </section>
    </>
  )
}

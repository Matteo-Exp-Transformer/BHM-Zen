import { useCallback, useRef, useState, type ReactNode } from 'react'

/**
 * Toast «voce da cucina» (mockup 01): pillola scura, 1.5s, mai bloccante.
 * Uso: const { toast, show } = useToast() → render {toast} in fondo alla pagina.
 */
export function useToast(): { toast: ReactNode; show: (msg: string) => void } {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const show = useCallback((next: string) => {
    setMsg(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 1500)
  }, [])

  const toast = (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center transition-all duration-300 ease-calm md:bottom-10 ${
        msg ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <span className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ground shadow-lg2">
        {msg}
      </span>
    </div>
  )

  return { toast, show }
}

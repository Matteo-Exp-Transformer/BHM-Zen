import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'

/**
 * Ingresso solo-invito (dec. 9 + default «/sign-up pubblica chiusa»):
 * nessuna registrazione libera — l'account lo crea il titolare invitando.
 * Voce umana §10.5: errori concreti, zero gergo.
 */
export default function LoginPage() {
  const { session, loading } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email o password non giuste. Riprova.'
          : 'Non riesco a farti entrare ora. Riprova tra un momento.',
      )
      setBusy(false)
    }
    // successo: onAuthStateChange aggiorna la sessione → redirect sopra
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-ground p-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_58%,#6f2b13)] text-lg font-extrabold text-white">
            B
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BHM</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Il diario di lavoro del tuo ristorante
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-shadow duration-300 ease-calm focus:ring-2 focus:ring-accent/50"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-shadow duration-300 ease-calm focus:ring-2 focus:ring-accent/50"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-bad-bg px-3.5 py-2.5 text-sm font-semibold text-bad-ink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-[14px] bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform duration-150 ease-calm active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? 'Un momento…' : 'Entra'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-mute">
          Si entra su invito del titolare.
          <br />
          Non hai le credenziali? Chiedi a chi gestisce la tua attività.
        </p>
      </div>
    </main>
  )
}

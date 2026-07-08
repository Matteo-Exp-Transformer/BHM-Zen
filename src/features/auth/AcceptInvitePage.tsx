import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'
import {
  accettaInvitoConSessione,
  accettaInvitoConSignUp,
  type EsitoAccettazione,
  type Invito,
} from './invites'

type Stato =
  | { kind: 'verifica' }
  | { kind: 'invalido'; motivo: string }
  | { kind: 'form'; invito: Invito }
  | { kind: 'conferma-email' }
  | { kind: 'entrato' }

const inputCls =
  'rounded-xl border border-hairline bg-surface-2 px-3.5 py-2.5 text-[15px] text-ink outline-none transition-shadow duration-300 ease-calm focus:ring-2 focus:ring-accent/50'

/**
 * Accettazione invito (FU-001): l'unica porta d'ingresso nuova dell'app
 * (dec. 9: niente registrazione libera). Due strade:
 *  A) dal link email → sessione già attiva → qui si imposta la password;
 *  B) dal link condiviso a mano → si crea l'account (con conferma email se
 *     attiva sul progetto — in quel caso si chiude dal login).
 */
export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { session, loading, signOut } = useSession()
  const queryClient = useQueryClient()

  const [stato, setStato] = useState<Stato>({ kind: 'verifica' })
  const [nome, setNome] = useState('')
  const [password, setPassword] = useState('')
  const [conferma, setConferma] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const sessionEmail = session?.user.email?.toLowerCase() ?? null

  useEffect(() => {
    if (loading) return
    let vivo = true
    async function carica() {
      if (!token) {
        setStato({ kind: 'invalido', motivo: 'Manca il codice invito nel link.' })
        return
      }
      const { data: invito, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle()
      if (!vivo) return
      if (error || !invito) {
        setStato({ kind: 'invalido', motivo: 'Invito non trovato: controlla il link.' })
        return
      }
      // percorso A: la sessione dal link email rende legittimo anche un token
      // già «usato» dal claim automatico — qui si sta solo impostando la password
      if (sessionEmail === invito.email) {
        setStato({ kind: 'form', invito })
        return
      }
      if (invito.used_at) {
        setStato({ kind: 'invalido', motivo: 'Questo invito è già stato usato.' })
        return
      }
      if (new Date(invito.expires_at) < new Date()) {
        setStato({
          kind: 'invalido',
          motivo: 'Questo invito è scaduto: chiedi al titolare di rigenerarlo.',
        })
        return
      }
      setStato({ kind: 'form', invito })
    }
    void carica()
    return () => {
      vivo = false
    }
  }, [token, loading, sessionEmail])

  // sessione di un'ALTRA persona aperta: mai accettare inviti sopra
  if (!loading && session && stato.kind === 'form' && sessionEmail !== stato.invito.email) {
    return (
      <Cornice>
        <p className="rounded-xl bg-warn-bg px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-warn-ink">
          C'è già una sessione aperta con un altro account. Esci prima di
          accettare questo invito.
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full rounded-[14px] bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink shadow-card"
        >
          Esci e riprova
        </button>
      </Cornice>
    )
  }

  if (stato.kind === 'entrato') return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (stato.kind !== 'form') return
    setErrore(null)
    if (password.length < 8) {
      setErrore('La password deve avere almeno 8 caratteri.')
      return
    }
    if (password !== conferma) {
      setErrore('Le due password non coincidono.')
      return
    }
    setBusy(true)
    try {
      const input = { invito: stato.invito, password, nome: nome.trim() || undefined }
      const esito: EsitoAccettazione = session
        ? await accettaInvitoConSessione(input)
        : await accettaInvitoConSignUp(input)
      if (esito === 'conferma-email') {
        setStato({ kind: 'conferma-email' })
      } else {
        await queryClient.invalidateQueries({ queryKey: ['membership'] })
        setStato({ kind: 'entrato' })
      }
    } catch (err) {
      logger.error('accettazione invito fallita', err)
      const msg = err instanceof Error ? err.message : ''
      setErrore(
        msg.includes('already registered')
          ? 'Con questa email esiste già un account: entra dal login.'
          : 'Non riesco a completare ora. Riprova tra un momento.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Cornice>
      {stato.kind === 'verifica' && (
        <p className="text-center text-sm text-ink-soft">Controllo l'invito…</p>
      )}

      {stato.kind === 'invalido' && (
        <>
          <p className="rounded-xl bg-bad-bg px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-bad-ink">
            {stato.motivo}
          </p>
          <a
            href="/login"
            className="mt-3 block text-center text-sm font-semibold text-accent"
          >
            Vai al login
          </a>
        </>
      )}

      {stato.kind === 'conferma-email' && (
        <>
          <p className="rounded-xl bg-ok-bg px-3.5 py-2.5 text-sm font-semibold leading-relaxed text-ok-ink">
            Account creato. Controlla la posta e conferma l'indirizzo, poi entra
            dal login con la password che hai scelto.
          </p>
          <a
            href="/login"
            className="mt-3 block text-center text-sm font-semibold text-accent"
          >
            Vai al login
          </a>
        </>
      )}

      {stato.kind === 'form' && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Sei dei nostri</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Invito per <strong>{stato.invito.email}</strong>. Scegli la
              password e da domani il registro lo firmi anche tu.
            </p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
              Nome e cognome
            </span>
            <input
              type="text"
              autoComplete="name"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
              Password (min. 8 caratteri)
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
              Ripeti la password
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={conferma}
              onChange={e => setConferma(e.target.value)}
              className={inputCls}
            />
          </label>

          {errore && (
            <p className="rounded-xl bg-bad-bg px-3.5 py-2.5 text-sm font-semibold text-bad-ink">
              {errore}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-[14px] bg-accent px-5 py-3 text-[15px] font-bold text-accent-ink shadow-card transition-transform duration-150 ease-calm active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? 'Un momento…' : 'Crea il mio accesso'}
          </button>
        </form>
      )}
    </Cornice>
  )
}

function Cornice({ children }: { children: React.ReactNode }) {
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
        <div className="rounded-card bg-surface p-6 shadow-card">{children}</div>
      </div>
    </main>
  )
}

import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/shell/AppShell'
import LoginPage from '@/features/auth/LoginPage'
import { useSession } from '@/lib/auth/session'

/** Attesa calma (§13.6): niente spinner ansiogeni per un check di sessione. */
function CalmSplash() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ground">
      <div className="grid h-12 w-12 animate-pulse place-items-center rounded-2xl bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_58%,#6f2b13)] text-lg font-extrabold text-white">
        B
      </div>
    </main>
  )
}

function RequireSession() {
  const { session, loading } = useSession()
  if (loading) return <CalmSplash />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function RequireDirector() {
  const { canDirect, loading } = useSession()
  if (loading) return <CalmSplash />
  if (!canDirect) return <Navigate to="/" replace />
  return <Outlet />
}

/**
 * Placeholder di casa: montano il layout reale (mockup 01/02/04/07) man mano
 * che le aree vengono portate. Testo = voce umana, mai «lorem ipsum».
 */
function HousePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 md:px-7 md:py-8">
      <header>
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          BHM
        </p>
        <h2 className="text-2xl font-bold tracking-tight md:text-[25px]">{title}</h2>
      </header>
      <div className="rounded-card bg-surface p-5 text-sm leading-relaxed text-ink-soft shadow-card">
        {note}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <HousePlaceholder
                title="Oggi"
                note="Il tuo diario di bordo sta arrivando: le cose da fare ora, il timbro di fine turno."
              />
            }
          />
          <Route
            path="reparti"
            element={
              <HousePlaceholder
                title="Reparti"
                note="Qui vivranno i tuoi reparti: i punti di conservazione, la temperatura che atterra, la cascata."
              />
            }
          />
          <Route
            path="scorte"
            element={
              <HousePlaceholder
                title="Scorte"
                note="Inventario e lista spesa, filtrabili per reparto. In arrivo col giro d'inventario."
              />
            }
          />
          <Route element={<RequireDirector />}>
            <Route
              path="regia"
              element={
                <HousePlaceholder
                  title="Regia"
                  note="① Imposto · ③ Controllo · ④ Dimostro — l'ingresso del titolare. In costruzione."
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

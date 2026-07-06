import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/shell/AppShell'
import LoginPage from '@/features/auth/LoginPage'
import OggiPage from '@/features/oggi/OggiPage'
import CalendarioPage from '@/features/calendario/CalendarioPage'
import RepartiPage from '@/features/reparti/RepartiPage'
import ScortePage from '@/features/scorte/ScortePage'
import RegiaPage from '@/features/regia/RegiaPage'
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

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route index element={<OggiPage />} />
          <Route path="calendario" element={<CalendarioPage />} />
          <Route path="reparti" element={<RepartiPage />} />
          <Route path="scorte" element={<ScortePage />} />
          <Route element={<RequireDirector />}>
            <Route path="regia" element={<RegiaPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

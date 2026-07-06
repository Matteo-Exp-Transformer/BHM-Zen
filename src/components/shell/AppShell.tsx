import { NavLink, Outlet } from 'react-router-dom'
import { useSession } from '@/lib/auth/session'
import {
  LogoutIcon,
  OggiIcon,
  RegiaIcon,
  RepartiIcon,
  ScorteIcon,
} from '@/components/icons'
import type { ComponentType, SVGProps } from 'react'

interface House {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  end?: boolean
  divided?: boolean
}

/**
 * Scheletro di navigazione (§12, mockup 06 = verità visiva):
 * - mobile: bottom tab bar · desktop/tablet (md+): side-rail 82px
 * - la barra si trasforma col ruolo: Regia solo per titolare/responsabile
 * - tab centrale dinamica: nome-reparto se uno solo, «Reparti» se più d'uno
 *   (il nome reale arriva col port dei reparti — per ora etichetta di default)
 */
function useHouses(): House[] {
  const { canDirect } = useSession()
  const houses: House[] = [
    { to: '/', label: 'Oggi', icon: OggiIcon, end: true },
    { to: '/reparti', label: 'Reparti', icon: RepartiIcon },
    { to: '/scorte', label: 'Scorte', icon: ScorteIcon },
  ]
  if (canDirect) houses.push({ to: '/regia', label: 'Regia', icon: RegiaIcon, divided: true })
  return houses
}

function initials(email: string | undefined) {
  if (!email) return '·'
  return email.slice(0, 2).toUpperCase()
}

export default function AppShell() {
  const houses = useHouses()
  const { session, signOut } = useSession()

  return (
    <div className="min-h-dvh bg-ground md:grid md:grid-cols-[82px_1fr]">
      {/* side-rail (desktop/tablet) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[82px] flex-col items-center gap-1 border-r border-hairline bg-surface py-3.5 md:flex">
        <div className="mb-2.5 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_58%,#6f2b13)] text-base font-extrabold text-white">
          B
        </div>
        <nav className="flex w-full flex-1 flex-col items-center gap-1">
          {houses.map(h => (
            <NavLink
              key={h.to}
              to={h.to}
              end={h.end}
              className={({ isActive }) =>
                [
                  'flex w-[66px] flex-col items-center gap-1 rounded-[13px] py-2 text-[10.5px] font-semibold transition-colors duration-300 ease-calm',
                  h.divided ? 'relative mt-1.5 before:absolute before:-top-1 before:left-3.5 before:right-3.5 before:h-px before:bg-hairline' : '',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-mute hover:bg-surface-2 hover:text-ink-soft',
                ].join(' ')
              }
            >
              <h.icon className="h-[22px] w-[22px]" />
              <span>{h.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => void signOut()}
          title={`${session?.user.email ?? ''} — esci`}
          className="group relative mt-1.5 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-xs font-bold text-white"
        >
          <span className="group-hover:opacity-0">{initials(session?.user.email)}</span>
          <LogoutIcon className="absolute h-4 w-4 opacity-0 group-hover:opacity-100" />
        </button>
      </aside>

      {/* contenuto */}
      <main className="pb-20 md:col-start-2 md:pb-0">
        <Outlet />
      </main>

      {/* bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-0.5 border-t border-hairline bg-surface px-1.5 pb-[calc(7px+env(safe-area-inset-bottom))] pt-[7px] md:hidden">
        {houses.map(h => (
          <NavLink
            key={h.to}
            to={h.to}
            end={h.end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-[3px] rounded-xl pb-1 pt-1.5 text-[10px] font-semibold transition-colors duration-300 ease-calm',
                isActive ? 'text-accent' : 'text-ink-mute',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <h.icon className="h-[21px] w-[21px]" />
                <span>{h.label}</span>
                <span
                  className={`mt-px h-[5px] w-[5px] rounded-full bg-accent transition-opacity duration-300 ease-calm ${isActive ? 'opacity-100' : 'opacity-0'}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

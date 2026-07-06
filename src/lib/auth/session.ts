import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

/** Ruoli attivi in beta (dec. 9). Fonte unica: company_members.role. */
export type Role = 'admin' | 'responsabile' | 'dipendente'

export interface SessionContextValue {
  session: Session | null
  /** true finché non sappiamo se c'è una sessione (evita flash di /login) */
  loading: boolean
  role: Role | null
  companyId: string | null
  /** Regia visibile solo a titolare/responsabile (§12.2) */
  canDirect: boolean
  /** scheda staff collegata alla membership (null se non collegata) */
  staffId: string | null
  /** nome da mostrare: staff.name → user_metadata → prefisso email */
  displayName: string | null
  /** reparti assegnati allo staff; null = nessuna assegnazione → vede tutti */
  departmentIds: string[] | null
  signOut: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession richiede <SessionProvider>')
  return ctx
}

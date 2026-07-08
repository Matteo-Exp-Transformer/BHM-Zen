import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { claimInvitoPendente } from '@/features/auth/invites'
import { SessionContext, type Role, type SessionContextValue } from './session'

async function fetchMembership(userId: string) {
  const { data, error } = await supabase
    .from('company_members')
    .select(
      'company_id, role, staff_id, staff:staff_id(name, department_assignments)',
    )
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

function pickDisplayName(
  staffName: string | null | undefined,
  session: Session | null,
): string | null {
  if (staffName) return staffName
  const meta = session?.user.user_metadata as
    | { first_name?: string; last_name?: string }
    | undefined
  if (meta?.first_name)
    return [meta.first_name, meta.last_name].filter(Boolean).join(' ')
  const email = session?.user.email
  return email ? (email.split('@')[0] ?? null) : null
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  const userEmail = session?.user.email
  const membership = useQuery({
    queryKey: ['membership', userId],
    queryFn: async () => {
      const m = await fetchMembership(userId!)
      if (m) return m
      // sessione senza membership: se c'è un invito pendente per questa
      // email lo agganciamo qui (FU-001) — copre il primo login dopo la
      // conferma email e l'arrivo dal link d'invito
      if (userEmail && (await claimInvitoPendente(userId!, userEmail))) {
        return fetchMembership(userId!)
      }
      return m
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })

  const role = (membership.data?.role as Role | undefined) ?? null
  const staff = membership.data?.staff ?? null
  const assignments = staff?.department_assignments ?? null
  const value: SessionContextValue = {
    session,
    loading: loading || (!!userId && membership.isLoading),
    role,
    companyId: membership.data?.company_id ?? null,
    canDirect: role === 'admin' || role === 'responsabile',
    staffId: membership.data?.staff_id ?? null,
    displayName: pickDisplayName(staff?.name, session),
    departmentIds: assignments && assignments.length > 0 ? assignments : null,
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

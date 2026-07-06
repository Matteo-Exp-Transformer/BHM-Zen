import { useEffect, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { SessionContext, type Role, type SessionContextValue } from './session'

async function fetchMembership(userId: string) {
  const { data, error } = await supabase
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
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
  const membership = useQuery({
    queryKey: ['membership', userId],
    queryFn: () => fetchMembership(userId!),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  })

  const role = (membership.data?.role as Role | undefined) ?? null
  const value: SessionContextValue = {
    session,
    loading: loading || (!!userId && membership.isLoading),
    role,
    companyId: membership.data?.company_id ?? null,
    canDirect: role === 'admin' || role === 'responsabile',
    signOut: async () => {
      await supabase.auth.signOut()
    },
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

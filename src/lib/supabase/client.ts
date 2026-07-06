import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Pattern ♻️ riusato dal legacy (mappa Fondamenta §3: «singleton buono»),
// SENZA le interfacce deprecated duplicate (🗑️ triplicazione tipi).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configurazione Supabase mancante in .env.local:\n' +
      '- VITE_SUPABASE_URL\n' +
      '- VITE_SUPABASE_ANON_KEY',
  )
}

let instance: SupabaseClient<Database> | null = null

export const supabase = (() => {
  if (!instance) {
    instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'bhm-supabase-auth',
        flowType: 'pkce',
      },
    })
  }
  return instance
})()

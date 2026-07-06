import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '@/lib/auth/SessionProvider'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sync dec. 11: realtime = UX non correttezza; floor = refetch-on-focus
      refetchOnWindowFocus: true,
      staleTime: 30_000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
)

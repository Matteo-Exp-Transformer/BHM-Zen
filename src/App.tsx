import { Routes, Route } from 'react-router-dom'

/**
 * Scheletro di navigazione (§12 masterplan): 3 lenti + Regia.
 * Le route montano placeholder finché le sedute UI non producono le schermate
 * (mockup docs/meta/MOCKUP_UI/ = verità visiva). Shell/tab bar: mockup 06.
 */
function Placeholder({ title }: { title: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sand-50 text-ink">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-ink-soft">In costruzione — BHM-Zen</p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Oggi" />} />
      <Route path="/reparti" element={<Placeholder title="Reparti" />} />
      <Route path="/scorte" element={<Placeholder title="Scorte" />} />
      <Route path="/regia" element={<Placeholder title="Regia" />} />
      <Route path="*" element={<Placeholder title="Pagina non trovata" />} />
    </Routes>
  )
}

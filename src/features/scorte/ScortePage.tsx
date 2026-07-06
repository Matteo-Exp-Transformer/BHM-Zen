/**
 * Scorte (dec. 12, mockup 07) — «fai il giro, la spesa si scrive da sé».
 * Inventario per categoria (accordion), giro di conteggio con stepper da
 * guanti (stock_counts append-only), spesa auto-compilata dai sotto-scorta
 * ma libera: NIENTE barra di avanzamento né «completamento» (dec. 12.4).
 */
import { useMemo, useState } from 'react'
import { useSession } from '@/lib/auth/session'
import { useToast } from '@/components/ui/Toast'
import {
  CartIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  MinusIcon,
  PlusIcon,
  ScorteIcon,
} from '@/components/icons'
import {
  useAggiungiRiga,
  useContaRimanenza,
  useCreaLista,
  useInventario,
  useListeSpesa,
  useRigheLista,
  useSpuntaRiga,
  useSuggerimenti,
  type ProdottoInventario,
} from './hooks'
import { esaurito, labelScadenza, sottoScorta, statoScadenza } from './stock'

function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'warn' | 'bad'; children: React.ReactNode }) {
  const cls = {
    neutral: 'bg-surface-2 text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]',
    warn: 'bg-warn-bg text-warn-ink',
    bad: 'bg-bad-bg text-bad-ink',
  }[tone]
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>
  )
}

function RigaProdotto({
  p,
  giroAttivo,
  onConta,
  pending,
}: {
  p: ProdottoInventario
  giroAttivo: boolean
  onConta: (productId: string, quantita: number) => void
  pending: boolean
}) {
  const scad = statoScadenza(p.expiryDate)
  const low = sottoScorta(p.quantita, p.parLevel)
  const out = esaurito(p.quantita)

  return (
    <article className="flex items-center gap-3 rounded-[14px] bg-surface p-3 shadow-card">
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-[14.5px] font-bold leading-tight">
          {p.nome}
          {p.allergens.map(a => (
            <span key={a} className="rounded-md bg-warn-bg px-1.5 py-0.5 text-[10.5px] font-bold text-warn-ink">
              {a}
            </span>
          ))}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-mute">
          {p.departmentName && <Pill>{p.departmentName}</Pill>}
          {scad === 'scaduto' && <Pill tone="bad">scaduto il {labelScadenza(p.expiryDate)}</Pill>}
          {scad === 'a_breve' && <Pill tone="warn">scade il {labelScadenza(p.expiryDate)}</Pill>}
          {scad === 'ok' && <span>fino al {labelScadenza(p.expiryDate)}</span>}
          {scad === null && <span>senza scadenza</span>}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {giroAttivo ? (
          <div className="inline-flex items-center rounded-[10px] bg-surface-2 shadow-[inset_0_0_0_1px_var(--hairline)]">
            <button
              type="button"
              aria-label={`Meno ${p.nome}`}
              disabled={pending || p.quantita <= 0}
              onClick={() => onConta(p.id, Math.max(0, p.quantita - 1))}
              className="grid h-9 w-9 place-items-center rounded-[9px] text-ink-soft transition-transform hover:bg-surface active:scale-95 disabled:opacity-40"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="min-w-[30px] text-center text-[14.5px] font-bold tabular-nums">
              {p.quantita}
            </span>
            <button
              type="button"
              aria-label={`Più ${p.nome}`}
              disabled={pending}
              onClick={() => onConta(p.id, p.quantita + 1)}
              className="grid h-9 w-9 place-items-center rounded-[9px] text-ink-soft transition-transform hover:bg-surface active:scale-95 disabled:opacity-40"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p
              className={`text-[15px] font-bold tabular-nums ${
                out ? 'text-bad-ink' : low ? 'text-warn-ink' : ''
              }`}
            >
              {p.quantita}
              {p.parLevel !== null && (
                <span className="text-[12px] font-semibold text-ink-mute"> / {p.parLevel}</span>
              )}
              {p.unit && <span className="text-[12px] font-semibold text-ink-mute"> {p.unit}</span>}
            </p>
            {out && <Pill tone="bad">da ricomprare</Pill>}
            {!out && low && <Pill tone="warn">sotto scorta</Pill>}
          </>
        )}
      </div>
    </article>
  )
}

export default function ScortePage() {
  const { displayName } = useSession()
  const [vista, setVista] = useState<'inventario' | 'spesa'>('inventario')
  const [depFilter, setDepFilter] = useState<string | null>(null)
  const [giroAttivo, setGiroAttivo] = useState(false)
  const [chiuse, setChiuse] = useState<Set<string>>(new Set())
  const [listaSel, setListaSel] = useState<string | null>(null)
  const [nuovaVoce, setNuovaVoce] = useState('')
  const { toast, show } = useToast()

  const { prodotti, isLoading } = useInventario()
  const conta = useContaRimanenza()
  const { liste, isLoading: listeLoading } = useListeSpesa()
  const listaCorrente = listaSel ?? liste.find(l => !l.completata)?.id ?? liste[0]?.id ?? null
  const { righe } = useRigheLista(vista === 'spesa' ? listaCorrente : null)
  const creaLista = useCreaLista()
  const spuntaRiga = useSpuntaRiga(listaCorrente)
  const aggiungiRiga = useAggiungiRiga(listaCorrente)
  const suggerimenti = useSuggerimenti(prodotti)

  const reparti = useMemo(() => {
    const nomi = new Map<string, string>()
    for (const p of prodotti) {
      if (p.departmentId && p.departmentName) nomi.set(p.departmentId, p.departmentName)
    }
    return [...nomi.entries()].map(([id, nome]) => ({ id, nome }))
  }, [prodotti])

  const visibili = useMemo(
    () => (depFilter ? prodotti.filter(p => p.departmentId === depFilter) : prodotti),
    [prodotti, depFilter],
  )

  const perCategoria = useMemo(() => {
    const map = new Map<string, ProdottoInventario[]>()
    for (const p of visibili) {
      const arr = map.get(p.categoria) ?? []
      arr.push(p)
      map.set(p.categoria, arr)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [visibili])

  const sottoScortaCount = suggerimenti.length

  const onConta = (productId: string, quantita: number) => {
    conta.mutate(
      { productId, quantita },
      { onError: () => show('Conteggio non salvato — riprova.') },
    )
  }

  const creaListaSuggerita = () => {
    creaLista.mutate(
      {
        nome: `Spesa ${new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(new Date())}`,
        suggerimenti,
      },
      {
        onSuccess: id => {
          setListaSel(id)
          show('Lista creata dai sotto-scorta.')
        },
        onError: () => show('Lista non creata — riprova.'),
      },
    )
  }

  const creaListaVuota = () => {
    creaLista.mutate(
      { nome: `Lista ${liste.length + 1}` },
      {
        onSuccess: id => {
          setListaSel(id)
          show('Nuova lista pronta.')
        },
        onError: () => show('Lista non creata — riprova.'),
      },
    )
  }

  const aggiungi = () => {
    const nome = nuovaVoce.trim()
    if (!nome || !listaCorrente) return
    setNuovaVoce('')
    aggiungiRiga.mutate({ nome }, { onError: () => show('Non aggiunto — riprova.') })
  }

  const toggleCategoria = (cat: string) =>
    setChiuse(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })

  const presi = righe.filter(r => r.presa).length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-5 md:px-7 md:py-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            Stock
          </p>
          <h2 className="text-2xl font-bold tracking-tight md:text-[25px]">Scorte</h2>
        </div>
        <div
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-[color-mix(in_srgb,var(--accent)_60%,#7a2f16)] text-sm font-bold text-white shadow-card md:hidden"
        >
          {(displayName ?? '·').slice(0, 2).toUpperCase()}
        </div>
      </header>

      {/* il giro d'inventario: conta le rimanenze, la spesa si aggiorna */}
      <div
        className={`flex flex-wrap items-center gap-3 rounded-card p-3.5 shadow-card ${
          giroAttivo
            ? 'bg-surface shadow-[var(--shadow),inset_0_0_0_1.5px_var(--accent)]'
            : 'bg-gradient-to-b from-accent-soft to-surface'
        }`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-surface text-accent shadow-card">
          <ClipboardIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold leading-tight">Giro d'inventario</p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-soft">
            {giroAttivo
              ? 'Giro in corso — tocca +/− su ogni prodotto: ogni conteggio resta registrato.'
              : sottoScortaCount > 0
                ? `${sottoScortaCount} ${sottoScortaCount === 1 ? 'prodotto' : 'prodotti'} sotto scorta — un giro e la spesa si compila da sé.`
                : 'Conta le rimanenze: il catalogo resta aggiornato e la spesa nasce già compilata.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setGiroAttivo(a => !a)
            if (giroAttivo) show('Giro salvato — la spesa è aggiornata.')
            else setVista('inventario')
          }}
          className={`shrink-0 rounded-[12px] px-4 py-2.5 text-[13.5px] font-bold transition-transform active:scale-95 ${
            giroAttivo ? 'bg-ok-bg text-ok-ink' : 'bg-accent text-accent-ink shadow-card'
          }`}
        >
          {giroAttivo ? 'Ho finito il giro' : 'Avvia inventario'}
        </button>
      </div>

      {/* vista: inventario / spesa */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-surface-2 p-[3px] shadow-[inset_0_0_0_1px_var(--hairline)]">
          {(
            [
              ['inventario', 'Inventario', ScorteIcon],
              ['spesa', 'Spesa', CartIcon],
            ] as const
          ).map(([v, label, IconCmp]) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`inline-flex items-center gap-2 rounded-[9px] px-4 py-2 text-[13.5px] font-bold transition-all ${
                vista === v ? 'bg-surface text-accent shadow-card' : 'text-ink-mute'
              }`}
            >
              <IconCmp className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        {vista === 'inventario' && reparti.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDepFilter(null)}
              className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
                !depFilter
                  ? 'bg-accent-soft text-accent'
                  : 'bg-surface text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
              }`}
            >
              Tutti
            </button>
            {reparti.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDepFilter(r.id)}
                className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
                  depFilter === r.id
                    ? 'bg-accent-soft text-accent'
                    : 'bg-surface text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                }`}
              >
                {r.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {vista === 'inventario' && (
        <>
          {isLoading && (
            <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
              Un attimo — leggo l'inventario…
            </div>
          )}
          {!isLoading && perCategoria.length === 0 && (
            <div className="rounded-card bg-surface p-5 text-sm leading-relaxed text-ink-soft shadow-card">
              L'inventario è vuoto. I prodotti si aggiungono dalla Regia (o durante
              l'onboarding): nome, categoria, reparto e scadenza — poi qui li conti
              e la spesa si compila da sé.
            </div>
          )}
          {perCategoria.map(([cat, items]) => {
            const lows = items.filter(p => sottoScorta(p.quantita, p.parLevel)).length
            const chiusa = chiuse.has(cat)
            return (
              <section key={cat} className="flex flex-col gap-2">
                {/* accordion (dec. 12.6): click sul nome apre/chiude */}
                <button
                  type="button"
                  onClick={() => toggleCategoria(cat)}
                  aria-expanded={!chiusa}
                  className="flex items-center gap-2.5 px-0.5 text-left"
                >
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-mute">
                    {cat}
                  </span>
                  {lows > 0 && <Pill tone="warn">{lows} sotto scorta</Pill>}
                  <span className="h-px flex-1 bg-hairline" />
                  <ChevronDownIcon
                    className={`h-4 w-4 text-ink-mute transition-transform ${chiusa ? '-rotate-90' : ''}`}
                  />
                </button>
                {!chiusa &&
                  items.map(p => (
                    <RigaProdotto
                      key={p.id}
                      p={p}
                      giroAttivo={giroAttivo}
                      onConta={onConta}
                      pending={conta.isPending}
                    />
                  ))}
              </section>
            )
          })}
        </>
      )}

      {vista === 'spesa' && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            {liste.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => setListaSel(l.id)}
                className={`rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-all ${
                  listaCorrente === l.id
                    ? 'bg-accent text-accent-ink'
                    : 'bg-surface text-ink-soft shadow-[inset_0_0_0_1px_var(--hairline)]'
                }`}
              >
                {l.nome}
              </button>
            ))}
            <button
              type="button"
              disabled={creaLista.isPending}
              onClick={creaListaVuota}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold text-accent shadow-[inset_0_0_0_1px_var(--accent-soft)] transition-transform active:scale-95 disabled:opacity-60"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Nuova lista
            </button>
          </div>

          {listeLoading && (
            <div className="animate-pulse rounded-card bg-surface p-5 text-sm text-ink-mute shadow-card">
              Un attimo — leggo le liste…
            </div>
          )}

          {!listeLoading && liste.length === 0 && (
            <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
              <p className="text-sm leading-relaxed text-ink-soft">
                Nessuna lista ancora.
                {sottoScortaCount > 0
                  ? ` Ci sono ${sottoScortaCount} prodotti sotto scorta: posso prepararti la lista io.`
                  : ' Fai un giro d\u2019inventario e la spesa nasce già compilata.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {sottoScortaCount > 0 && (
                  <button
                    type="button"
                    disabled={creaLista.isPending}
                    onClick={creaListaSuggerita}
                    className="rounded-xl bg-accent px-4 py-2.5 text-[13.5px] font-bold text-accent-ink shadow-card transition-transform active:scale-95 disabled:opacity-60"
                  >
                    Crea dai sotto-scorta
                  </button>
                )}
                <button
                  type="button"
                  disabled={creaLista.isPending}
                  onClick={creaListaVuota}
                  className="rounded-xl bg-surface-2 px-4 py-2.5 text-[13.5px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--hairline)] transition-transform active:scale-95 disabled:opacity-60"
                >
                  Lista vuota
                </button>
              </div>
            </div>
          )}

          {listaCorrente && (
            <div className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card">
              <p className="mb-1 flex items-center gap-2 text-[15.5px] font-bold">
                <CartIcon className="h-[18px] w-[18px] text-accent" />
                {liste.find(l => l.id === listaCorrente)?.nome ?? 'Lista'}
              </p>
              <p className="mb-2 text-[12.5px] text-ink-mute">
                È una proposta, non un obbligo: aggiungi, togli, spunta man mano che
                compri.
              </p>
              {righe.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => spuntaRiga.mutate({ rigaId: r.id, presa: !r.presa })}
                  className="flex items-center gap-3 rounded-[10px] px-1.5 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-[7px] transition-all ${
                      r.presa
                        ? 'bg-ok text-white'
                        : 'shadow-[inset_0_0_0_2px_var(--hairline)] text-transparent'
                    }`}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    className={`flex-1 text-[14px] font-semibold ${
                      r.presa ? 'text-ink-mute line-through' : ''
                    }`}
                  >
                    {r.nome}
                  </span>
                  <span className="text-[12px] tabular-nums text-ink-mute">
                    {r.quantita > 1 || r.unit ? `${r.quantita} ${r.unit ?? 'pz'}` : ''}
                  </span>
                </button>
              ))}
              <div className="mt-1 flex items-center gap-3 border-t border-hairline pt-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-accent-soft text-accent">
                  <PlusIcon className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={nuovaVoce}
                  onChange={e => setNuovaVoce(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') aggiungi()
                  }}
                  placeholder="Aggiungi un articolo e premi Invio…"
                  className="flex-1 border-b-[1.5px] border-dashed border-hairline bg-transparent py-1 text-[14px] text-ink outline-none placeholder:text-ink-mute focus:border-accent"
                />
              </div>
              {/* niente barra di avanzamento (dec. 12.4): solo un conto discreto */}
              <p className="mt-2 text-[12px] font-semibold text-ink-mute">
                {presi} presi{righe.length > 0 ? ` · ${righe.length} articoli` : ''}
              </p>
            </div>
          )}
        </>
      )}

      {toast}
    </div>
  )
}

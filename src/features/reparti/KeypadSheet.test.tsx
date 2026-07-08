/**
 * Component test del tastierone (FU-012 P1): verifica il CABLAGGIO UI→fonte-unica,
 * non i numeri — l'atteso è calcolato via verdictForPoint (LOCK haccp-rules),
 * mai hardcoded (RULE HACCP-lock). Il hook di scrittura è mockato: qui si prova
 * il gesto, non il DB (quello è verify:flows:write).
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { KeypadSheet } from './KeypadSheet'
import { verdictForPoint, VERDICT_WORDS } from '@/compliance/point-verdict'

const mutateAsync = vi.fn()
vi.mock('./hooks', () => ({
  useRegistraTemperatura: () => ({ mutateAsync }),
}))

const punto = {
  id: 'p1',
  name: 'Frigo 1',
  type: 'fridge',
  departmentName: 'Cucina',
  rule: null,
} as never

function renderSheet(overrides: { onSaved?: () => void; onClose?: () => void } = {}) {
  const onSaved = vi.fn()
  const onClose = vi.fn()
  render(
    <KeypadSheet
      punto={punto}
      open
      onClose={overrides.onClose ?? onClose}
      onSaved={overrides.onSaved ?? onSaved}
    />,
  )
  return { onSaved, onClose }
}

describe('KeypadSheet — 🌡️ regtemp', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue(undefined)
  })

  it('digita, atterra col verdetto della fonte-unica e salva', async () => {
    vi.useFakeTimers()
    try {
      const { onSaved, onClose } = renderSheet()

      fireEvent.click(screen.getByRole('button', { name: '4' }))
      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))

      // il sussurro mostrato È il verdetto che decide il LOCK per questo punto/valore
      const atteso = verdictForPoint('fridge', 4)
      expect(atteso).not.toBeNull()
      expect(screen.getByText(VERDICT_WORDS[atteso!].whisper)).toBeInTheDocument()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100)
      })
      expect(mutateAsync).toHaveBeenCalledWith({ punto, valueC: 4 })
      expect(onSaved).toHaveBeenCalledWith({ valueC: 4, verdict: atteso })
      expect(onClose).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('segno e cancella compongono il valore giusto (es. freezer sotto zero)', async () => {
    vi.useFakeTimers()
    try {
      renderSheet()
      fireEvent.click(screen.getByRole('button', { name: '1' }))
      fireEvent.click(screen.getByRole('button', { name: '9' }))
      fireEvent.click(screen.getByRole('button', { name: 'Cancella' }))
      fireEvent.click(screen.getByRole('button', { name: '8' }))
      fireEvent.click(screen.getByRole('button', { name: 'Cambia segno' }))
      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100)
      })
      expect(mutateAsync).toHaveBeenCalledWith({ punto, valueC: -18 })
    } finally {
      vi.useRealTimers()
    }
  })

  it('se il registro rifiuta la scrittura, mostra errore e NON chiude', async () => {
    vi.useFakeTimers()
    try {
      mutateAsync.mockRejectedValueOnce(new Error('RLS'))
      const { onSaved, onClose } = renderSheet()
      fireEvent.click(screen.getByRole('button', { name: '4' }))
      fireEvent.click(screen.getByRole('button', { name: 'Conferma' }))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100)
      })
      expect(onSaved).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(
        screen.getByText(/Non registrata — riprova/),
      ).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

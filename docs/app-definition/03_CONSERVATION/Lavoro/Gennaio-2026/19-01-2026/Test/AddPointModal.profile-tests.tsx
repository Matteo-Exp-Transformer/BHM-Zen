/**
 * Test per TASK-5.1: Profilo Conservazione
 * 
 * Estrazione dalla sezione "AddPointModal - TASK-5.1: Profilo Conservazione"
 * del file src/features/conservation/components/__tests__/AddPointModal.test.tsx
 * 
 * Questi test verificano:
 * - Sezione profilo visibile solo per frigoriferi
 * - Selezione categoria appliance e profilo
 * - Auto-configurazione categorie quando profilo selezionato
 * - Categorie read-only quando profilo attivo
 * - Validazione profilo obbligatorio per frigoriferi
 * - Note HACCP mostrate quando profilo selezionato
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor as rtlWaitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPointModal } from '../AddPointModal'

// Mock hooks (stessi mock del file originale)
vi.mock('@/features/management/hooks/useDepartments', () => ({
  useDepartments: vi.fn(() => ({
    departments: [
      { id: 'dept-1', name: 'Cucina', is_active: true },
      { id: 'dept-2', name: 'Mensa', is_active: true },
    ],
  })),
}))

vi.mock('@/features/management/hooks/useStaff', () => ({
  useStaff: vi.fn(() => ({
    staff: [
      { id: 'staff-1', first_name: 'Mario', last_name: 'Rossi', role: 'admin' },
    ],
  })),
}))

vi.mock('@/features/inventory/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { 
        id: 'cat-1', 
        name: 'Preparazioni/Pronti/Cotti (RTE)',
        temperature_requirements: { min_temp: 0, max_temp: 4 }
      },
      { 
        id: 'cat-2', 
        name: 'Latticini',
        temperature_requirements: { min_temp: 2, max_temp: 8 }
      },
      { 
        id: 'cat-3', 
        name: 'Carni crude',
        temperature_requirements: { min_temp: 0, max_temp: 4 }
      },
    ],
  })),
}))

vi.mock('@/features/conservation/hooks/useMaintenanceTasks', () => ({
  useMaintenanceTasks: vi.fn(() => ({
    maintenanceTasks: [],
    isLoading: false,
    error: null,
    stats: {
      total_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
    },
  })),
  calculateNextDue: vi.fn(() => new Date()),
}))

vi.mock('@/hooks/useCalendarSettings', () => ({
  useCalendarSettings: vi.fn(() => ({
    weekStartsOn: 1,
  })),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}))

describe('AddPointModal - TASK-5.1: Profilo Conservazione', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  it('should show profile section when pointType is fridge', async () => {
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Fridge type is already selected by default, but verify profile section appears
    // Wait for profile section to appear
    await rtlWaitFor(() => {
      expect(screen.getByText(/Profilo Punto di Conservazione/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })
  })

  it('should not show profile section when pointType is not fridge', async () => {
    const user = userEvent.setup()
    
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    const freezerButton = screen.getByText(/congelatore/i)
    await user.click(freezerButton)

    // Profile section should not be visible
    await rtlWaitFor(() => {
      expect(screen.queryByText(/Profilo Punto di Conservazione/i)).not.toBeInTheDocument()
    })
  })

  it('should show profile select after selecting appliance category', async () => {
    const user = userEvent.setup()
    
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Wait for profile section (fridge is default)
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })

    // Select appliance category
    const applianceLabel = screen.getByLabelText(/Categoria elettrodomestico/i)
    const applianceSelect = applianceLabel.closest('div')?.querySelector('button') || applianceLabel
    await user.click(applianceSelect as HTMLElement)

    await rtlWaitFor(() => {
      const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
      const option = applianceOptions.find(opt => {
        const parent = opt.closest('[role="option"]')
        return parent !== null
      })
      expect(option).toBeInTheDocument()
    })

    const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
    const applianceOption = applianceOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (applianceOption) {
      await user.click(applianceOption)
    }

    // Profile select should appear
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Profilo HACCP/i)).toBeInTheDocument()
    })
  })

  it('should auto-configure categories when profile is selected', async () => {
    const user = userEvent.setup()
    
    // Update mock to include categories that match profile categories
    const { useCategories } = await import('@/features/inventory/hooks/useCategories')
    vi.mocked(useCategories).mockReturnValue({
      categories: [
        { 
          id: 'cat-1', 
          name: 'Preparazioni/Pronti/Cotti (RTE)',
          temperature_requirements: { min_temp: 0, max_temp: 4, storage_type: 'fridge' }
        },
        { 
          id: 'cat-2', 
          name: 'Latticini',
          temperature_requirements: { min_temp: 2, max_temp: 8, storage_type: 'fridge' }
        },
        { 
          id: 'cat-3', 
          name: 'Carni crude',
          temperature_requirements: { min_temp: 0, max_temp: 4, storage_type: 'fridge' }
        },
      ],
    })

    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Select appliance category
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })

    const applianceLabel = screen.getByLabelText(/Categoria elettrodomestico/i)
    const applianceSelect = applianceLabel.closest('div')?.querySelector('button') || applianceLabel
    await user.click(applianceSelect as HTMLElement)

    await rtlWaitFor(() => {
      const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
      expect(applianceOptions.length).toBeGreaterThan(0)
    })

    const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
    const applianceOption = applianceOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (applianceOption) {
      await user.click(applianceOption)
    }

    // Select profile
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Profilo HACCP/i)).toBeInTheDocument()
    })

    const profileLabel = screen.getByLabelText(/Profilo HACCP/i)
    const profileSelect = profileLabel.closest('div')?.querySelector('button') || profileLabel
    await user.click(profileSelect as HTMLElement)

    await rtlWaitFor(() => {
      const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
      const option = profileOptions.find(opt => {
        const parent = opt.closest('[role="option"]')
        return parent !== null
      })
      expect(option).toBeInTheDocument()
    })

    const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
    const profileOption = profileOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (profileOption) {
      await user.click(profileOption)
    }

    // Categories should be auto-configured (read-only)
    await rtlWaitFor(() => {
      expect(screen.getByText(/auto-configurate/i)).toBeInTheDocument()
    })
  })

  it('should make categories read-only when profile is active', async () => {
    const user = userEvent.setup()
    
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Select appliance category
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })

    const applianceLabel = screen.getByLabelText(/Categoria elettrodomestico/i)
    const applianceSelect = applianceLabel.closest('div')?.querySelector('button') || applianceLabel
    await user.click(applianceSelect as HTMLElement)

    await rtlWaitFor(() => {
      const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
      expect(applianceOptions.length).toBeGreaterThan(0)
    })

    const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
    const applianceOption = applianceOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (applianceOption) {
      await user.click(applianceOption)
    }

    // Select profile
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Profilo HACCP/i)).toBeInTheDocument()
    })

    const profileLabel = screen.getByLabelText(/Profilo HACCP/i)
    const profileSelect = profileLabel.closest('div')?.querySelector('button') || profileLabel
    await user.click(profileSelect as HTMLElement)

    await rtlWaitFor(() => {
      const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
      const option = profileOptions.find(opt => {
        const parent = opt.closest('[role="option"]')
        return parent !== null
      })
      expect(option).toBeInTheDocument()
    })

    const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
    const profileOption = profileOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (profileOption) {
      await user.click(profileOption)
    }

    // Categories section should be read-only (opacity-75 pointer-events-none)
    await rtlWaitFor(() => {
      const categoriesSection = screen.getByText(/Categorie prodotti/i).closest('div')?.parentElement
      expect(categoriesSection).toHaveClass('opacity-75')
      // Note: pointer-events-none might not be testable with JSDOM
    })
  })

  it('should require profile selection for fridge type', async () => {
    const user = userEvent.setup()
    
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Fill required fields
    const nameInput = screen.getByLabelText(/nome/i)
    await user.type(nameInput, 'Test Point')

    // Select department
    const deptSelect = screen.getAllByRole('combobox')[0]
    await user.click(deptSelect)
    await rtlWaitFor(() => {
      expect(screen.getByText(/Cucina/i)).toBeInTheDocument()
    })
    await user.click(screen.getByText(/Cucina/i))

    // Select appliance category but NOT profile
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })

    const applianceLabel = screen.getByLabelText(/Categoria elettrodomestico/i)
    const applianceSelect = applianceLabel.closest('div')?.querySelector('button') || applianceLabel
    await user.click(applianceSelect as HTMLElement)

    await rtlWaitFor(() => {
      const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
      expect(applianceOptions.length).toBeGreaterThan(0)
    })

    const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
    const applianceOption = applianceOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (applianceOption) {
      await user.click(applianceOption)
    }

    // Try to submit without selecting profile
    const submitButton = screen.getByRole('button', { name: /crea|salva/i })
    await user.click(submitButton)

    // Validation should fail - profile is required for fridge type
    await rtlWaitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled()
    }, { timeout: 2000 })
    
    // Check for validation error (either inline or in summary)
    const error = screen.queryByText(/Seleziona un profilo HACCP|profilo.*obbligatorio/i)
    // Error might be in validation summary or inline
    if (!error) {
      // Check if error summary exists
      const errorSummary = screen.queryByText(/errori di validazione/i)
      expect(errorSummary).toBeTruthy()
    }
  })

  it('should show HACCP notes when profile is selected', async () => {
    const user = userEvent.setup()
    
    render(
      <AddPointModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    )

    // Select appliance category
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Categoria elettrodomestico/i)).toBeInTheDocument()
    })

    const applianceLabel = screen.getByLabelText(/Categoria elettrodomestico/i)
    const applianceSelect = applianceLabel.closest('div')?.querySelector('button') || applianceLabel
    await user.click(applianceSelect as HTMLElement)

    await rtlWaitFor(() => {
      const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
      expect(applianceOptions.length).toBeGreaterThan(0)
    })

    const applianceOptions = screen.getAllByText(/Frigorifero Verticale con Freezer/i)
    const applianceOption = applianceOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (applianceOption) {
      await user.click(applianceOption)
    }

    // Select profile
    await rtlWaitFor(() => {
      expect(screen.getByLabelText(/Profilo HACCP/i)).toBeInTheDocument()
    })

    const profileLabel = screen.getByLabelText(/Profilo HACCP/i)
    const profileSelect = profileLabel.closest('div')?.querySelector('button') || profileLabel
    await user.click(profileSelect as HTMLElement)

    await rtlWaitFor(() => {
      const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
      const option = profileOptions.find(opt => {
        const parent = opt.closest('[role="option"]')
        return parent !== null
      })
      expect(option).toBeInTheDocument()
    })

    const profileOptions = screen.getAllByText(/Profilo Massima Capienza/i)
    const profileOption = profileOptions.find(opt => {
      const parent = opt.closest('[role="option"]')
      return parent !== null
    })
    if (profileOption) {
      await user.click(profileOption)
    }

    // HACCP notes should appear
    await rtlWaitFor(() => {
      expect(screen.getByText(/Note HACCP/i)).toBeInTheDocument()
      expect(screen.getByText(/Temperatura consigliata/i)).toBeInTheDocument()
    })
  })
})

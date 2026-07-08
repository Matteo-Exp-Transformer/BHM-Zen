import { test, expect } from '@playwright/test'
import { requireDipendenteUser } from './helpers/env'

/**
 * Guard ruoli (§12.2 + dec. 9): il dipendente NON vede Regia — né in barra né via URL.
 * Login fresco senza lo storageState admin del setup.
 */
test.use({ storageState: { cookies: [], origins: [] } })

test('dipendente — non vede Regia (barra e route)', async ({ page }) => {
  const { email, password } = requireDipendenteUser()

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Entra' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Ecco il tuo oggi.')).toBeVisible({ timeout: 15_000 })

  // niente tab Regia nella barra (canDirect = false)
  await expect(page.getByRole('link', { name: 'Regia' })).toHaveCount(0)

  // la route diretta rimbalza su Oggi (RequireDirector → Navigate "/")
  await page.goto('/regia')
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Il dossier del controllo')).toHaveCount(0)
})

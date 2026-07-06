import { mkdir } from 'node:fs/promises'
import { test as setup, expect } from '@playwright/test'
import { requireTestUser } from './helpers/env'

const authFile = 'e2e/.auth/user.json'

/**
 * Login reale (solo-invito) → salva storageState per i test browser.
 * Stesso utente test di verify:flows — RLS attiva.
 */
setup('autentica utente test', async ({ page }) => {
  const { email, password } = requireTestUser()

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Entra' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Ecco il tuo oggi.')).toBeVisible({ timeout: 15_000 })

  await mkdir('e2e/.auth', { recursive: true })
  await page.context().storageState({ path: authFile })
})

import { test, expect } from '@playwright/test'

test.describe('smoke autenticato', () => {
  test('Oggi — diario caricato', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Ecco il tuo oggi.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Oggi' })).toBeVisible()
  })

  test('navigazione 4 case — admin vede Regia', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Scorte' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Regia' })).toBeVisible()

    await page.getByRole('link', { name: 'Reparti' }).click()
    await expect(page).toHaveURL(/\/reparti/)

    await page.getByRole('link', { name: 'Scorte' }).click()
    await expect(page).toHaveURL(/\/scorte/)

    await page.getByRole('link', { name: 'Regia' }).click()
    await expect(page).toHaveURL(/\/regia/)
  })

  test('login — pagina solo-invito', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'BHM' })).toBeVisible()
    await expect(page.getByText('Si entra su invito del titolare.')).toBeVisible()
    await ctx.close()
  })
})

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

  test('Calendario — agenda del mese', async ({ page }) => {
    await page.goto('/calendario')
    await expect(page.getByRole('heading', { name: 'Calendario' })).toBeVisible()
  })

  test('Scorte — inventario caricato', async ({ page }) => {
    await page.goto('/scorte')
    await expect(page.getByRole('heading', { name: 'Scorte' })).toBeVisible()
  })

  test('Regia — dossier e parametri (admin)', async ({ page }) => {
    await page.goto('/regia')
    await expect(
      page.getByRole('heading', { name: 'Il dossier del controllo' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Parametri HACCP/ }),
    ).toBeVisible()
  })

  test('Regia — struttura: reparti e punti modificabili (owner 08-07)', async ({ page }) => {
    await page.goto('/regia')
    await page.getByRole('button', { name: /Reparti & punti/ }).click()
    await expect(page.getByText('Punti di conservazione')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nuovo reparto' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Nuovo punto' })).toBeVisible()
    // il form del punto parla la lingua della fonte-unica (range atteso dal LOCK)
    await page.getByRole('button', { name: 'Nuovo punto' }).click()
    const sheet = page.getByRole('dialog', { name: 'Reparti e punti di conservazione' })
    await expect(sheet.getByText(/atteso .*°C/)).toBeVisible()
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

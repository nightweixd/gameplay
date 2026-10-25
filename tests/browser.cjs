const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const base = process.env.GAMEPLAY_TEST_URL || 'http://127.0.0.1:5180'
const output = path.resolve('test-results')
const chrome =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : undefined)

;(async () => {
  fs.mkdirSync(output, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: chrome,
    args: ['--enable-unsafe-swiftshader'],
  })
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
      reducedMotion: 'reduce',
    })
    const errors = [],
      failed = [],
      external = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
    })
    page.on('request', (request) => {
      if (!request.url().startsWith(base) && !request.url().startsWith('data:'))
        external.push(request.url())
    })
    const response = await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(response.status(), 200)
    await page.getByRole('heading', { name: 'Choose your adventure' }).waitFor()
    assert.deepEqual(
      await page.locator('.game-card h3').allTextContents(),
      ['Scratch', 'Minecraft', 'Python Carnival'],
      'adventures appear in Scratch, Minecraft, Python order',
    )
    const scratchLinks = page.locator('.scratch-card a')
    assert.equal(await scratchLinks.count(), 2)
    for (const link of await scratchLinks.all()) {
      assert.equal(await link.getAttribute('href'), 'https://scratch.mit.edu/')
      assert.equal(await link.getAttribute('target'), '_blank')
      assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
    }
    assert.equal(
      await page.getByRole('link', { name: 'GeniusCode+ Gameplay home', exact: true }).count(),
      1,
    )
    assert.equal(
      await page
        .locator('.brand-logo')
        .evaluate((image) => image.complete && image.naturalWidth > 0),
      true,
      'official logo loads',
    )
    assert.equal(
      await page.locator('link[rel="icon"]').getAttribute('href'),
      '/brand/geniuscode-logo.png',
    )
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      const header = await page.locator('.site-header').evaluate((element) => {
        const brand = element.querySelector('.brand').getBoundingClientRect()
        const navigation = element.querySelector('nav').getBoundingClientRect()
        return { brandRight: brand.right, navigationLeft: navigation.left, right: navigation.right }
      })
      assert.ok(
        header.brandRight + 4 <= header.navigationLeft,
        `${width}px logo and help must not overlap`,
      )
      assert.ok(header.right <= width, `${width}px header controls must fit`)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${width}px welcome overflow`,
      )
      await page.screenshot({ path: path.join(output, `welcome-${width}.png`), fullPage: true })
    }
    assert.equal(
      await page.locator('.future-card a,.future-card button').count(),
      0,
      'coming soon must not be clickable',
    )
    await page.getByRole('button', { name: 'How to play', exact: true }).click()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('dialog').count(), 0)
    assert.equal(
      await page
        .getByRole('button', { name: 'How to play', exact: true })
        .evaluate((button) => button === document.activeElement),
      true,
      'help must return focus',
    )
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.getByRole('link', { name: 'Play Minecraft', exact: true }).click()
    await page.getByRole('button', { name: 'Play', exact: true }).waitFor({ timeout: 30000 })
    await page.waitForFunction(() => !document.querySelector('button')?.disabled, {
      timeout: 30000,
    })
    await page.screenshot({ path: path.join(output, 'minecraft-start.png') })
    await page.getByRole('button', { name: 'How to Play', exact: true }).click()
    await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Play', exact: true }).click()
    await page.getByRole('button', { name: 'Code Builder', exact: true }).waitFor()
    await page.keyboard.press('Digit3')
    assert.equal(
      await page
        .getByRole('button', { name: '3: stone', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    )
    await page.keyboard.press('KeyC')
    await page
      .getByRole('heading', { name: 'Code Builder', exact: true })
      .waitFor({ timeout: 30000 })
    await page.locator('.blocklySvg').waitFor()
    assert.equal(await page.getByRole('dialog').count(), 1)
    assert.ok(
      (await page.locator('.blocklyBlockCanvas > .blocklyDraggable').count()) >= 1,
      'starter blocks rendered',
    )
    await page.screenshot({ path: path.join(output, 'minecraft-code-builder.png') })
    await page.getByRole('button', { name: 'Run code', exact: true }).click()
    await page
      .getByText('Done! Your agent ran 8 steps.', { exact: true })
      .waitFor({ timeout: 30000 })
    await page.screenshot({ path: path.join(output, 'minecraft-tower.png') })
    await page.keyboard.press('KeyC')
    await page.locator('.blocklySvg').waitFor()
    assert.ok(
      (await page.locator('.blocklyBlockCanvas > .blocklyDraggable').count()) >= 1,
      'blocks survive reopening',
    )
    await page.getByRole('button', { name: 'Back to world · C', exact: true }).click()
    await page.keyboard.press('KeyT')
    await page.getByRole('textbox', { name: 'Chat and commands', exact: false }).fill('help')
    await page.getByRole('button', { name: 'Send', exact: true }).click()
    await page
      .getByText('run = run your blocks · stop = stop agent · agent = bring agent to you', {
        exact: true,
      })
      .waitFor()
    await page.evaluate(() => {
      if (document.pointerLockElement) document.exitPointerLock()
      else window.dispatchEvent(new Event('blur'))
    })
    await page.getByRole('button', { name: 'Resume Game', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Reset agent', exact: true }).click()
    await page.getByRole('link', { name: 'All games', exact: true }).click()
    await page.getByRole('heading', { name: 'Choose your adventure' }).waitFor()
    await page.goto(`${base}/games/minecraft`, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Play', exact: true }).waitFor({ timeout: 30000 })
    assert.equal(
      await page.getByText('Done! Your agent ran 8 steps.', { exact: true }).count(),
      0,
      'new visit resets session',
    )
    assert.deepEqual(errors, [], 'no uncaught browser errors')
    assert.deepEqual(failed, [], 'no failed requests')
    assert.deepEqual(external, [], 'gameplay must not request external services')
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.context().route('https://scratch.mit.edu/', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<title>Scratch external link test</title>',
      }),
    )
    const popupReady = page.waitForEvent('popup')
    await page.getByRole('link', { name: 'Open Scratch', exact: true }).click()
    const scratchPage = await popupReady
    await scratchPage.waitForLoadState()
    assert.equal(scratchPage.url(), 'https://scratch.mit.edu/')
    assert.equal(await scratchPage.evaluate(() => window.opener), null)
    await scratchPage.close()
    console.log(
      'Browser checks passed: Scratch/Minecraft/Python order, direct Scratch link in a new tab, responsive welcome, help/focus, game entry/deep link, world, inventory, Blockly, 8-step agent execution, code retention, commands, pause/reset/exit, fresh sessions and no external requests before opening Scratch.',
    )
    console.log(`Screenshots: ${output}`)
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

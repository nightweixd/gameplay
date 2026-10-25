const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    filename,
  )
const { missions } = require('../src/games/python/missions.ts')

const base = process.env.GAMEPLAY_TEST_URL || 'http://127.0.0.1:5180'
const chrome =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : undefined)

;(async () => {
  fs.mkdirSync('test-results', { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: chrome })
  try {
    const page = await browser.newPage({
      viewport: { width: 1500, height: 1100 },
      reducedMotion: 'reduce',
    })
    const errors = [],
      failed = [],
      uploads = [],
      external = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`)
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD'].includes(request.method())) uploads.push(request.url())
      if (
        !request.url().startsWith(base) &&
        !request.url().startsWith('blob:') &&
        !request.url().startsWith('data:')
      )
        external.push(request.url())
    })
    // Vite preview does not implement Pages _headers; apply the exact worker policy here.
    await page.route('**/assets/python-runner.worker-*.js', async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'content-security-policy':
            "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'; worker-src 'none'",
        },
      })
    })
    await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(await page.getByText('3 adventures to explore', { exact: true }).count(), 1)
    await page.getByRole('link', { name: 'Play Python', exact: true }).click()
    await page.getByRole('heading', { name: 'Python Carnival', exact: true }).waitFor()
    for (const width of [1500, 1280, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${width}px Python layout overflow`,
      )
      await page.screenshot({ path: `test-results/python-${width}.png`, fullPage: true })
    }
    await page.setViewportSize({ width: 1500, height: 1100 })
    const editor = page.getByRole('textbox', { name: 'Python code', exact: true })
    const output = page.getByLabel('Python output', { exact: true })
    const run = async () => {
      await page.getByRole('button', { name: 'Run Python', exact: true }).click()
      await page
        .getByRole('button', { name: 'Run Python', exact: true })
        .waitFor({ timeout: 60000 })
    }
    await editor.fill(missions[0].solution)
    await run()
    await page.getByText('Festival stamp earned!', { exact: true }).waitFor({ timeout: 2000 })
    assert.match(await output.innerText(), /Welcome!/)
    assert.equal(await page.getByText('1 / 8 festival stamps', { exact: true }).count(), 1)
    await page.reload({ waitUntil: 'networkidle' })
    assert.equal(await editor.inputValue(), missions[0].solution, 'draft survives reload')
    assert.equal(
      await page.getByText('1 / 8 festival stamps', { exact: true }).count(),
      1,
      'stamp survives reload',
    )
    await run()
    assert.equal(
      await page.getByText('1 / 8 festival stamps', { exact: true }).count(),
      1,
      'repeat success must not award duplicate stamps',
    )
    for (const mission of missions.slice(1)) {
      await page
        .getByRole('button', { name: new RegExp(mission.title) })
        .first()
        .click()
      await editor.fill(mission.solution)
      await run()
      await page.getByText('Festival stamp earned!', { exact: true }).waitFor({ timeout: 2000 })
    }
    assert.equal(await page.getByText('8 / 8 festival stamps', { exact: true }).count(), 1)
    await page.screenshot({ path: 'test-results/python-complete.png', fullPage: true })
    await page.getByRole('button', { name: 'Free code', exact: true }).click()
    await editor.fill('print(6 * 7)')
    await run()
    assert.equal((await output.innerText()).trim(), '42')
    await editor.fill('print(input("Name? "))')
    await page
      .getByRole('textbox', {
        name: 'One answer per line, in the order your program asks.',
        exact: true,
      })
      .fill('Ada')
    await run()
    assert.match(await output.innerText(), /Ada/)
    await editor.fill('print("<img src=x onerror=alert(1)>")')
    await run()
    assert.match(await output.innerText(), /<img/)
    assert.equal(await output.locator('img').count(), 0, 'Python output must never be HTML')
    await editor.fill('if True\n    print("oops")')
    await run()
    await page
      .getByText(/SyntaxError:/)
      .first()
      .waitFor()
    await editor.fill('while True:\n    pass')
    await run()
    await page
      .getByRole('status')
      .filter({ hasText: 'Stopped after 5 seconds' })
      .waitFor({ timeout: 2000 })
    await editor.fill('while True:\n    pass')
    await page.getByRole('button', { name: 'Run Python', exact: true }).click()
    await page
      .getByRole('status')
      .filter({ hasText: 'Running your Python' })
      .waitFor({ timeout: 45000 })
    await page.getByRole('button', { name: 'Stop', exact: true }).click()
    await page.getByRole('button', { name: 'Run Python', exact: true }).waitFor()
    await editor.fill('print("Recovered")')
    await run()
    assert.equal((await output.innerText()).trim(), 'Recovered', 'fresh worker after stop/timeout')
    await page.getByRole('button', { name: 'Reset code', exact: true }).click()
    await page.getByRole('dialog').waitFor()
    await page.getByRole('button', { name: 'Keep my code', exact: true }).click()
    assert.equal(await editor.inputValue(), 'print("Recovered")', 'reset cancellation keeps draft')
    const downloadEvent = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download Python code', exact: true }).click()
    assert.equal((await downloadEvent).suggestedFilename(), 'my-python-playground.py')
    await page.getByRole('link', { name: 'All games', exact: true }).click()
    await page.getByRole('heading', { name: 'Choose your adventure' }).waitFor()
    assert.deepEqual(errors, [], 'no uncaught browser errors')
    assert.deepEqual(failed, [], 'no failed assets')
    assert.deepEqual(uploads, [], 'no code or inputs uploaded')
    assert.deepEqual(external, [], 'no external runtime CDN or API')
    console.log(
      'Python browser checks passed: eight missions, real Python, responsive layout, stamps/drafts, free code, input/output, errors, stop/timeout/recovery, downloads, and no uploads or external requests under the production worker policy.',
    )
  } finally {
    await browser.close()
  }
})().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

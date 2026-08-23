import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

/**
 * Alguns entorns porten Chromium preinstal·lat en una versió que no coincideix
 * amb la que baixaria aquesta versió de Playwright. Si el binari hi és, el fem
 * servir; si no, s'utilitza el que Playwright gestioni.
 */
const PREINSTALLED_CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const executablePath = existsSync(PREINSTALLED_CHROME) ? PREINSTALLED_CHROME : undefined

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'off',
    launchOptions: { args: ['--no-sandbox'], ...(executablePath ? { executablePath } : {}) },
  },
  projects: [
    { name: 'iphone-15', use: { ...devices['Desktop Chrome'], viewport: { width: 393, height: 852 }, isMobile: false, hasTouch: true } },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

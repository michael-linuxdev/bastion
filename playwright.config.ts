import { defineConfig, devices } from '@playwright/test';

// Unterordner wie im Deployment (z. B. "/bastion/"), damit genau das getestet
// wird, was ausgeliefert wird.
const basis = process.env['BASE_PATH'] ?? '/';
const port = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}${basis}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Testet den fertigen Build (pnpm build vorher ausführen), nicht den Entwicklungsserver.
  webServer: {
    command: `pnpm preview --port ${port} --strictPort`,
    url: `http://localhost:${port}${basis}`,
    reuseExistingServer: !process.env['CI'],
  },
});

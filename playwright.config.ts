import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  /*
   * One retry. Against `next dev` the server recompiles each route on first
   * request, and 240+ parallel tests can push a cold route past the timeout —
   * a slow machine, not a broken product. A test that fails twice is real.
   *
   * The canonical run is against `next build && next start`, which is what
   * ships. Dev is worth running too: React strips hydration warnings from
   * production builds, so hydration bugs are only visible in dev.
   */
  retries: 1,
  /*
   * Capped. `next dev` compiles each route on first request, and unbounded
   * parallelism starves it badly enough that healthy tests time out — which
   * makes real failures indistinguishable from load. Four workers keeps the
   * whole suite honest on both targets at a modest cost in wall-clock.
   */
  workers: 4,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});

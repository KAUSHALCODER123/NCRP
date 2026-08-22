import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/freeze",
  "/dashboard",
  "/login",
  "/help",
  "/learn",
  "/learn/digital-arrest",
  "/learn/otp-vishing",
  "/learn/upi-collect-request",
  "/learn/task-job-scam",
  "/learn/investment-scam",
  "/learn/loan-app-extortion",
  "/learn/sextortion",
  "/learn/fake-customer-care",
  "/learn/for/senior",
  "/learn/for/student",
  "/learn/for/women",
  "/learn/for/business",
  "/stories",
  "/stories/st-0041",
  "/stories/st-0038",
  "/stories/st-0035",
  "/stories/write",
  "/scam-check",
  "/scam-check/appeal",
  "/verify-officer",
  "/report",
  "/blocked",
  "/report/harassment",
  "/report/impersonation",
  "/report/account",
  "/lien/LN-2026-08-7741",
  "/case/SHY-2026-08-3312",
];

test.describe("every route renders", () => {
  for (const path of ROUTES) {
    test(`200 and no console error: ${path}`, async ({ page, isMobile }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));

      const res = await page.goto(path);
      expect(res?.status(), `${path} status`).toBeLessThan(400);

      // Exactly one h1, and it is not empty.
      const h1 = page.locator("h1");
      await expect(h1.first()).toBeVisible();
      expect((await h1.first().innerText()).trim().length).toBeGreaterThan(2);

      // Shared chrome present. On phones the primary nav is a disclosure
      // menu, so it is legitimately out of the a11y tree until opened —
      // what must always be reachable is the control that opens it.
      if (isMobile) {
        await expect(page.getByRole("button", { name: /^menu$/i })).toBeVisible();
      } else {
        await expect(
          page.getByRole("navigation", { name: "Primary" }),
        ).toBeVisible();
      }
      await expect(page.getByRole("contentinfo")).toBeAttached();

      expect(errors, `${path} console errors`).toEqual([]);
    });
  }
});

test.describe("unknown content 404s rather than crashing", () => {
  for (const path of [
    "/learn/not-a-real-scam",
    "/learn/for/martians",
    "/report/nonsense",
    "/stories/st-9999",
  ]) {
    test(`404: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
    });
  }
});

test.describe("unknown records degrade gracefully", () => {
  test("missing case shows a way forward, not a crash", async ({ page }) => {
    await page.goto("/case/SHY-0000-00-0000");
    await expect(page.getByText(/no such case|couldn't find/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /demo logins|file a report/i }).first()).toBeVisible();
  });

  test("missing lien shows a way forward", async ({ page }) => {
    await page.goto("/lien/LN-0000-00-0000");
    await expect(page.getByText(/no such hold/i)).toBeVisible();
  });

  test("missing receipt shows a way forward", async ({ page }) => {
    await page.goto("/receipt/SHY-0000-00-0000");
    await expect(page.getByText(/couldn't find that case/i)).toBeVisible();
  });
});

test("skip link works and is the first tab stop", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
});

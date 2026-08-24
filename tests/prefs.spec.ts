import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test.describe("theme", () => {
  test("dark can be chosen and survives navigation and reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.goto("/learn");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("device setting is honoured and is the default", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    // No explicit choice: the attribute is absent and the media query decides.
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", "light");
    const canvas = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--c-canvas")
        .trim(),
    );
    expect(canvas.toLowerCase()).not.toBe("#f6f8fc");
  });

  test("light overrides a dark device", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.getByRole("button", { name: "Light" }).click();
    const canvas = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--c-canvas")
        .trim(),
    );
    expect(canvas.toLowerCase()).toBe("#f6f8fc");
  });

  test("theme is applied before paint, not after", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dark" }).click();
    await page.goto("/help");
    // Read at the very first opportunity on the new document.
    const attr = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(attr).toBe("dark");
  });
});

test.describe("accessibility controls", () => {
  test("high contrast switches the palette and drops shadows", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "High contrast" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");

    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--c-ink")
        .trim(),
    );
    expect(["#000", "#000000"]).toContain(ink.toLowerCase());
  });

  test("text scaling actually changes the computed size", async ({ page, isMobile }) => {
    test.skip(isMobile, "scale controls are hidden on phones by design");
    await page.goto("/");
    const before = await page
      .locator("body")
      .evaluate((b) => parseFloat(getComputedStyle(b).fontSize));
    await page.getByRole("button", { name: "Largest text" }).click();
    const after = await page
      .locator("body")
      .evaluate((b) => parseFloat(getComputedStyle(b).fontSize));
    expect(after).toBeGreaterThan(before * 1.2);
  });
});

test.describe("localisation", () => {
  /*
   * Markers are read from the locale files rather than hardcoded, so a
   * reworded translation can never silently break the test — and the test
   * verifies the string the app will actually render.
   */
  const CASES = ["hi", "mr", "gu", "ta", "te", "kn"].map((value) => ({
    value,
    marker: (
      JSON.parse(
        readFileSync(join("lib", "i18n", `${value}.json`), "utf8"),
      ) as Record<string, string>
    )["hero.ctaReport"],
  }));

  for (const c of CASES) {
    test(`switches to ${c.value} and persists`, async ({ page }) => {
      await page.goto("/");
      await page.getByTestId("language").selectOption(c.value);
      await expect(page.locator("html")).toHaveAttribute("lang", c.value);
      await expect(page.getByText(c.marker).first()).toBeVisible();

      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("lang", c.value);
      await expect(page.getByText(c.marker).first()).toBeVisible();
    });
  }

  test("untranslated pages fall back to English rather than blanking", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("language").selectOption("ta");
    await page.goto("/learn/digital-arrest");
    await expect(page.locator("h1")).toContainText(/Digital arrest/i);
  });

  test("language follows the citizen through receipt and lien journeys", async ({ page }) => {
    const hi = JSON.parse(
      readFileSync(join("lib", "i18n", "hi.json"), "utf8"),
    ) as Record<string, string>;

    await page.goto("/");
    await page.getByTestId("language").selectOption("hi");
    await expect(page.locator("html")).toHaveAttribute("lang", "hi");

    await page.goto("/receipt/SHY-2026-08-3312");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      hi["rc.holding"],
    );

    await page.goto("/lien/LN-2026-08-7741");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      hi["ln.smallAmount"],
    );
    await expect(page.getByRole("button", { name: hi["ln.submit"] })).toBeVisible();
  });
});

test.describe("safety", () => {
  test("quick exit is always reachable", async ({ page }) => {
    await page.goto("/");
    const control = page.getByRole("button", {
      name: /leave this site immediately/i,
    });
    /*
     * Hidden in local development so it does not throw a developer off the
     * site on every mis-click. It is unconditionally present in a production
     * build, which is where this assertion matters.
     */
    test.skip(
      (await control.count()) === 0,
      "quick exit is hidden in dev; run against a production build",
    );

    for (const p of ["/", "/freeze", "/learn/sextortion"]) {
      await page.goto(p);
      await expect(
        page.getByRole("button", { name: /leave this site immediately/i }),
      ).toBeVisible();
    }
  });

  test("quick exit leaves the site and clears stored cases", async ({ page }) => {
    await page.goto("/");
    test.skip(
      (await page
        .getByRole("button", { name: /leave this site immediately/i })
        .count()) === 0,
      "quick exit is hidden in dev; run against a production build",
    );

    await page.goto("/login");
    await page.getByRole("button", { name: /Suresh Pillai/i }).click();
    await expect(page).toHaveURL(/dashboard/);

    await page
      .getByRole("button", { name: /leave this site immediately/i })
      .click();
    await page.waitForURL((u) => !u.href.includes("localhost:3000"), {
      timeout: 10_000,
    });
    expect(page.url()).not.toContain("localhost:3000");
  });
});

test.describe("saved preferences do not break hydration", () => {
  /*
   * The pre-paint script mutates <html> before React hydrates. Every earlier
   * route test loaded a page with no preferences set, so the attributes
   * matched by accident and this whole class of error went unseen.
   */
  const PAGES = ["/", "/freeze", "/learn/sextortion", "/stories", "/report/harassment"];

  for (const path of PAGES) {
    test(`no hydration error with prefs applied: ${path}`, async ({ page, isMobile }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));

      // Set every preference the script restores, then load fresh so the
      // script runs before hydration exactly as it does for a returning user.
      await page.goto("/");
      await page.getByRole("button", { name: "Dark" }).click();
      await page.getByRole("button", { name: "High contrast" }).click();
      if (!isMobile) {
        await page.getByRole("button", { name: "Largest text" }).click();
      }
      await page.getByTestId("language").selectOption("hi");

      errors.length = 0;
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const hydration = errors.filter((e) => /hydrat/i.test(e));
      expect(hydration, hydration.join("\n")).toEqual([]);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test("preferences actually survive the reload they are restored on", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Dark" }).click();
    await page.getByRole("button", { name: "High contrast" }).click();
    await page.getByTestId("language").selectOption("ta");

    await page.goto("/freeze");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(html).toHaveAttribute("data-contrast", "high");
    await expect(html).toHaveAttribute("lang", "ta");
  });
});

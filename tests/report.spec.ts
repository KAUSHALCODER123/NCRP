import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test.describe("harassment report", () => {
  test("safety guidance comes before anything is collected", async ({ page }) => {
    await page.goto("/report/harassment");
    await expect(page.getByText(/Before you start/i)).toBeVisible();
    await expect(page.getByText(/Quick exit/i).first()).toBeVisible();
    await expect(page.getByText(/never have to give your name/i)).toBeVisible();
    // No form fields until a situation is chosen.
    await expect(page.getByLabel(/Link, username or platform/i)).toBeHidden();
  });

  test("choosing a situation gives one action before any form", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /Private photos or videos/i }).click();
    await expect(page.getByText(/Do this first/i)).toBeVisible();
    await expect(page.getByText(/Do not pay and do not reply/i)).toBeVisible();
  });

  test("anonymous is the default and yields a claim token", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /Someone is demanding money/i }).click();

    const anon = page.getByRole("radio", { name: /Without my name/i });
    await expect(anon).toBeChecked();

    await page.getByLabel(/Link, username or platform/i).fill("instagram.com/fake_account");
    await page.getByRole("button", { name: /Getting the content taken down/i }).click();

    await expect(page.getByText(/Recorded without your name/i)).toBeVisible({
      timeout: 20_000,
    });
    // The token is the only route back to an anonymous report.
    await expect(page.getByText(/only way back to this report/i)).toBeVisible();
  });

  test("takedown notices are dispatched to platforms", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /will not leave me alone/i }).click();
    await page.getByLabel(/Link, username or platform/i).fill("telegram");
    await page.getByRole("button", { name: /Getting the content taken down/i }).click();

    await expect(page.getByText(/Notice sent/i).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/preserve/i).first()).toBeVisible();
  });

  test("a child-related report is offered without a name", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /A child is involved/i }).click();
    await expect(page.getByText(/highest priority/i)).toBeVisible();
    await expect(page.getByText(/Do not share or forward/i)).toBeVisible();
  });
});

test.describe("other report kinds", () => {
  test("impersonation has no anonymous option and says why to act", async ({ page }) => {
    await page.goto("/report/impersonation");
    await expect(page.getByRole("radio", { name: /Without my name/i })).toBeHidden();
    await page.getByRole("button", { name: /fake profile using my name/i }).click();
    await expect(page.getByText(/Do not message the account yourself/i)).toBeVisible();
  });

  test("hacked email is prioritised as the master key", async ({ page }) => {
    await page.goto("/report/account");
    await page.getByRole("button", { name: /My email was taken over/i }).click();
    await expect(page.getByText(/master key/i)).toBeVisible();
  });

  test("banking takeover is redirected to the faster money path", async ({ page }) => {
    await page.goto("/report/account");
    await page.getByRole("button", { name: /banking or payment app/i }).click();
    await expect(page.getByText(/report that first/i)).toBeVisible();
  });
});

test.describe("the emergency path is localised", () => {
  /*
   * Read from the locale files rather than hardcoded. A reworded translation
   * is not a regression, and a test that breaks on one is testing the wrong
   * thing — this asserts the app renders the string it actually ships.
   */
  const CASES = ["hi", "ta", "kn"].map((value) => ({
    value,
    marker: (
      JSON.parse(
        readFileSync(join("lib", "i18n", `${value}.json`), "utf8"),
      ) as Record<string, string>
    )["fz.step1"],
  }));

  for (const c of CASES) {
    test(`freeze flow in ${c.value}`, async ({ page }) => {
      await page.goto("/");
      await page.getByTestId("language").selectOption(c.value);
      await page.goto("/freeze");
      await expect(page.getByText(c.marker).first()).toBeVisible();
    });
  }
});

test.describe("choosing what kind of crime", () => {
  test("Report a crime asks the type first, not for a transaction", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: /^menu$/i }).click();
    await page.getByRole("link", { name: /report a crime/i }).first().click();

    await expect(page).toHaveURL(/\/report$/);
    // The old behaviour dropped everyone into the financial form.
    await expect(page.getByLabel(/Transaction reference/i)).toBeHidden();

    for (const name of [
      /financial fraud/i,
      /women/i,
      /pretending to be you/i,
      /account was hacked/i,
    ]) {
      await expect(page.getByRole("link", { name }).first()).toBeVisible();
    }
  });

  test("each choice reaches its own flow", async ({ page }) => {
    for (const [name, url] of [
      [/financial fraud/i, /\/freeze$/],
      [/women/i, /\/report\/harassment$/],
      [/pretending to be you/i, /\/report\/impersonation$/],
      [/account was hacked/i, /\/report\/account$/],
    ] as const) {
      await page.goto("/report");
      await page.getByRole("link", { name }).first().click();
      await expect(page).toHaveURL(url);
    }
  });
});

test.describe("report flows are localised", () => {
  for (const loc of ["hi", "ta", "kn"]) {
    test(`harassment flow content in ${loc}`, async ({ page }) => {
      await page.goto("/");
      await page.getByTestId("language").selectOption(loc);
      await page.goto("/report/harassment");
      await page.waitForLoadState("networkidle");

      const text = await page.locator("main").innerText();
      // Both the chrome and the flow's own copy must translate — the copy
      // lives in report-kinds.ts and used to stay English.
      const latinSentences = text
        .split("\n")
        .filter((l) => /^[A-Za-z][A-Za-z ,.'’—-]{35,}$/.test(l.trim()));
      expect(latinSentences, latinSentences.join("\n")).toEqual([]);
    });
  }
});

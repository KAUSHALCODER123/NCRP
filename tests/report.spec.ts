import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test.describe("harassment report", () => {
  test("safety guidance comes before anything is collected", async ({ page }) => {
    await page.goto("/report/harassment");
    await expect(page.getByText(/Before you start/i)).toBeVisible();
    await expect(page.getByText(/private device/i).first()).toBeVisible();
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

    const token = (await page.getByText(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/).textContent())!;
    await page.getByRole("link", { name: /Track it/i }).click();
    await page.getByLabel(/Anonymous tracking code/i).fill(token);
    await page.getByRole("button", { name: /Find my report/i }).click();

    await expect(page.getByText(token)).toBeVisible();
    await expect(page.getByText(/Someone is demanding money/i)).toBeVisible();
    await expect(page.getByText(/Report open/i)).toBeVisible();

    // The anonymous receipt survives a refresh without becoming a login.
    await page.reload();
    await page.getByLabel(/Anonymous tracking code/i).fill(token);
    await page.getByRole("button", { name: /Find my report/i }).click();
    await expect(page.getByText(token)).toBeVisible();
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

test.describe("the identifier decides where the notice goes", () => {
  test("a phone number adds the telecom route a platform cannot do", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /Someone is demanding money/i }).click();
    await page.getByLabel(/Link, username or platform|Where is it happening/i)
      .or(page.locator("#where"))
      .first()
      .fill("9142207781");

    await expect(page.getByText(/telecom operator/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Getting the content taken down/i }).click();
    await expect(page.getByText(/Chakshu/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test("a profile link routes to the platform, not the telecom operator", async ({ page }) => {
    await page.goto("/report/impersonation");
    await page.getByRole("button", { name: /fake profile using my name/i }).click();
    await page.locator("#where").fill("instagram.com/fake_account_123");

    await expect(page.getByText(/Recognised as a link/i)).toBeVisible();
    await expect(page.getByText(/Chakshu/i)).toBeHidden();
  });

  test("a UPI ID routes to the bank behind it", async ({ page }) => {
    await page.goto("/report/impersonation");
    await page.getByRole("button", { name: /asking my contacts for money/i }).click();
    await page.locator("#where").fill("rahul.verma@ybl");

    await expect(page.getByText(/Recognised as a UPI ID/i)).toBeVisible();
    // Already reported by others, so the report joins an existing cluster.
    await expect(page.getByText(/already reported this/i)).toBeVisible();
  });

  test("evidence copy matches what is being collected", async ({ page }) => {
    await page.goto("/report/harassment");
    await page.getByRole("button", { name: /Someone is demanding money/i }).click();
    // A bank receipt prompt on a blackmail report is nonsense.
    await expect(page.getByText(/bank SMS screenshot/i)).toBeHidden();
    await expect(page.getByText(/screenshots of what they sent/i)).toBeVisible();

    await page.goto("/freeze");
    await page.getByRole("button", { name: /In the last 2 hours/i }).click();
    await page.getByRole("button", { name: /No — file directly here/i }).click();
    await page.getByRole("button", { name: /Continue to transaction details/i }).click();
    await expect(page.getByText(/bank SMS screenshot/i)).toBeVisible();
  });
});

test.describe("hero shows every kind of crime, without rotating", () => {
  test("all four kinds are reachable, money is the default", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  });

  test("nothing rotates on its own", async ({ page }) => {
    await page.goto("/");
    const selected = () =>
      page.getByRole("tab", { selected: true }).getAttribute("id");
    const before = await selected();
    await page.waitForTimeout(6000);
    // An auto-advancing hero would move the emergency demo away from a reader.
    expect(await selected()).toBe(before);
  });

  test("switching tabs shows that crime's own recipients", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /blackmail/i }).click();

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /take away their leverage/i,
    );
    await expect(
      page.getByRole("link", { name: /report blackmail/i }),
    ).toHaveAttribute("href", "/report/harassment");

    const panel = page.getByRole("tabpanel");
    await expect(panel.getByText(/Chakshu/i)).toBeVisible();
    await expect(panel.getByText(/WhatsApp/i)).toBeVisible();
    // The money demo's bank list must not linger.
    await expect(panel.getByText(/Paytm Payments Bank/i)).toBeHidden();
  });

  test("tabs are keyboard navigable", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab").first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: /blackmail/i }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(
      page.getByRole("tab", { name: /hacked account/i }),
    ).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("the person whose account is blocked has a door", () => {
  test("home offers it as a real option, not an essay", async ({ page }) => {
    await page.goto("/");
    // The old section explained mule accounts and hop numbers at someone who
    // came here to do something. It should be gone.
    await expect(page.getByText(/mule account/i)).toBeHidden();
    await expect(page.getByText(/hop 1/i)).toBeHidden();
    await expect(page.getByText(/2\.18%/)).toBeHidden();

    await page.getByRole("link", { name: /money in my account is blocked/i }).first().click();
    await expect(page).toHaveURL(/\/blocked$/);
  });

  test("it answers what that person is actually asking", async ({ page }) => {
    await page.goto("/blocked");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/blocked/i);
    // Am I in trouble? How much is held? How do I fix it? How long?
    await expect(page.getByText(/not a suspect/i)).toBeVisible();
    await expect(page.getByText(/rest of your balance works normally/i)).toBeVisible();
    await expect(page.getByText(/about two minutes/i)).toBeVisible();
    await expect(page.getByText(/7 days/i)).toBeVisible();
    // And no jargon.
    await expect(page.getByText(/mule|hop \d/i)).toBeHidden();
  });
});

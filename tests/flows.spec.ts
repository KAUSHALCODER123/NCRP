import { test, expect, type Page } from "@playwright/test";

/** Step 1 of the freeze triage. */
async function triage(page: Page) {
  await page.goto("/freeze");
  await page.getByRole("button", { name: /In the last 2 hours/i }).click();
  await page.getByRole("button", { name: /No — file directly here/i }).click();
  await page.getByRole("button", { name: /Continue to transaction details/i }).click();
}

test.describe("emergency freeze flow", () => {
  test("SMS paste fills the form and dispatches a freeze", async ({ page }) => {
    await triage(page);

    await page.getByRole("button", { name: "UPI debit — HDFC" }).click();
    await expect(page.getByLabel("Amount taken")).toHaveValue(/47500/);
    await expect(page.getByLabel("Which bank or wallet")).toHaveValue(/HDFC/);

    await page.getByLabel("Your mobile number").fill("9876543210");
    const submit = page.getByRole("button", { name: /Freeze now/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText(/Freeze request sent/i)).toBeVisible();
    await expect(page.getByText(/is open/i)).toBeVisible();
    // Identity verification runs alongside, never in front of, the freeze.
    await expect(page.getByText(/Freeze already sent/i)).toBeVisible();
  });

  test("cannot dispatch without an amount and a bank", async ({ page }) => {
    await triage(page);
    await expect(
      page.getByRole("button", { name: /Enter the amount and bank/i }),
    ).toBeDisabled();
  });

  test("rejects a zero or negative amount", async ({ page }) => {
    await triage(page);
    await page.getByLabel("Amount taken").fill("0");
    await expect(page.getByText(/must be more than zero/i)).toBeVisible();
    await page.getByLabel("Amount taken").fill("-500");
    await expect(page.getByText(/must be more than zero/i)).toBeVisible();
  });

  test("flags high severity at one lakh", async ({ page }) => {
    await triage(page);
    await page.getByLabel("Amount taken").fill("100000");
    await expect(page.getByText(/High severity/i).first()).toBeVisible();
    await expect(page.getByText(/e-Zero FIR/i).first()).toBeVisible();
  });

  test("mobile number validation is specific, not generic", async ({ page }) => {
    await triage(page);
    const m = page.getByLabel("Your mobile number");
    await m.fill("12345");
    await expect(page.getByText(/too short/i)).toBeVisible();
    await m.fill("1234567890");
    await expect(page.getByText(/start with 6, 7, 8 or 9/i)).toBeVisible();
    await m.fill("9876543210");
    await expect(page.getByText(/start with 6, 7, 8 or 9/i)).toBeHidden();
  });

  test("does not pretend to send an OTP without a valid demo number", async ({ page }) => {
    await triage(page);
    await page.getByLabel("Amount taken").fill("5000");
    await page.getByLabel("Which bank or wallet").fill("HDFC Bank");
    await expect(page.getByRole("button", { name: /Enter the demo mobile/i })).toBeDisabled();
    await page.getByRole("button", { name: /Use demo number/i }).click();
    await page.getByRole("button", { name: /Freeze now/i }).click();
    await expect(page.getByText(/No SMS was sent\. Dummy OTP/i)).toBeVisible();
  });

  test("a short UTR warns but never blocks reporting", async ({ page }) => {
    await triage(page);
    await page.getByLabel("Amount taken").fill("5000");
    await page.getByLabel("Which bank or wallet").fill("HDFC Bank");
    await page.getByRole("button", { name: /Use demo number/i }).click();
    await page.getByLabel(/Transaction reference/i).fill("4239871234");
    await expect(page.getByText(/2 more to find/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Freeze now/i })).toBeEnabled();
  });

  test("accepts characters the official portal rejects", async ({ page }) => {
    await triage(page);
    await page.getByLabel(/Who was paid/i).fill("rahul.verma@ybl #$*'~|!");
    await expect(page.getByLabel(/Who was paid/i)).toHaveValue(/@ybl/);
  });

  test("receipt streams bank acknowledgements and holds money", async ({ page }) => {
    await triage(page);
    await page.getByRole("button", { name: "UPI debit — HDFC" }).click();
    await page.getByLabel("Your mobile number").fill("9876543210");
    await page.getByRole("button", { name: /Freeze now/i }).click();
    await page.getByRole("link", { name: /Watch the banks respond/i }).click();

    await expect(page).toHaveURL(/\/receipt\//);
    await expect(page.getByText(/Money held so far/i)).toBeVisible();
    // All three institutions settle.
    await expect(page.getByText(/3 of 3 responded/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/RBI 3-day window/i)).toBeVisible();
  });

  test("a filed case survives a reload", async ({ page }) => {
    await triage(page);
    await page.getByRole("button", { name: "UPI debit — HDFC" }).click();
    await page.getByLabel("Your mobile number").fill("9876543210");
    await page.getByRole("button", { name: /Freeze now/i }).click();
    await page.getByRole("link", { name: /Watch the banks respond/i }).click();
    await page.waitForURL(/\/receipt\//);
    const url = page.url();
    await page.reload();
    expect(page.url()).toBe(url);
    await expect(page.getByText(/Money held so far/i)).toBeVisible();
  });

  test("a signed-out citizen can reopen a financial case by case ID", async ({ page }) => {
    await triage(page);
    await page.getByRole("button", { name: "UPI debit — HDFC" }).click();
    await page.getByRole("button", { name: /Use demo number/i }).click();
    await page.getByRole("button", { name: /Freeze now/i }).click();
    const opened = (await page.getByText(/Case SHY-.* is open/i).textContent())!;
    const caseId = opened.match(/SHY-[0-9-]+/)![0];

    await page.goto("/dashboard");
    await page.getByLabel(/Tracking code or case ID/i).fill(caseId);
    await page.getByRole("button", { name: /Find my report/i }).click();
    await expect(page.getByText(caseId)).toBeVisible();
    await page.getByRole("link", { name: /Track it/i }).click();
    await expect(page).toHaveURL(new RegExp(`/case/${caseId}$`));
  });

  test("a duplicate opens the existing case without another freeze", async ({ page }) => {
    await triage(page);
    await page.getByRole("button", { name: "UPI debit — HDFC" }).click();
    await page.getByLabel(/Transaction reference/i).fill("456123789012");
    await Promise.all([
      page.waitForURL(/\/case\/SHY-2026-08-2904#add-details$/),
      page.getByRole("button", { name: /Open existing case/i }).click(),
    ]);
    await expect(page.getByText(/Tell us what happened/i)).toBeVisible();
  });
});

test.describe("collateral victim flow", () => {
  test("hold shows the disputed amount and the usable balance", async ({ page }) => {
    await page.goto("/lien/LN-2026-08-7741");
    await expect(page.getByText("₹5,000").first()).toBeVisible();
    await expect(page.getByText("₹9,95,000").first()).toBeVisible();
    await expect(page.getByText(/Still yours to use/i)).toBeVisible();
    await expect(page.getByText(/You are here/i)).toBeVisible();
  });

  test("dispute requires evidence, then runs both SLA clocks to a NOC", async ({ page }) => {
    await page.goto("/lien/LN-2026-08-7741");

    const submit = page.getByRole("button", { name: /Submit dispute/i });
    await expect(submit).toBeDisabled();

    await page.getByRole("button", { name: /Sale invoice/i }).click();
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByText(/Bank review/i).first()).toBeVisible();

    const advance = page.getByRole("button", { name: /Simulate the next official step/i });
    await advance.click();
    await expect(page.getByText(/Officer decision/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Simulate the next official step/i }).click();
    await expect(page.getByText(/No Objection Certificate issued/i)).toBeVisible();
    await expect(page.getByText(/Hold lifted — /i)).toBeVisible();
  });
});

test.describe("public tools", () => {
  test("scam check flags a reported identifier", async ({ page }) => {
    await page.goto("/scam-check");
    await page.getByRole("button", { name: "rahul.verma@ybl" }).click();
    await expect(page.getByText(/High risk/i)).toBeVisible();
    await expect(page.getByText(/213/)).toBeVisible();
    await expect(page.getByText(/Do not pay/i)).toBeVisible();
  });

  test("an unknown identifier is not called safe", async ({ page }) => {
    await page.goto("/scam-check");
    await page.getByLabel(/UPI ID, phone number or link/i).fill("someone@okicici");
    await page.getByRole("button", { name: /Check it/i }).click();
    await expect(page.getByText(/not.*the same as safe/i)).toBeVisible();
  });

  test("the seeded lookup is labelled, and real services are offered", async ({ page }) => {
    await page.goto("/scam-check");
    // The demo database must never pass itself off as real complaint data.
    await expect(page.getByText(/Demo data/i).first()).toBeVisible();
    await expect(page.getByText(/not real complaints/i)).toBeVisible();

    // Services that genuinely perform a lookup today.
    for (const name of ["Chakshu", "TAFCOP", "CEIR"]) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
    await expect(
      page.locator('a[href^="https://sancharsaathi.gov.in"]').first(),
    ).toBeVisible();
  });

  test("figures carry a source, and red flags need no database", async ({ page }) => {
    await page.goto("/scam-check");
    await expect(page.getByText(/₹22,495 cr/)).toBeVisible();
    await expect(page.getByText(/Ministry of Home Affairs/i).first()).toBeVisible();
    await expect(page.getByText(/Six signs that settle it/i)).toBeVisible();
    await expect(page.getByText(/UPI PIN to receive money/i)).toBeVisible();
  });

  test("officer verification distinguishes real from fake", async ({ page }) => {
    await page.goto("/verify-officer");
    const code = page.getByLabel(/6-digit code/i);

    await code.fill("000000");
    await page.getByRole("button", { name: /Check this officer/i }).click();
    await expect(page.getByText(/No officer is contacting you/i)).toBeVisible();
    await expect(page.getByText(/no such thing as a .digital arrest/i)).toBeVisible();

    await code.fill("483921");
    await page.getByRole("button", { name: /Check this officer/i }).click();
    await expect(page.getByText(/Verified/i).first()).toBeVisible();
    await expect(page.getByText(/never ask you for an OTP/i)).toBeVisible();
  });
});

test.describe("demo personas", () => {
  test("each login lands on a populated dashboard", async ({ page }) => {
    for (const [name, expected] of [
      ["Ramesh Iyer", /Active/i],
      ["Anjali Desai", /Money returned/i],
      ["Suresh Pillai", /on hold/i],
    ] as const) {
      await page.goto("/login");
      await page.getByRole("button", { name: new RegExp(name, "i") }).click();
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(expected).first()).toBeVisible();
    }
  });

  test("a fresh victim sees an empty state that invites action", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Priya Nair/i }).click();
    await expect(page.getByText(/Nothing filed yet/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /File a report/i })).toBeVisible();
  });

  test("signed-out dashboard does not dead-end", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Tracking code or case ID/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /pick a demo login/i })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("public accusation boundary", () => {
  test("the signal API accepts and exposes no visitor accusation", async ({ request }) => {
    const post = await request.post("/api/signal", {
      data: {
        identifier: "visitor-submission@bank",
        scam: "financial",
        amountPaise: 100000,
        name: "A Real Person",
        narrative: "private account of an incident",
      },
    });
    expect(post.status()).toBe(410);
    const posted = await post.json();
    expect(posted).toMatchObject({ ok: false, disabled: true, reports: 0 });

    const get = await request.get("/api/signal?q=visitor-submission%40bank");
    expect(get.status()).toBe(410);
    const body = await get.text();
    expect(body).not.toContain("visitor-submission@bank");
    expect(body).not.toContain("A Real Person");
    expect(body).not.toContain("private account");
  });

  test("Scam Check identifies its corpus as fictional sample data", async ({ page }) => {
    await page.goto("/scam-check");
    await expect(page.getByText(/Fictional sample data/i).first()).toBeVisible();
    await expect(page.getByText(/does not publish accusations submitted/i)).toBeVisible();
  });
});

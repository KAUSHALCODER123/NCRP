import { test, expect } from "@playwright/test";

/**
 * The database holds warnings, not complaints.
 *
 * These assert the privacy boundary as firmly as the behaviour: a future
 * change that starts persisting a complainant's name or free text should
 * break a test rather than ship quietly.
 */
test.describe("anonymous fraud signals", () => {
  const unique = () => `t${Date.now()}${Math.floor(Math.random() * 1e4)}@ybl`;

  test("a report becomes the warning the next person sees", async ({ request }) => {
    const id = unique();

    const before = await request.get(`/api/signal?q=${encodeURIComponent(id)}`);
    expect((await before.json()).reports).toBe(0);

    await request.post("/api/signal", {
      data: { identifier: id, scam: "digital-arrest", amountPaise: 4750000 },
    });

    const after = await request.get(`/api/signal?q=${encodeURIComponent(id)}`);
    const j = await after.json();
    expect(j.reports).toBe(1);
    expect(j.kind).toBe("upi");
  });

  test("the same number in different formats is one identifier", async ({ request }) => {
    const n = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
    for (const form of [`+91 ${n}`, n, `0${n}`]) {
      await request.post("/api/signal", { data: { identifier: form } });
    }
    const r = await request.get(`/api/signal?q=${n}`);
    // A leading 91 on a bare ten-digit number is part of the number, not a
    // country code — getting this wrong splits one number into two.
    expect((await r.json()).reports).toBe(3);
  });

  test("nothing personal is accepted, whatever is sent", async ({ request }) => {
    const id = unique();
    await request.post("/api/signal", {
      data: {
        identifier: id,
        scam: "financial",
        amountPaise: 100000,
        // None of these may ever be persisted.
        name: "A Real Person",
        mobile: "9876543210",
        narrative: "They called me and I sent the money",
        email: "someone@example.com",
      },
    });

    const r = await request.get(`/api/signal?q=${encodeURIComponent(id)}`);
    const body = await r.text();
    expect(body).not.toContain("A Real Person");
    expect(body).not.toContain("9876543210");
    expect(body).not.toContain("someone@example.com");
    expect(body).not.toContain("sent the money");
  });

  test("an empty or malformed request is refused quietly", async ({ request }) => {
    for (const data of [{}, { identifier: "" }, { identifier: "   " }]) {
      const r = await request.post("/api/signal", { data });
      expect(r.status()).toBe(200);
      expect((await r.json()).reports).toBe(0);
    }
  });

  test("an oversized identifier is rejected rather than stored", async ({ request }) => {
    const r = await request.post("/api/signal", {
      data: { identifier: "x".repeat(500) + "@ybl" },
    });
    expect(r.status()).toBe(200);
    expect((await r.json()).ok).toBe(false);
  });
});

test.describe("reporting feeds the lookup", () => {
  test("Scam Check counts a freshly reported identifier", async ({ page, request }) => {
    const id = `t${Date.now()}@okaxis`;
    for (let i = 0; i < 2; i++) {
      await request.post("/api/signal", { data: { identifier: id, scam: "upi" } });
    }

    await page.goto("/scam-check");
    await page.getByLabel(/UPI ID, phone number or link/i).fill(id);
    await page.getByRole("button", { name: /Check it/i }).click();

    await expect(page.getByText(/2\s*reports/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

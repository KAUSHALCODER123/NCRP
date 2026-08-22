import { test as base, expect } from "@playwright/test";

/*
 * Each test gets its own caller identity. The limiter keys on
 * x-forwarded-for, which is what a real deployment sees behind a proxy;
 * without this every parallel test shares one bucket and trips the limit
 * on the suite rather than on the behaviour under test.
 */
let n = 0;
const test = base.extend<{ ip: string }>({
  ip: async ({}, use) => {
    n += 1;
    await use(`203.0.113.${n % 250}`);
  },
});

test.describe("/api/classify", () => {
  test("classifies a described incident", async ({ request, ip }) => {
    const r = await request.post("/api/classify", {
      headers: { "x-forwarded-for": ip },
      data: { text: "They called saying CBI has a case and made me transfer money on a video call" },
    });
    expect(r.status()).toBe(200);
    const j = await r.json();
    expect(j).toMatchObject({
      category: expect.any(String),
      subcategory: expect.any(String),
      modus: expect.any(String),
      routedTo: expect.any(String),
    });
    expect(Array.isArray(j.sections)).toBe(true);
  });

  test("empty text still returns a usable shape", async ({ request, ip }) => {
    const r = await request.post("/api/classify", { headers: { "x-forwarded-for": ip }, data: { text: "" } });
    expect(r.status()).toBe(200);
    const j = await r.json();
    expect(j.category).toBeTruthy();
    expect(j.fallback).toBe(true);
  });

  test("malformed body does not 500", async ({ request, ip }) => {
    const r = await request.post("/api/classify", {
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      data: "not json at all",
    });
    expect(r.status()).toBeLessThan(500);
  });

  test("absurdly long input is handled", async ({ request, ip }) => {
    const r = await request.post("/api/classify", {
      headers: { "x-forwarded-for": ip },
      data: { text: "मुझे धोखा हुआ ".repeat(4000) },
    });
    expect(r.status()).toBe(200);
    expect((await r.json()).category).toBeTruthy();
  });

  test("never leaks the API key", async ({ request, ip }) => {
    const r = await request.post("/api/classify", { headers: { "x-forwarded-for": ip }, data: { text: "upi fraud" } });
    expect(await r.text()).not.toMatch(/sk-[A-Za-z0-9]/);
  });
});

test.describe("/api/ocr", () => {
  test("rejects a non-image payload without erroring", async ({ request, ip }) => {
    const r = await request.post("/api/ocr", { headers: { "x-forwarded-for": ip }, data: { image: "hello" } });
    expect(r.status()).toBe(200);
    expect(await r.json()).toMatchObject({ ok: false, text: "" });
  });

  test("missing body does not 500", async ({ request, ip }) => {
    const r = await request.post("/api/ocr", {
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      data: "",
    });
    expect(r.status()).toBeLessThan(500);
  });

  test("oversized payload is refused cheaply", async ({ request, ip }) => {
    const huge = "data:image/png;base64," + "A".repeat(15_000_000);
    const r = await request.post("/api/ocr", { headers: { "x-forwarded-for": ip }, data: { image: huge } });
    expect(r.status()).toBeLessThan(500);
    expect((await r.json()).ok).toBe(false);
  });
});

test.describe("/api/freeze/stream", () => {
  test("streams acks in causal order and settles", async ({ request, ip }) => {
    const r = await request.get(
      "/api/freeze/stream?amount=4750000&insts=hdfc:debit,paytm:beneficiary,phonepe:layer2",
      { headers: { "x-forwarded-for": ip } },
    );
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("text/event-stream");
    expect(r.headers()["cache-control"]).toContain("no-cache");

    const body = await r.text();
    const acks = [...body.matchAll(/event: ack\ndata: (.+)/g)].map((m) =>
      JSON.parse(m[1]),
    );
    expect(acks.length).toBe(3);

    const roleIndex = (role: string) => acks.findIndex((a) => a.role === role);
    // Hop 2 can only be known from hop 1's exit trail.
    expect(roleIndex("layer2")).toBeGreaterThan(roleIndex("beneficiary"));

    // Held total never exceeds the reported amount.
    const held = acks.reduce((s, a) => s + a.heldPaise, 0);
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThanOrEqual(4750000);

    expect(body).toContain("event: done");
  });

  test("no institutions still completes", async ({ request, ip }) => {
    const r = await request.get("/api/freeze/stream?amount=1000&insts=", { headers: { "x-forwarded-for": ip } });
    expect(r.status()).toBe(200);
    expect(await r.text()).toContain("event: done");
  });

  test("zero amount does not produce a negative hold", async ({ request, ip }) => {
    const r = await request.get(
      "/api/freeze/stream?amount=0&insts=hdfc:debit,paytm:beneficiary",
      { headers: { "x-forwarded-for": ip } },
    );
    const body = await r.text();
    const acks = [...body.matchAll(/event: ack\ndata: (.+)/g)].map((m) =>
      JSON.parse(m[1]),
    );
    for (const a of acks) expect(a.heldPaise).toBeGreaterThanOrEqual(0);
  });

  test("garbage institution ids do not crash the stream", async ({ request, ip }) => {
    const r = await request.get(
      "/api/freeze/stream?amount=5000&insts=;;;:::,%%%:beneficiary",
      { headers: { "x-forwarded-for": ip } },
    );
    expect(r.status()).toBe(200);
    expect(await r.text()).toContain("event: done");
  });
});

test.describe("rate limiting", () => {
  test.describe.configure({ mode: "serial" });

  test("ocr refuses a flood but keeps the client's fallback shape", async ({ request, ip }) => {
    const results = [];
    for (let i = 0; i < 12; i++) {
      const r = await request.post("/api/ocr", { headers: { "x-forwarded-for": ip }, data: { image: "x" } });
      results.push(r);
    }
    const limited = results.filter((r) => r.status() === 429);
    expect(limited.length).toBeGreaterThan(0);

    const last = limited[limited.length - 1];
    expect(last.headers()["retry-after"]).toBeTruthy();
    expect(last.headers()["ratelimit-limit"]).toBe("8");
    // Same shape as an unreadable image, so the uploader degrades rather than
    // dead-ends.
    expect(await last.json()).toMatchObject({ ok: false, text: "" });
  });

  test("advertises remaining budget on success", async ({ request, ip }) => {
    const r = await request.get("/api/freeze/stream?amount=100&insts=", { headers: { "x-forwarded-for": ip } });
    expect(r.headers()["ratelimit-limit"]).toBe("30");
    expect(Number(r.headers()["ratelimit-remaining"])).toBeGreaterThanOrEqual(0);
  });
});

import { test, expect } from "@playwright/test";

test.describe("survivor stories", () => {
  test("shows outcomes honestly, including failures", async ({ page }) => {
    await page.goto("/stories");
    await expect(page.getByText(/not all success stories/i)).toBeVisible();
    await expect(page.getByText(/Nothing recovered/i).first()).toBeVisible();
    await expect(page.getByText(/Money returned/i).first()).toBeVisible();
  });

  test("a story shows what was lost and what came back", async ({ page }) => {
    await page.goto("/stories/st-0035");
    await expect(page.getByText(/Verified against case/i)).toBeVisible();
    await expect(page.getByText(/Taken/i).first()).toBeVisible();
    await expect(page.getByText(/Came back/i).first()).toBeVisible();
    await expect(page.getByText(/What they want you to know/i)).toBeVisible();
  });
});

test.describe("writing a story is gated on a real case", () => {
  test("privacy terms appear before the writing form", async ({ page }) => {
    await page.goto("/stories/write");
    await expect(page.getByText(/Anonymous by default/i)).toBeVisible();
    await expect(page.getByText(/never published, at any stage/i)).toBeVisible();
  });

  test("an unknown case number is refused", async ({ page }) => {
    await page.goto("/stories/write");
    await page.getByLabel(/Your case number/i).fill("SHY-0000-00-0000");
    await page.getByRole("button", { name: /^check$/i }).click();
    await expect(page.getByRole("alert").first()).toContainText(/couldn't find/i);
  });

  test("an unresolved case is refused with a reason", async ({ page }) => {
    await page.goto("/stories/write");
    await page.getByRole("button", { name: "SHY-2026-08-3312" }).click();
    await expect(page.getByRole("alert").first()).toContainText(/reaches an outcome/i);
  });

  test("a resolved case unlocks the form and states the outcome", async ({ page }) => {
    await page.goto("/stories/write");
    await page.getByRole("button", { name: "SHY-2026-07-1180" }).click();
    await expect(page.getByText(/Case found/i)).toBeVisible();
    await expect(page.getByText(/show this outcome honestly/i)).toBeVisible();

    await page.getByLabel(/One line, in your words/i).fill("What happened to me");
    await page
      .getByLabel(/What happened$/i)
      .fill("A long enough account of what happened to me, written out properly so the submit button becomes available.");
    await page.getByRole("button", { name: /Send for review/i }).click();
    await expect(page.getByText(/Sent for review/i)).toBeVisible();
    await expect(page.getByText(/A person reads every story/i)).toBeVisible();
  });
});

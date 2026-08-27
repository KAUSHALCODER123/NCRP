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
    await expect(page.getByText(/Fictional composite/i).first()).toBeVisible();
    await expect(page.getByText(/Taken/i).first()).toBeVisible();
    await expect(page.getByText(/Came back/i).first()).toBeVisible();
    await expect(page.getByText(/Safety lesson/i)).toBeVisible();
  });
});

test.describe("real story collection is disabled", () => {
  test("the direct write route explains the safety boundary", async ({ page }) => {
    await page.goto("/stories/write");
    await expect(page.getByRole("heading", { name: /does not collect survivor stories/i })).toBeVisible();
    await expect(page.getByText(/fictional composites/i)).toBeVisible();
    await expect(page.getByText(/no moderation team/i)).toBeVisible();
  });
});

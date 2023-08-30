import { expect, test } from "@playwright/test";

test("welcome page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Welcome")).toBeVisible();
});

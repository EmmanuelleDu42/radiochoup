// tests/e2e/keyboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("keyboard shortcuts", () => {
  test("la touche M coupe le son et le restaure", async ({ page }) => {
    await page.goto("/");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await volume.fill("60");
    await volume.blur();
    await page.keyboard.press("KeyM");
    await expect(volume).toHaveValue("0");
    await page.keyboard.press("KeyM");
    await expect(volume).toHaveValue("60");
  });

  test("la touche 5 met le volume à 50", async ({ page }) => {
    await page.goto("/");
    await page.locator("body").click();
    await page.keyboard.press("Digit5");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await expect(volume).toHaveValue("50");
  });
});

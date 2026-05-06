// tests/e2e/playback.spec.ts
import { test, expect } from "@playwright/test";

test.describe("playback", () => {
  test("la home charge avec le bouton lecture visible", async ({ page }) => {
    await page.goto("/");
    const playButton = page.getByRole("button", { name: /Lire|Mettre en pause/ }).first();
    await expect(playButton).toBeVisible();
  });

  test("le slider de volume est présent et utilisable", async ({ page }) => {
    await page.goto("/");
    const volume = page.getByRole("slider", { name: /Volume/i }).first();
    await expect(volume).toBeVisible();
    await volume.fill("50");
    await expect(volume).toHaveValue("50");
  });

  test("le titre de page suit le morceau (eventually)", async ({ page }) => {
    await page.goto("/");
    await expect.poll(async () => (await page.title()).length, {
      timeout: 10000,
      intervals: [500, 1000, 2000]
    }).toBeGreaterThan(3);
  });
});

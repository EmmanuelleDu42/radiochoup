// tests/e2e/history.spec.ts
import { test, expect } from "@playwright/test";

test.describe("history", () => {
  test("ouvrir et fermer la modale historique", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 1280) < 1024, "modal historique uniquement en desktop");
    await page.goto("/");
    await page.getByRole("button", { name: "Historique" }).click();
    await expect(page.getByRole("dialog", { name: /derniers titres/i })).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).first().click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

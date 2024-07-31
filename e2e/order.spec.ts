import { test, expect } from "@playwright/test";

test("order", async ({ page }) => {
  await page.goto("http://localhost:5173/home");

  await test.step("add-products", async () => {
    await page.getByRole("main").getByPlaceholder("Search...").fill("burger");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("main").getByPlaceholder("Search...").fill("Onion");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("main").getByPlaceholder("Search...").fill("Lemon");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Add" }).click();
  });
  await test.step("create-order", async () => {
    await page.locator('input[name="recipient"]').fill("Budi");
    await page.getByRole("button", { name: "Create Order" }).click();
    await page.waitForTimeout(1000);
    // Assert
    await expect(page.getByRole("main")).toContainText("Budi");
    await expect(page.getByRole("main")).toContainText("Burger");
  });
  await test.step("pay-order", async () => {
    await page.locator('input[name="inputAmount"]').fill("60000");
    await expect(page.getByRole("main")).toContainText("Rp 8.000,00");
    await page.getByRole("button", { name: "Process" }).click();
    await page.waitForTimeout(1000);
    // Assert
    await expect(page.getByRole("main")).toContainText("Paid");
  });
  await test.step("complete-order", async () => {
    await page.getByRole("button", { name: "Complete" }).click();
    await page.waitForTimeout(1000);
    // Assert
    await expect(page.getByRole("main")).toContainText("Completed");
  });
});

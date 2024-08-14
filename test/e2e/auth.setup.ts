import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  const creds = (await import("./login_creds.json", { with: { type: "json" } })).default;
  await page.getByPlaceholder("email@address.com").fill(creds.username);
  await page.getByPlaceholder("password").fill(creds.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(
    page.getByLabel("breadcrumb").getByRole("link", { name: "Home" }),
  ).toBeVisible();
  expect(page.url(), "url").toBe("http://localhost:5173/home");

  await page.context().storageState({ path: authFile });
});

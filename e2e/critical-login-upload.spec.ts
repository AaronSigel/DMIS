import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@dmis.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "demo";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DMIS" })).toBeVisible();

  await page.getByPlaceholder("Электронная почта").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Пароль").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test("critical flow: login and upload document", async ({ page }) => {
  await login(page);

  await page.locator("aside").getByRole("button", { name: /Документы/ }).first().click();
  await expect(page.getByRole("heading", { name: "Документы" })).toBeVisible();

  const uniqueSuffix = Date.now();
  const fileName = `critical-upload-${uniqueSuffix}.txt`;
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Загрузить" }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: fileName,
    mimeType: "text/plain",
    buffer: Buffer.from(`critical flow upload ${uniqueSuffix}`, "utf-8"),
  });

  await expect(page.getByRole("row", { name: new RegExp(fileName) })).toBeVisible({
    timeout: 20_000,
  });
});

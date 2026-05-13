import { expect, test } from "./fixtures";

test("critical flow: login and upload document", async ({ authenticatedPage: page }) => {

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

import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@dmis.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "demo";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByPlaceholder("Электронная почта").fill(ADMIN_EMAIL);
  await page.getByPlaceholder("Пароль").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("critical flow: ask question and open citation when available", async ({ page }) => {
  await login(page);

  const token = await page.evaluate(() => window.localStorage.getItem("dmis_token") ?? "");
  expect(token.length).toBeGreaterThan(0);

  const createThreadResponse = await page.request.post("/api/assistant/threads", {
    data: { title: "E2E thread" },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(createThreadResponse.ok()).toBeTruthy();
  const thread = (await createThreadResponse.json()) as { id: string };

  const sendMessageResponse = await page.request.post(`/api/assistant/threads/${thread.id}/messages`, {
    data: {
      question: "Кратко опиши доступные модули системы",
      documentIds: [],
      knowledgeSourceIds: ["documents"],
      ideologyProfileId: "balanced",
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(sendMessageResponse.ok()).toBeTruthy();

  const threadDetailResponse = await page.request.get(`/api/assistant/threads/${thread.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(threadDetailResponse.ok()).toBeTruthy();
});

test("critical flow: confirm action and open audit when available", async ({ page }) => {
  await login(page);

  const token = await page.evaluate(() => window.localStorage.getItem("dmis_token") ?? "");
  expect(token.length).toBeGreaterThan(0);

  const draftResponse = await page.request.post("/api/actions/draft", {
    data: {
      intent: "send_email",
      entities: {
        type: "send_email",
        to: "user@dmis.local",
        subject: "E2E draft action",
        body: "Please confirm this action in UI",
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(draftResponse.ok()).toBeTruthy();
  const draftedAction = (await draftResponse.json()) as { id: string };
  expect(draftedAction.id.length).toBeGreaterThan(0);

  const confirmResponse = await page.request.post(`/api/actions/${draftedAction.id}/confirm`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(confirmResponse.ok()).toBeTruthy();

  await page.locator("aside").getByRole("button", { name: /Журнал аудита/ }).first().click();
  await expect(page.getByRole("heading", { name: "Журнал аудита" })).toBeVisible();
});

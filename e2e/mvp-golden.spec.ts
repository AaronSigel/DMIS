import { expect, test } from '@playwright/test';

const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';
const ACTION_SUBJECT = `DMIS MVP golden ${Date.now()}`;
const ACTION_BODY = 'Проверка end-to-end сценария controlled action.';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('login-email-input').fill(DEMO_EMAIL);
  await page.getByTestId('login-password-input').fill(DEMO_PASSWORD);
  await page.getByTestId('login-submit-button').click();

  await expect(page).toHaveURL(/\/(dashboard|documents)/);
  if (!page.url().includes('/documents')) {
    await page.goto('/documents');
  }
  await expect(page).toHaveURL(/\/documents/);
}

test('P0 golden flow: login -> upload -> action draft -> confirm -> mailpit -> audit', async ({
  page,
  request,
}) => {
  await login(page);

  const fileName = `dmis-golden-${Date.now()}.txt`;
  await page.locator('input[type="file"]').first().setInputFiles({
    name: fileName,
    mimeType: 'text/plain',
    buffer: Buffer.from('DMIS golden file: procurement policy update.'),
  });

  await expect(page.getByText(fileName)).toBeVisible();
  await expect(page.getByText('Загрузка файлов')).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem('dmis_token'));
  expect(token).toBeTruthy();
  const auth = { Authorization: `Bearer ${token}` };

  const draftResponse = await request.post('http://127.0.0.1:8080/api/actions/draft', {
    headers: auth,
    data: {
      intent: 'send_email',
      entities: {
        type: 'send_email',
        to: DEMO_EMAIL,
        subject: ACTION_SUBJECT,
        body: ACTION_BODY,
      },
    },
  });
  expect(draftResponse.ok()).toBeTruthy();
  const draft = (await draftResponse.json()) as { id: string; status: string };
  expect(draft.status).toBe('DRAFT');

  const confirmResponse = await request.post(
    `http://127.0.0.1:8080/api/actions/${encodeURIComponent(draft.id)}/confirm`,
    { headers: auth },
  );
  expect(confirmResponse.ok()).toBeTruthy();
  const confirmed = (await confirmResponse.json()) as { status: string };
  expect(confirmed.status).toBe('EXECUTED');

  const mailpit = await request.get('http://127.0.0.1:8025/api/v1/messages');
  expect(mailpit.ok()).toBeTruthy();
  const payload = (await mailpit.json()) as {
    messages?: Array<{ Subject?: string }>;
  };
  const hasGoldenMessage = (payload.messages ?? []).some((m) =>
    (m.Subject ?? '').includes(ACTION_SUBJECT),
  );
  expect(hasGoldenMessage).toBeTruthy();

  await page.goto('/audit');
  await expect(page.getByRole('heading', { name: 'Журнал аудита' })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toBeVisible();
});

import { expect, test } from '@playwright/test';

const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';

async function loginAndGetToken(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/');
  await page.getByTestId('login-email-input').fill(DEMO_EMAIL);
  await page.getByTestId('login-password-input').fill(DEMO_PASSWORD);
  await page.getByTestId('login-submit-button').click();
  await expect(page).toHaveURL(/\/(dashboard|documents)/);

  const token = await page.evaluate(() => localStorage.getItem('dmis_token'));
  if (!token) throw new Error('Missing auth token after login');
  return token;
}

test('controlled action error -> cancel + retry via new draft, with audit evidence', async ({
  page,
  request,
}) => {
  const token = await loginAndGetToken(page);
  const headers = { Authorization: `Bearer ${token}` };

  const invalidDraftResp = await request.post('http://127.0.0.1:8080/api/actions/draft', {
    headers,
    data: {
      intent: 'send_email',
      entities: {
        type: 'send_email',
        to: DEMO_EMAIL,
        subject: `DMIS retry test invalid ${Date.now()}`,
        body: 'Should fail and remain draft',
        attachmentDocumentIds: ['doc-does-not-exist'],
      },
    },
  });
  expect(invalidDraftResp.ok()).toBeTruthy();
  const invalidDraft = (await invalidDraftResp.json()) as { id: string; status: string };
  expect(invalidDraft.status).toBe('DRAFT');

  const failConfirmResp = await request.post(
    `http://127.0.0.1:8080/api/actions/${encodeURIComponent(invalidDraft.id)}/confirm`,
    { headers },
  );
  expect(failConfirmResp.ok()).toBeFalsy();
  expect([400, 404, 422, 500, 503]).toContain(failConfirmResp.status());

  const actionsAfterFailResp = await request.get('http://127.0.0.1:8080/api/actions', { headers });
  expect(actionsAfterFailResp.ok()).toBeTruthy();
  const actionsAfterFail = (await actionsAfterFailResp.json()) as Array<{ id: string; status: string }>;
  const failedActionState = actionsAfterFail.find((a) => a.id === invalidDraft.id);
  expect(failedActionState?.status).toBe('DRAFT');

  const cancelResp = await request.post(
    `http://127.0.0.1:8080/api/actions/${encodeURIComponent(invalidDraft.id)}/cancel`,
    { headers },
  );
  expect(cancelResp.ok()).toBeTruthy();
  const cancelled = (await cancelResp.json()) as { status: string };
  expect(cancelled.status).toBe('CANCELLED');

  const validDraftResp = await request.post('http://127.0.0.1:8080/api/actions/draft', {
    headers,
    data: {
      intent: 'send_email',
      entities: {
        type: 'send_email',
        to: DEMO_EMAIL,
        subject: `DMIS retry test valid ${Date.now()}`,
        body: 'Retry by creating corrected draft',
      },
    },
  });
  expect(validDraftResp.ok()).toBeTruthy();
  const validDraft = (await validDraftResp.json()) as { id: string; status: string };
  expect(validDraft.status).toBe('DRAFT');

  const successConfirmResp = await request.post(
    `http://127.0.0.1:8080/api/actions/${encodeURIComponent(validDraft.id)}/confirm`,
    { headers },
  );
  expect(successConfirmResp.ok()).toBeTruthy();
  const executed = (await successConfirmResp.json()) as { status: string };
  expect(executed.status).toBe('EXECUTED');

  const auditResp = await request.get('http://127.0.0.1:8080/api/audit', { headers });
  expect(auditResp.ok()).toBeTruthy();
  const audit = (await auditResp.json()) as Array<{ action: string; resourceId: string }>;

  expect(
    audit.some((e) => e.action === 'action.execute.failed' && e.resourceId === invalidDraft.id),
  ).toBeTruthy();
  expect(audit.some((e) => e.action === 'action.cancel' && e.resourceId === invalidDraft.id)).toBeTruthy();
  expect(audit.some((e) => e.action === 'action.execute' && e.resourceId === validDraft.id)).toBeTruthy();
});

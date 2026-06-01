import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type MailMessageSummary = {
  id: string;
  subject: string;
};

type MailMessageDetail = {
  id: string;
  subject: string;
  body: string;
};

type MailDraft = {
  id: string;
  subject: string;
  body: string;
};

const API_BASE = 'http://127.0.0.1:8080';
const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';

test('mail workflow: list, draft create/update/send, list/read message', async ({ request }) => {
  const token = await getAccessToken(request, { email: DEMO_EMAIL, password: DEMO_PASSWORD });
  const headers = { Authorization: `Bearer ${token}` };

  const listBeforeResp = await request.get(`${API_BASE}/api/mail/messages`, { headers });
  expect(listBeforeResp.ok()).toBeTruthy();

  const draftsBeforeResp = await request.get(`${API_BASE}/api/mail/drafts`, { headers });
  expect(draftsBeforeResp.ok()).toBeTruthy();

  const stamp = Date.now();
  const subject = `DMIS e2e mail workflow ${stamp}`;
  const body = 'Initial draft body';

  const createDraftResp = await request.post(`${API_BASE}/api/mail/drafts`, {
    headers,
    data: {
      to: DEMO_EMAIL,
      subject,
      body,
      attachmentDocumentIds: [],
    },
  });
  expect(createDraftResp.ok()).toBeTruthy();
  const createdDraft = (await createDraftResp.json()) as MailDraft;
  expect(createdDraft.subject).toBe(subject);

  const updatedBody = `${body} / updated`;
  const updateDraftResp = await request.put(
    `${API_BASE}/api/mail/drafts/${encodeURIComponent(createdDraft.id)}`,
    {
      headers,
      data: {
        to: DEMO_EMAIL,
        subject,
        body: updatedBody,
        attachmentDocumentIds: [],
      },
    },
  );
  expect(updateDraftResp.ok()).toBeTruthy();
  const updatedDraft = (await updateDraftResp.json()) as MailDraft;
  expect(updatedDraft.body).toContain('updated');

  const sendDraftResp = await request.post(
    `${API_BASE}/api/mail/drafts/${encodeURIComponent(createdDraft.id)}/send`,
    { headers },
  );
  expect(sendDraftResp.ok()).toBeTruthy();

  const draftsAfterResp = await request.get(`${API_BASE}/api/mail/drafts`, { headers });
  expect(draftsAfterResp.ok()).toBeTruthy();
  const draftsAfter = (await draftsAfterResp.json()) as MailDraft[];
  expect(draftsAfter.some((draft) => draft.id === createdDraft.id)).toBeFalsy();

  const listAfterResp = await request.get(`${API_BASE}/api/mail/messages`, { headers });
  expect(listAfterResp.ok()).toBeTruthy();
  const messages = (await listAfterResp.json()) as MailMessageSummary[];
  const sentMessage = messages.find((message) => message.subject === subject);
  expect(sentMessage).toBeTruthy();

  const detailResp = await request.get(
    `${API_BASE}/api/mail/messages/${encodeURIComponent(sentMessage!.id)}`,
    { headers },
  );
  expect(detailResp.ok()).toBeTruthy();
  const detail = (await detailResp.json()) as MailMessageDetail;
  expect(detail.subject).toBe(subject);
  expect(detail.body).toContain('updated');
});

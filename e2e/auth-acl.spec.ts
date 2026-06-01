import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type DocumentView = {
  id: string;
  ownerId: string;
};

type ActionView = {
  id: string;
  status: string;
};

const API_BASE = 'http://127.0.0.1:8080';

const ADMIN = { email: 'sokolov-d-a@example.com', password: 'demo' };
const ANALYST = { email: 'petrova-a-s@example.com', password: 'demo' };

test('auth/acl: 401 without token, 403 for чужие document/actions', async ({ request }) => {
  const unauthorized = await request.get(`${API_BASE}/api/documents`);
  expect(unauthorized.status()).toBe(401);

  const adminToken = await getAccessToken(request, ADMIN);
  const analystToken = await getAccessToken(request, ANALYST);

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const analystHeaders = { Authorization: `Bearer ${analystToken}` };

  const uploadResponse = await request.post(`${API_BASE}/api/documents`, {
    headers: adminHeaders,
    multipart: {
      file: {
        name: `acl-admin-only-${Date.now()}.txt`,
        mimeType: 'text/plain',
        buffer: Buffer.from('ACL test admin private document'),
      },
    },
  });
  expect(uploadResponse.ok()).toBeTruthy();
  const uploaded = (await uploadResponse.json()) as DocumentView;
  const forbiddenRead = await request.get(`${API_BASE}/api/documents/${encodeURIComponent(uploaded.id)}`, {
    headers: analystHeaders,
  });
  expect(forbiddenRead.status()).toBe(403);

  const forbiddenDownload = await request.get(
    `${API_BASE}/api/documents/${encodeURIComponent(uploaded.id)}/binary`,
    {
      headers: analystHeaders,
    },
  );
  expect(forbiddenDownload.status()).toBe(403);

  const draftResponse = await request.post(`${API_BASE}/api/actions/draft`, {
    headers: adminHeaders,
    data: {
      intent: 'send_email',
      entities: {
        type: 'send_email',
        to: ADMIN.email,
        subject: `ACL action ${Date.now()}`,
        body: 'forbidden confirm/cancel by another user',
      },
    },
  });
  expect(draftResponse.ok()).toBeTruthy();
  const draft = (await draftResponse.json()) as ActionView;
  expect(draft.status).toBe('DRAFT');

  const forbiddenConfirm = await request.post(
    `${API_BASE}/api/actions/${encodeURIComponent(draft.id)}/confirm`,
    { headers: analystHeaders },
  );
  expect(forbiddenConfirm.status()).toBe(403);

  const forbiddenCancel = await request.post(
    `${API_BASE}/api/actions/${encodeURIComponent(draft.id)}/cancel`,
    { headers: analystHeaders },
  );
  expect(forbiddenCancel.status()).toBe(403);
});

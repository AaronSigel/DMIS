import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

const API_BASE = 'http://127.0.0.1:8080';
const ADMIN = { email: 'sokolov-d-a@example.com', password: 'demo' };

type ThreadView = { id: string };
type SubmitResult = {
  route?: string;
  responseType?: string;
  action?: { id: string; status: string; intent: string };
};

test('stt transcript goes through assistant/action pipeline to executed action', async ({ request }) => {
  const token = await getAccessToken(request, ADMIN);
  const headers = { Authorization: `Bearer ${token}` };

  const transcriptText = 'Отправь письмо аналитику';
  const sttResp = await request.post(`${API_BASE}/api/stt/transcripts`, {
    headers,
    data: { text: transcriptText },
  });
  expect(sttResp.ok()).toBeTruthy();
  const sttBody = (await sttResp.json()) as { text: string; status: string };
  expect(sttBody.status).toBe('accepted');
  expect(sttBody.text).toBe(transcriptText);

  const threadResp = await request.post(`${API_BASE}/api/assistant/threads`, {
    headers,
    data: { title: `STT pipeline ${Date.now()}` },
  });
  expect(threadResp.ok()).toBeTruthy();
  const thread = (await threadResp.json()) as ThreadView;

  const submitResp = await request.post(`${API_BASE}/api/assistant/threads/${encodeURIComponent(thread.id)}/submit`, {
    headers,
    data: {
      text: sttBody.text,
      documentIds: [],
      knowledgeSourceIds: ['documents'],
      ideologyProfileId: 'balanced',
      stream: false,
    },
  });
  expect(submitResp.ok()).toBeTruthy();
  const submit = (await submitResp.json()) as SubmitResult;
  expect(submit.route).toBe('CONTROLLED_ACTION');
  expect(submit.responseType).toBe('ACTION_DRAFT');
  expect(submit.action?.status).toBe('DRAFT');
  expect(submit.action?.intent).toBe('send_email');

  const confirmResp = await request.post(
    `${API_BASE}/api/actions/${encodeURIComponent(String(submit.action?.id))}/confirm`,
    { headers },
  );
  expect(confirmResp.ok()).toBeTruthy();
  const executed = (await confirmResp.json()) as { status: string };
  expect(executed.status).toBe('EXECUTED');

  const auditResp = await request.get(`${API_BASE}/api/audit`, { headers });
  expect(auditResp.ok()).toBeTruthy();
  const audit = (await auditResp.json()) as Array<{ action: string; resourceId: string }>;
  expect(audit.some((e) => e.action === 'stt.transcript.accepted')).toBeTruthy();
  expect(audit.some((e) => e.action === 'assistant.action.draft.created')).toBeTruthy();
  expect(audit.some((e) => e.action === 'action.execute' && e.resourceId === submit.action?.id)).toBeTruthy();
});

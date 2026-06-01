import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

const API_BASE = 'http://127.0.0.1:8080';
const ADMIN = { email: 'sokolov-d-a@example.com', password: 'demo' };

type ThreadView = { id: string };
type SubmitResult = {
  status?: string;
  diagnosticCode?: string | null;
  message?: string | null;
};

type DocumentView = {
  id: string;
  status: string;
};

async function waitIndexed(
  request: import('@playwright/test').APIRequestContext,
  headers: Record<string, string>,
  documentId: string,
): Promise<DocumentView> {
  const deadline = Date.now() + 30_000;
  let last: DocumentView | null = null;
  while (Date.now() < deadline) {
    const response = await request.get(`${API_BASE}/api/documents/${encodeURIComponent(documentId)}`, { headers });
    expect(response.ok()).toBeTruthy();
    last = (await response.json()) as DocumentView;
    if (last.status === 'INDEXED' || last.status === 'FAILED') {
      return last;
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  throw new Error(`Document ${documentId} did not finish indexing in time, last=${last?.status}`);
}

test('assistant fallback: no selected doc -> graceful answer without crash', async ({ request }) => {
  const token = await getAccessToken(request, ADMIN);
  const headers = { Authorization: `Bearer ${token}` };

  const threadResp = await request.post(`${API_BASE}/api/assistant/threads`, {
    headers,
    data: { title: `RAG fallback no-doc ${Date.now()}` },
  });
  expect(threadResp.ok()).toBeTruthy();
  const thread = (await threadResp.json()) as ThreadView;

  const submitResp = await request.post(`${API_BASE}/api/assistant/threads/${encodeURIComponent(thread.id)}/submit`, {
    headers,
    data: {
      text: 'Суммаризируй документ',
      documentIds: [],
      knowledgeSourceIds: ['documents'],
      ideologyProfileId: 'balanced',
      stream: false,
    },
  });
  expect(submitResp.ok()).toBeTruthy();
  const submit = (await submitResp.json()) as SubmitResult;
  expect(submit.status).toBe('OK');
  expect(submit.diagnosticCode).toBeNull();
  expect((submit.message ?? '').length).toBeGreaterThan(0);
});

test('assistant fallback: indexed doc + irrelevant query -> contextual no-hit answer', async ({ request }) => {
  const token = await getAccessToken(request, ADMIN);
  const headers = { Authorization: `Bearer ${token}` };

  const uploadResp = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file: {
        name: `rag-fallback-${Date.now()}.txt`,
        mimeType: 'text/plain',
        buffer: Buffer.from('Содержимое документа: регламент командировок и отпусков.'),
      },
    },
  });
  expect(uploadResp.ok()).toBeTruthy();
  const uploaded = (await uploadResp.json()) as DocumentView;

  const indexed = await waitIndexed(request, headers, uploaded.id);
  expect(['INDEXED', 'FAILED']).toContain(indexed.status);

  const threadResp = await request.post(`${API_BASE}/api/assistant/threads`, {
    headers,
    data: { title: `RAG fallback no-context ${Date.now()}` },
  });
  expect(threadResp.ok()).toBeTruthy();
  const thread = (await threadResp.json()) as ThreadView;

  const rareQuery = `zxqv-no-hit-${Date.now()}-a9f31c`; // deliberately irrelevant token
  const submitResp = await request.post(`${API_BASE}/api/assistant/threads/${encodeURIComponent(thread.id)}/submit`, {
    headers,
    data: {
      text: `Что сказано про ${rareQuery}?`,
      documentIds: [uploaded.id],
      knowledgeSourceIds: ['documents'],
      ideologyProfileId: 'balanced',
      stream: false,
    },
  });
  expect(submitResp.ok()).toBeTruthy();
  const submit = (await submitResp.json()) as SubmitResult;

  if (indexed.status === 'FAILED') {
    expect(submit.status).toBe('OK');
    expect((submit.message ?? '').length).toBeGreaterThan(0);
    return;
  }

  expect(submit.status).toBe('OK');
  expect(submit.diagnosticCode).toBe('OK');
  expect((submit.message ?? '').toLowerCase()).toContain('отсутств');
});

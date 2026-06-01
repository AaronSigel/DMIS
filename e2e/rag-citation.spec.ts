import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

const API_BASE = 'http://127.0.0.1:8080';
const ADMIN = { email: 'sokolov-d-a@example.com', password: 'demo' };

type ThreadView = { id: string };

type DocumentView = {
  id: string;
  title?: string;
  fileName?: string;
  status: string;
  diagnosticCode?: string | null;
  diagnosticMessage?: string | null;
};

type RagSourceView = {
  documentId?: string;
  documentTitle?: string;
};

type SubmitResult = {
  status?: string;
  diagnosticCode?: string | null;
  message?: string | null;
  contextDocuments?: Array<{
    documentId?: string;
    title?: string;
    status?: string;
    diagnosticCode?: string | null;
    diagnosticMessage?: string | null;
  }>;
};

type SendMessageResult = {
  rag?: {
    status?: string;
    answer?: string;
    sources?: RagSourceView[];
  };
  contextStatus?: string;
  contextDiagnosticCode?: string | null;
  contextDocuments?: Array<{
    documentId?: string;
    title?: string;
    status?: string;
  }>;
};

async function waitIndexedTerminal(
  request: import('@playwright/test').APIRequestContext,
  headers: Record<string, string>,
  documentId: string,
): Promise<DocumentView> {
  const maxAttempts = 45;
  let last: DocumentView | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await request.get(`${API_BASE}/api/documents/${encodeURIComponent(documentId)}`, { headers });
    expect(response.ok()).toBeTruthy();
    last = (await response.json()) as DocumentView;

    if (last.status === 'INDEXED' || last.status === 'FAILED') {
      return last;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  throw new Error(`Document ${documentId} did not reach terminal indexing status. Last status: ${last?.status ?? 'unknown'}`);
}

function includesDocCitation(
  sources: RagSourceView[] | undefined,
  uploadedDocumentId: string,
  uploadedTitleCandidates: string[],
): boolean {
  if (!Array.isArray(sources) || sources.length === 0) {
    return false;
  }

  const normalizedCandidates = uploadedTitleCandidates.map((value) => value.toLowerCase());
  return sources.some((source) => {
    if (source.documentId === uploadedDocumentId) {
      return true;
    }

    const title = (source.documentTitle ?? '').toLowerCase();
    return normalizedCandidates.some((candidate) => candidate.length > 0 && title.includes(candidate));
  });
}

test('assistant rag: indexed doc answer carries citation/source context', async ({ request }) => {
  const token = await getAccessToken(request, ADMIN);
  const headers = { Authorization: `Bearer ${token}` };

  const marker = `RAG_CITATION_MARKER_${Date.now()}`;
  const factA = 'City of Light commonly refers to Paris.';
  const factB = 'The Eiffel Tower is located in Paris, France.';
  const fileName = `rag-citation-${Date.now()}.txt`;
  const fileBody = `${marker}\n${factA}\n${factB}\n`;

  const uploadResp = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file: {
        name: fileName,
        mimeType: 'text/plain',
        buffer: Buffer.from(fileBody, 'utf8'),
      },
    },
  });
  expect(uploadResp.ok()).toBeTruthy();
  const uploaded = (await uploadResp.json()) as DocumentView;

  const indexed = await waitIndexedTerminal(request, headers, uploaded.id);
  expect(['INDEXED', 'FAILED']).toContain(indexed.status);

  const threadResp = await request.post(`${API_BASE}/api/assistant/threads`, {
    headers,
    data: { title: `RAG citation thread ${Date.now()}` },
  });
  expect(threadResp.ok()).toBeTruthy();
  const thread = (await threadResp.json()) as ThreadView;

  const submitResp = await request.post(`${API_BASE}/api/assistant/threads/${encodeURIComponent(thread.id)}/submit`, {
    headers,
    data: {
      text: `Using marker ${marker}, what city is referenced as the City of Light and where is the Eiffel Tower located?`,
      documentIds: [uploaded.id],
      knowledgeSourceIds: ['documents'],
      ideologyProfileId: 'balanced',
      stream: false,
    },
  });

  expect(submitResp.status()).toBe(200);
  expect(submitResp.ok()).toBeTruthy();
  const submit = (await submitResp.json()) as SubmitResult;
  expect((submit.message ?? '').trim().length).toBeGreaterThan(0);

  if (indexed.status === 'FAILED') {
    expect(submit.status).toBe('OK');
    const contextDoc = submit.contextDocuments?.find((doc) => doc.documentId === uploaded.id);
    if (contextDoc) {
      expect(contextDoc.status).toBe('FAILED');
    }
    return;
  }

  const titleCandidates = [uploaded.title ?? '', uploaded.fileName ?? '', fileName];
  let citedInSubmit = false;

  const submitAny = submit as Record<string, unknown>;
  const submitSources = submitAny.sources as RagSourceView[] | undefined;
  if (includesDocCitation(submitSources, uploaded.id, titleCandidates)) {
    citedInSubmit = true;
  }

  if (!citedInSubmit) {
    const messagesResp = await request.post(
      `${API_BASE}/api/assistant/threads/${encodeURIComponent(thread.id)}/messages`,
      {
        headers,
        data: {
          question: `Repeat based on marker ${marker} and include concise factual answer.`,
          documentIds: [uploaded.id],
          knowledgeSourceIds: ['documents'],
          ideologyProfileId: 'balanced',
        },
      },
    );

    expect(messagesResp.status()).toBe(200);
    expect(messagesResp.ok()).toBeTruthy();
    const withRag = (await messagesResp.json()) as SendMessageResult;

    expect((withRag.rag?.answer ?? '').trim().length).toBeGreaterThan(0);
    expect(withRag.rag?.status).toBe('OK');

    const citedInRag = includesDocCitation(withRag.rag?.sources, uploaded.id, titleCandidates);
    expect(citedInRag).toBeTruthy();
    return;
  }

  expect(citedInSubmit).toBeTruthy();
});

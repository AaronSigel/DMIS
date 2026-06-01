import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type ApiError = { errorCode?: string; message?: string };

const API_BASE = 'http://127.0.0.1:8080';
const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';

test('documents upload errors: empty file, unsupported type, too large file', async ({ request }) => {
  const token = await getAccessToken(request, { email: DEMO_EMAIL, password: DEMO_PASSWORD });
  const headers = { Authorization: `Bearer ${token}` };

  const emptyResp = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file: {
        name: 'empty.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(''),
      },
    },
  });
  expect(emptyResp.status()).toBe(400);
  const emptyBody = (await emptyResp.json()) as ApiError;
  expect(emptyBody.errorCode).toBe('FILE_REQUIRED');

  const unsupportedResp = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file: {
        name: 'malware.exe',
        mimeType: 'application/octet-stream',
        buffer: Buffer.from('MZ...'),
      },
    },
  });
  expect(unsupportedResp.status()).toBe(400);
  const unsupportedBody = (await unsupportedResp.json()) as ApiError;
  expect(unsupportedBody.errorCode).toBe('UNSUPPORTED_FILE_TYPE');

  const tooLargeBuffer = Buffer.alloc(21 * 1024 * 1024, 'a');
  const tooLargeResp = await request.post(`${API_BASE}/api/documents`, {
    headers,
    multipart: {
      file: {
        name: 'too-large.txt',
        mimeType: 'text/plain',
        buffer: tooLargeBuffer,
      },
    },
  });
  expect(tooLargeResp.status()).toBe(413);
  const tooLargeBody = (await tooLargeResp.json()) as ApiError;
  expect(tooLargeBody.errorCode).toBe('FILE_TOO_LARGE');
});

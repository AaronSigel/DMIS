import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'http://127.0.0.1:8080';
const CACHE_FILE = path.join(process.cwd(), '.tmp-e2e-auth-cache.json');
const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = {
  token: string;
  savedAtMs: number;
};

type CacheShape = Record<string, CacheEntry>;

function readCache(): CacheShape {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CacheShape;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheShape): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf8');
}

export async function getAccessToken(
  request: import('@playwright/test').APIRequestContext,
  creds: { email: string; password: string },
): Promise<string> {
  const cache = readCache();
  const cached = cache[creds.email];
  const now = Date.now();

  if (cached && now - cached.savedAtMs < CACHE_TTL_MS) {
    return cached.token;
  }

  const response = await request.post(`${API_BASE}/api/auth/login`, {
    data: creds,
  });

  if (!response.ok()) {
    // If login is rate-limited but we already have any cached token, use it as fallback.
    if (response.status() === 429 && cached?.token) {
      return cached.token;
    }
    throw new Error(`Login failed for ${creds.email}: ${response.status()}`);
  }

  const body = (await response.json()) as { token: string };
  cache[creds.email] = { token: body.token, savedAtMs: now };
  writeCache(cache);
  return body.token;
}

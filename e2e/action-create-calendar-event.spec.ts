import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type ActionView = {
  id: string;
  status: string;
};

type CalendarEvent = {
  id: string;
  title: string;
};

const API_BASE = 'http://127.0.0.1:8080';
const DEMO_EMAIL = 'sokolov-d-a@example.com';
const DEMO_PASSWORD = 'demo';

test('controlled action: create_calendar_event -> confirm -> appears in calendar + audit', async ({ request }) => {
  const token = await getAccessToken(request, { email: DEMO_EMAIL, password: DEMO_PASSWORD });
  const headers = { Authorization: `Bearer ${token}` };

  const stamp = Date.now();
  const title = `DMIS e2e action calendar ${stamp}`;
  const startIso = '2026-06-25T09:00:00Z';
  const endIso = '2026-06-25T10:00:00Z';

  const draftResp = await request.post(`${API_BASE}/api/actions/draft`, {
    headers,
    data: {
      intent: 'create_calendar_event',
      entities: {
        type: 'create_calendar_event',
        title,
        attendees: ['petrova-a-s@example.com'],
        startIso,
        endIso,
      },
    },
  });
  expect(draftResp.ok()).toBeTruthy();
  const draft = (await draftResp.json()) as ActionView;
  expect(draft.status).toBe('DRAFT');

  const confirmResp = await request.post(
    `${API_BASE}/api/actions/${encodeURIComponent(draft.id)}/confirm`,
    { headers },
  );
  expect(confirmResp.ok()).toBeTruthy();
  const executed = (await confirmResp.json()) as ActionView;
  expect(executed.status).toBe('EXECUTED');

  const eventsResp = await request.get(`${API_BASE}/api/calendar/events`, { headers });
  expect(eventsResp.ok()).toBeTruthy();
  const events = (await eventsResp.json()) as CalendarEvent[];
  const created = events.find((event) => event.title === title);
  expect(created).toBeTruthy();

  const auditResp = await request.get(`${API_BASE}/api/audit`, { headers });
  expect(auditResp.ok()).toBeTruthy();
  const audit = (await auditResp.json()) as Array<{ action: string; resourceId: string }>;
  expect(audit.some((entry) => entry.action === 'action.execute' && entry.resourceId === draft.id)).toBeTruthy();
});

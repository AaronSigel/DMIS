import { expect, test } from '@playwright/test';
import { getAccessToken } from './helpers/auth';

type CalendarEvent = {
  id: string;
  title: string;
  startIso: string;
  endIso: string;
  attendees: string[];
  participants?: Array<{ userId: string }>;
};

const API_BASE = 'http://127.0.0.1:8080';
const ADMIN = { email: 'sokolov-d-a@example.com', password: 'demo' };
const ANALYST = { email: 'petrova-a-s@example.com', password: 'demo' };

async function login(
  request: import('@playwright/test').APIRequestContext,
  creds: { email: string; password: string },
): Promise<{ token: string; user: { id: string; email: string } }> {
  const token = await getAccessToken(request, creds);
  const meResp = await request.get(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(meResp.ok()).toBeTruthy();
  const user = (await meResp.json()) as { id: string; email: string };
  return { token, user };
}

test('calendar workflow: list, create, update(reschedule), add/remove participant', async ({ request }) => {
  const admin = await login(request, ADMIN);
  const analyst = await login(request, ANALYST);
  const headers = { Authorization: `Bearer ${admin.token}` };

  const listResp = await request.get(`${API_BASE}/api/calendar/events`, { headers });
  expect(listResp.ok()).toBeTruthy();

  const stamp = Date.now();
  const title = `DMIS e2e calendar workflow ${stamp}`;
  const startIso = '2026-07-03T10:00:00Z';
  const endIso = '2026-07-03T11:00:00Z';

  const createResp = await request.post(`${API_BASE}/api/calendar/events`, {
    headers,
    data: {
      title,
      attendees: [admin.user.email],
      startIso,
      endIso,
      description: 'calendar workflow create',
    },
  });
  expect(createResp.ok()).toBeTruthy();
  const created = (await createResp.json()) as CalendarEvent;
  expect(created.title).toBe(title);

  const updatedTitle = `${title} updated`;
  const updatedStart = '2026-07-03T12:00:00Z';
  const updatedEnd = '2026-07-03T13:00:00Z';

  const updateResp = await request.put(`${API_BASE}/api/calendar/events/${encodeURIComponent(created.id)}`, {
    headers,
    data: {
      title: updatedTitle,
      attendees: [admin.user.email],
      startIso: updatedStart,
      endIso: updatedEnd,
      description: 'calendar workflow update',
    },
  });
  expect(updateResp.ok()).toBeTruthy();
  const updated = (await updateResp.json()) as CalendarEvent;
  expect(updated.title).toBe(updatedTitle);
  expect(updated.startIso).toBe(updatedStart);
  expect(updated.endIso).toBe(updatedEnd);

  const addParticipantResp = await request.post(
    `${API_BASE}/api/calendar/events/${encodeURIComponent(created.id)}/participants`,
    {
      headers,
      data: { userId: analyst.user.id },
    },
  );
  expect(addParticipantResp.ok()).toBeTruthy();
  const withParticipant = (await addParticipantResp.json()) as CalendarEvent;
  expect((withParticipant.participants ?? []).some((p) => p.userId === analyst.user.id)).toBeTruthy();

  const removeParticipantResp = await request.delete(
    `${API_BASE}/api/calendar/events/${encodeURIComponent(created.id)}/participants/${encodeURIComponent(analyst.user.id)}`,
    { headers },
  );
  expect(removeParticipantResp.ok()).toBeTruthy();
  const withoutParticipant = (await removeParticipantResp.json()) as CalendarEvent;
  expect((withoutParticipant.participants ?? []).some((p) => p.userId === analyst.user.id)).toBeFalsy();

  const getResp = await request.get(`${API_BASE}/api/calendar/events/${encodeURIComponent(created.id)}`, { headers });
  expect(getResp.ok()).toBeTruthy();
  const fetched = (await getResp.json()) as CalendarEvent;
  expect((fetched.participants ?? []).some((p) => p.userId === analyst.user.id)).toBeFalsy();

  const deleteResp = await request.delete(`${API_BASE}/api/calendar/events/${encodeURIComponent(created.id)}`, {
    headers,
  });
  expect(deleteResp.status()).toBe(204);
});

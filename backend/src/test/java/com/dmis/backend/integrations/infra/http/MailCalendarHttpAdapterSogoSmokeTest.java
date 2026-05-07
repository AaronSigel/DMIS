package com.dmis.backend.integrations.infra.http;

import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.infra.persistence.MailCalendarPersistenceAdapter;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class MailCalendarHttpAdapterSogoSmokeTest {

    @Test
    void sendCalendarDraft_realSogo_optInByEnv() {
        // Локальный запуск: экспортировать SOGO_CALDAV_* и выполнить
        // ./mvnw -Dtest=MailCalendarHttpAdapterSogoSmokeTest test
        String baseUrl = env("SOGO_CALDAV_BASE_URL");
        String username = env("SOGO_CALDAV_USERNAME");
        String password = env("SOGO_CALDAV_PASSWORD");
        String calendarPath = env("SOGO_CALDAV_CALENDAR_PATH");

        // Smoke-тест опциональный: в CI без env должен быть SKIPPED.
        Assumptions.assumeTrue(
                isPresent(baseUrl) && isPresent(username) && isPresent(password) && isPresent(calendarPath),
                "Skip smoke: SOGO_CALDAV_* env не задан"
        );

        MailCalendarHttpAdapter adapter = new MailCalendarHttpAdapter(
                mock(MailCalendarPersistenceAdapter.class),
                new EmptyObjectProvider<>(),
                "no-reply@dmis.test.local",
                "",
                baseUrl,
                username,
                password,
                calendarPath
        );

        IntegrationDtos.CalendarDraftView draft = new IntegrationDtos.CalendarDraftView(
                "smoke-event-" + UUID.randomUUID(),
                "DMIS CalDAV smoke",
                List.of(username),
                "2026-05-08T08:00:00Z",
                "2026-05-08T09:00:00Z",
                "smoke-user"
        );

        String idempotencyKey = "smoke-" + UUID.randomUUID();
        IntegrationDtos.CalendarDraftView sent = adapter.sendCalendarDraft(draft, idempotencyKey);

        assertEquals(draft, sent);
    }

    private static String env(String key) {
        return System.getenv(key);
    }

    private static boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    private static final class EmptyObjectProvider<T> implements ObjectProvider<T> {
        @Override
        public T getObject() {
            return null;
        }

        @Override
        public T getObject(Object... args) {
            return null;
        }

        @Override
        public T getIfAvailable() {
            return null;
        }

        @Override
        public T getIfUnique() {
            return null;
        }
    }
}

package com.dmis.backend.integrations.domain.model;

import java.time.Instant;

public record CalendarEventParticipant(
        String id,
        String eventId,
        String userId,
        EventParticipantStatus status,
        Instant createdAt
) {
}

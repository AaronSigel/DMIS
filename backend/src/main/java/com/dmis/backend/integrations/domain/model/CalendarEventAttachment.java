package com.dmis.backend.integrations.domain.model;

import java.time.Instant;

public record CalendarEventAttachment(
        String id,
        String eventId,
        String documentId,
        EventAttachmentRole role,
        Instant createdAt
) {
}

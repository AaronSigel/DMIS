package com.dmis.backend.integrations.domain.model;

import java.time.Instant;
import java.util.List;

/**
 * Событие пользовательского календаря (MVP, без повторения и сложной TZ-логики).
 */
public record CalendarEvent(
        String id,
        String title,
        List<String> attendees,
        String startIso,
        String endIso,
        String createdBy,
        Instant createdAt,
        Instant updatedAt,
        String description,
        EventCreationSource creationSource,
        String sourceMailMessageId
) {
    public CalendarEvent {
        description = description == null ? "" : description;
        creationSource = creationSource == null ? EventCreationSource.UI : creationSource;
    }
}

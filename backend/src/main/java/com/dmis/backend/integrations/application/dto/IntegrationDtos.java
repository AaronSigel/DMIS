package com.dmis.backend.integrations.application.dto;

import java.time.Instant;
import java.util.List;

public final class IntegrationDtos {
    private IntegrationDtos() {
    }

    public record MailDraftView(String id, String to, String subject, String body, String createdBy) {
    }

    /**
     * Вложение для SMTP после проверки ACL и загрузки из хранилища (не персистится в mail_drafts).
     */
    public record MailAttachment(String fileName, String contentType, byte[] content) {
    }

    public record CalendarDraftView(
            String id,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String createdBy
    ) {
    }

    /** Событие пользовательского календаря (таблица {@code calendar_events}). */
    public record CalendarEventView(
            String id,
            String title,
            List<String> attendees,
            String startIso,
            String endIso,
            String createdBy,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record BusySlot(String startIso, String endIso) {
    }

    public record FreeBusyView(String attendee, List<BusySlot> busySlots) {
    }

    public record MailMessageSummaryView(
            String id,
            String from,
            String to,
            String subject,
            String preview,
            String sentAtIso
    ) {
    }

    public record MailMessageDetailView(
            String id,
            String from,
            String to,
            String subject,
            String body,
            String sentAtIso
    ) {
    }

    public record MailMessageSearchRequest(String query, int limit) {
    }

    public record MailMessageSearchView(String query, List<MailMessageSummaryView> messages) {
    }
}

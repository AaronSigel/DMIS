package com.dmis.backend.integrations.application.dto;

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

    public record BusySlot(String startIso, String endIso) {
    }

    public record FreeBusyView(String attendee, List<BusySlot> busySlots) {
    }
}

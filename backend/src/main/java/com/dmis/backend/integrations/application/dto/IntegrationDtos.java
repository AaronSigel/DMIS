package com.dmis.backend.integrations.application.dto;

import java.time.Instant;
import java.util.List;

public final class IntegrationDtos {
    private IntegrationDtos() {
    }

    public record MailDraftView(String id, String to, String subject, String body, String createdBy) {
    }

    /** Метаданные вложения входящего письма (Mailpit PartID). */
    public record MailAttachmentPartView(String partId, String fileName, String contentType, long sizeBytes) {
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

    public record CalendarParticipantView(
            String userId,
            String email,
            String displayName,
            String status
    ) {
    }

    public record CalendarAttachmentView(
            String id,
            String documentId,
            String documentTitle,
            String role
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
            Instant updatedAt,
            String description,
            String creationSource,
            String sourceMailMessageId,
            List<CalendarParticipantView> participants,
            List<CalendarAttachmentView> attachments
    ) {
    }

    public record AvailabilityRequest(
            List<String> attendeeEmails,
            String fromIso,
            String toIso,
            int slotMinutes
    ) {
    }

    public record SuggestedSlot(String startIso, String endIso) {
    }

    public record AvailabilityResponse(List<SuggestedSlot> slots) {
    }

    public record CreateCalendarEventFromMailRequest(String mailbox, String messageId) {
    }

    public record AddCalendarParticipantRequest(String userId) {
    }

    public record AddCalendarAttachmentRequest(String documentId, String role) {
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
            String sentAtIso,
            boolean hasAttachments,
            boolean draft
    ) {
    }

    public record MailMessageDetailView(
            String id,
            String from,
            String to,
            String subject,
            String body,
            String sentAtIso,
            List<MailAttachmentPartView> attachments
    ) {
    }

    public record MailMessageSearchRequest(String query, int limit, String folder) {
    }

    /** Результат краткого пересказа цепочки писем. */
    public record MailThreadSummaryView(String summary, String provider, String model) {
    }

    /** Запрос пересказа: при отсутствии цепочки — объединяем переданные id писем. */
    public record MailThreadSummaryRequest(List<String> messageIds) {
    }

    public record MailMessageSearchView(String query, List<MailMessageSummaryView> messages) {
    }

    /** Настройки IMAP-учётки пользователя (без раскрытия пароля). */
    public record MailAccountView(
            boolean connected,
            String imapHost,
            int imapPort,
            String imapUsername
    ) {
    }
}

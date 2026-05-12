package com.dmis.backend.integrations.domain.model;

/**
 * Виртуальные папки почтового ящика (Mailpit-MVP: фильтрация на стороне приложения).
 */
public enum MailFolder {
    INBOX,
    SENT,
    DRAFT,
    /** Заглушка для папок вне поддерживаемых Mailpit-маршрутов read API. */
    ARCHIVE,
    /** Письма с вложениями, где пользователь — отправитель или получатель. */
    ATTACHMENTS;

    public static MailFolder fromNullable(String raw) {
        if (raw == null || raw.isBlank()) {
            return INBOX;
        }
        return MailFolder.valueOf(raw.trim().toUpperCase());
    }
}
package com.dmis.backend.integrations.domain.model;

public enum EventParticipantStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    TENTATIVE,
    /** Внешний адрес из устаревшего поля {@code attendees} (CSV), без строки в participants. */
    UNKNOWN
}

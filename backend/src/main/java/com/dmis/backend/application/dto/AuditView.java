package com.dmis.backend.audit.application.dto;

import java.time.Instant;

public record AuditView(
        String id,
        Instant at,
        String actorId,
        String action,
        String resourceType,
        String resourceId,
        String details
) {
}

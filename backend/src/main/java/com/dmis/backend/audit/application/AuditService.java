package com.dmis.backend.audit.application;

import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {
    private final AuditPort auditPort;

    public AuditService(AuditPort auditPort) {
        this.auditPort = auditPort;
    }

    public void append(String actorId, String action, String resourceType, String resourceId, String details) {
        auditPort.append(new AuditView(
                "audit-" + UUID.randomUUID(),
                Instant.now(),
                actorId,
                action,
                resourceType,
                resourceId,
                details
        ));
    }

    public List<AuditView> listAll() {
        return auditPort.findAll();
    }
}

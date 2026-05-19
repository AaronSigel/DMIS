package com.dmis.backend.audit.application;

import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {
    private final AuditPort auditPort;
    private final AclService aclService;

    public AuditService(AuditPort auditPort, AclService aclService) {
        this.auditPort = auditPort;
        this.aclService = aclService;
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

    /** ADMIN видит весь журнал; остальные — только свои записи. */
    public List<AuditView> listFor(UserView actor) {
        if (aclService.isAdmin(actor)) {
            return auditPort.findAll();
        }
        return auditPort.findByActorId(actor.id());
    }
}

package com.dmis.backend.audit.application.port;

import com.dmis.backend.audit.application.dto.AuditView;

import java.util.List;

public interface AuditPort {
    void append(AuditView auditView);

    List<AuditView> findAll();
}

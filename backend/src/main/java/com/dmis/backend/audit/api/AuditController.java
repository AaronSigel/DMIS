package com.dmis.backend.audit.api;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.platform.security.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {
    private final AuditService auditService;
    private final CurrentUserProvider currentUserProvider;

    public AuditController(AuditService auditService, CurrentUserProvider currentUserProvider) {
        this.auditService = auditService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public List<AuditView> list() {
        return auditService.listFor(currentUserProvider.currentUser());
    }
}

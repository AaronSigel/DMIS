package com.dmis.backend.audit.infra.persistence;

import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.application.port.AuditPort;
import com.dmis.backend.audit.infra.persistence.entity.AuditLogEntity;
import com.dmis.backend.audit.infra.persistence.repository.AuditLogJpaRepository;
import com.dmis.backend.shared.persistence.PersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuditPersistenceAdapter implements AuditPort {
    private final AuditLogJpaRepository repository;
    private final PersistenceMapper mapper;

    public AuditPersistenceAdapter(AuditLogJpaRepository repository, PersistenceMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public void append(AuditView auditView) {
        repository.save(new AuditLogEntity(
                auditView.id(),
                auditView.at(),
                auditView.actorId(),
                auditView.action(),
                auditView.resourceType(),
                auditView.resourceId(),
                auditView.details()
        ));
    }

    @Override
    public List<AuditView> findAll() {
        return repository.findAll().stream().map(mapper::toAuditView).toList();
    }
}

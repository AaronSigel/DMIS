package com.dmis.backend.audit.infra.persistence.repository;

import com.dmis.backend.audit.infra.persistence.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogEntity, String> {
}

package com.dmis.backend.audit.infra.persistence.repository;

import com.dmis.backend.audit.infra.persistence.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogEntity, String> {
    List<AuditLogEntity> findByActorIdOrderByAtDesc(String actorId);
}

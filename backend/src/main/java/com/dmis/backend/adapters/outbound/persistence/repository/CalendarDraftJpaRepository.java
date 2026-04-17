package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.CalendarDraftEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarDraftJpaRepository extends JpaRepository<CalendarDraftEntity, String> {
}

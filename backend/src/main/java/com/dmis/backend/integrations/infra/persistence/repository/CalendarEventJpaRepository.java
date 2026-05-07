package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarEventJpaRepository extends JpaRepository<CalendarEventEntity, String> {

    List<CalendarEventEntity> findByCreatedByOrderByStartIsoAsc(String createdBy);

    List<CalendarEventEntity> findAllByOrderByStartIsoAsc();
}

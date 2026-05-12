package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface CalendarEventAttachmentJpaRepository extends JpaRepository<CalendarEventAttachmentEntity, String> {

    List<CalendarEventAttachmentEntity> findByEventIdOrderByCreatedAtAsc(String eventId);

    List<CalendarEventAttachmentEntity> findByEventIdInOrderByEventIdAscCreatedAtAsc(Collection<String> eventIds);

    void deleteByEventIdAndId(String eventId, String id);
}

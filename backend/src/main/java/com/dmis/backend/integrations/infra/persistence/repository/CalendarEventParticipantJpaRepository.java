package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CalendarEventParticipantJpaRepository extends JpaRepository<CalendarEventParticipantEntity, String> {

    List<CalendarEventParticipantEntity> findByEventIdOrderByCreatedAtAsc(String eventId);

    List<CalendarEventParticipantEntity> findByEventIdInOrderByEventIdAscCreatedAtAsc(Collection<String> eventIds);

    Optional<CalendarEventParticipantEntity> findByEventIdAndUserId(String eventId, String userId);

    void deleteByEventIdAndUserId(String eventId, String userId);
}

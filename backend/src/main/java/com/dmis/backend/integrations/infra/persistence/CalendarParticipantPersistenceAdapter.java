package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.port.CalendarParticipantPort;
import com.dmis.backend.integrations.domain.model.CalendarEventParticipant;
import com.dmis.backend.integrations.domain.model.EventParticipantStatus;
import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventParticipantEntity;
import com.dmis.backend.integrations.infra.persistence.repository.CalendarEventParticipantJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class CalendarParticipantPersistenceAdapter implements CalendarParticipantPort {
    private final CalendarEventParticipantJpaRepository repository;

    public CalendarParticipantPersistenceAdapter(CalendarEventParticipantJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<CalendarEventParticipant> listByEventIdOrdered(String eventId) {
        return repository.findByEventIdOrderByCreatedAtAsc(eventId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<CalendarEventParticipant> listByEventIdsOrdered(Collection<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return List.of();
        }
        return repository.findByEventIdInOrderByEventIdAscCreatedAtAsc(eventIds).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<CalendarEventParticipant> findByEventAndUser(String eventId, String userId) {
        return repository.findByEventIdAndUserId(eventId, userId).map(this::toDomain);
    }

    @Override
    public void save(CalendarEventParticipant participant) {
        repository.save(new CalendarEventParticipantEntity(
                participant.id(),
                participant.eventId(),
                participant.userId(),
                participant.status().name(),
                participant.createdAt()
        ));
    }

    @Override
    public void deleteByEventAndUser(String eventId, String userId) {
        repository.deleteByEventIdAndUserId(eventId, userId);
    }

    private CalendarEventParticipant toDomain(CalendarEventParticipantEntity e) {
        return new CalendarEventParticipant(
                e.getId(),
                e.getEventId(),
                e.getUserId(),
                EventParticipantStatus.valueOf(e.getStatus()),
                e.getCreatedAt()
        );
    }
}

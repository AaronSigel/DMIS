package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.port.CalendarEventPort;
import com.dmis.backend.integrations.domain.model.CalendarEvent;
import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventEntity;
import com.dmis.backend.integrations.infra.persistence.repository.CalendarEventJpaRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class CalendarEventPersistenceAdapter implements CalendarEventPort {
    private final CalendarEventJpaRepository calendarEventJpaRepository;

    public CalendarEventPersistenceAdapter(CalendarEventJpaRepository calendarEventJpaRepository) {
        this.calendarEventJpaRepository = calendarEventJpaRepository;
    }

    @Override
    public List<CalendarEvent> listByCreatedBy(String createdBy) {
        return calendarEventJpaRepository.findByCreatedByOrderByStartIsoAsc(createdBy).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<CalendarEvent> listAllOrderByStartIsoAsc() {
        return calendarEventJpaRepository.findAllByOrderByStartIsoAsc().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<CalendarEvent> findById(String id) {
        return calendarEventJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public CalendarEvent save(CalendarEvent event) {
        Instant now = Instant.now();
        Instant createdAt = event.createdAt() != null ? event.createdAt() : now;
        Instant updatedAt = now;
        CalendarEventEntity entity = new CalendarEventEntity(
                event.id(),
                event.title(),
                attendeesToCsv(event.attendees()),
                event.startIso(),
                event.endIso(),
                event.createdBy(),
                createdAt,
                updatedAt
        );
        calendarEventJpaRepository.save(entity);
        return toDomain(entity);
    }

    @Override
    public void deleteById(String id) {
        calendarEventJpaRepository.deleteById(id);
    }

    private CalendarEvent toDomain(CalendarEventEntity e) {
        return new CalendarEvent(
                e.getId(),
                e.getTitle(),
                csvToAttendees(e.getAttendees()),
                e.getStartIso(),
                e.getEndIso(),
                e.getCreatedBy(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }

    private static String attendeesToCsv(List<String> attendees) {
        if (attendees == null || attendees.isEmpty()) {
            return "";
        }
        return String.join(",", attendees);
    }

    private static List<String> csvToAttendees(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}

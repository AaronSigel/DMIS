package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.domain.model.CalendarEventParticipant;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CalendarParticipantPort {

    List<CalendarEventParticipant> listByEventIdOrdered(String eventId);

    List<CalendarEventParticipant> listByEventIdsOrdered(Collection<String> eventIds);

    Optional<CalendarEventParticipant> findByEventAndUser(String eventId, String userId);

    void save(CalendarEventParticipant participant);

    void deleteByEventAndUser(String eventId, String userId);
}

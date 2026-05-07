package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.domain.model.CalendarEvent;

import java.util.List;
import java.util.Optional;

public interface CalendarEventPort {

    List<CalendarEvent> listByCreatedBy(String createdBy);

    List<CalendarEvent> listAllOrderByStartIsoAsc();

    Optional<CalendarEvent> findById(String id);

    CalendarEvent save(CalendarEvent event);

    void deleteById(String id);
}

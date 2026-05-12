package com.dmis.backend.integrations.application.port;

import com.dmis.backend.integrations.domain.model.CalendarEventAttachment;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CalendarAttachmentPort {

    List<CalendarEventAttachment> listByEventIdOrdered(String eventId);

    List<CalendarEventAttachment> listByEventIdsOrdered(Collection<String> eventIds);

    Optional<CalendarEventAttachment> findById(String attachmentId);

    void save(CalendarEventAttachment attachment);

    void deleteById(String attachmentId);
}

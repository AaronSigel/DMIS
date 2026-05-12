package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.port.CalendarAttachmentPort;
import com.dmis.backend.integrations.domain.model.CalendarEventAttachment;
import com.dmis.backend.integrations.domain.model.EventAttachmentRole;
import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventAttachmentEntity;
import com.dmis.backend.integrations.infra.persistence.repository.CalendarEventAttachmentJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Component
public class CalendarAttachmentPersistenceAdapter implements CalendarAttachmentPort {
    private final CalendarEventAttachmentJpaRepository repository;

    public CalendarAttachmentPersistenceAdapter(CalendarEventAttachmentJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<CalendarEventAttachment> listByEventIdOrdered(String eventId) {
        return repository.findByEventIdOrderByCreatedAtAsc(eventId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<CalendarEventAttachment> listByEventIdsOrdered(Collection<String> eventIds) {
        if (eventIds == null || eventIds.isEmpty()) {
            return List.of();
        }
        return repository.findByEventIdInOrderByEventIdAscCreatedAtAsc(eventIds).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<CalendarEventAttachment> findById(String attachmentId) {
        return repository.findById(attachmentId).map(this::toDomain);
    }

    @Override
    public void save(CalendarEventAttachment attachment) {
        repository.save(new CalendarEventAttachmentEntity(
                attachment.id(),
                attachment.eventId(),
                attachment.documentId(),
                attachment.role().name(),
                attachment.createdAt()
        ));
    }

    @Override
    public void deleteById(String attachmentId) {
        repository.deleteById(attachmentId);
    }

    private CalendarEventAttachment toDomain(CalendarEventAttachmentEntity e) {
        return new CalendarEventAttachment(
                e.getId(),
                e.getEventId(),
                e.getDocumentId(),
                EventAttachmentRole.valueOf(e.getRole()),
                e.getCreatedAt()
        );
    }
}

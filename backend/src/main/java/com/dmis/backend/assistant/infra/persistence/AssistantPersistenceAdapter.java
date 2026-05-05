package com.dmis.backend.assistant.infra.persistence;

import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.assistant.infra.persistence.entity.AssistantMessageEntity;
import com.dmis.backend.assistant.infra.persistence.entity.AssistantPreferenceEntity;
import com.dmis.backend.assistant.infra.persistence.entity.AssistantThreadDocumentEntity;
import com.dmis.backend.assistant.infra.persistence.entity.AssistantThreadEntity;
import com.dmis.backend.assistant.infra.persistence.repository.AssistantMessageJpaRepository;
import com.dmis.backend.assistant.infra.persistence.repository.AssistantPreferenceJpaRepository;
import com.dmis.backend.assistant.infra.persistence.repository.AssistantThreadDocumentJpaRepository;
import com.dmis.backend.assistant.infra.persistence.repository.AssistantThreadJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AssistantPersistenceAdapter implements AssistantPort {
    private final AssistantThreadJpaRepository threadRepository;
    private final AssistantMessageJpaRepository messageRepository;
    private final AssistantThreadDocumentJpaRepository threadDocumentRepository;
    private final AssistantPreferenceJpaRepository preferenceRepository;

    public AssistantPersistenceAdapter(
            AssistantThreadJpaRepository threadRepository,
            AssistantMessageJpaRepository messageRepository,
            AssistantThreadDocumentJpaRepository threadDocumentRepository,
            AssistantPreferenceJpaRepository preferenceRepository
    ) {
        this.threadRepository = threadRepository;
        this.messageRepository = messageRepository;
        this.threadDocumentRepository = threadDocumentRepository;
        this.preferenceRepository = preferenceRepository;
    }

    @Override
    public AssistantDtos.ThreadView saveThread(AssistantDtos.ThreadView thread) {
        AssistantThreadEntity saved = threadRepository.save(new AssistantThreadEntity(
                thread.id(),
                thread.ownerId(),
                thread.title(),
                thread.ideologyProfileId(),
                join(thread.knowledgeSourceIds()),
                thread.createdAt(),
                thread.updatedAt()
        ));
        return toView(saved);
    }

    @Override
    public List<AssistantDtos.ThreadView> findThreadsByOwner(String ownerId) {
        return threadRepository.findByOwnerId(ownerId).stream().map(this::toView).toList();
    }

    @Override
    public Optional<AssistantDtos.ThreadView> findThreadById(String threadId) {
        return threadRepository.findById(threadId).map(this::toView);
    }

    @Override
    public AssistantDtos.MessageView saveMessage(AssistantDtos.MessageView message) {
        AssistantMessageEntity saved = messageRepository.save(new AssistantMessageEntity(
                message.id(),
                message.threadId(),
                message.role(),
                message.content(),
                join(message.documentIds()),
                message.createdAt()
        ));
        return toView(saved);
    }

    @Override
    public List<AssistantDtos.MessageView> findMessagesByThreadId(String threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId).stream().map(this::toView).toList();
    }

    @Override
    public void linkDocument(String threadId, String documentId) {
        if (threadDocumentRepository.findByThreadIdAndDocumentId(threadId, documentId).isPresent()) {
            return;
        }
        threadDocumentRepository.save(new AssistantThreadDocumentEntity(
                "thread-doc-" + UUID.randomUUID(),
                threadId,
                documentId
        ));
    }

    @Override
    public void unlinkDocument(String threadId, String documentId) {
        threadDocumentRepository.findByThreadIdAndDocumentId(threadId, documentId)
                .ifPresent(threadDocumentRepository::delete);
    }

    @Override
    public List<String> findLinkedDocumentIds(String threadId) {
        return threadDocumentRepository.findByThreadId(threadId).stream()
                .map(AssistantThreadDocumentEntity::getDocumentId)
                .distinct()
                .toList();
    }

    @Override
    public AssistantDtos.AssistantPreferencesView savePreferences(AssistantDtos.AssistantPreferencesView preferences) {
        AssistantPreferenceEntity saved = preferenceRepository.save(new AssistantPreferenceEntity(
                preferences.ownerId(),
                preferences.ideologyProfileId(),
                join(preferences.knowledgeSourceIds()),
                preferences.updatedAt()
        ));
        return toView(saved);
    }

    @Override
    public Optional<AssistantDtos.AssistantPreferencesView> findPreferencesByOwner(String ownerId) {
        return preferenceRepository.findById(ownerId).map(this::toView);
    }

    private AssistantDtos.ThreadView toView(AssistantThreadEntity entity) {
        return new AssistantDtos.ThreadView(
                entity.getId(),
                entity.getOwnerId(),
                entity.getTitle(),
                entity.getIdeologyProfileId(),
                split(entity.getKnowledgeSourceIds()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private AssistantDtos.MessageView toView(AssistantMessageEntity entity) {
        return new AssistantDtos.MessageView(
                entity.getId(),
                entity.getThreadId(),
                entity.getRole(),
                entity.getContent(),
                split(entity.getDocumentIds()),
                entity.getCreatedAt()
        );
    }

    private AssistantDtos.AssistantPreferencesView toView(AssistantPreferenceEntity entity) {
        return new AssistantDtos.AssistantPreferencesView(
                entity.getOwnerId(),
                entity.getIdeologyProfileId(),
                split(entity.getKnowledgeSourceIds()),
                entity.getUpdatedAt()
        );
    }

    private static String join(List<String> values) {
        return values == null ? "" : values.stream().map(String::trim).filter(v -> !v.isBlank()).collect(Collectors.joining(","));
    }

    private static List<String> split(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return List.of(raw.split(",")).stream().map(String::trim).filter(v -> !v.isBlank()).toList();
    }
}

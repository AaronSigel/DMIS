package com.dmis.backend.assistant.application.port;

import com.dmis.backend.assistant.application.dto.AssistantDtos;

import java.util.List;
import java.util.Optional;

public interface AssistantPort {
    AssistantDtos.ThreadView saveThread(AssistantDtos.ThreadView thread);

    List<AssistantDtos.ThreadView> findThreadsByOwner(String ownerId);

    Optional<AssistantDtos.ThreadView> findThreadById(String threadId);

    void deleteThread(String threadId);

    AssistantDtos.MessageView saveMessage(AssistantDtos.MessageView message);

    List<AssistantDtos.MessageView> findMessagesByThreadId(String threadId);

    void linkDocument(String threadId, String documentId);

    void unlinkDocument(String threadId, String documentId);

    List<String> findLinkedDocumentIds(String threadId);

    AssistantDtos.AssistantPreferencesView savePreferences(AssistantDtos.AssistantPreferencesView preferences);

    Optional<AssistantDtos.AssistantPreferencesView> findPreferencesByOwner(String ownerId);
}

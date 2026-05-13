package com.dmis.backend.assistant.application;

import com.dmis.backend.actions.application.ActionService;
import com.dmis.backend.actions.application.IntentParserService;
import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.assistant.application.port.ThreadTitleGeneratorPort;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AssistantService {
    private static final List<String> DEFAULT_KNOWLEDGE_SOURCES = List.of("documents");
    private static final String DEFAULT_IDEOLOGY_PROFILE = "balanced";

    private final AssistantPort assistantPort;
    private final DocumentUseCases documentUseCases;
    private final SearchService searchService;
    private final AclService aclService;
    private final AuditService auditService;
    private final ThreadTitleGeneratorPort threadTitleGeneratorPort;
    private final IntentParserService intentParserService;
    private final ActionService actionService;

    public AssistantService(
            AssistantPort assistantPort,
            DocumentUseCases documentUseCases,
            SearchService searchService,
            AclService aclService,
            AuditService auditService,
            ThreadTitleGeneratorPort threadTitleGeneratorPort,
            IntentParserService intentParserService,
            ActionService actionService
    ) {
        this.assistantPort = assistantPort;
        this.documentUseCases = documentUseCases;
        this.searchService = searchService;
        this.aclService = aclService;
        this.auditService = auditService;
        this.threadTitleGeneratorPort = threadTitleGeneratorPort;
        this.intentParserService = intentParserService;
        this.actionService = actionService;
    }

    public AssistantDtos.ThreadView createThread(UserView actor, String title) {
        Instant now = Instant.now();
        AssistantDtos.AssistantPreferencesView preferences = preferences(actor);
        AssistantDtos.ThreadView created = assistantPort.saveThread(new AssistantDtos.ThreadView(
                "thread-" + UUID.randomUUID(),
                actor.id(),
                title == null || title.isBlank() ? "Новый диалог" : title.trim(),
                preferences.ideologyProfileId(),
                preferences.knowledgeSourceIds(),
                now,
                now
        ));
        auditService.append(actor.id(), "assistant.thread.create", "assistant_thread", created.id(), "Thread created");
        return created;
    }

    public List<AssistantDtos.ThreadView> listThreads(UserView actor) {
        return assistantPort.findThreadsByOwner(actor.id()).stream()
                .sorted(Comparator.comparing(AssistantDtos.ThreadView::updatedAt).reversed())
                .toList();
    }

    public AssistantDtos.ThreadDetailView getThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        return new AssistantDtos.ThreadDetailView(
                thread,
                assistantPort.findMessagesByThreadId(thread.id()),
                assistantPort.findLinkedDocumentIds(thread.id())
        );
    }

    public AssistantDtos.ThreadView generateThreadTitle(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<AssistantDtos.MessageView> messages = assistantPort.findMessagesByThreadId(thread.id());
        String currentTitle = thread.title() == null || thread.title().isBlank() ? "Новый диалог" : thread.title();

        String generated = threadTitleGeneratorPort.generateTitle(
                extractFirstUserMessage(messages),
                extractFirstAssistantMessage(messages),
                currentTitle
        );
        String safeTitle = normalizeGeneratedTitle(generated, currentTitle);
        Instant now = Instant.now();
        AssistantDtos.ThreadView updated = assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                safeTitle,
                thread.ideologyProfileId(),
                thread.knowledgeSourceIds(),
                thread.createdAt(),
                now
        ));
        auditService.append(actor.id(), "assistant.thread.title.generate", "assistant_thread", thread.id(), "Thread title generated");
        return updated;
    }

    public void deleteThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        assistantPort.deleteThread(thread.id());
        auditService.append(actor.id(), "assistant.thread.delete", "assistant_thread", thread.id(), "Thread deleted");
    }

    public AssistantDtos.SendMessageResult sendMessage(
            UserView actor,
            String threadId,
            String question,
            List<String> selectedDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<String> linkedDocumentIds = assistantPort.findLinkedDocumentIds(thread.id());
        List<String> effectiveSelected = selectedDocumentIds == null || selectedDocumentIds.isEmpty()
                ? linkedDocumentIds
                : selectedDocumentIds.stream().distinct().toList();
        validateDocumentAccess(actor, effectiveSelected);

        Instant now = Instant.now();
        AssistantDtos.MessageView userMessage = assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "USER",
                question,
                effectiveSelected,
                now
        ));
        SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                effectiveSelected,
                normalizeKnowledgeSources(knowledgeSourceIds, thread.knowledgeSourceIds()),
                normalizeIdeologyProfile(ideologyProfileId, thread.ideologyProfileId())
        );
        var rag = searchService.answer(actor, question, options);
        AssistantDtos.MessageView assistantMessage = assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "ASSISTANT",
                rag.answer(),
                effectiveSelected,
                Instant.now()
        ));
        assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                thread.title(),
                options.ideologyProfileId(),
                options.knowledgeSourceIds(),
                thread.createdAt(),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.message.send", "assistant_thread", thread.id(), "Message sent");
        return new AssistantDtos.SendMessageResult(userMessage, assistantMessage, rag);
    }

    public ActionDtos.AiActionView parseActionDraft(UserView actor, String userText) {
        return parseActionDraft(actor, userText, List.of());
    }

    public ActionDtos.AiActionView parseActionDraft(UserView actor, String userText, List<String> selectedDocumentIds) {
        IntentParserService.ParsedDraft parsedDraft = intentParserService.parseDraft(userText, selectedDocumentIds);
        return actionService.draft(actor, parsedDraft.intent(), parsedDraft.entities());
    }

    public void appendStreamMessages(
            UserView actor,
            String threadId,
            String question,
            String answer,
            List<String> selectedDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
        if (threadId == null || threadId.isBlank()) {
            return;
        }
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        List<String> linkedDocumentIds = assistantPort.findLinkedDocumentIds(thread.id());
        List<String> effectiveSelected = selectedDocumentIds == null || selectedDocumentIds.isEmpty()
                ? linkedDocumentIds
                : selectedDocumentIds.stream().distinct().toList();
        validateDocumentAccess(actor, effectiveSelected);
        SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                effectiveSelected,
                normalizeKnowledgeSources(knowledgeSourceIds, thread.knowledgeSourceIds()),
                normalizeIdeologyProfile(ideologyProfileId, thread.ideologyProfileId())
        );
        Instant now = Instant.now();
        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "USER",
                question,
                effectiveSelected,
                now
        ));
        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                thread.id(),
                "ASSISTANT",
                answer,
                effectiveSelected,
                Instant.now()
        ));
        assistantPort.saveThread(new AssistantDtos.ThreadView(
                thread.id(),
                thread.ownerId(),
                thread.title(),
                options.ideologyProfileId(),
                options.knowledgeSourceIds(),
                thread.createdAt(),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.message.stream.save", "assistant_thread", thread.id(), "Stream message pair saved");
    }

    public void linkDocument(UserView actor, String threadId, String documentId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
        aclService.requireDocumentRead(actor, document.id(), document.ownerId());
        assistantPort.linkDocument(thread.id(), documentId);
        auditService.append(actor.id(), "assistant.thread.link_document", "assistant_thread", thread.id(), "Linked " + documentId);
    }

    public void unlinkDocument(UserView actor, String threadId, String documentId) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        assistantPort.unlinkDocument(thread.id(), documentId);
        auditService.append(actor.id(), "assistant.thread.unlink_document", "assistant_thread", thread.id(), "Unlinked " + documentId);
    }

    public AssistantDtos.MentionDocumentView uploadAndLink(UserView actor, String threadId, String fileName, byte[] bytes, String contentType) {
        AssistantDtos.ThreadView thread = loadAccessibleThread(actor, threadId);
        DocumentDtos.DocumentView uploaded = documentUseCases.upload(actor, fileName, bytes, contentType);
        assistantPort.linkDocument(thread.id(), uploaded.id());
        return new AssistantDtos.MentionDocumentView(uploaded.id(), uploaded.title(), uploaded.updatedAt());
    }

    public List<AssistantDtos.MentionDocumentView> mentionCandidates(UserView actor, String query, int limit) {
        String normalized = query == null ? "" : query.trim().toLowerCase();
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        return documentUseCases.list(actor, new DocumentDtos.DocumentListQuery(null, null, null, null, "updatedAt", "desc", null, null, 0, 200))
                .content().stream()
                .filter(doc -> normalized.isBlank() || doc.title().toLowerCase().contains(normalized) || doc.id().toLowerCase().contains(normalized))
                .limit(safeLimit)
                .map(doc -> new AssistantDtos.MentionDocumentView(doc.id(), doc.title(), doc.updatedAt()))
                .toList();
    }

    public AssistantDtos.AssistantPreferencesView preferences(UserView actor) {
        return assistantPort.findPreferencesByOwner(actor.id())
                .orElseGet(() -> new AssistantDtos.AssistantPreferencesView(
                        actor.id(),
                        DEFAULT_IDEOLOGY_PROFILE,
                        DEFAULT_KNOWLEDGE_SOURCES,
                        Instant.now()
                ));
    }

    public AssistantDtos.AssistantPreferencesView savePreferences(UserView actor, String ideologyProfileId, List<String> knowledgeSourceIds) {
        AssistantDtos.AssistantPreferencesView saved = assistantPort.savePreferences(new AssistantDtos.AssistantPreferencesView(
                actor.id(),
                normalizeIdeologyProfile(ideologyProfileId, DEFAULT_IDEOLOGY_PROFILE),
                normalizeKnowledgeSources(knowledgeSourceIds, DEFAULT_KNOWLEDGE_SOURCES),
                Instant.now()
        ));
        auditService.append(actor.id(), "assistant.preferences.update", "assistant_preferences", actor.id(), "Preferences updated");
        return saved;
    }

    private AssistantDtos.ThreadView loadAccessibleThread(UserView actor, String threadId) {
        AssistantDtos.ThreadView thread = assistantPort.findThreadById(threadId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Thread not found"));
        if (!thread.ownerId().equals(actor.id()) && !aclService.isAdmin(actor)) {
            throw new ResponseStatusException(NOT_FOUND, "Thread not found");
        }
        return thread;
    }

    private void validateDocumentAccess(UserView actor, List<String> documentIds) {
        for (String documentId : documentIds) {
            DocumentDtos.DocumentView document = documentUseCases.get(actor, documentId);
            aclService.requireDocumentRead(actor, document.id(), document.ownerId());
        }
    }

    private List<String> normalizeKnowledgeSources(List<String> requested, List<String> fallback) {
        List<String> source = (requested == null || requested.isEmpty()) ? fallback : requested;
        if (source == null || source.isEmpty()) {
            return DEFAULT_KNOWLEDGE_SOURCES;
        }
        return source.stream().map(String::trim).filter(s -> !s.isBlank()).distinct().toList();
    }

    private String normalizeIdeologyProfile(String requested, String fallback) {
        String value = requested == null || requested.isBlank() ? fallback : requested;
        if (value == null || value.isBlank()) {
            return DEFAULT_IDEOLOGY_PROFILE;
        }
        return value.trim();
    }

    private static String extractFirstUserMessage(List<AssistantDtos.MessageView> messages) {
        return messages.stream()
                .filter(message -> "USER".equalsIgnoreCase(message.role()))
                .map(AssistantDtos.MessageView::content)
                .filter(content -> content != null && !content.isBlank())
                .findFirst()
                .orElse("");
    }

    private static String extractFirstAssistantMessage(List<AssistantDtos.MessageView> messages) {
        return messages.stream()
                .filter(message -> "ASSISTANT".equalsIgnoreCase(message.role()))
                .map(AssistantDtos.MessageView::content)
                .filter(content -> content != null && !content.isBlank())
                .findFirst()
                .orElse("");
    }

    private static String normalizeGeneratedTitle(String generated, String fallback) {
        String value = generated == null || generated.isBlank() ? fallback : generated.trim();
        if (value.length() > 120) {
            return value.substring(0, 120).trim();
        }
        return value;
    }
}

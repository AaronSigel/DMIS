package com.dmis.backend.search.api;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class SearchController {
    private final SearchService searchService;
    private final CurrentUserProvider currentUserProvider;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public SearchController(
            SearchService searchService,
            CurrentUserProvider currentUserProvider,
            LlmChatPort llmChatPort,
            AuditService auditService,
            ObjectMapper objectMapper
    ) {
        this.searchService = searchService;
        this.currentUserProvider = currentUserProvider;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/search")
    public SearchDtos.SearchResponse search(@Valid @RequestBody SearchRequest request) {
        return searchService.search(currentUserProvider.currentUser(), request.query());
    }

    @PostMapping("/rag/answer")
    public SearchDtos.RagResponse answer(@Valid @RequestBody RagRequest request) {
        return searchService.answer(currentUserProvider.currentUser(), request.question());
    }

    @PostMapping(value = "/rag/answer/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter answerStream(@Valid @RequestBody RagRequest request) {
        var actor = currentUserProvider.currentUser();
        String question = request.question();

        SearchDtos.SearchResponse retrieved = searchService.search(actor, question);
        if (retrieved.hits().isEmpty()) {
            SseEmitter emitter = new SseEmitter(0L);
            try {
                emitter.send(SseEmitter.event().data("{\"delta\":\"Не найдено релевантных документов по запросу.\"}"));
                emitter.send(SseEmitter.event().data("{\"done\":true}"));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        List<SearchDtos.RagSourceView> sources = retrieved.hits().stream()
                .limit(3)
                .map(hit -> new SearchDtos.RagSourceView(hit.documentId(), hit.title(), hit.chunkId(), hit.chunkText()))
                .toList();
        List<String> contextChunks = sources.stream().map(SearchDtos.RagSourceView::chunkText).toList();
        List<String> documentIds = sources.stream().map(SearchDtos.RagSourceView::documentId).distinct().toList();

        long startedAtMs = System.currentTimeMillis();
        String ragId = "rag-" + UUID.randomUUID();
        auditService.append(
                actor.id(),
                "rag.answer.stream.request",
                "rag",
                ragId,
                "question=" + question + ", chunks=" + contextChunks.size() + ", documents=" + documentIds
        );

        SseEmitter emitter = new SseEmitter(0L);
        new Thread(() -> {
            StringBuilder fullAnswer = new StringBuilder();
            String provider = null;
            String model = null;
            try (InputStream stream = llmChatPort.chatStream(new LlmChatPort.ChatRequest(
                    question,
                    contextChunks,
                    null,
                    null,
                    null,
                    null
            ))) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (!line.startsWith("data:")) {
                            continue;
                        }
                        String json = line.substring("data:".length()).trim();
                        if (json.isEmpty()) {
                            continue;
                        }
                        emitter.send(SseEmitter.event().data(json));

                        try {
                            JsonNode node = objectMapper.readTree(json);
                            JsonNode delta = node.get("delta");
                            if (delta != null && delta.isTextual()) {
                                fullAnswer.append(delta.asText());
                            }
                            JsonNode done = node.get("done");
                            if (done != null && done.isBoolean() && done.asBoolean()) {
                                JsonNode p = node.get("provider");
                                if (p != null && p.isTextual()) {
                                    provider = p.asText();
                                }
                                JsonNode m = node.get("model");
                                if (m != null && m.isTextual()) {
                                    model = m.asText();
                                }
                            }
                        } catch (Exception ignored) {
                            // Streaming must be best-effort; malformed JSON should not break the connection.
                        }
                    }
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            } finally {
                long elapsedMs = System.currentTimeMillis() - startedAtMs;
                auditService.append(
                        actor.id(),
                        "rag.answer.stream.response",
                        "rag",
                        ragId,
                        "provider=" + provider + ", model=" + model + ", answerChars=" + fullAnswer.length() + ", elapsedMs=" + elapsedMs
                );
            }
        }, "rag-answer-stream").start();
        return emitter;
    }

    public record SearchRequest(@NotBlank String query) {
    }

    public record RagRequest(@NotBlank String question) {
    }
}

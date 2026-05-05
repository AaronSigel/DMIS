package com.dmis.backend.search.api;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.search.application.RagStreamEventParser;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.search.application.port.LlmChatPort;
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

@RestController
@RequestMapping("/api")
public class SearchController {
    private final SearchService searchService;
    private final CurrentUserProvider currentUserProvider;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final RagStreamEventParser ragStreamEventParser;
    private final ObjectMapper objectMapper;

    public SearchController(
            SearchService searchService,
            CurrentUserProvider currentUserProvider,
            LlmChatPort llmChatPort,
            AuditService auditService,
            RagStreamEventParser ragStreamEventParser,
            ObjectMapper objectMapper
    ) {
        this.searchService = searchService;
        this.currentUserProvider = currentUserProvider;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.ragStreamEventParser = ragStreamEventParser;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/search")
    public SearchDtos.SearchOnlyResponse search(@Valid @RequestBody SearchRequest request) {
        return searchService.search(currentUserProvider.currentUser(), request.query());
    }

    @PostMapping({"/rag/answer-with-sources", "/rag/answer"})
    public SearchDtos.AnswerWithSourcesResponse answer(@Valid @RequestBody RagRequest request) {
        return searchService.answer(
                currentUserProvider.currentUser(),
                request.question(),
                new SearchService.AnswerOptions(request.documentIds(), request.knowledgeSourceIds(), request.ideologyProfileId())
        );
    }

    @PostMapping(value = "/rag/answer-with-sources/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter answerStream(@Valid @RequestBody RagRequest request) {
        var actor = currentUserProvider.currentUser();
        String question = request.question();

        SearchService.PreparedAnswer prepared = searchService.prepareAnswer(
                actor,
                question,
                "rag.answer.stream",
                new SearchService.AnswerOptions(request.documentIds(), request.knowledgeSourceIds(), request.ideologyProfileId())
        );
        if (!"OK".equals(prepared.status())) {
            SseEmitter emitter = new SseEmitter(0L);
            try {
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(new StreamDeltaPayload(prepared.fallbackAnswer()))));
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(
                        new StreamDonePayload(
                                true,
                                prepared.status(),
                                prepared.fallbackAnswer(),
                                null,
                                null,
                                prepared.sources(),
                                prepared.pipeline()
                        )
                )));
                auditService.append(
                        actor.id(),
                        "rag.answer.stream.response",
                        "rag",
                        prepared.ragId(),
                        "status=" + prepared.status() + ", llmLatencyMs=0, totalLatencyMs=" + prepared.pipeline().totalLatencyMs()
                );
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        SseEmitter emitter = new SseEmitter(0L);
        new Thread(() -> {
            StringBuilder fullAnswer = new StringBuilder();
            String provider = null;
            String model = null;
            long llmStartedAtMs = System.currentTimeMillis();
            try (InputStream stream = llmChatPort.chatStream(new LlmChatPort.ChatRequest(
                    question,
                    prepared.contextChunks(),
                    prepared.systemPrompt(),
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
                        try {
                            RagStreamEventParser.ParsedEvent parsed = ragStreamEventParser.parse(json);
                            if (parsed.delta() != null) {
                                fullAnswer.append(parsed.delta());
                            }
                            if (parsed.done()) {
                                provider = parsed.provider();
                                model = parsed.model();
                                long llmLatencyMs = System.currentTimeMillis() - llmStartedAtMs;
                                SearchDtos.AnswerPipelineMeta pipeline = withLlmLatency(prepared.pipeline(), llmLatencyMs);
                                auditService.append(
                                        actor.id(),
                                        "rag.answer.stream.llm",
                                        "rag",
                                        prepared.ragId(),
                                        "provider=" + provider + ", model=" + model + ", latencyMs=" + llmLatencyMs
                                );
                                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(
                                        new StreamDonePayload(
                                                true,
                                                "OK",
                                                fullAnswer.toString(),
                                                provider,
                                                model,
                                                prepared.sources(),
                                                pipeline
                                        )
                                )));
                                continue;
                            }
                        } catch (Exception ignored) {
                            // Streaming must be best-effort; malformed JSON should not break the connection.
                        }
                        emitter.send(SseEmitter.event().data(json));
                    }
                }
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            } finally {
                auditService.append(
                        actor.id(),
                        "rag.answer.stream.response",
                        "rag",
                        prepared.ragId(),
                        "status=OK, provider=" + provider + ", model=" + model + ", answerChars=" + fullAnswer.length()
                );
            }
        }, "rag-answer-stream").start();
        return emitter;
    }

    public record SearchRequest(@NotBlank String query) {
    }

    public record RagRequest(
            @NotBlank String question,
            String threadId,
            List<String> documentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId
    ) {
    }

    private record StreamDeltaPayload(String delta) {
    }

    private record StreamDonePayload(
            boolean done,
            String status,
            String answer,
            String provider,
            String model,
            List<SearchDtos.RagSourceView> sources,
            SearchDtos.AnswerPipelineMeta pipeline
    ) {
    }

    private SearchDtos.AnswerPipelineMeta withLlmLatency(SearchDtos.AnswerPipelineMeta base, long llmLatencyMs) {
        return new SearchDtos.AnswerPipelineMeta(
                base.retrievalTopK(),
                base.rerankTopN(),
                base.maxContextChunks(),
                base.maxContextChars(),
                base.retrievedCount(),
                base.returnedCount(),
                base.usedContextChunks(),
                base.usedContextChars(),
                base.contextTrimmed(),
                base.retrievalLatencyMs(),
                base.rerankLatencyMs(),
                llmLatencyMs,
                base.totalLatencyMs() + llmLatencyMs
        );
    }
}

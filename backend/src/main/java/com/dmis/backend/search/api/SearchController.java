package com.dmis.backend.search.api;

import com.dmis.backend.assistant.application.AssistantService;
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
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api")
public class SearchController {
    private final SearchService searchService;
    private final CurrentUserProvider currentUserProvider;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final AssistantService assistantService;
    private final RagStreamEventParser ragStreamEventParser;
    private final ObjectMapper objectMapper;

    public SearchController(
            SearchService searchService,
            CurrentUserProvider currentUserProvider,
            LlmChatPort llmChatPort,
            AuditService auditService,
            AssistantService assistantService,
            RagStreamEventParser ragStreamEventParser,
            ObjectMapper objectMapper
    ) {
        this.searchService = searchService;
        this.currentUserProvider = currentUserProvider;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.assistantService = assistantService;
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
                assistantService.appendStreamMessages(
                        actor,
                        request.threadId(),
                        question,
                        prepared.fallbackAnswer(),
                        request.documentIds(),
                        request.knowledgeSourceIds(),
                        request.ideologyProfileId()
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
            String finalStatus = "OK";
            boolean messagesPersisted = false;
            long llmStartedAtMs = System.currentTimeMillis();
            AtomicBoolean streamClosed = new AtomicBoolean(false);
            ScheduledExecutorService heartbeat = Executors.newSingleThreadScheduledExecutor();
            emitter.onCompletion(() -> streamClosed.set(true));
            emitter.onTimeout(() -> streamClosed.set(true));
            emitter.onError((error) -> streamClosed.set(true));
            heartbeat.scheduleAtFixedRate(() -> {
                if (streamClosed.get()) return;
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (Exception e) {
                    streamClosed.set(true);
                }
            }, 15, 15, TimeUnit.SECONDS);
            try (InputStream stream = llmChatPort.chatStream(new LlmChatPort.ChatRequest(
                    question,
                    prepared.contextChunks(),
                    prepared.systemPrompt(),
                    null,
                    searchService.resolveMaxTokens(),
                    null
            ))) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                    String line;
                    while (!streamClosed.get() && (line = reader.readLine()) != null) {
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
                                if (!messagesPersisted) {
                                    assistantService.appendStreamMessages(
                                            actor,
                                            request.threadId(),
                                            question,
                                            fullAnswer.toString(),
                                            request.documentIds(),
                                            request.knowledgeSourceIds(),
                                            request.ideologyProfileId()
                                    );
                                    messagesPersisted = true;
                                }
                                continue;
                            }
                        } catch (Exception ignored) {
                            // Streaming must be best-effort; malformed JSON should not break the connection.
                        }
                        emitter.send(SseEmitter.event().data(json));
                    }
                }
                if (!streamClosed.get()) {
                    emitter.complete();
                }
            } catch (Exception e) {
                finalStatus = "ERROR";
                if (!streamClosed.get()) {
                    emitter.completeWithError(e);
                }
            } finally {
                streamClosed.set(true);
                heartbeat.shutdownNow();
                auditService.append(
                        actor.id(),
                        "rag.answer.stream.response",
                        "rag",
                        prepared.ragId(),
                        "status=" + finalStatus + ", provider=" + provider + ", model=" + model + ", answerChars=" + fullAnswer.length()
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

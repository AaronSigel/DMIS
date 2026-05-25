package com.dmis.backend.search.api;

import com.dmis.backend.assistant.application.AssistantRagOrchestrator;
import com.dmis.backend.assistant.application.AssistantService;
import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.search.application.RagStreamEventParser;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api")
public class SearchController {
    private final SearchService searchService;
    private final CurrentUserProvider currentUserProvider;
    private final LlmChatPort llmChatPort;
    private final AuditService auditService;
    private final AssistantService assistantService;
    private final AssistantRagOrchestrator assistantRagOrchestrator;
    private final RagStreamEventParser ragStreamEventParser;
    private final ObjectMapper objectMapper;
    private final TaskExecutor ragStreamExecutor;
    private final TaskScheduler ragHeartbeatScheduler;
    private final long ragSseTimeoutMs;
    private final long ragHeartbeatIntervalMs;

    public SearchController(
            SearchService searchService,
            CurrentUserProvider currentUserProvider,
            LlmChatPort llmChatPort,
            AuditService auditService,
            AssistantService assistantService,
            AssistantRagOrchestrator assistantRagOrchestrator,
            RagStreamEventParser ragStreamEventParser,
            ObjectMapper objectMapper,
            @Qualifier("ragStreamExecutor") TaskExecutor ragStreamExecutor,
            @Qualifier("ragHeartbeatScheduler") TaskScheduler ragHeartbeatScheduler,
            @Value("${search.rag.stream.timeout-ms:0}") long ragSseTimeoutMs,
            @Value("${search.rag.stream.heartbeat-interval-ms:15000}") long ragHeartbeatIntervalMs
    ) {
        this.searchService = searchService;
        this.currentUserProvider = currentUserProvider;
        this.llmChatPort = llmChatPort;
        this.auditService = auditService;
        this.assistantService = assistantService;
        this.assistantRagOrchestrator = assistantRagOrchestrator;
        this.ragStreamEventParser = ragStreamEventParser;
        this.objectMapper = objectMapper;
        this.ragStreamExecutor = ragStreamExecutor;
        this.ragHeartbeatScheduler = ragHeartbeatScheduler;
        this.ragSseTimeoutMs = ragSseTimeoutMs;
        this.ragHeartbeatIntervalMs = ragHeartbeatIntervalMs;
    }

    @PostMapping("/search")
    public SearchDtos.SearchOnlyResponse search(@Valid @RequestBody SearchRequest request) {
        return searchService.search(currentUserProvider.currentUser(), request.query());
    }

    @PostMapping({"/rag/answer-with-sources", "/rag/answer"})
    public SearchDtos.AnswerWithSourcesResponse answer(@Valid @RequestBody RagRequest request) {
        var actor = currentUserProvider.currentUser();
        assistantService.requireAccessibleThread(actor, request.threadId());
        return assistantRagOrchestrator.orchestrate(
                actor,
                request.threadId(),
                request.question(),
                request.documentIds(),
                request.knowledgeSourceIds(),
                request.ideologyProfileId(),
                "rag.answer"
        ).response();
    }

    @PostMapping(value = "/rag/answer-with-sources/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter answerStream(@Valid @RequestBody RagRequest request) {
        var actor = currentUserProvider.currentUser();
        assistantService.requireAccessibleThread(actor, request.threadId());
        String question = request.question();

        AssistantRagOrchestrator.RagStreamPlan streamPlan = assistantRagOrchestrator.prepareStream(
                actor,
                request.threadId(),
                question,
                request.documentIds(),
                request.knowledgeSourceIds(),
                request.ideologyProfileId(),
                "rag.answer.stream"
        );
        SearchService.PreparedAnswer prepared = streamPlan.preparedAnswer();
        String messageId = "msg-" + UUID.randomUUID();
        if (!"OK".equals(prepared.status())) {
            SseEmitter emitter = new SseEmitter(0L);
            try {
                auditService.append(actor.id(), "assistant.stream.started", "rag", prepared.ragId(), "messageId=" + messageId);
                sendStartEvent(emitter, messageId);
                if (prepared.fallbackAnswer() != null && !prepared.fallbackAnswer().isBlank()) {
                    sendTokenEvent(emitter, prepared.fallbackAnswer());
                }
                sendDiagnosticEvent(emitter, prepared.status(), streamPlan.contextDiagnosticCode(), prepared.fallbackAnswer());
                sendDoneEvent(
                        emitter,
                        prepared.status(),
                        prepared.fallbackAnswer(),
                        null,
                        null,
                        prepared.sources(),
                        prepared.pipeline(),
                        streamPlan.contextStatus(),
                        streamPlan.contextDiagnosticCode(),
                        streamPlan.contextDocuments()
                );
                auditService.append(
                        actor.id(),
                        "assistant.stream.completed",
                        "rag",
                        prepared.ragId(),
                        "status=" + prepared.status() + ", messageId=" + messageId
                );
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
                        streamPlan.effectiveDocumentIds(),
                        request.knowledgeSourceIds(),
                        request.ideologyProfileId()
                );
                emitter.complete();
            } catch (Exception e) {
                completeStreamWithError(emitter, messageId, prepared.ragId(), actor.id(), e);
            }
            return emitter;
        }

        SseEmitter emitter = new SseEmitter(ragSseTimeoutMs <= 0 ? 0L : ragSseTimeoutMs);
        ragStreamExecutor.execute(() -> {
            StringBuilder fullAnswer = new StringBuilder();
            String provider = null;
            String model = null;
            String finalStatus = "OK";
            boolean messagesPersisted = false;
            boolean doneEventSent = false;
            long llmStartedAtMs = System.currentTimeMillis();
            AtomicBoolean streamClosed = new AtomicBoolean(false);
            AtomicReference<ScheduledFuture<?>> heartbeatTaskRef = new AtomicReference<>();
            Runnable closeStream = () -> {
                if (streamClosed.compareAndSet(false, true)) {
                    ScheduledFuture<?> heartbeatTask = heartbeatTaskRef.getAndSet(null);
                    if (heartbeatTask != null) {
                        heartbeatTask.cancel(true);
                    }
                }
            };
            emitter.onCompletion(closeStream);
            emitter.onTimeout(closeStream);
            emitter.onError((error) -> closeStream.run());
            ScheduledFuture<?> heartbeatTask = ragHeartbeatScheduler.scheduleAtFixedRate(() -> {
                if (streamClosed.get()) {
                    return;
                }
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (Exception e) {
                    closeStream.run();
                }
            }, Duration.ofMillis(Math.max(ragHeartbeatIntervalMs, 1_000L)));
            heartbeatTaskRef.set(heartbeatTask);
            try {
                auditService.append(actor.id(), "assistant.stream.started", "rag", prepared.ragId(), "messageId=" + messageId);
                sendStartEvent(emitter, messageId);

                if (searchService.llmToolLoopEnabled()) {
                    LlmChatPort.ChatResponse llm = searchService.resolveLlmResponse(actor, prepared);
                    fullAnswer.append(llm.answer());
                    provider = llm.provider();
                    model = llm.model();
                    long llmLatencyMs = System.currentTimeMillis() - llmStartedAtMs;
                    SearchDtos.AnswerPipelineMeta pipeline = withLlmLatency(prepared.pipeline(), llmLatencyMs);
                    auditService.append(
                            actor.id(),
                            "rag.answer.stream.llm",
                            "rag",
                            prepared.ragId(),
                            "provider=" + provider + ", model=" + model + ", latencyMs=" + llmLatencyMs + ", toolLoop=true"
                    );
                    sendTokenEvent(emitter, llm.answer());
                    sendDoneEvent(
                            emitter,
                            "OK",
                            fullAnswer.toString(),
                            provider,
                            model,
                            prepared.sources(),
                            pipeline,
                            streamPlan.contextStatus(),
                            streamPlan.contextDiagnosticCode(),
                            streamPlan.contextDocuments()
                    );
                    doneEventSent = true;
                    assistantService.appendStreamMessages(
                            actor,
                            request.threadId(),
                            question,
                            fullAnswer.toString(),
                            streamPlan.effectiveDocumentIds(),
                            request.knowledgeSourceIds(),
                            request.ideologyProfileId()
                    );
                    messagesPersisted = true;
                } else {
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
                                    if (parsed.error() != null) {
                                        sendErrorEvent(emitter, "LLM_STREAM_FAILED", parsed.error());
                                        finalStatus = "ERROR";
                                        break;
                                    }
                                    if (parsed.delta() != null) {
                                        fullAnswer.append(parsed.delta());
                                        sendTokenEvent(emitter, parsed.delta());
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
                                        sendDoneEvent(
                                                emitter,
                                                "OK",
                                                fullAnswer.toString(),
                                                provider,
                                                model,
                                                prepared.sources(),
                                                pipeline,
                                                streamPlan.contextStatus(),
                                                streamPlan.contextDiagnosticCode(),
                                                streamPlan.contextDocuments()
                                        );
                                        doneEventSent = true;
                                        if (!messagesPersisted && !fullAnswer.isEmpty()) {
                                            assistantService.appendStreamMessages(
                                                    actor,
                                                    request.threadId(),
                                                    question,
                                                    fullAnswer.toString(),
                                                    streamPlan.effectiveDocumentIds(),
                                                    request.knowledgeSourceIds(),
                                                    request.ideologyProfileId()
                                            );
                                            messagesPersisted = true;
                                        }
                                    }
                                } catch (Exception ignored) {
                                    // Streaming must be best-effort; malformed JSON should not break the connection.
                                }
                            }
                        }
                    }
                }

                if (!doneEventSent && !streamClosed.get()) {
                    long llmLatencyMs = System.currentTimeMillis() - llmStartedAtMs;
                    SearchDtos.AnswerPipelineMeta pipeline = withLlmLatency(prepared.pipeline(), llmLatencyMs);
                    String answer = fullAnswer.toString();
                    sendDoneEvent(
                            emitter,
                            answer.isBlank() ? "NO_CONTEXT" : "OK",
                            answer,
                            provider,
                            model,
                            prepared.sources(),
                            pipeline,
                            streamPlan.contextStatus(),
                            streamPlan.contextDiagnosticCode(),
                            streamPlan.contextDocuments()
                    );
                    doneEventSent = true;
                    if (!messagesPersisted && !answer.isBlank()) {
                        assistantService.appendStreamMessages(
                                actor,
                                request.threadId(),
                                question,
                                answer,
                                streamPlan.effectiveDocumentIds(),
                                request.knowledgeSourceIds(),
                                request.ideologyProfileId()
                        );
                        messagesPersisted = true;
                    }
                }

                if (!streamClosed.get()) {
                    emitter.complete();
                }
                auditService.append(
                        actor.id(),
                        "assistant.stream.completed",
                        "rag",
                        prepared.ragId(),
                        "status=" + finalStatus + ", messageId=" + messageId + ", answerChars=" + fullAnswer.length()
                );
            } catch (Exception e) {
                finalStatus = "ERROR";
                auditService.append(
                        actor.id(),
                        "assistant.stream.failed",
                        "rag",
                        prepared.ragId(),
                        "messageId=" + messageId + ", error=" + e.getMessage()
                );
                if (!streamClosed.get()) {
                    completeStreamWithError(emitter, messageId, prepared.ragId(), actor.id(), e);
                }
            } finally {
                closeStream.run();
                auditService.append(
                        actor.id(),
                        "rag.answer.stream.response",
                        "rag",
                        prepared.ragId(),
                        "status=" + finalStatus + ", provider=" + provider + ", model=" + model + ", answerChars=" + fullAnswer.length()
                );
            }
        });
        return emitter;
    }

    private void sendStartEvent(SseEmitter emitter, String messageId) throws java.io.IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(new StreamStartPayload(messageId))));
    }

    private void sendTokenEvent(SseEmitter emitter, String delta) throws java.io.IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(new StreamTokenPayload(delta))));
    }

    private void sendDiagnosticEvent(
            SseEmitter emitter,
            String status,
            String diagnosticCode,
            String message
    ) throws java.io.IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(
                new StreamDiagnosticPayload(status, diagnosticCode, message)
        )));
    }

    private void sendErrorEvent(SseEmitter emitter, String diagnosticCode, String message) throws java.io.IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(
                new StreamErrorPayload(diagnosticCode, message)
        )));
    }

    private void sendDoneEvent(
            SseEmitter emitter,
            String status,
            String answer,
            String provider,
            String model,
            List<SearchDtos.RagSourceView> sources,
            SearchDtos.AnswerPipelineMeta pipeline,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDtos.AssistantDocumentStatusView> contextDocuments
    ) throws java.io.IOException {
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(
                new StreamDonePayload(
                        true,
                        status,
                        answer,
                        provider,
                        model,
                        sources,
                        pipeline,
                        contextStatus,
                        contextDiagnosticCode,
                        contextDocuments
                )
        )));
    }

    private void completeStreamWithError(SseEmitter emitter, String messageId, String ragId, String actorId, Exception error) {
        try {
            sendErrorEvent(emitter, "LLM_STREAM_FAILED", error.getMessage() == null ? "Stream failed" : error.getMessage());
            sendDoneEvent(emitter, "ERROR", "", null, null, List.of(), emptyPipeline(), "ERROR", "LLM_STREAM_FAILED", List.of());
            auditService.append(actorId, "assistant.stream.failed", "rag", ragId, "messageId=" + messageId + ", error=" + error.getMessage());
            emitter.complete();
        } catch (Exception ignored) {
            emitter.completeWithError(error);
        }
    }

    private SearchDtos.AnswerPipelineMeta emptyPipeline() {
        return new SearchDtos.AnswerPipelineMeta(0, 0, 0, 0, 0, 0, 0, 0, false, 0L, 0L, 0L, 0L);
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

    private record StreamStartPayload(String type, String messageId) {
        private StreamStartPayload(String messageId) {
            this("start", messageId);
        }
    }

    private record StreamTokenPayload(String type, String delta) {
        private StreamTokenPayload(String delta) {
            this("token", delta);
        }
    }

    private record StreamDiagnosticPayload(String type, String status, String diagnosticCode, String message) {
        private StreamDiagnosticPayload(String status, String diagnosticCode, String message) {
            this("diagnostic", status, diagnosticCode, message);
        }
    }

    private record StreamErrorPayload(String type, String status, String diagnosticCode, String message) {
        private StreamErrorPayload(String diagnosticCode, String message) {
            this("error", "ERROR", diagnosticCode, message);
        }
    }

    private record StreamDonePayload(
            String type,
            boolean done,
            String status,
            String answer,
            String provider,
            String model,
            List<SearchDtos.RagSourceView> sources,
            SearchDtos.AnswerPipelineMeta pipeline,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDtos.AssistantDocumentStatusView> contextDocuments
    ) {
        private StreamDonePayload(
                boolean done,
                String status,
                String answer,
                String provider,
                String model,
                List<SearchDtos.RagSourceView> sources,
                SearchDtos.AnswerPipelineMeta pipeline,
                String contextStatus,
                String contextDiagnosticCode,
                List<AssistantDtos.AssistantDocumentStatusView> contextDocuments
        ) {
            this("done", done, status, answer, provider, model, sources, pipeline, contextStatus, contextDiagnosticCode, contextDocuments);
        }
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

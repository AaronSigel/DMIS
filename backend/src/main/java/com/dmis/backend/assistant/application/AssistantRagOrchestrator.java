package com.dmis.backend.assistant.application;

import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.search.application.SearchService;
import com.dmis.backend.search.application.dto.SearchDtos;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AssistantRagOrchestrator {
    private final AssistantPort assistantPort;
    private final ContextAssemblyService contextAssemblyService;
    private final SearchService searchService;

    public AssistantRagOrchestrator(
            AssistantPort assistantPort,
            ContextAssemblyService contextAssemblyService,
            SearchService searchService
    ) {
        this.assistantPort = assistantPort;
        this.contextAssemblyService = contextAssemblyService;
        this.searchService = searchService;
    }

    public List<String> resolveEffectiveDocumentIds(UserView actor, String threadId, List<String> requestDocumentIds) {
        List<String> requested = requestDocumentIds == null ? List.of() : requestDocumentIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
        if (!requested.isEmpty()) {
            return requested;
        }
        if (threadId == null || threadId.isBlank()) {
            return List.of();
        }
        return assistantPort.findLinkedDocumentIds(threadId);
    }

    public RagOrchestrationResult orchestrate(
            UserView actor,
            String threadId,
            String question,
            List<String> requestDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId,
            String ragEventName
    ) {
        RagPlan plan = buildPlan(actor, threadId, question, requestDocumentIds, knowledgeSourceIds, ideologyProfileId, ragEventName);
        if (plan.diagnosticOnly()) {
            return toResult(plan, plan.diagnosticResponse());
        }
        SearchDtos.AnswerWithSourcesResponse response = searchService.completePreparedAnswer(actor, plan.preparedAnswer());
        return toResult(plan, response);
    }

    public RagStreamPlan prepareStream(
            UserView actor,
            String threadId,
            String question,
            List<String> requestDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId,
            String ragEventName
    ) {
        RagPlan plan = buildPlan(actor, threadId, question, requestDocumentIds, knowledgeSourceIds, ideologyProfileId, ragEventName);
        return new RagStreamPlan(
                plan.effectiveDocumentIds(),
                plan.documentContext(),
                plan.preparedAnswer(),
                plan.contextStatus(),
                plan.contextDiagnosticCode(),
                plan.contextDocuments(),
                plan.diagnosticOnly()
        );
    }

    private RagPlan buildPlan(
            UserView actor,
            String threadId,
            String question,
            List<String> requestDocumentIds,
            List<String> knowledgeSourceIds,
            String ideologyProfileId,
            String ragEventName
    ) {
        if (KnowledgeSourcePolicy.unsupportedOnly(knowledgeSourceIds)) {
            SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                    List.of(),
                    knowledgeSourceIds,
                    ideologyProfileId
            );
            SearchService.PreparedAnswer prepared = searchService.prepareAnswer(actor, question, ragEventName, options);
            return new RagPlan(
                    List.of(),
                    null,
                    prepared,
                    prepared.status(),
                    prepared.status(),
                    List.of(),
                    true
            );
        }

        List<String> effectiveDocumentIds = resolveEffectiveDocumentIds(actor, threadId, requestDocumentIds);
        SearchService.AnswerOptions options = new SearchService.AnswerOptions(
                effectiveDocumentIds,
                knowledgeSourceIds,
                ideologyProfileId
        );

        if (effectiveDocumentIds.isEmpty()) {
            SearchService.PreparedAnswer prepared = searchService.prepareAnswer(actor, question, ragEventName, options);
            return new RagPlan(
                    effectiveDocumentIds,
                    null,
                    prepared,
                    null,
                    null,
                    List.of(),
                    !"OK".equals(prepared.status())
            );
        }

        ContextMode mode = ContextModeDetector.detect(question, ContextMode.AUTO);
        PreparedDocumentContext documentContext = contextAssemblyService.prepareDocumentContext(
                actor,
                question,
                effectiveDocumentIds,
                mode
        );
        List<AssistantDtos.AssistantDocumentStatusView> contextDocuments = documentContext.documents().stream()
                .map(contextAssemblyService::toStatusView)
                .toList();

        if (!documentContext.llmAllowed()) {
            SearchDtos.AnswerPipelineMeta pipeline = emptyPipeline();
            SearchDtos.AnswerWithSourcesResponse diagnostic = new SearchDtos.AnswerWithSourcesResponse(
                    question,
                    documentContext.status(),
                    documentContext.userMessage(),
                    documentContext.sources(),
                    pipeline
            );
            SearchService.PreparedAnswer prepared = new SearchService.PreparedAnswer(
                    question,
                    documentContext.status(),
                    documentContext.userMessage(),
                    documentContext.sources(),
                    List.of(),
                    pipeline,
                    searchService.resolveSystemPromptForProfile(ideologyProfileId),
                    "rag-" + UUID.randomUUID()
            );
            return new RagPlan(
                    effectiveDocumentIds,
                    documentContext,
                    prepared,
                    documentContext.status(),
                    documentContext.diagnosticCode(),
                    contextDocuments,
                    true
            );
        }

        SearchService.PreparedAnswer prepared = searchService.prepareAnswerFromContext(
                actor,
                question,
                documentContext.contextChunks(),
                documentContext.sources(),
                ragEventName,
                withSummaryPromptIfNeeded(options, mode)
        );
        return new RagPlan(
                effectiveDocumentIds,
                documentContext,
                prepared,
                documentContext.status(),
                documentContext.diagnosticCode(),
                contextDocuments,
                false
        );
    }

    private RagOrchestrationResult toResult(RagPlan plan, SearchDtos.AnswerWithSourcesResponse response) {
        return new RagOrchestrationResult(
                plan.effectiveDocumentIds(),
                plan.documentContext(),
                response,
                plan.contextStatus(),
                plan.contextDiagnosticCode(),
                plan.contextDocuments()
        );
    }

    private SearchDtos.AnswerPipelineMeta emptyPipeline() {
        return new SearchDtos.AnswerPipelineMeta(0, 0, 0, 0, 0, 0, 0, 0, false, 0L, 0L, 0L, 0L);
    }

    private SearchService.AnswerOptions withSummaryPromptIfNeeded(SearchService.AnswerOptions options, ContextMode mode) {
        if (mode != ContextMode.SUMMARY && mode != ContextMode.ANALYSIS) {
            return options;
        }
        return new SearchService.AnswerOptions(
                options.documentIds(),
                options.knowledgeSourceIds(),
                options.ideologyProfileId(),
                searchService.resolveSummarySystemPrompt()
        );
    }

    private record RagPlan(
            List<String> effectiveDocumentIds,
            PreparedDocumentContext documentContext,
            SearchService.PreparedAnswer preparedAnswer,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDtos.AssistantDocumentStatusView> contextDocuments,
            boolean diagnosticOnly
    ) {
        SearchDtos.AnswerWithSourcesResponse diagnosticResponse() {
            SearchDtos.AnswerPipelineMeta pipeline = new SearchDtos.AnswerPipelineMeta(
                    0, 0, 0, 0, 0, 0, 0, 0, false, 0L, 0L, 0L, 0L
            );
            return new SearchDtos.AnswerWithSourcesResponse(
                    preparedAnswer().query(),
                    preparedAnswer().status(),
                    preparedAnswer().fallbackAnswer(),
                    preparedAnswer().sources(),
                    pipeline
            );
        }
    }

    public record RagOrchestrationResult(
            List<String> effectiveDocumentIds,
            PreparedDocumentContext documentContext,
            SearchDtos.AnswerWithSourcesResponse response,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDtos.AssistantDocumentStatusView> contextDocuments
    ) {
    }

    public record RagStreamPlan(
            List<String> effectiveDocumentIds,
            PreparedDocumentContext documentContext,
            SearchService.PreparedAnswer preparedAnswer,
            String contextStatus,
            String contextDiagnosticCode,
            List<AssistantDtos.AssistantDocumentStatusView> contextDocuments,
            boolean diagnosticOnly
    ) {
    }
}

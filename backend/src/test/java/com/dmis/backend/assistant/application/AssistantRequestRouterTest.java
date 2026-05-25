package com.dmis.backend.assistant.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AssistantRequestRouterTest {

    private AssistantRequestRouter router;

    @BeforeEach
    void setUp() {
        router = new AssistantRequestRouter();
    }

    @Test
    void summaryWithLinkedDocumentRoutesToDocumentSummary() {
        var decision = router.route(
                "Сделай summary этого файла",
                List.of(),
                List.of("doc-1")
        );
        assertEquals(RequestType.DOCUMENT_SUMMARY, decision.requestType());
    }

    @Test
    void summaryWithoutDocumentsRoutesToUnknown() {
        var decision = router.route("Сделай summary этого файла", List.of(), List.of());
        assertEquals(RequestType.UNKNOWN, decision.requestType());
        assertEquals(ContextAssemblyService.STATUS_NO_DOCUMENT_SELECTED, decision.diagnosticCode());
    }

    @Test
    void uniquePhraseQuestionRoutesToDocumentQa() {
        var decision = router.route(
                "Какая контрольная фраза указана в документе?",
                List.of("doc-1"),
                List.of()
        );
        assertEquals(RequestType.DOCUMENT_QA, decision.requestType());
    }

    @Test
    void emailWithMentionRoutesToControlledAction() {
        var decision = router.route(
                "Подготовь письмо @manager с этим документом",
                List.of("doc-1"),
                List.of("doc-1")
        );
        assertEquals(RequestType.CONTROLLED_ACTION, decision.requestType());
    }

    @Test
    void multiDocSummaryWithoutSelectionRoutesToUnknown() {
        var decision = router.route(
                "Сделай summary файла",
                List.of(),
                List.of("doc-1", "doc-2")
        );
        assertEquals(RequestType.UNKNOWN, decision.requestType());
    }

    @Test
    void selectedSingleDocSummaryRoutesToDocumentSummary() {
        var decision = router.route(
                "Сделай summary выбранного файла",
                List.of("doc-alpha"),
                List.of("doc-alpha", "doc-beta")
        );
        assertEquals(RequestType.DOCUMENT_SUMMARY, decision.requestType());
    }

    @Test
    void emailWithFullNameRoutesToControlledAction() {
        var decision = router.route(
                "Подготовь письмо Project Manager по этому документу",
                List.of("doc-1"),
                List.of()
        );
        assertEquals(RequestType.CONTROLLED_ACTION, decision.requestType());
    }

    @Test
    void documentSearchRoutesCorrectly() {
        var decision = router.route("Найди документ по договору", List.of(), List.of());
        assertEquals(RequestType.DOCUMENT_SEARCH, decision.requestType());
    }

    @Test
    void generalChatWithoutDocuments() {
        var decision = router.route("Привет, как дела?", List.of(), List.of());
        assertEquals(RequestType.GENERAL_CHAT, decision.requestType());
    }

    @Test
    void forwardToAnalystWithMentionRoutesToControlledAction() {
        var decision = router.route(
                "Перешли @empty.txt аналитику",
                List.of(),
                List.of("doc-empty")
        );
        assertEquals(RequestType.CONTROLLED_ACTION, decision.requestType());
    }

    @Test
    void forwardToAnalystWithSelectedDocumentRoutesToControlledAction() {
        var decision = router.route(
                "перешли это аналитику",
                List.of("doc-1"),
                List.of()
        );
        assertEquals(RequestType.CONTROLLED_ACTION, decision.requestType());
    }

    @Test
    void forwardToAnalystWithoutDocumentsRoutesToDocumentQa() {
        var decision = router.route("Перешли @contract.txt аналитику", List.of(), List.of());
        assertEquals(RequestType.GENERAL_CHAT, decision.requestType());
    }
}

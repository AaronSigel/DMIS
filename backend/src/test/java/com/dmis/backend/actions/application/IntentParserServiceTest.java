package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.port.IntentParserPort;
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

class IntentParserServiceTest {
    private IntentParserPort intentParserPort;
    private UserAccessPort userAccessPort;
    private IntentParserService intentParserService;

    @BeforeEach
    void setUp() {
        intentParserPort = mock(IntentParserPort.class);
        userAccessPort = mock(UserAccessPort.class);
        intentParserService = new IntentParserService(
                intentParserPort,
                new UserMentionResolver(userAccessPort),
                Validation.buildDefaultValidatorFactory().getValidator()
        );
    }

    @Test
    void parseDraftMapsSendEmailIntent() {
        when(intentParserPort.parse("send mail"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "to@example.com", "subject", "Тема", "body", "Текст")
                ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("send mail");

        assertEquals("send_email", parsed.intent());
        assertEquals("to@example.com", ((com.dmis.backend.actions.application.dto.ActionDtos.SendEmailEntities) parsed.entities()).to());
    }

    @Test
    void parseDraftMapsSendEmailWithAttachmentDocumentIds() {
        when(intentParserPort.parse("mail with attachment"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of(
                                "to", "to@example.com",
                                "subject", "Тема",
                                "body", "Текст",
                                "attachmentDocumentIds", List.of("doc-a", "doc-b")
                        )
                ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("mail with attachment");

        var entities = (com.dmis.backend.actions.application.dto.ActionDtos.SendEmailEntities) parsed.entities();
        assertEquals(List.of("doc-a", "doc-b"), entities.attachmentDocumentIds());
    }

    @Test
    void parseDraftMapsCalendarIntent() {
        when(intentParserPort.parse("create meeting"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "create_calendar_event",
                        Map.of(
                                "title", "Standup",
                                "attendees", List.of("a@b.com"),
                                "startIso", "2026-05-10T09:00:00Z",
                                "endIso", "2026-05-10T09:30:00Z"
                        )
                ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("create meeting");

        assertEquals("create_calendar_event", parsed.intent());
    }

    @Test
    void parseDraftResolvesUserMentionInEmailRecipient() {
        when(intentParserPort.parse("send to analyst"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "@analyst", "subject", "Тема", "body", "Текст")
                ));
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-analyst", "analyst@example.com", "Data Analyst")
        ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("send to analyst");

        var entities = (com.dmis.backend.actions.application.dto.ActionDtos.SendEmailEntities) parsed.entities();
        assertEquals("analyst@example.com", entities.to());
    }

    @Test
    void parseDraftResolvesUserMentionsInCalendarAttendees() {
        when(intentParserPort.parse("create meeting with analyst"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "create_calendar_event",
                        Map.of(
                                "title", "Standup",
                                "attendees", List.of("@analyst", "external@example.com"),
                                "startIso", "2026-05-10T09:00:00Z",
                                "endIso", "2026-05-10T09:30:00Z"
                        )
                ));
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-analyst", "analyst@example.com", "Data Analyst")
        ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("create meeting with analyst");

        var entities = (com.dmis.backend.actions.application.dto.ActionDtos.CreateCalendarEventEntities) parsed.entities();
        assertEquals(List.of("analyst@example.com", "external@example.com"), entities.attendees());
    }

    @Test
    void parseDraftRejectsUnknownUserMention() {
        when(intentParserPort.parse("send to unknown"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "@unknown", "subject", "Тема", "body", "Текст")
                ));
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-analyst", "analyst@example.com", "Data Analyst")
        ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("send to unknown"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Unknown user mention: @unknown"));
    }

    @Test
    void parseDraftRejectsAmbiguousUserMention() {
        when(intentParserPort.parse("send to analyst"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "@Data_Analyst", "subject", "Тема", "body", "Текст")
                ));
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u-analyst-1", "analyst1@example.com", "Data Analyst"),
                new UserSummaryView("u-analyst-2", "analyst2@example.com", "Data Analyst")
        ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("send to analyst"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Ambiguous user mention: @Data_Analyst"));
    }

    @Test
    void parseDraftMapsUpdateTagsIntent() {
        when(intentParserPort.parse("tag document"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "update_document_tags",
                        Map.of("documentId", "doc-1", "tags", List.of("urgent"))
                ));

        IntentParserService.ParsedDraft parsed = intentParserService.parseDraft("tag document");

        assertEquals("update_document_tags", parsed.intent());
    }

    @Test
    void parseDraftRejectsUnsupportedIntent() {
        when(intentParserPort.parse("unknown"))
                .thenReturn(new IntentParserPort.ParsedIntent("unknown_intent", Map.of("foo", "bar")));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("unknown"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void parseDraftRejectsInvalidEntities() {
        when(intentParserPort.parse("send mail"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "not-email", "subject", "", "body", "body")
                ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("send mail"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Entity field must not be blank: subject"));
    }

    @Test
    void parseDraftRejectsMissingRequiredField() {
        when(intentParserPort.parse("send mail"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "to@example.com", "subject", "Тема")
                ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("send mail"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Missing entity field: body"));
    }

    @Test
    void parseDraftRejectsEmptyArrayEntities() {
        when(intentParserPort.parse("tag document"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "update_document_tags",
                        Map.of("documentId", "doc-1", "tags", List.of())
                ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("tag document"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Entity field must be non-empty array: tags"));
    }

    @Test
    void parseDraftRejectsInvalidCalendarRange() {
        when(intentParserPort.parse("create meeting"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "create_calendar_event",
                        Map.of(
                                "title", "Standup",
                                "attendees", List.of("a@b.com"),
                                "startIso", "2026-05-10T10:00:00Z",
                                "endIso", "2026-05-10T09:00:00Z"
                        )
                ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> intentParserService.parseDraft("create meeting"));

        assertEquals(BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Invalid entities for intent create_calendar_event"));
    }
}

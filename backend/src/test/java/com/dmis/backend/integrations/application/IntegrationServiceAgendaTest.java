package com.dmis.backend.integrations.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.DocumentUseCases;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.dmis.backend.integrations.application.port.CalendarAttachmentPort;
import com.dmis.backend.integrations.application.port.CalendarEventPort;
import com.dmis.backend.integrations.application.port.CalendarParticipantPort;
import com.dmis.backend.integrations.application.port.MailCalendarPort;
import com.dmis.backend.integrations.application.port.MailDraftPort;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.domain.model.CalendarEvent;
import com.dmis.backend.integrations.domain.model.EventCreationSource;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class IntegrationServiceAgendaTest {

    @Test
    void prepareMeetingAgendaReplacesExistingGeneratedAgenda() {
        CalendarEventPort calendarEventPort = mock(CalendarEventPort.class);
        CalendarAttachmentPort calendarAttachmentPort = mock(CalendarAttachmentPort.class);
        CalendarParticipantPort calendarParticipantPort = mock(CalendarParticipantPort.class);
        DocumentUseCases documentUseCases = mock(DocumentUseCases.class);
        UserAccessPort userAccessPort = mock(UserAccessPort.class);
        LlmChatPort llmChatPort = mock(LlmChatPort.class);
        UserView actor = new UserView("u-owner", "owner@example.com", "Owner", Set.of(RoleName.USER));
        CalendarEvent event = new CalendarEvent(
                "event-1",
                "Planning",
                List.of("owner@example.com"),
                "2026-05-12T08:11:00Z",
                "2026-05-13T09:12:00Z",
                actor.id(),
                Instant.parse("2026-05-01T08:00:00Z"),
                Instant.parse("2026-05-01T08:00:00Z"),
                "asd\n\n--- Повестка ---\n- old item",
                EventCreationSource.UI,
                null
        );

        when(calendarEventPort.findById(event.id())).thenReturn(Optional.of(event));
        when(calendarEventPort.save(any(CalendarEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(calendarAttachmentPort.listByEventIdOrdered(event.id())).thenReturn(List.of());
        when(calendarParticipantPort.listByEventIdOrdered(event.id())).thenReturn(List.of());
        when(documentUseCases.getAccessibleByIds(any(), anyList())).thenReturn(Map.of());
        when(userAccessPort.findAllByIds(anyList())).thenReturn(List.of());
        when(llmChatPort.chat(any())).thenReturn(new LlmChatPort.ChatResponse("- new item", "test", "test"));

        IntegrationService service = new IntegrationService(
                mock(MailCalendarPort.class),
                mock(MailReadPort.class),
                calendarEventPort,
                mock(SttPort.class),
                mock(AuditService.class),
                new AclService(new DocumentAccessPort() {
                    @Override
                    public Optional<DocumentAccessLevel> findLevel(String documentId, String principalId) {
                        return Optional.empty();
                    }

                    @Override
                    public List<String> findAccessibleDocumentIds(String principalId) {
                        return List.of();
                    }
                }),
                mock(MailDraftPort.class),
                documentUseCases,
                calendarParticipantPort,
                calendarAttachmentPort,
                userAccessPort,
                llmChatPort,
                10,
                26_214_400L,
                2048
        );

        service.prepareMeetingAgendaDraft(actor, event.id(), List.of());

        ArgumentCaptor<CalendarEvent> savedCaptor = ArgumentCaptor.forClass(CalendarEvent.class);
        verify(calendarEventPort).save(savedCaptor.capture());
        assertEquals("asd\n\n--- Повестка ---\n- new item", savedCaptor.getValue().description());

        ArgumentCaptor<LlmChatPort.ChatRequest> chatCaptor = ArgumentCaptor.forClass(LlmChatPort.ChatRequest.class);
        verify(llmChatPort).chat(chatCaptor.capture());
        String context = String.join("\n", chatCaptor.getValue().contextChunks());
        assertFalse(context.contains("- old item"));
    }
}

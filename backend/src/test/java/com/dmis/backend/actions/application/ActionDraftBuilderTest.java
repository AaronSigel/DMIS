package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

class ActionDraftBuilderTest {

    private ActionDraftBuilder builder;
    private UserAccessPort userAccessPort;

    @BeforeEach
    void setUp() {
        userAccessPort = Mockito.mock(UserAccessPort.class);
        when(userAccessPort.findAllSummaries()).thenReturn(List.of(
                new UserSummaryView("u1", "volkova-e-v@example.com", "manager", "Project Manager"),
                new UserSummaryView("u2", "petrova-a-s@example.com", "analyst", "Петрова Анна Сергеевна")
        ));
        builder = new ActionDraftBuilder(new UserMentionResolver(userAccessPort));
    }

    @Test
    void buildSendEmailWithMentionAndLinkedDocument() {
        ActionDtos.SendEmailEntities entities = builder.buildSendEmail(
                "Подготовь письмо @manager с этим документом",
                List.of(),
                List.of("doc-123")
        );

        assertEquals("volkova-e-v@example.com", entities.to());
        assertEquals("Документ для ознакомления", entities.subject());
        assertEquals("Коллеги, направляю документ из DMIS.", entities.body());
        assertTrue(entities.attachmentDocumentIds().contains("doc-123"));
    }

    @Test
    void buildSendEmailByFullName() {
        ActionDtos.SendEmailEntities entities = builder.buildSendEmail(
                "Подготовь письмо Project Manager по этому документу",
                List.of("doc-456"),
                List.of()
        );

        assertEquals("volkova-e-v@example.com", entities.to());
        assertTrue(entities.attachmentDocumentIds().contains("doc-456"));
    }

    @Test
    void buildSendEmailWithMentionAndSubjectWithoutAttachments() {
        ActionDtos.SendEmailEntities entities = builder.buildSendEmail(
                "Подготовь письмо @manager с темой E2E test",
                List.of(),
                List.of()
        );

        assertEquals("volkova-e-v@example.com", entities.to());
        assertEquals("E2E test", entities.subject());
        assertEquals("Коллеги, направляю документ из DMIS.", entities.body());
        assertTrue(entities.attachmentDocumentIds().isEmpty());
    }

    @Test
    void buildSendEmailWithHashMentionAndLinkedDocument() {
        ActionDtos.SendEmailEntities entities = builder.buildSendEmail(
                "Подготовь письмо #Петрова А.С. с этим документом",
                List.of(),
                List.of("doc-789")
        );

        assertEquals("petrova-a-s@example.com", entities.to());
        assertTrue(entities.attachmentDocumentIds().contains("doc-789"));
    }

    @Test
    void buildCreateCalendarEventWithoutAttendeesUsesOrganizer() {
        ActionDtos.CreateCalendarEventEntities entities = builder.buildCreateCalendarEvent(
                "Создай новую встречу на 26.05.2028. Тема - \"Проверка DMIS\"",
                "sokolov-d-a@example.com"
        );

        assertEquals("Проверка DMIS", entities.title());
        assertEquals("2028-05-26T10:00:00Z", entities.startIso());
        assertEquals("2028-05-26T11:00:00Z", entities.endIso());
        assertEquals(List.of("sokolov-d-a@example.com"), entities.attendees());
    }

    @Test
    void buildCreateCalendarEventWithMention() {
        ActionDtos.CreateCalendarEventEntities entities = builder.buildCreateCalendarEvent(
                "Создай встречу с @manager на 27.05.2028 в 15:00 на 30 минут",
                "sokolov-d-a@example.com"
        );

        assertEquals(List.of("volkova-e-v@example.com"), entities.attendees());
        assertEquals("2028-05-27T15:00:00Z", entities.startIso());
        assertEquals("2028-05-27T15:30:00Z", entities.endIso());
    }

    @Test
    void tryBuildCreateCalendarEventWithoutDateNeedsClarification() {
        ActionDraftBuildResult result = builder.tryBuildCreateCalendarEvent(
                "Создай встречу по согласованию договора",
                "sokolov-d-a@example.com"
        );

        assertTrue(result.needsClarification());
        assertEquals(ActionDtos.CREATE_CALENDAR_EVENT_INTENT, result.intent());
        assertTrue(result.missingFields().contains("startAt"));
        assertEquals("согласованию договора", result.partialEntities().get("title"));
    }
}

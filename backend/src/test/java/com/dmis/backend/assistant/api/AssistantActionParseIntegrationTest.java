package com.dmis.backend.assistant.api;

import com.dmis.backend.actions.application.port.IntentParserPort;
import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssistantActionParseIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IntentParserPort intentParserPort;
    @MockBean
    private SttPort sttPort;
    @MockBean
    private ObjectStoragePort objectStoragePort;
    @MockBean
    private EmbeddingsPort embeddingsPort;

    @Test
    void parseActionCreatesDraftAction() throws Exception {
        when(intentParserPort.parse("Отправь письмо директору"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "director@example.com", "subject", "Отчет", "body", "Отчет готов")
                ));
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/assistant/actions/parse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Отправь письмо директору\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.intent").value("send_email"))
                .andExpect(jsonPath("$.entities.type").value("send_email"))
                .andExpect(jsonPath("$.entities.to").value("director@example.com"));
    }

    @Test
    void parseActionResolvesUserMentionToEmail() throws Exception {
        when(intentParserPort.parse("Отправь письмо @analyst"))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "send_email",
                        Map.of("to", "@analyst", "subject", "Отчет", "body", "Отчет готов")
                ));
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/assistant/actions/parse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Отправь письмо @analyst\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.intent").value("send_email"))
                .andExpect(jsonPath("$.entities.type").value("send_email"))
                .andExpect(jsonPath("$.entities.to").value("analyst@example.com"));
    }

    @Test
    void parseActionRejectsBlankText() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/assistant/actions/parse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"));
    }

    @Test
    void parseActionRejectsUnsupportedIntentFromParser() throws Exception {
        when(intentParserPort.parse(anyString()))
                .thenReturn(new IntentParserPort.ParsedIntent("unsupported_intent", Map.of("x", "y")));
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/assistant/actions/parse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Сделай что-то\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Unsupported intent")));
    }

    @Test
    void parseActionRejectsInvalidEntitiesFromParser() throws Exception {
        when(intentParserPort.parse(anyString()))
                .thenReturn(new IntentParserPort.ParsedIntent(
                        "create_calendar_event",
                        Map.of(
                                "title", "Standup",
                                "attendees", java.util.List.of("a@b.com"),
                                "startIso", "2026-05-10T11:00:00Z",
                                "endIso", "2026-05-10T10:00:00Z"
                        )
                ));
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/assistant/actions/parse")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"Создай встречу\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid entities for intent create_calendar_event")));
    }

    private String loginAndGetToken() throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = objectMapper.readTree(json);
        return node.get("token").asText();
    }
}

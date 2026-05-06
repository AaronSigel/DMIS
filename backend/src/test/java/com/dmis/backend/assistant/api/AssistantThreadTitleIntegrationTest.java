package com.dmis.backend.assistant.api;

import com.dmis.backend.assistant.application.dto.AssistantDtos;
import com.dmis.backend.assistant.application.port.AssistantPort;
import com.dmis.backend.assistant.application.port.ThreadTitleGeneratorPort;
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

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssistantThreadTitleIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private AssistantPort assistantPort;

    @MockBean
    private ThreadTitleGeneratorPort threadTitleGeneratorPort;

    @Test
    void generateTitleRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/assistant/threads/thread-1/title"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void generateTitleUpdatesThreadForOwner() throws Exception {
        when(threadTitleGeneratorPort.generateTitle(anyString(), anyString(), anyString())).thenReturn("Новая тема");
        String token = loginAndGetToken("admin@dmis.local");

        String threadJson = mockMvc.perform(post("/api/assistant/threads")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Новый диалог\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String threadId = objectMapper.readTree(threadJson).get("id").asText();

        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                threadId,
                "USER",
                "Подготовь краткий отчёт по документу",
                List.of(),
                Instant.now()
        ));
        assistantPort.saveMessage(new AssistantDtos.MessageView(
                "msg-" + UUID.randomUUID(),
                threadId,
                "ASSISTANT",
                "Отчёт готов, ключевые пункты выделены.",
                List.of(),
                Instant.now()
        ));

        mockMvc.perform(post("/api/assistant/threads/{threadId}/title", threadId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(threadId))
                .andExpect(jsonPath("$.title").value("Новая тема"));
    }

    @Test
    void generateTitleReturnsNotFoundForNonOwner() throws Exception {
        when(threadTitleGeneratorPort.generateTitle(anyString(), anyString(), anyString())).thenReturn("Новая тема");
        String adminToken = loginAndGetToken("admin@dmis.local");
        String analystToken = loginAndGetToken("analyst@dmis.local");

        String threadJson = mockMvc.perform(post("/api/assistant/threads")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Админский тред\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String threadId = objectMapper.readTree(threadJson).get("id").asText();

        mockMvc.perform(post("/api/assistant/threads/{threadId}/title", threadId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + analystToken))
                .andExpect(status().isNotFound());
    }

    private String loginAndGetToken(String email) throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode node = objectMapper.readTree(json);
        return node.get("token").asText();
    }
}

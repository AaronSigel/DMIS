package com.dmis.backend.assistant.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AssistantSeedConversationIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void seedConversationRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/assistant/threads/thread-1/seed-conversation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userContent\":\"q\",\"assistantContent\":\"a\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void seedConversationSavesUserAndAssistantMessages() throws Exception {
        String token = loginAndGetToken("sokolov-d-a@example.com");

        String threadJson = mockMvc.perform(post("/api/assistant/threads")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Seed test thread\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String threadId = objectMapper.readTree(threadJson).get("id").asText();

        mockMvc.perform(post("/api/assistant/threads/{threadId}/seed-conversation", threadId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "userContent": "Тестовый вопрос seed",
                                  "assistantContent": "Тестовый ответ seed",
                                  "documentIds": []
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages.length()").value(2))
                .andExpect(jsonPath("$.messages[0].role").value("USER"))
                .andExpect(jsonPath("$.messages[0].content").value("Тестовый вопрос seed"))
                .andExpect(jsonPath("$.messages[1].role").value("ASSISTANT"))
                .andExpect(jsonPath("$.messages[1].content").value("Тестовый ответ seed"));
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

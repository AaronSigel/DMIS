package com.dmis.backend.search.api;

import com.dmis.backend.search.application.port.ChunkRerankPort;
import com.dmis.backend.search.application.port.ChunkSearchPort;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SearchControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChunkSearchPort chunkSearchPort;
    @MockBean
    private ChunkRerankPort chunkRerankPort;
    @MockBean
    private LlmChatPort llmChatPort;

    @Test
    void ragStreamDoneEventContainsAnswerAndSources() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), eq("policy"), eq(10))).thenReturn(List.of(
                new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9),
                new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "c-2", "beta context", 0.8)
        ));
        when(chunkRerankPort.rerank(eq("policy"), anyList())).thenReturn(List.of(
                new ChunkRerankPort.RerankScore("c-2", 0.95),
                new ChunkRerankPort.RerankScore("c-1", 0.1)
        ));
        when(llmChatPort.chatStream(any())).thenReturn(new ByteArrayInputStream((
                "data: {\"delta\":\"Ответ \"}\n\n" +
                        "data: {\"delta\":\"готов\"}\n\n" +
                        "data: {\"done\":true,\"provider\":\"fake\",\"model\":\"test-model\"}\n\n"
        ).getBytes(StandardCharsets.UTF_8)));

        String token = loginAndGetToken();

        MvcResult asyncResult = mockMvc.perform(post("/api/rag/answer/stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"policy\"}"))
                .andExpect(request().asyncStarted())
                .andReturn();
        asyncResult.getAsyncResult(5_000);
        assertEquals(200, asyncResult.getResponse().getStatus());
        String body = asyncResult.getResponse().getContentAsString(StandardCharsets.UTF_8);

        assertTrue(body.contains("\"done\":true"));
        assertTrue(body.contains("\"answer\":\"Ответ готов\""));
        assertTrue(body.contains("\"sources\":[{\"documentId\":\"doc-2\""));
        assertTrue(body.contains("\"chunkId\":\"c-2\""));
    }

    @Test
    void ragStreamEmptyResultDoneEventContainsEmptySources() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), eq("missing"), eq(10))).thenReturn(List.of());

        String token = loginAndGetToken();

        MvcResult asyncResult = mockMvc.perform(post("/api/rag/answer/stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"missing\"}"))
                .andExpect(request().asyncStarted())
                .andReturn();
        asyncResult.getAsyncResult(5_000);
        assertEquals(200, asyncResult.getResponse().getStatus());

        String body = asyncResult.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertTrue(body.contains("\"delta\":\"Не найдено релевантных документов по запросу.\""));
        assertTrue(body.contains("\"done\":true"));
        assertTrue(body.contains("\"sources\":[]"));
    }

    private String loginAndGetToken() throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@dmis.local\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }
}

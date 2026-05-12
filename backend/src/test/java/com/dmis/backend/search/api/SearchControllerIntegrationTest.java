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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.ArgumentMatchers.anyString;
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
        when(chunkSearchPort.search(anyString(), anyBoolean(), anyString(), anyInt(), nullable(List.class))).thenReturn(List.of(
                new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9),
                new ChunkSearchPort.ChunkHit("doc-2", "Doc 2", "c-2", "beta context", 0.8)
        ));
        when(chunkRerankPort.rerank(anyString(), anyList())).thenReturn(List.of(
                new ChunkRerankPort.RerankScore("c-2", 0.95),
                new ChunkRerankPort.RerankScore("c-1", 0.1)
        ));
        when(llmChatPort.chatStream(any())).thenReturn(new ByteArrayInputStream((
                "data: {\"delta\":\"Ответ \"}\n\n" +
                        "data: {\"delta\":\"готов\"}\n\n" +
                        "data: {\"done\":true,\"provider\":\"fake\",\"model\":\"test-model\"}\n\n"
        ).getBytes(StandardCharsets.UTF_8)));

        String token = loginAndGetToken();

        MvcResult asyncResult = mockMvc.perform(post("/api/rag/answer-with-sources/stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"policy\"}"))
                .andExpect(request().asyncStarted())
                .andReturn();
        asyncResult.getAsyncResult(5_000);
        assertEquals(200, asyncResult.getResponse().getStatus());
        String body = asyncResult.getResponse().getContentAsString(StandardCharsets.UTF_8);

        assertTrue(body.contains("\"done\":true"));
        assertTrue(body.contains("\"status\":\"OK\""));
        assertTrue(body.contains("\"answer\":\"Ответ готов\""));
        assertTrue(body.contains("\"sources\":[{\"documentId\":\"doc-2\""));
        assertTrue(body.contains("\"chunkId\":\"c-2\""));
    }

    @Test
    void ragStreamEmptyResultDoneEventContainsEmptySources() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), anyString(), anyInt(), nullable(List.class))).thenReturn(List.of());

        String token = loginAndGetToken();

        MvcResult asyncResult = mockMvc.perform(post("/api/rag/answer-with-sources/stream")
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
        assertTrue(body.contains("\"status\":\"NO_CONTEXT\""));
        assertTrue(body.contains("\"sources\":[]"));
    }

    @Test
    void searchOnlyEndpointReturnsStableContract() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), anyString(), anyInt(), nullable(List.class))).thenReturn(List.of(
                new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9)
        ));
        when(chunkRerankPort.rerank(anyString(), anyList())).thenReturn(List.of(
                new ChunkRerankPort.RerankScore("c-1", 0.91)
        ));

        String token = loginAndGetToken();
        String response = mockMvc.perform(post("/api/search")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"policy\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);

        assertTrue(response.contains("\"status\":\"OK\""));
        assertTrue(response.contains("\"hits\":[{\"documentId\":\"doc-1\""));
        assertTrue(response.contains("\"pipeline\":"));
        assertTrue(response.contains("\"retrievalTopK\":10"));
    }

    @Test
    void answerWithSourcesEndpointReturnsStableContract() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), anyString(), anyInt(), nullable(List.class))).thenReturn(List.of(
                new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9)
        ));
        when(chunkRerankPort.rerank(anyString(), anyList())).thenReturn(List.of(
                new ChunkRerankPort.RerankScore("c-1", 0.91)
        ));
        when(llmChatPort.chat(any())).thenReturn(new LlmChatPort.ChatResponse("Ответ [1]", "fake", "test-model"));

        String token = loginAndGetToken();
        String response = mockMvc.perform(post("/api/rag/answer-with-sources")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"policy\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);

        assertTrue(response.contains("\"status\":\"OK\""));
        assertTrue(response.contains("\"answer\":\"Ответ [1]\""));
        assertTrue(response.contains("\"sources\":[{\"documentId\":\"doc-1\""));
        assertTrue(response.contains("\"pipeline\":"));
    }

    @Test
    void ragAnswerAliasMatchesAnswerWithSources() throws Exception {
        when(chunkSearchPort.search(anyString(), anyBoolean(), anyString(), anyInt(), nullable(List.class))).thenReturn(List.of(
                new ChunkSearchPort.ChunkHit("doc-1", "Doc 1", "c-1", "alpha context", 0.9)
        ));
        when(chunkRerankPort.rerank(anyString(), anyList())).thenReturn(List.of(
                new ChunkRerankPort.RerankScore("c-1", 0.91)
        ));
        when(llmChatPort.chat(any())).thenReturn(new LlmChatPort.ChatResponse("Ответ [1]", "fake", "test-model"));

        String token = loginAndGetToken();
        String response = mockMvc.perform(post("/api/rag/answer")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"policy\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);

        assertTrue(response.contains("\"answer\":\"Ответ [1]\""));
        assertTrue(response.contains("\"sources\":[{\"documentId\":\"doc-1\""));
    }

    private String loginAndGetToken() throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }
}

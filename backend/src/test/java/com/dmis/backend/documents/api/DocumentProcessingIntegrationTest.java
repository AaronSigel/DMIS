package com.dmis.backend.documents.api;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DocumentProcessingIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private ObjectStoragePort objectStoragePort;
    @MockBean
    private EmbeddingsPort embeddingsPort;

    @Test
    void uploadIndexesChunksIntoPgvectorTable() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            List<String> texts = (List<String>) invocation.getArgument(0);
            List<float[]> out = new ArrayList<>(texts.size());
            for (int i = 0; i < texts.size(); i++) {
                out.add(dummyEmbedding1024());
            }
            return out;
        });

        String token = loginAndGetToken();

        String body = "hello ".repeat(600);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                body.getBytes(StandardCharsets.UTF_8)
        );

        String json = mockMvc.perform(multipart("/api/documents")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode tree = objectMapper.readTree(json);
        String documentId = tree.get("id").asText();

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ? AND version_id = ?",
                Integer.class,
                documentId,
                "v1"
        );
        assertTrue(count != null && count > 0, "expected chunks to be created");
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

    private static float[] dummyEmbedding1024() {
        float[] v = new float[1024];
        v[0] = 1.0f;
        return v;
    }
}


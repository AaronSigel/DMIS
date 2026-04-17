package com.dmis.backend.documents.api;

import com.dmis.backend.documents.application.port.DocumentChunkPort;
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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpHeaders.CONTENT_DISPOSITION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
    @Autowired
    private DocumentChunkPort documentChunkPort;

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

        Integer metadataCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks " +
                        "WHERE document_id = ? AND version_id = ? " +
                        "AND embedding_model = ? AND embedding_dim = 1024 AND embedding_normalized = TRUE",
                Integer.class,
                documentId,
                "v1",
                "/models/bge-m3"
        );
        assertEquals(count, metadataCount, "expected all chunks to contain embedding metadata");
    }

    @Test
    void documentCardAndVersionsFlowWorks() throws Exception {
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

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "policy-v1.txt", "v1 text");

        mockMvc.perform(get("/api/documents")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(documentId));

        mockMvc.perform(get("/api/documents/{documentId}", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(documentId))
                .andExpect(jsonPath("$.versions[0].versionId").value("v1"));

        MockMultipartFile nextVersion = new MockMultipartFile(
                "file",
                "policy-v2.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "v2 text".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/documents/{documentId}/versions", documentId)
                        .file(nextVersion)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versions.length()").value(2))
                .andExpect(jsonPath("$.versions[1].versionId").value("v2"));

        Integer v1ChunkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ? AND version_id = ?",
                Integer.class,
                documentId,
                "v1"
        );
        Integer v2ChunkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ? AND version_id = ?",
                Integer.class,
                documentId,
                "v2"
        );
        assertTrue(v1ChunkCount != null && v1ChunkCount > 0, "expected v1 chunks to remain");
        assertTrue(v2ChunkCount != null && v2ChunkCount > 0, "expected v2 chunks to be created");
    }

    @Test
    void replaceChunksRewritesRowsForSameDocumentVersion() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "replace-source.txt", "initial");
        String versionId = "v1";
        Instant now = Instant.now();

        documentChunkPort.replaceChunks(
                documentId,
                versionId,
                now,
                List.of(
                        new DocumentChunkPort.DocumentChunk("doc-replace-v1-0", 0, "first", dummyEmbedding1024(), "/models/bge-m3", 1024, true),
                        new DocumentChunkPort.DocumentChunk("doc-replace-v1-1", 1, "second", dummyEmbedding1024(), "/models/bge-m3", 1024, true)
                )
        );
        documentChunkPort.replaceChunks(
                documentId,
                versionId,
                now,
                List.of(
                        new DocumentChunkPort.DocumentChunk("doc-replace-v1-0", 0, "rewritten", dummyEmbedding1024(), "/models/bge-m3", 1024, true)
                )
        );

        Integer chunkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ? AND version_id = ?",
                Integer.class,
                documentId,
                versionId
        );
        String onlyChunkText = jdbcTemplate.queryForObject(
                "SELECT chunk_text FROM document_chunks WHERE document_id = ? AND version_id = ?",
                String.class,
                documentId,
                versionId
        );
        assertEquals(1, chunkCount, "expected stale version chunks to be replaced");
        assertEquals("rewritten", onlyChunkText);
    }

    @Test
    void addVersionDeniedWhenActorHasNoWriteAccess() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String adminToken = loginAndGetToken("admin@dmis.local");
        String analystToken = loginAndGetToken("analyst@dmis.local");
        String documentId = upload(adminToken, "admin-doc.txt", "admin text");

        MockMultipartFile nextVersion = new MockMultipartFile(
                "file",
                "denied.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "analyst edit".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/documents/{documentId}/versions", documentId)
                        .file(nextVersion)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + analystToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void searchReturnsHitsFromAllVersions() throws Exception {
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

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "v1.txt", "alpha policy text");

        MockMultipartFile nextVersion = new MockMultipartFile(
                "file",
                "v2.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "beta policy text".getBytes(StandardCharsets.UTF_8)
        );
        mockMvc.perform(multipart("/api/documents/{documentId}/versions", documentId)
                        .file(nextVersion)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        String searchJson = mockMvc.perform(post("/api/search")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"alpha beta\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode hits = objectMapper.readTree(searchJson).get("hits");
        boolean hasV1 = false;
        boolean hasV2 = false;
        for (JsonNode hit : hits) {
            String chunkId = hit.get("chunkId").asText();
            hasV1 = hasV1 || chunkId.startsWith(documentId + "-v1-");
            hasV2 = hasV2 || chunkId.startsWith(documentId + "-v2-");
        }
        assertTrue(hasV1, "expected at least one hit from v1");
        assertTrue(hasV2, "expected at least one hit from v2");
    }

    @Test
    void getDocumentReturnsNotFoundForUnknownId() throws Exception {
        String token = loginAndGetToken("admin@dmis.local");
        mockMvc.perform(get("/api/documents/{documentId}", "doc-missing")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"));
    }

    @Test
    void downloadAndDeleteDocumentFlowWorks() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(objectStoragePort.load("minio://test-bucket/path")).thenReturn("v1 text".getBytes(StandardCharsets.UTF_8));
        doNothing().when(objectStoragePort).delete(anyString());
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "downloadable.txt", "v1 text");

        mockMvc.perform(get("/api/documents/{documentId}/binary", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string(CONTENT_DISPOSITION, "attachment; filename=\"downloadable.txt\""))
                .andExpect(content().bytes("v1 text".getBytes(StandardCharsets.UTF_8)));

        mockMvc.perform(delete("/api/documents/{documentId}", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/documents/{documentId}", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void listSupportsStatusTypeAndSort() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        upload(token, "zzz-policy.txt", "b text");
        upload(token, "aaa-policy.txt", "a text");

        String json = mockMvc.perform(get("/api/documents")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .param("status", "INDEXED")
                        .param("type", "text/plain")
                        .param("sortBy", "name")
                        .param("order", "asc"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode list = objectMapper.readTree(json);
        int aaaIndex = -1;
        int zzzIndex = -1;
        for (int i = 0; i < list.size(); i++) {
            JsonNode row = list.get(i);
            assertEquals("INDEXED", row.get("status").asText());
            assertEquals("text/plain", row.get("type").asText());
            if ("aaa-policy.txt".equals(row.get("title").asText())) {
                aaaIndex = i;
            }
            if ("zzz-policy.txt".equals(row.get("title").asText())) {
                zzzIndex = i;
            }
        }
        assertTrue(aaaIndex >= 0 && zzzIndex >= 0, "expected seeded docs in list response");
        assertTrue(aaaIndex < zzzIndex, "expected ascending sort by name");
    }

    @Test
    void uploadReturnsStructuredErrorWhenIndexingFails() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenThrow(new IllegalStateException("Embeddings service unavailable"));

        String token = loginAndGetToken("admin@dmis.local");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "broken.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "text".getBytes(StandardCharsets.UTF_8)
        );
        mockMvc.perform(multipart("/api/documents")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("EMBEDDING_FAILED"))
                .andExpect(jsonPath("$.message").value("Failed to index document version"));
    }

    @Test
    void uploadRejectsUnsupportedFileType() throws Exception {
        String token = loginAndGetToken("admin@dmis.local");
        MockMultipartFile badFile = new MockMultipartFile(
                "file",
                "script.sh",
                "application/x-sh",
                "echo hi".getBytes(StandardCharsets.UTF_8)
        );
        mockMvc.perform(multipart("/api/documents")
                        .file(badFile)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("UNSUPPORTED_FILE_TYPE"));
    }

    @Test
    void uploadRejectsTooLargeFile() throws Exception {
        String token = loginAndGetToken("admin@dmis.local");
        byte[] hugeContent = new byte[20 * 1024 * 1024 + 1];
        MockMultipartFile hugeFile = new MockMultipartFile(
                "file",
                "huge.txt",
                MediaType.TEXT_PLAIN_VALUE,
                hugeContent
        );
        mockMvc.perform(multipart("/api/documents")
                        .file(hugeFile)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.errorCode").value("FILE_TOO_LARGE"));
    }

    @Test
    void uploadRejectsEmptyFile() throws Exception {
        String token = loginAndGetToken("admin@dmis.local");
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.txt",
                MediaType.TEXT_PLAIN_VALUE,
                new byte[0]
        );
        mockMvc.perform(multipart("/api/documents")
                        .file(emptyFile)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("FILE_REQUIRED"));
    }

    private String upload(String token, String fileName, String text) throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                fileName,
                MediaType.TEXT_PLAIN_VALUE,
                text.getBytes(StandardCharsets.UTF_8)
        );
        String json = mockMvc.perform(multipart("/api/documents")
                        .file(file)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("id").asText();
    }

    private String loginAndGetToken(String email) throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }

    private String loginAndGetToken() throws Exception {
        return loginAndGetToken("admin@dmis.local");
    }

    private static float[] dummyEmbedding1024() {
        float[] v = new float[1024];
        v[0] = 1.0f;
        return v;
    }
}


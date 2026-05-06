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
import static org.hamcrest.Matchers.containsString;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ?",
                Integer.class,
                documentId
        );
        assertTrue(count != null && count > 0, "expected chunks to be created");

        Integer metadataCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks " +
                        "WHERE document_id = ? " +
                        "AND embedding_model = ? AND embedding_dim = 1024 AND embedding_normalized = TRUE",
                Integer.class,
                documentId,
                "/models/bge-m3"
        );
        assertEquals(count, metadataCount, "expected all chunks to contain embedding metadata");
    }

    @Test
    void documentCardFlowWorks() throws Exception {
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
                .andExpect(jsonPath("$.content[0].id").value(documentId));

        mockMvc.perform(get("/api/documents/{documentId}", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(documentId))
                .andExpect(jsonPath("$.fileName").value("policy-v1.txt"));
    }

    @Test
    void replaceChunksRewritesRowsForSameDocument() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "replace-source.txt", "initial");
        Instant now = Instant.now();

        documentChunkPort.replaceChunks(
                documentId,
                now,
                List.of(
                        new DocumentChunkPort.DocumentChunk("doc-replace-0", 0, "first", dummyEmbedding1024(), "/models/bge-m3", 1024, true),
                        new DocumentChunkPort.DocumentChunk("doc-replace-1", 1, "second", dummyEmbedding1024(), "/models/bge-m3", 1024, true)
                )
        );
        documentChunkPort.replaceChunks(
                documentId,
                now,
                List.of(
                        new DocumentChunkPort.DocumentChunk("doc-replace-0", 0, "rewritten", dummyEmbedding1024(), "/models/bge-m3", 1024, true)
                )
        );

        Integer chunkCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM document_chunks WHERE document_id = ?",
                Integer.class,
                documentId
        );
        String onlyChunkText = jdbcTemplate.queryForObject(
                "SELECT chunk_text FROM document_chunks WHERE document_id = ?",
                String.class,
                documentId
        );
        assertEquals(1, chunkCount, "expected stale chunks to be replaced");
        assertEquals("rewritten", onlyChunkText);
    }

    @Test
    void patchDeniedWhenActorHasNoWriteAccess() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String adminToken = loginAndGetToken("admin@dmis.local");
        String analystToken = loginAndGetToken("analyst@dmis.local");
        String documentId = upload(adminToken, "admin-doc.txt", "admin text");

        mockMvc.perform(patch("/api/documents/{documentId}", documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tags\":[\"denied\"]}")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + analystToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void searchReturnsHitsFromDocumentChunks() throws Exception {
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
        String documentId = upload(token, "policy.txt", "alpha beta policy text");

        String searchJson = mockMvc.perform(post("/api/search")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"alpha beta\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode hits = objectMapper.readTree(searchJson).get("hits");
        boolean hasCurrent = false;
        for (JsonNode hit : hits) {
            String chunkId = hit.get("chunkId").asText();
            hasCurrent = hasCurrent || chunkId.startsWith(documentId + "-");
        }
        assertTrue(hasCurrent, "expected at least one hit from current document");
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

        JsonNode list = objectMapper.readTree(json).get("content");
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
                .andExpect(jsonPath("$.message").value("Failed to index document"));
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
    void listIsPaged() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        upload(token, "page-a.txt", "a");
        upload(token, "page-b.txt", "b");

        mockMvc.perform(get("/api/documents")
                        .param("page", "0")
                        .param("size", "1")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1));

        mockMvc.perform(get("/api/documents")
                        .param("page", "1")
                        .param("size", "1")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void extractedTextEndpointReturnsPlainBody() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "plain.txt", "hello extracted");

        String body = mockMvc.perform(get("/api/documents/{documentId}/extracted-text", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertTrue(body.contains("hello"), "expected extracted text to contain uploaded content");
    }

    @Test
    void binaryInlineUsesContentDispositionInline() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(objectStoragePort.load("minio://test-bucket/path")).thenReturn("v1 text".getBytes(StandardCharsets.UTF_8));
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "inline.txt", "v1 text");

        mockMvc.perform(get("/api/documents/{documentId}/binary", documentId)
                        .param("disposition", "inline")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string(CONTENT_DISPOSITION, containsString("inline")));
    }

    @Test
    void patchTagsAndFilterByTag() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String taggedId = upload(token, "tagged.txt", "x");
        upload(token, "other.txt", "y");

        mockMvc.perform(patch("/api/documents/{documentId}", taggedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tags\":[\"alpha\",\"beta\"]}")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags[0]").value("alpha"));

        mockMvc.perform(get("/api/documents")
                        .param("tag", "alpha")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(taggedId));
    }

    @Test
    void patchRenameTitleAndFileNameUpdatesViewAndDownloadHeader() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(objectStoragePort.load("minio://test-bucket/path")).thenReturn("v1 text".getBytes(StandardCharsets.UTF_8));
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "original-name.txt", "v1 text");

        mockMvc.perform(patch("/api/documents/{documentId}", documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Новое имя\",\"fileName\":\"renamed-on-disk.txt\"}")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Новое имя"))
                .andExpect(jsonPath("$.fileName").value("renamed-on-disk.txt"));

        mockMvc.perform(get("/api/documents/{documentId}/binary", documentId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(header().string(CONTENT_DISPOSITION, "attachment; filename=\"renamed-on-disk.txt\""));
    }

    @Test
    void patchRejectsNoOpBody() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "noop-patch.txt", "x");

        mockMvc.perform(patch("/api/documents/{documentId}", documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("NO_CHANGES"));
    }

    @Test
    void patchRejectsFileNameWithMismatchedExtension() throws Exception {
        when(objectStoragePort.store(anyString(), any(), any())).thenReturn("minio://test-bucket/path");
        when(embeddingsPort.embed(anyList())).thenReturn(List.of(dummyEmbedding1024()));

        String token = loginAndGetToken("admin@dmis.local");
        String documentId = upload(token, "ext-test.txt", "body");

        mockMvc.perform(patch("/api/documents/{documentId}", documentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fileName\":\"wrong.pdf\"}")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errorCode").value("FILENAME_EXTENSION_MISMATCH"));
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


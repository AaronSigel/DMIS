package com.dmis.backend.integrations.api;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.domain.model.MailFolder;
import com.dmis.backend.search.application.port.LlmChatPort;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MailApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SttPort sttPort;
    @MockBean
    private ObjectStoragePort objectStoragePort;
    @MockBean
    private EmbeddingsPort embeddingsPort;

    @MockBean
    private MailReadPort mailReadPort;
    @MockBean
    private LlmChatPort llmChatPort;

    @Test
    void listMessages_badFolder_returns400() throws Exception {
        String token = loginAndGetToken();
        mockMvc.perform(get("/api/mail/messages")
                        .param("folder", "NOT_A_FOLDER")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createDraft_and_listDrafts() throws Exception {
        String token = loginAndGetToken();
        String subject = "Hello-" + UUID.randomUUID();

        mockMvc.perform(post("/api/mail/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content(String.format(
                                "{\"to\":\"recipient@example.com\",\"subject\":\"%s\",\"body\":\"World\"}",
                                subject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subject").value(subject));

        mockMvc.perform(get("/api/mail/drafts")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].subject", hasItem(subject)));
    }

    @Test
    void sendDraft_returnsServiceUnavailableWhenSmtpNotConfigured() throws Exception {
        String token = loginAndGetToken();
        String subject = "SendMe-" + UUID.randomUUID();

        String createJson = mockMvc.perform(post("/api/mail/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content(String.format(
                                "{\"to\":\"recipient@example.com\",\"subject\":\"%s\",\"body\":\"Body\"}",
                                subject)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String draftId = objectMapper.readTree(createJson).get("id").asText();

        // SMTP is not configured in the test context, so sending should return 503 SERVICE_UNAVAILABLE.
        mockMvc.perform(post("/api/mail/drafts/" + draftId + "/send")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void summarizeDraft_usesSavedDraftBody() throws Exception {
        when(llmChatPort.chat(any())).thenReturn(new LlmChatPort.ChatResponse(
                "Черновик просит отправить статус менеджеру.",
                "fake",
                "test-model"
        ));
        String token = loginAndGetToken();
        String subject = "DraftSummary-" + UUID.randomUUID();

        String createJson = mockMvc.perform(post("/api/mail/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content(String.format(
                                "{\"to\":\"manager@example.com\",\"subject\":\"%s\",\"body\":\"Нужно отправить статус менеджеру.\"}",
                                subject)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String draftId = objectMapper.readTree(createJson).get("id").asText();

        mockMvc.perform(post("/api/mail/threads/" + draftId + "/summary")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("{\"messageIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Черновик просит отправить статус менеджеру."))
                .andExpect(jsonPath("$.provider").value("fake"))
                .andExpect(jsonPath("$.model").value("test-model"));
        verify(llmChatPort).chat(argThat(request ->
                request.question().contains(subject)
                        && request.question().contains("Нужно отправить статус менеджеру.")
        ));
    }

    @Test
    void createDraft_invalidRecipient_returns400() throws Exception {
        String token = loginAndGetToken();
        mockMvc.perform(post("/api/mail/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("{\"to\":\"not-an-email\",\"subject\":\"s\",\"body\":\"b\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listInbox_delegatesToMailReadPort() throws Exception {
        when(mailReadPort.listMailMessages(anyString(), any(MailFolder.class)))
                .thenReturn(List.of(new IntegrationDtos.MailMessageSummaryView(
                        "m1",
                        "a@b.com",
                        "c@d.com",
                        "Sub",
                        "prev",
                        "2026-01-01T00:00:00Z",
                        false,
                        false
                )));

        String token = loginAndGetToken();
        mockMvc.perform(get("/api/mail/messages")
                        .param("folder", "INBOX")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m1"));
    }

    private String loginAndGetToken() throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sokolov-d-a@example.com\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }
}

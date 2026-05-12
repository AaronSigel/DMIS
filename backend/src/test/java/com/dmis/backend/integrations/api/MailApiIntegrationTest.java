package com.dmis.backend.integrations.api;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.application.dto.IntegrationDtos;
import com.dmis.backend.integrations.application.port.MailReadPort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.domain.model.MailFolder;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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
                        .content("{\"email\":\"admin@example.com\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(json).get("token").asText();
    }
}

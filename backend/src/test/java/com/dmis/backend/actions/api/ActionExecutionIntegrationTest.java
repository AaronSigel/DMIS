package com.dmis.backend.actions.api;

import com.dmis.backend.integrations.application.port.SttPort;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.documents.application.port.EmbeddingsPort;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ActionExecutionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private SttPort sttPort;
    @MockBean
    private ObjectStoragePort objectStoragePort;
    @MockBean
    private EmbeddingsPort embeddingsPort;

    @Test
    void sendEmailIntentCreatesMailDraftOnExecute() throws Exception {
        String token = loginAndGetToken();

        String draftJson = mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"send_email","entities":{"type":"send_email","to":"recipient@example.com","subject":"Test","body":"Hello"}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();

        String actionId = objectMapper.readTree(draftJson).get("id").asText();

        mockMvc.perform(post("/api/actions/{id}/confirm", actionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        mockMvc.perform(post("/api/actions/{id}/execute", actionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXECUTED"));

        int mailDrafts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM mail_drafts WHERE recipient = ?",
                Integer.class, "recipient@example.com");
        assertEquals(1, mailDrafts);
    }

    @Test
    void createCalendarEventIntentCreatesCalendarDraftOnExecute() throws Exception {
        String token = loginAndGetToken();

        String draftJson = mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"create_calendar_event","entities":{"type":"create_calendar_event","title":"Standup","attendees":["a@b.com","c@d.com"],"startIso":"2026-05-10T09:00:00Z","endIso":"2026-05-10T09:30:00Z"}}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String actionId = objectMapper.readTree(draftJson).get("id").asText();

        mockMvc.perform(post("/api/actions/{id}/confirm", actionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/actions/{id}/execute", actionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXECUTED"));

        int calDrafts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM calendar_drafts WHERE title = ?",
                Integer.class, "Standup");
        assertEquals(1, calDrafts);
    }

    @Test
    void executeReturnsBadRequestWhenActionIsNotConfirmed() throws Exception {
        String token = loginAndGetToken();

        String draftJson = mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"send_email","entities":{"type":"send_email","to":"recipient@example.com","subject":"Test","body":"Hello"}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();

        String actionId = objectMapper.readTree(draftJson).get("id").asText();

        mockMvc.perform(post("/api/actions/{id}/execute", actionId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"))
                .andExpect(jsonPath("$.message").value("Action must be confirmed before execution"));
    }

    @Test
    void draftRejectsUnsupportedIntent() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"unknown_intent","entities":{"type":"send_email","to":"recipient@example.com","subject":"Test","body":"Hello"}}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Unsupported intent")));
    }

    @Test
    void draftRejectsInvalidEntitiesOnValidation() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"send_email","entities":{"type":"send_email","to":"not-email","subject":"","body":"Hello"}}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void draftRejectsMismatchedIntentAndEntitiesType() throws Exception {
        String token = loginAndGetToken();

        mockMvc.perform(post("/api/actions/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"intent":"send_email","entities":{"type":"update_document_tags","documentId":"doc-1","tags":["urgent"]}}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("REQUEST_ERROR"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Entities type does not match intent")));
    }

    @Test
    void sttAudioEndpointReturnsTranscript() throws Exception {
        when(sttPort.transcribe(any(), anyLong(), anyString(), anyString())).thenReturn("Привет, мир");

        String token = loginAndGetToken();

        MockMultipartFile audio = new MockMultipartFile("audio", "test.wav", "audio/wav", "fake-audio-bytes".getBytes());

        mockMvc.perform(multipart("/api/stt/audio")
                        .file(audio)
                        .param("language", "ru")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Привет, мир"))
                .andExpect(jsonPath("$.status").value("transcribed"));
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

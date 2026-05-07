package com.dmis.backend.integrations;

import com.dmis.backend.documents.application.port.EmbeddingsPort;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.integrations.application.port.SttPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CalendarEventsIntegrationTest {

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
    void analystCrudLifecycle() throws Exception {
        String token = loginAndGetToken("analyst@dmis.local");

        String body = mockMvc.perform(post("/api/calendar/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"title":"Standup","attendees":["a@b.com"],"startIso":"2026-06-01T10:00:00Z","endIso":"2026-06-01T11:00:00Z"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Standup"))
                .andExpect(jsonPath("$.createdBy").value("u-analyst"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(body).get("id").asText();

        Integer rows = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM calendar_events WHERE id = ?",
                Integer.class,
                id
        );
        assertEquals(1, rows);

        mockMvc.perform(get("/api/calendar/events")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + id + "')]").exists());

        mockMvc.perform(get("/api/calendar/events/" + id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Standup"));

        mockMvc.perform(put("/api/calendar/events/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .content("""
                                {"title":"Standup updated","attendees":["a@b.com"],"startIso":"2026-06-01T10:00:00Z","endIso":"2026-06-01T11:00:00Z"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Standup updated"));

        mockMvc.perform(delete("/api/calendar/events/" + id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        Integer afterDelete = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM calendar_events WHERE id = ?",
                Integer.class,
                id
        );
        assertEquals(0, afterDelete);
    }

    @Test
    void nonOwnerGetsNotFoundForForeignEvent() throws Exception {
        String foreignId = "cal-foreign-" + UUID.randomUUID();
        Instant now = Instant.now();
        jdbcTemplate.update(
                """
                        INSERT INTO calendar_events (id, title, attendees, start_iso, end_iso, created_by, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                foreignId,
                "Admin event",
                "x@y.com",
                "2026-06-01T10:00:00Z",
                "2026-06-01T11:00:00Z",
                "u-admin",
                Timestamp.from(now),
                Timestamp.from(now)
        );

        String analystToken = loginAndGetToken("analyst@dmis.local");

        mockMvc.perform(get("/api/calendar/events/" + foreignId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + analystToken))
                .andExpect(status().isNotFound());

        jdbcTemplate.update("DELETE FROM calendar_events WHERE id = ?", foreignId);
    }

    @Test
    void adminCanReadAnalystEvent() throws Exception {
        String analystToken = loginAndGetToken("analyst@dmis.local");

        String body = mockMvc.perform(post("/api/calendar/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + analystToken)
                        .content("""
                                {"title":"Shared","attendees":["z@z.com"],"startIso":"2026-07-01T09:00:00Z","endIso":"2026-07-01T10:00:00Z"}
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(body).get("id").asText();

        String adminToken = loginAndGetToken("admin@dmis.local");

        mockMvc.perform(get("/api/calendar/events/" + id)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Shared"));

        jdbcTemplate.update("DELETE FROM calendar_events WHERE id = ?", id);
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
}

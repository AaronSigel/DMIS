package com.dmis.backend.auth.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void usersMeRequiresAuth() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void traceIdHeaderIsEchoedOrGenerated() throws Exception {
        mockMvc.perform(get("/api/health").header("X-Trace-Id", "trace-from-test"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Trace-Id", "trace-from-test"));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Trace-Id", not(blankOrNullString())));
    }

    @Test
    void actuatorHealthAndPrometheusArePublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk());
    }

    @Test
    void loginReturnsJwtAndAllowsUsersMe() throws Exception {
        MvcResult mvcResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@dmis.local\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, allOf(
                        containsString("dmis_refresh="),
                        containsString("HttpOnly"),
                        containsString("Path=/api/auth/refresh"),
                        containsString("SameSite=Lax")
                )))
                .andReturn();
        String json = mvcResult.getResponse().getContentAsString();
        JsonNode tree = objectMapper.readTree(json);
        String token = tree.get("token").asText();

        mockMvc.perform(get("/api/users/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@dmis.local"));
    }

    @Test
    void loginAutoSyncsMailAccount() throws Exception {
        String token = loginAndGetToken("admin@dmis.local");

        mockMvc.perform(get("/api/mail/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connected").value(true))
                .andExpect(jsonPath("$.imapUsername").value("admin@dmis.local"));
    }

    @Test
    void corsPreflightForLoginAllowsCredentials() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
    }

    @Test
    void refreshWithValidTokenReturnsNewTokenPair() throws Exception {
        Cookie refreshCookie = loginAndGetRefreshCookie("admin@dmis.local");

        mockMvc.perform(post("/api/auth/refresh").cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.user.email").value("admin@dmis.local"))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("dmis_refresh=")));
    }

    @Test
    void refreshTokenReuseRevokesWholeFamily() throws Exception {
        Cookie initialRefresh = loginAndGetRefreshCookie("admin@dmis.local");

        MvcResult rotateResult = mockMvc.perform(post("/api/auth/refresh").cookie(initialRefresh))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        Cookie rotatedRefresh = rotateResult.getResponse().getCookie(AuthController.REFRESH_COOKIE_NAME);
        if (rotatedRefresh == null) {
            throw new AssertionError("Ожидался новый refresh cookie после ротации");
        }

        mockMvc.perform(post("/api/auth/refresh").cookie(initialRefresh))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/refresh").cookie(rotatedRefresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithInvalidTokenReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(AuthController.REFRESH_COOKIE_NAME, "not.a.valid.token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithoutCookieReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void usersListRequiresAdminRole() throws Exception {
        String adminToken = loginAndGetToken("admin@dmis.local");
        String userToken = loginAndGetToken("analyst@dmis.local");

        mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").exists());

        mockMvc.perform(get("/api/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void auditListRequiresAdminRole() throws Exception {
        String adminToken = loginAndGetToken("admin@dmis.local");
        String userToken = loginAndGetToken("analyst@dmis.local");

        mockMvc.perform(get("/api/audit")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/audit")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
                .andExpect(status().isForbidden());
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

    private Cookie loginAndGetRefreshCookie(String email) throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"demo\"}"))
                .andExpect(status().isOk())
                .andReturn();
        Cookie refreshCookie = loginResult.getResponse().getCookie(AuthController.REFRESH_COOKIE_NAME);
        if (refreshCookie == null) {
            throw new AssertionError("Ожидался Set-Cookie dmis_refresh после логина");
        }
        return refreshCookie;
    }
}

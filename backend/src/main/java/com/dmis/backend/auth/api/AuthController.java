package com.dmis.backend.auth.api;

import com.dmis.backend.auth.application.AuthService;
import com.dmis.backend.auth.application.dto.AuthResponse;
import com.dmis.backend.auth.application.dto.AuthResult;
import com.dmis.backend.platform.config.JwtProperties;
import com.dmis.backend.platform.security.CurrentUserProvider;
import com.dmis.backend.shared.model.UserView;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    static final String REFRESH_COOKIE_NAME = "dmis_refresh";
    private static final String REFRESH_COOKIE_PATH = "/api/auth/refresh";

    private final AuthService authService;
    private final CurrentUserProvider currentUserProvider;
    private final JwtProperties jwtProperties;
    private final boolean refreshCookieSecure;

    public AuthController(
            AuthService authService,
            CurrentUserProvider currentUserProvider,
            JwtProperties jwtProperties,
            @Value("${security.jwt.refresh-cookie.secure:false}") boolean refreshCookieSecure
    ) {
        this.authService = authService;
        this.currentUserProvider = currentUserProvider;
        this.jwtProperties = jwtProperties;
        this.refreshCookieSecure = refreshCookieSecure;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request.email(), request.password());
        appendRefreshCookie(response, result.refreshToken());
        return new AuthResponse(result.token(), result.user());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Missing refresh token");
        }
        AuthResult result = authService.refresh(refreshToken);
        appendRefreshCookie(response, result.refreshToken());
        return new AuthResponse(result.token(), result.user());
    }

    @GetMapping("/me")
    public UserView me() {
        return currentUserProvider.currentUser();
    }

    private void appendRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ofSeconds(jwtProperties.refreshExpirationSeconds()))
                .sameSite("Lax")
                .secure(refreshCookieSecure)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {
    }
}

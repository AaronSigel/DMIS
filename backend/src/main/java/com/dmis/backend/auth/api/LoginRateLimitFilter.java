package com.dmis.backend.auth.api;

import com.dmis.backend.auth.application.port.RateLimiterPort;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Ограничивает частоту POST /api/auth/login на основе IP клиента.
 * Запускается до Spring Security, чтобы 429 возвращался сразу,
 * минуя цепочку аутентификации.
 */
@Component
@Order(SecurityProperties.DEFAULT_FILTER_ORDER - 10)
public class LoginRateLimitFilter extends OncePerRequestFilter {
    static final String LOGIN_PATH = "/api/auth/login";

    private final RateLimiterPort rateLimiter;

    public LoginRateLimitFilter(RateLimiterPort rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !(HttpMethod.POST.matches(request.getMethod())
                && LOGIN_PATH.equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String key = clientKey(request);
        RateLimiterPort.Verdict verdict = rateLimiter.tryConsume(key);
        if (verdict.allowed()) {
            chain.doFilter(request, response);
            return;
        }
        writeRateLimited(response, verdict.retryAfterSeconds());
    }

    private static String clientKey(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr == null || remoteAddr.isBlank() ? "unknown" : remoteAddr;
    }

    private static void writeRateLimited(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"errorCode\":\"RATE_LIMITED\",\"message\":\"Too many login attempts\",\"details\":{}}"
        );
    }
}

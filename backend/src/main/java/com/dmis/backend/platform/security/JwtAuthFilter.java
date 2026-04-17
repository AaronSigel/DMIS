package com.dmis.backend.platform.security;

import com.dmis.backend.auth.application.port.TokenPort;
import com.dmis.backend.users.application.port.UserAccessPort;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final TokenPort tokenPort;
    private final UserAccessPort userAccessPort;

    public JwtAuthFilter(TokenPort tokenPort, UserAccessPort userAccessPort) {
        this.tokenPort = tokenPort;
        this.userAccessPort = userAccessPort;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenPort.parse(token).flatMap(subject -> userAccessPort.findById(subject.userId())).ifPresent(user -> {
                UserPrincipal principal = new UserPrincipal(
                        user.id(),
                        user.roles().stream().map(Enum::name).collect(Collectors.toList())
                );
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }
        filterChain.doFilter(request, response);
    }
}

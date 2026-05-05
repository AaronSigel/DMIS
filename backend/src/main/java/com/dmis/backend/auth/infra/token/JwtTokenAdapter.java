package com.dmis.backend.auth.infra.token;

import com.dmis.backend.auth.application.port.TokenPort;
import com.dmis.backend.platform.config.JwtProperties;
import com.dmis.backend.shared.model.UserView;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtTokenAdapter implements TokenPort {
    private final JwtProperties jwtProperties;

    public JwtTokenAdapter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public String issue(UserView userView) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userView.id())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(jwtProperties.expirationSeconds())))
                .claim("email", userView.email())
                .claim("roles", userView.roles().stream().map(Enum::name).toList())
                .signWith(secretKey())
                .compact();
    }

    @Override
    public Optional<TokenSubject> parse(String token) {
        try {
            String userId = Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
            return Optional.of(new TokenSubject(userId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public String issueRefresh(UserView userView) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userView.id())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(jwtProperties.refreshExpirationSeconds())))
                .claim("type", "refresh")
                .signWith(secretKey())
                .compact();
    }

    @Override
    public Optional<TokenSubject> parseRefresh(String refreshToken) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
            if (!"refresh".equals(claims.get("type", String.class))) {
                return Optional.empty();
            }
            return Optional.of(new TokenSubject(claims.getSubject()));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private SecretKey secretKey() {
        return Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }
}

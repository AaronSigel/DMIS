package com.dmis.backend.auth.application;

import com.dmis.backend.auth.application.dto.AuthResult;
import com.dmis.backend.auth.application.port.RefreshTokenStatePort;
import com.dmis.backend.auth.application.port.TokenPort;
import com.dmis.backend.platform.config.JwtProperties;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.users.application.port.UserAccessPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {
    private final UserAccessPort userAccessPort;
    private final RefreshTokenStatePort refreshTokenStatePort;
    private final TokenPort tokenPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;

    public AuthService(
            UserAccessPort userAccessPort,
            RefreshTokenStatePort refreshTokenStatePort,
            TokenPort tokenPort,
            PasswordEncoder passwordEncoder,
            JwtProperties jwtProperties
    ) {
        this.userAccessPort = userAccessPort;
        this.refreshTokenStatePort = refreshTokenStatePort;
        this.tokenPort = tokenPort;
        this.passwordEncoder = passwordEncoder;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public AuthResult login(String email, String password) {
        UserAccessPort.UserWithPassword user = userAccessPort.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
        TokenPort.RefreshTokenClaims refreshClaims = newRefreshClaims(user.user().id(), UUID.randomUUID().toString());
        String refreshToken = tokenPort.issueRefresh(user.user(), refreshClaims);
        persistIssuedRefreshToken(refreshClaims);
        return new AuthResult(tokenPort.issue(user.user()), refreshToken, user.user());
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public AuthResult refresh(String refreshToken) {
        TokenPort.RefreshTokenClaims claims = tokenPort.parseRefresh(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token"));

        RefreshTokenStatePort.RefreshTokenRecord storedToken = refreshTokenStatePort.findByTokenId(claims.tokenId())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token"));

        Instant now = Instant.now();
        if (!storedToken.userId().equals(claims.userId()) || !storedToken.familyId().equals(claims.familyId())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token");
        }
        if (storedToken.revokedAt() != null || storedToken.replacedByTokenId() != null || storedToken.expiresAt().isBefore(now)) {
            refreshTokenStatePort.revokeFamily(storedToken.familyId(), now, RefreshTokenRevokeReason.REUSE_DETECTED);
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token");
        }

        UserView user = userAccessPort.findById(claims.userId())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "User not found"));

        TokenPort.RefreshTokenClaims nextClaims = newRefreshClaims(user.id(), storedToken.familyId());
        boolean rotated = refreshTokenStatePort.markAsRotated(storedToken.tokenId(), nextClaims.tokenId());
        if (!rotated) {
            refreshTokenStatePort.revokeFamily(storedToken.familyId(), now, RefreshTokenRevokeReason.REUSE_DETECTED);
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid refresh token");
        }

        String nextRefreshToken = tokenPort.issueRefresh(user, nextClaims);
        persistIssuedRefreshToken(nextClaims);
        return new AuthResult(tokenPort.issue(user), nextRefreshToken, user);
    }

    public UserView me(String userId) {
        return userAccessPort.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid user"));
    }

    private TokenPort.RefreshTokenClaims newRefreshClaims(String userId, String familyId) {
        return new TokenPort.RefreshTokenClaims(userId, UUID.randomUUID().toString(), familyId);
    }

    private void persistIssuedRefreshToken(TokenPort.RefreshTokenClaims claims) {
        Instant now = Instant.now();
        refreshTokenStatePort.create(new RefreshTokenStatePort.RefreshTokenRecord(
                claims.tokenId(),
                claims.familyId(),
                claims.userId(),
                now,
                now.plusSeconds(jwtProperties.refreshExpirationSeconds()),
                null,
                null,
                null
        ));
    }
}

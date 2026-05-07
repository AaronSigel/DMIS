package com.dmis.backend.auth.application.port;

import com.dmis.backend.shared.model.UserView;

import java.util.Optional;

public interface TokenPort {
    String issue(UserView userView);

    Optional<TokenSubject> parse(String token);

    String issueRefresh(UserView userView, RefreshTokenClaims claims);

    Optional<RefreshTokenClaims> parseRefresh(String refreshToken);

    record TokenSubject(String userId) {
    }

    record RefreshTokenClaims(String userId, String tokenId, String familyId) {
    }
}

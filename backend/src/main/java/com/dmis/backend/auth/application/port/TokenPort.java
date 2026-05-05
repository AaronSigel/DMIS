package com.dmis.backend.auth.application.port;

import com.dmis.backend.shared.model.UserView;

import java.util.Optional;

public interface TokenPort {
    String issue(UserView userView);

    Optional<TokenSubject> parse(String token);

    String issueRefresh(UserView userView);

    Optional<TokenSubject> parseRefresh(String refreshToken);

    record TokenSubject(String userId) {
    }
}

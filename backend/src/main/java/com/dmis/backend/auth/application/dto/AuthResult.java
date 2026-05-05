package com.dmis.backend.auth.application.dto;

import com.dmis.backend.shared.model.UserView;

public record AuthResult(String token, String refreshToken, UserView user) {
}

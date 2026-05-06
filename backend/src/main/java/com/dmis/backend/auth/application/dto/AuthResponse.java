package com.dmis.backend.auth.application.dto;

import com.dmis.backend.shared.model.UserView;

/** Ответ логина/refresh: access-токен в теле; refresh — только HttpOnly cookie. */
public record AuthResponse(String token, UserView user) {
}

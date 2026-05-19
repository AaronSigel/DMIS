package com.dmis.backend.users.application.dto;

public record UserSummaryView(String id, String email, String nickname, String fullName) {
    public UserSummaryView(String id, String email, String fullName) {
        this(id, email, null, fullName);
    }
}

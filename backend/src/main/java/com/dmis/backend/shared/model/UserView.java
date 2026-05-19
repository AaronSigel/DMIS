package com.dmis.backend.shared.model;

import java.util.Set;

public record UserView(String id, String email, String nickname, String fullName, Set<RoleName> roles) {
    public UserView(String id, String email, String fullName, Set<RoleName> roles) {
        this(id, email, null, fullName, roles);
    }
}

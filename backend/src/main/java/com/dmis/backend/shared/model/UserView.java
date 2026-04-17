package com.dmis.backend.shared.model;

import com.dmis.backend.shared.model.RoleName;

import java.util.Set;

public record UserView(String id, String email, String fullName, Set<RoleName> roles) {
}

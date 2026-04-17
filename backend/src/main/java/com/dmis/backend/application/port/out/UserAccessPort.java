package com.dmis.backend.users.application.port;

import com.dmis.backend.shared.model.UserView;

import java.util.Optional;

public interface UserAccessPort {
    Optional<UserWithPassword> findByEmail(String email);

    Optional<UserView> findById(String id);

    record UserWithPassword(UserView user, String passwordHash) {
    }
}

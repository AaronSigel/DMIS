package com.dmis.backend.users.application.port;

import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.users.application.dto.UserSummaryView;

import java.util.List;
import java.util.Optional;

public interface UserAccessPort {
    Optional<UserWithPassword> findByEmail(String email);

    Optional<UserView> findById(String id);

    List<UserSummaryView> findAllSummaries();

    record UserWithPassword(UserView user, String passwordHash) {
    }
}

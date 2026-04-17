package com.dmis.backend.users.infra.persistence;

import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.persistence.PersistenceMapper;
import com.dmis.backend.users.application.port.UserAccessPort;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserPersistenceAdapter implements UserAccessPort {
    private final UserJpaRepository userJpaRepository;
    private final PersistenceMapper mapper;

    public UserPersistenceAdapter(UserJpaRepository userJpaRepository, PersistenceMapper mapper) {
        this.userJpaRepository = userJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<UserWithPassword> findByEmail(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email)
                .map(entity -> new UserWithPassword(mapper.toUserView(entity), entity.getPasswordHash()));
    }

    @Override
    public Optional<UserView> findById(String id) {
        return userJpaRepository.findById(id).map(mapper::toUserView);
    }
}

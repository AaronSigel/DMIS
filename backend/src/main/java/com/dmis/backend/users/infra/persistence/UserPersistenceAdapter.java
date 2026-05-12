package com.dmis.backend.users.infra.persistence;

import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.persistence.PersistenceMapper;
import com.dmis.backend.users.application.dto.UserSummaryView;
import com.dmis.backend.users.application.port.UserAccessPort;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.dmis.backend.users.infra.persistence.repository.UserJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
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

    @Override
    public List<UserView> findAllByIds(Collection<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return userJpaRepository.findAllById(ids).stream()
                .map(mapper::toUserView)
                .toList();
    }

    @Override
    public List<UserSummaryView> searchSummaries(String query, int limit) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 2) {
            return List.of();
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        return userJpaRepository.searchByEmailOrName(q, PageRequest.of(0, safeLimit)).stream()
                .map(e -> new UserSummaryView(e.getId(), e.getEmail(), e.getFullName()))
                .toList();
    }

    @Override
    public List<UserSummaryView> findAllSummaries() {
        return userJpaRepository.findAll().stream()
                .sorted(Comparator.comparing(UserEntity::getEmail, String.CASE_INSENSITIVE_ORDER))
                .map(e -> new UserSummaryView(e.getId(), e.getEmail(), e.getFullName()))
                .toList();
    }
}

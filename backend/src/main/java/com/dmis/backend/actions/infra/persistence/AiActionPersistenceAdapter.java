package com.dmis.backend.actions.infra.persistence;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.infra.persistence.entity.AiActionEntity;
import com.dmis.backend.actions.infra.persistence.repository.AiActionJpaRepository;
import com.dmis.backend.shared.persistence.PersistenceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AiActionPersistenceAdapter implements AiActionPort {
    private static final Logger log = LoggerFactory.getLogger(AiActionPersistenceAdapter.class);

    private final AiActionJpaRepository repository;
    private final PersistenceMapper mapper;

    public AiActionPersistenceAdapter(AiActionJpaRepository repository, PersistenceMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public ActionDtos.AiActionView save(ActionDtos.AiActionView action) {
        repository.save(new AiActionEntity(
                action.id(),
                action.intent(),
                mapper.toJson(action.entities()),
                action.actorId(),
                action.status().name(),
                action.confirmedBy()
        ));
        return findById(action.id()).orElseThrow();
    }

    @Override
    public Optional<ActionDtos.AiActionView> findById(String id) {
        return repository.findById(id).flatMap(this::safeMap);
    }

    @Override
    public List<ActionDtos.AiActionView> findAll() {
        return repository.findAll().stream()
                .map(this::safeMap)
                .flatMap(Optional::stream)
                .toList();
    }

    private Optional<ActionDtos.AiActionView> safeMap(AiActionEntity entity) {
        try {
            return Optional.of(mapper.toActionView(entity));
        } catch (RuntimeException exception) {
            log.warn("Skip malformed ai_action id={} during read: {}", entity.getId(), exception.getMessage());
            return Optional.empty();
        }
    }
}

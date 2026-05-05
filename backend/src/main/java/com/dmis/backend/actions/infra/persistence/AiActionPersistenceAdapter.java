package com.dmis.backend.actions.infra.persistence;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.AiActionPort;
import com.dmis.backend.actions.infra.persistence.entity.AiActionEntity;
import com.dmis.backend.actions.infra.persistence.repository.AiActionJpaRepository;
import com.dmis.backend.shared.persistence.PersistenceMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class AiActionPersistenceAdapter implements AiActionPort {
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
        return repository.findById(id).map(mapper::toActionView);
    }

    @Override
    public List<ActionDtos.AiActionView> findAll() {
        return repository.findAll().stream().map(mapper::toActionView).toList();
    }
}

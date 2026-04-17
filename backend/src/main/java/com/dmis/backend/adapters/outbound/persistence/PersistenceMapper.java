package com.dmis.backend.shared.persistence;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.domain.ActionStatus;
import com.dmis.backend.actions.infra.persistence.entity.AiActionEntity;
import com.dmis.backend.audit.application.dto.AuditView;
import com.dmis.backend.audit.infra.persistence.entity.AuditLogEntity;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.users.infra.persistence.entity.RoleEntity;
import com.dmis.backend.users.infra.persistence.entity.UserEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class PersistenceMapper {
    private final ObjectMapper objectMapper;

    public PersistenceMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public UserView toUserView(UserEntity entity) {
        Set<RoleName> roles = entity.getRoles().stream()
                .map(RoleEntity::getName)
                .map(RoleName::valueOf)
                .collect(Collectors.toSet());
        return new UserView(entity.getId(), entity.getEmail(), entity.getFullName(), roles);
    }

    public String toJson(Map<String, String> entities) {
        try {
            return objectMapper.writeValueAsString(entities == null ? Map.of() : entities);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot serialize entities", e);
        }
    }

    public Map<String, String> fromJson(String json) {
        try {
            if (json == null || json.isBlank()) {
                return Map.of();
            }
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot deserialize entities", e);
        }
    }

    public ActionDtos.AiActionView toActionView(AiActionEntity entity) {
        return new ActionDtos.AiActionView(
                entity.getId(),
                entity.getIntent(),
                fromJson(entity.getEntitiesJson()),
                entity.getActorId(),
                ActionStatus.valueOf(entity.getStatus()),
                entity.getConfirmedBy()
        );
    }

    public AuditView toAuditView(AuditLogEntity entity) {
        return new AuditView(
                entity.getId(),
                entity.getAt(),
                entity.getActorId(),
                entity.getAction(),
                entity.getResourceType(),
                entity.getResourceId(),
                entity.getDetails()
        );
    }
}

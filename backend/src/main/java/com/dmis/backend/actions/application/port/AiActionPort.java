package com.dmis.backend.actions.application.port;

import com.dmis.backend.actions.application.dto.ActionDtos;

import java.util.List;
import java.util.Optional;

public interface AiActionPort {
    ActionDtos.AiActionView save(ActionDtos.AiActionView action);

    Optional<ActionDtos.AiActionView> findById(String id);

    List<ActionDtos.AiActionView> findAll();
}

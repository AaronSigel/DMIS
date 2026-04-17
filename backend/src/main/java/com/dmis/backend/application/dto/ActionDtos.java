package com.dmis.backend.actions.application.dto;

import com.dmis.backend.actions.domain.ActionStatus;

import java.util.Map;

public final class ActionDtos {
    private ActionDtos() {
    }

    public record AiActionView(
            String id,
            String intent,
            Map<String, String> entities,
            String actorId,
            ActionStatus status,
            String confirmedBy
    ) {
    }
}

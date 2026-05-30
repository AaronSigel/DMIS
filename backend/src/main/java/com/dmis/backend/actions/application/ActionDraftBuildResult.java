package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;

import java.util.List;
import java.util.Map;

/**
 * Результат детерминированной сборки черновика: полный или с недостающими полями.
 */
public record ActionDraftBuildResult(
        String intent,
        ActionDtos.ActionEntities entities,
        Map<String, Object> partialEntities,
        List<String> missingFields
) {
    public ActionDraftBuildResult {
        partialEntities = partialEntities == null ? Map.of() : Map.copyOf(partialEntities);
        missingFields = missingFields == null ? List.of() : List.copyOf(missingFields);
    }

    public boolean isComplete() {
        return missingFields.isEmpty() && entities != null;
    }

    public boolean needsClarification() {
        return !missingFields.isEmpty();
    }

    public static ActionDraftBuildResult complete(String intent, ActionDtos.ActionEntities entities) {
        return new ActionDraftBuildResult(intent, entities, Map.of(), List.of());
    }

    public static ActionDraftBuildResult clarification(
            String intent,
            Map<String, Object> partialEntities,
            List<String> missingFields
    ) {
        return new ActionDraftBuildResult(intent, null, partialEntities, missingFields);
    }
}

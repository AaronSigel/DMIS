package com.dmis.backend.actions.api;

import com.dmis.backend.actions.application.ActionService;
import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.platform.security.CurrentUserProvider;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/actions")
public class ActionsController {
    private final ActionService actionService;
    private final CurrentUserProvider currentUserProvider;

    public ActionsController(ActionService actionService, CurrentUserProvider currentUserProvider) {
        this.actionService = actionService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping
    public List<ActionDtos.AiActionView> list() {
        return actionService.list(currentUserProvider.currentUser());
    }

    @PostMapping("/draft")
    public ActionDtos.AiActionView draft(@Valid @RequestBody DraftRequest request) {
        return actionService.draft(currentUserProvider.currentUser(), request.intent(), request.entities());
    }

    @PostMapping("/{actionId}/confirm")
    public ActionDtos.AiActionView confirm(@PathVariable("actionId") String actionId) {
        return actionService.confirm(currentUserProvider.currentUser(), actionId);
    }

    @PostMapping("/{actionId}/execute")
    public ActionDtos.AiActionView execute(@PathVariable("actionId") String actionId) {
        return actionService.execute(currentUserProvider.currentUser(), actionId);
    }

    public record DraftRequest(@NotBlank String intent, Map<String, String> entities) {
    }
}

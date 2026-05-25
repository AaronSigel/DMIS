package com.dmis.backend.assistant.tools;

import com.dmis.backend.shared.model.UserView;

import java.util.List;

public interface AiToolGateway {
    List<AiToolDefinition> listTools(UserView actor);

    AiToolCallResult call(UserView actor, AiToolCallRequest request);
}

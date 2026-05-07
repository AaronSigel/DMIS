package com.dmis.backend.actions.application.port;

import java.util.Map;

public interface IntentParserPort {
    ParsedIntent parse(String userText);

    record ParsedIntent(String intent, Map<String, Object> entities) {
    }
}

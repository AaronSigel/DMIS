package com.dmis.backend.actions.infra.http;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.IntentParserPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Component
public class AiServiceIntentParserAdapter implements IntentParserPort {
    private static final String SYSTEM_PROMPT = """
            Ты извлекаешь действие для корпоративной системы документооборота.
            Доступны только intent:
            - %s
            - %s
            - %s
            Верни только структурированный JSON с полями intent и entities.
            Для %s entities: to, subject, body.
            Для %s entities: title, attendees (массив email), startIso, endIso.
            Для %s entities: documentId, tags (массив строк).
            Не используй пустые строки и пустые массивы как валидные значения entities.
            Если данных недостаточно, верни наиболее вероятный intent, но заполняй entities только содержательными значениями.
            """.formatted(
            ActionDtos.SEND_EMAIL_INTENT,
            ActionDtos.CREATE_CALENDAR_EVENT_INTENT,
            ActionDtos.UPDATE_DOCUMENT_TAGS_INTENT,
            ActionDtos.SEND_EMAIL_INTENT,
            ActionDtos.CREATE_CALENDAR_EVENT_INTENT,
            ActionDtos.UPDATE_DOCUMENT_TAGS_INTENT
    );

    private final RestClient restClient;
    private final String structuredPath;

    public AiServiceIntentParserAdapter(
            @Value("${AI_BASE_URL:http://localhost:8002}") String baseUrl,
            @Value("${ai.intent.structured-path:/v2/chat/structured}") String structuredPath
    ) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.structuredPath = structuredPath;
    }

    @Override
    public ParsedIntent parse(String userText) {
        try {
            StructuredChatResponse response = restClient.post()
                    .uri(structuredPath)
                    .body(new StructuredChatRequest(userText, SYSTEM_PROMPT, 0.0, 256, null, null))
                    .retrieve()
                    .body(StructuredChatResponse.class);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser returned empty response");
            }
            if (!"ok".equals(response.status())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser returned error status");
            }
            if (response.structured() == null || response.structured().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser returned empty structured payload");
            }
            Object intent = response.structured().get("intent");
            Object entities = response.structured().get("entities");
            if (!(intent instanceof String parsedIntent)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser answer has no intent");
            }
            if (!(entities instanceof Map<?, ?> rawEntities)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser answer has no entities object");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> typedEntities = (Map<String, Object>) rawEntities;
            return new ParsedIntent(parsedIntent.trim(), typedEntities);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse intent from AI response", exception);
        }
    }

    private record StructuredChatRequest(
            String question,
            String systemPrompt,
            Double temperature,
            Integer maxTokens,
            String traceId,
            Map<String, Object> responseSchema
    ) {
    }

    private record StructuredChatResponse(
            String status,
            Map<String, Object> structured,
            String provider,
            String model,
            String error
    ) {
    }
}

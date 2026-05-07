package com.dmis.backend.actions.application;

import com.dmis.backend.actions.application.dto.ActionDtos;
import com.dmis.backend.actions.application.port.IntentParserPort;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class IntentParserService {
    private final IntentParserPort intentParserPort;
    private final Validator validator;

    public IntentParserService(IntentParserPort intentParserPort, Validator validator) {
        this.intentParserPort = intentParserPort;
        this.validator = validator;
    }

    public ParsedDraft parseDraft(String userText) {
        if (userText == null || userText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User text is required");
        }

        IntentParserPort.ParsedIntent raw = intentParserPort.parse(userText.trim());
        if (raw == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser returned empty response");
        }
        if (raw.intent() == null || raw.intent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser did not return intent");
        }
        if (!ActionDtos.supportedIntents().contains(raw.intent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported intent: " + raw.intent());
        }
        if (raw.entities() == null || raw.entities().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser did not return entities");
        }

        ActionDtos.ActionEntities entities = mapEntities(raw.intent(), raw.entities());
        validateEntities(raw.intent(), entities);
        return new ParsedDraft(raw.intent(), entities);
    }

    private ActionDtos.ActionEntities mapEntities(String intent, Map<String, Object> entities) {
        try {
            return switch (intent) {
                case ActionDtos.SEND_EMAIL_INTENT -> new ActionDtos.SendEmailEntities(
                        requiredString(entities, "to"),
                        requiredString(entities, "subject"),
                        requiredString(entities, "body"),
                        optionalDocumentIdList(entities, "attachmentDocumentIds")
                );
                case ActionDtos.CREATE_CALENDAR_EVENT_INTENT -> new ActionDtos.CreateCalendarEventEntities(
                        requiredString(entities, "title"),
                        requiredStringList(entities, "attendees"),
                        requiredString(entities, "startIso"),
                        requiredString(entities, "endIso")
                );
                case ActionDtos.UPDATE_DOCUMENT_TAGS_INTENT -> new ActionDtos.UpdateDocumentTagsEntities(
                        requiredString(entities, "documentId"),
                        requiredStringList(entities, "tags")
                );
                default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported intent: " + intent);
            };
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to parse entities for intent: " + intent, exception);
        }
    }

    private void validateEntities(String intent, ActionDtos.ActionEntities entities) {
        Set<ConstraintViolation<ActionDtos.ActionEntities>> violations = validator.validate(entities);
        if (!violations.isEmpty()) {
            String details = violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid entities for intent " + intent + ": " + details);
        }
    }

    private static String requiredString(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: " + key);
        }
        String text = String.valueOf(value).trim();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity field must not be blank: " + key);
        }
        return text;
    }

    /**
     * Опциональный массив ID документов для вложений; отсутствие ключа или {@code null} — пустой список.
     */
    private static List<String> optionalDocumentIdList(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value == null) {
            return List.of();
        }
        if (!(value instanceof List<?> list)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity field must be array: " + key);
        }
        List<String> normalized = list.stream()
                .map(item -> item == null ? "" : String.valueOf(item).trim())
                .toList();
        if (normalized.stream().anyMatch(String::isBlank)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity array must contain non-blank values: " + key);
        }
        return normalized;
    }

    private static List<String> requiredStringList(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (!(value instanceof List<?> list) || list.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity field must be non-empty array: " + key);
        }
        List<String> normalized = list.stream()
                .map(item -> item == null ? "" : String.valueOf(item).trim())
                .toList();
        if (normalized.stream().anyMatch(String::isBlank)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity array must contain non-blank values: " + key);
        }
        return normalized;
    }

    public record ParsedDraft(String intent, ActionDtos.ActionEntities entities) {
    }
}

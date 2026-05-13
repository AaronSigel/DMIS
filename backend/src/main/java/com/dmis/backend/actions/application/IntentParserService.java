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
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class IntentParserService {
    private final IntentParserPort intentParserPort;
    private final UserMentionResolver userMentionResolver;
    private final Validator validator;

    public IntentParserService(
            IntentParserPort intentParserPort,
            UserMentionResolver userMentionResolver,
            Validator validator
    ) {
        this.intentParserPort = intentParserPort;
        this.userMentionResolver = userMentionResolver;
        this.validator = validator;
    }

    public ParsedDraft parseDraft(String userText) {
        return parseDraft(userText, List.of());
    }

    public ParsedDraft parseDraft(String userText, List<String> selectedDocumentIds) {
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
        if (raw.entities() == null || (raw.entities().isEmpty() && !ActionDtos.SEND_EMAIL_INTENT.equals(raw.intent()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Intent parser did not return entities");
        }

        ActionDtos.ActionEntities entities = mapEntities(raw.intent(), raw.entities(), userText.trim(), normalizeSelectedDocumentIds(selectedDocumentIds));
        validateEntities(raw.intent(), entities);
        return new ParsedDraft(raw.intent(), entities);
    }

    private ActionDtos.ActionEntities mapEntities(
            String intent,
            Map<String, Object> entities,
            String userText,
            List<String> selectedDocumentIds
    ) {
        try {
            return switch (intent) {
                case ActionDtos.SEND_EMAIL_INTENT -> new ActionDtos.SendEmailEntities(
                        userMentionResolver.resolve(resolveEmailRecipient(entities, userText)),
                        resolveEmailSubject(entities, selectedDocumentIds),
                        resolveEmailBody(entities, userText, selectedDocumentIds),
                        mergeDocumentIds(optionalDocumentIdList(entities, "attachmentDocumentIds"), selectedDocumentIds)
                );
                case ActionDtos.CREATE_CALENDAR_EVENT_INTENT -> new ActionDtos.CreateCalendarEventEntities(
                        requiredString(entities, "title"),
                        requiredStringList(entities, "attendees").stream()
                                .map(userMentionResolver::resolve)
                                .toList(),
                        requiredString(entities, "startIso"),
                        requiredString(entities, "endIso")
                );
                case ActionDtos.UPDATE_DOCUMENT_TAGS_INTENT -> new ActionDtos.UpdateDocumentTagsEntities(
                        requiredString(entities, "documentId"),
                        requiredStringList(entities, "tags")
                );
                case ActionDtos.RESCHEDULE_CALENDAR_EVENT_INTENT -> new ActionDtos.RescheduleCalendarEventEntities(
                        requiredString(entities, "eventId"),
                        optionalString(entities, "title"),
                        requiredString(entities, "startIso"),
                        requiredString(entities, "endIso")
                );
                case ActionDtos.PREPARE_MEETING_AGENDA_INTENT -> new ActionDtos.PrepareMeetingAgendaEntities(
                        requiredString(entities, "eventId"),
                        optionalDocumentIdList(entities, "extraDocumentIds")
                );
                case ActionDtos.SUGGEST_MEETING_SLOTS_INTENT -> new ActionDtos.SuggestMeetingSlotsEntities(
                        requiredStringList(entities, "attendeeEmails").stream()
                                .map(userMentionResolver::resolve)
                                .toList(),
                        requiredString(entities, "fromIso"),
                        requiredString(entities, "toIso"),
                        requiredInt(entities, "slotMinutes")
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

    private static String optionalString(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isBlank() ? null : text;
    }

    private String resolveEmailRecipient(Map<String, Object> entities, String userText) {
        String explicit = optionalString(entities, "to");
        if (explicit != null) {
            return explicit;
        }
        String normalized = userText.toLowerCase(java.util.Locale.ROOT);
        if (normalized.contains("аналит")) {
            return "@analyst";
        }
        if (normalized.contains("reviewer") || normalized.contains("ревьюер")) {
            return "@reviewer";
        }
        if (normalized.contains("manager") || normalized.contains("менеджер")) {
            return "@manager";
        }
        if (normalized.contains("admin") || normalized.contains("админ")) {
            return "@admin";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: to");
    }

    /**
     * Тема письма для черновика. Если парсер не вернул {@code subject}, но
     * к запросу приложены документы — генерируем дефолтную тему. Наличие
     * выбранных документов само по себе достаточный сигнал намерения
     * «отправить документ»: не привязываемся к конкретным ключевым словам
     * в тексте пользователя (RU/EN/перефразировки).
     */
    private static String resolveEmailSubject(Map<String, Object> entities, List<String> selectedDocumentIds) {
        String explicit = optionalString(entities, "subject");
        if (explicit != null) {
            return explicit;
        }
        if (!selectedDocumentIds.isEmpty()) {
            return "Документ для ознакомления";
        }
        return requiredString(entities, "subject");
    }

    /**
     * Тело письма. Логика симметрична {@link #resolveEmailSubject}: при
     * наличии выбранных документов используем дефолтное тело, иначе
     * требуем {@code body} от парсера.
     */
    private static String resolveEmailBody(Map<String, Object> entities, String userText, List<String> selectedDocumentIds) {
        String explicit = optionalString(entities, "body");
        if (explicit != null) {
            return explicit;
        }
        if (!selectedDocumentIds.isEmpty()) {
            return "Коллеги, направляю документ из DMIS. Команда пользователя: " + userText;
        }
        return requiredString(entities, "body");
    }

    private static List<String> normalizeSelectedDocumentIds(List<String> selectedDocumentIds) {
        if (selectedDocumentIds == null) {
            return List.of();
        }
        return selectedDocumentIds.stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
    }

    private static List<String> mergeDocumentIds(List<String> parsedDocumentIds, List<String> selectedDocumentIds) {
        LinkedHashSet<String> merged = new LinkedHashSet<>();
        parsedDocumentIds.stream()
                .filter(IntentParserService::looksLikeDocumentId)
                .forEach(merged::add);
        merged.addAll(selectedDocumentIds);
        return List.copyOf(merged);
    }

    private static boolean looksLikeDocumentId(String value) {
        return value != null && value.startsWith("doc-");
    }

    private static int requiredInt(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing entity field: " + key);
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value).trim());
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Entity field must be integer: " + key);
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

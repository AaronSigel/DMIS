package com.dmis.backend.assistant.application;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Детерминированная маршрутизация запросов ассистента до вызова action parser.
 */
@Component
public class AssistantRequestRouter {
    private static final Pattern SUMMARY_PATTERN = Pattern.compile(
            "(?i)(summary|кратко|суммаризируй|резюме|о\\s+ч[её]m\\s+документ|главные\\s+пункты|выжимка|содержание)"
    );
    private static final Pattern CONTROLLED_ACTION_PATTERN = Pattern.compile(
            "(?i)(подготовь\\s+письм|отправ(ь|ить)\\s+письм|создай\\s+встреч|назнач(ь|ить)\\s+встреч|"
                    + "prepare\\s+email|send\\s+email|create\\s+(meeting|event)|schedule\\s+meeting)"
    );
    private static final Pattern MENTION_PATTERN = Pattern.compile("[@#][\\p{L}\\p{N}._-]+");
    private static final Pattern QUESTION_PATTERN = Pattern.compile(
            "(?i)(\\?|какая|какой|какие|как|что|где|когда|сколько|указан|написано|содержит|контрольн)"
    );

    public RoutingDecision route(String text, List<String> selectedDocumentIds, List<String> linkedDocumentIds) {
        String normalized = text == null ? "" : text.trim();
        List<String> selected = normalizeIds(selectedDocumentIds);
        List<String> linked = normalizeIds(linkedDocumentIds);
        List<String> effective = !selected.isEmpty() ? selected : linked;

        if (normalized.isBlank()) {
            return new RoutingDecision(RequestType.UNKNOWN, "NO_CONTEXT", "Пустой запрос.");
        }

        if (isControlledAction(normalized)) {
            return new RoutingDecision(RequestType.CONTROLLED_ACTION, null, null);
        }

        if (isForwardToRecipient(normalized) && !effective.isEmpty()) {
            return new RoutingDecision(RequestType.CONTROLLED_ACTION, null, null);
        }

        if (isDocumentSearch(normalized)) {
            return new RoutingDecision(RequestType.DOCUMENT_SEARCH, null, null);
        }

        if (SUMMARY_PATTERN.matcher(normalized).find()) {
            if (effective.isEmpty()) {
                return new RoutingDecision(
                        RequestType.UNKNOWN,
                        ContextAssemblyService.STATUS_NO_DOCUMENT_SELECTED,
                        "Выберите документ или дождитесь привязки загруженного файла к диалогу."
                );
            }
            if (selected.isEmpty() && linked.size() > 1) {
                return new RoutingDecision(
                        RequestType.UNKNOWN,
                        ContextAssemblyService.STATUS_NO_DOCUMENT_SELECTED,
                        "В контексте несколько документов. Уточните, для какого файла нужен summary."
                );
            }
            return new RoutingDecision(RequestType.DOCUMENT_SUMMARY, null, null);
        }

        if (!effective.isEmpty() && QUESTION_PATTERN.matcher(normalized).find()) {
            return new RoutingDecision(RequestType.DOCUMENT_QA, null, null);
        }

        if (!effective.isEmpty()) {
            return new RoutingDecision(RequestType.DOCUMENT_QA, null, null);
        }

        return new RoutingDecision(RequestType.GENERAL_CHAT, null, null);
    }

    private static boolean isDocumentSearch(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        return ((lower.contains("найди") || lower.contains("найти") || lower.contains("search"))
                && lower.contains("документ"))
                || lower.contains("поиск по документ");
    }

    private static boolean isControlledAction(String text) {
        if (CONTROLLED_ACTION_PATTERN.matcher(text).find()) {
            return true;
        }
        String lower = text.toLowerCase(Locale.ROOT);
        if ((lower.contains("подготовь") || lower.contains("отправ")) && lower.contains("письм")) {
            return true;
        }
        if ((lower.contains("создай") || lower.contains("назнач")) && lower.contains("встреч")) {
            return true;
        }
        if ((lower.contains("prepare") || lower.contains("send")) && lower.contains("email")) {
            return true;
        }
        if ((lower.contains("create") || lower.contains("schedule")) && (lower.contains("meeting") || lower.contains("event"))) {
            return true;
        }
        return MENTION_PATTERN.matcher(text).find()
                && lower.matches("(?s).*(письм|email|mail|встреч|meeting|event).*");
    }

    /**
     * Пересылка документа получателю без явного слова «письмо» (например, «перешли @file аналитику»).
     */
    private static boolean isForwardToRecipient(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        boolean forwardVerb = lower.contains("перешл")
                || lower.contains("передай")
                || lower.contains("forward")
                || (lower.contains("отправ") && !lower.contains("письм"));
        if (!forwardVerb) {
            return false;
        }
        return lower.contains("аналит")
                || lower.contains("analyst")
                || lower.contains("reviewer")
                || lower.contains("ревьюер")
                || lower.contains("менеджер")
                || lower.contains("manager")
                || lower.contains("админ")
                || lower.contains("admin");
    }

    private static List<String> normalizeIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream()
                .filter(id -> id != null && !id.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
    }

    public record RoutingDecision(
            RequestType requestType,
            String diagnosticCode,
            String diagnosticMessage
    ) {
        public boolean isDiagnosticOnly() {
            return diagnosticCode != null && !diagnosticCode.isBlank();
        }
    }
}

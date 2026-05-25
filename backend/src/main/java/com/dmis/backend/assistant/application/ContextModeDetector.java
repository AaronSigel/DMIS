package com.dmis.backend.assistant.application;

import java.util.Locale;
import java.util.regex.Pattern;

final class ContextModeDetector {
    private static final Pattern SUMMARY_PATTERN = Pattern.compile(
            "(?i)(summary|кратко|суммаризируй|резюме|о\\s+ч[её]м\\s+документ|главные\\s+пункты|выжимка)"
    );

    private ContextModeDetector() {
    }

    static ContextMode detect(String question, ContextMode requestedMode) {
        if (requestedMode != null && requestedMode != ContextMode.AUTO) {
            return requestedMode;
        }
        if (question == null || question.isBlank()) {
            return ContextMode.QUESTION_ANSWER;
        }
        if (SUMMARY_PATTERN.matcher(question.toLowerCase(Locale.ROOT)).find()) {
            return ContextMode.SUMMARY;
        }
        return ContextMode.QUESTION_ANSWER;
    }
}

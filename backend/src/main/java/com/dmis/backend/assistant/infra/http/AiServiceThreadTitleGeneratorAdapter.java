package com.dmis.backend.assistant.infra.http;

import com.dmis.backend.assistant.application.port.ThreadTitleGeneratorPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class AiServiceThreadTitleGeneratorAdapter implements ThreadTitleGeneratorPort {
    private static final String DEFAULT_TITLE = "Новый диалог";

    private final RestClient restClient;

    public AiServiceThreadTitleGeneratorAdapter(@Value("${AI_BASE_URL:http://localhost:8002}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public String generateTitle(String userQuestion, String assistantAnswer, String currentTitle) {
        String fallback = (currentTitle == null || currentTitle.isBlank()) ? DEFAULT_TITLE : currentTitle.trim();
        if ((userQuestion == null || userQuestion.isBlank()) && (assistantAnswer == null || assistantAnswer.isBlank())) {
            return fallback;
        }
        try {
            String prompt = """
                    Сгенерируй короткий заголовок (2-6 слов) для корпоративного диалога.
                    Верни только заголовок без кавычек, точки и пояснений.
                    """;
            String question = ("Вопрос пользователя: " + safe(userQuestion) + "\n" +
                    "Ответ ассистента: " + safe(assistantAnswer)).trim();

            ChatResponse response = restClient.post()
                    .uri("/chat")
                    .body(new ChatRequest(question, List.of(), prompt, 0.2, 32, null))
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null || response.answer() == null || response.answer().isBlank()) {
                return fallback;
            }
            return response.answer().trim();
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private static String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private record ChatRequest(
            String question,
            List<String> contextChunks,
            String systemPrompt,
            Double temperature,
            Integer maxTokens,
            String traceId
    ) {
    }

    private record ChatResponse(String answer) {
    }
}

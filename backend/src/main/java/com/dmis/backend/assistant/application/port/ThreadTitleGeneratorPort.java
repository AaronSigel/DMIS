package com.dmis.backend.assistant.application.port;

public interface ThreadTitleGeneratorPort {
    String generateTitle(String userQuestion, String assistantAnswer, String currentTitle);
}

package com.dmis.backend.testing.application;

import com.dmis.backend.testing.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Управление жизненным циклом тестовых сессий.
 */
@Service
public class TestSessionService {
    private static final Logger log = LoggerFactory.getLogger(TestSessionService.class);
    private final Map<String, TestSession> sessions = new ConcurrentHashMap<>();

    /**
     * Создать новую тестовую сессию.
     */
    public TestSession createSession(
        String name,
        IsolationLevel isolationLevel,
        CleanupPolicy cleanupPolicy
    ) {
        TestSession session = new TestSession(name, isolationLevel, cleanupPolicy);
        sessions.put(session.getId(), session);
        log.info("Created test session: id={}, name={}, isolation={}",
            session.getId(), name, isolationLevel);
        return session;
    }

    /**
     * Получить сессию по ID.
     */
    public TestSession getSession(String sessionId) {
        TestSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Test session not found: " + sessionId);
        }
        return session;
    }

    /**
     * Запустить сессию.
     */
    public void startSession(String sessionId) {
        TestSession session = getSession(sessionId);
        session.start();
        log.info("Started test session: id={}", sessionId);
    }

    /**
     * Завершить сессию.
     */
    public void endSession(String sessionId, boolean success) {
        TestSession session = getSession(sessionId);
        session.finish(success);

        if (session.shouldCleanup()) {
            cleanupSession(sessionId);
        }

        log.info("Ended test session: id={}, status={}, duration={}ms",
            sessionId, session.getStatus(), session.getDurationMs());
    }

    /**
     * Добавить шаг в сессию.
     */
    public void addStep(String sessionId, TestStep step) {
        TestSession session = getSession(sessionId);
        session.addStep(step);
    }

    /**
     * Добавить ассерт в сессию.
     */
    public void addAssertion(String sessionId, TestAssertion assertion) {
        TestSession session = getSession(sessionId);
        session.addAssertion(assertion);
    }

    /**
     * Очистить данные сессии.
     */
    private void cleanupSession(String sessionId) {
        TestSession session = getSession(sessionId);

        switch (session.getIsolationLevel()) {
            case TRANSACTION:
                // Rollback будет выполнен автоматически Spring'ом
                log.debug("Transaction rollback for session: {}", sessionId);
                break;
            case SCHEMA:
                // TODO: DROP SCHEMA test_session_{sessionId} CASCADE
                log.debug("Schema cleanup for session: {}", sessionId);
                break;
            case DATABASE:
                // TODO: Закрыть in-memory БД
                log.debug("Database cleanup for session: {}", sessionId);
                break;
            case NONE:
                log.debug("No cleanup for session: {}", sessionId);
                break;
        }

        sessions.remove(sessionId);
    }

    /**
     * Получить все активные сессии.
     */
    public Map<String, TestSession> getActiveSessions() {
        return Map.copyOf(sessions);
    }
}

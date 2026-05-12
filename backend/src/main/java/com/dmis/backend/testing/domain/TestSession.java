package com.dmis.backend.testing.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Изолированная тестовая сессия для agent-driven тестирования.
 * Каждая сессия имеет собственный контекст, данные и жизненный цикл.
 */
public class TestSession {
    private final String id;
    private final String name;
    private final IsolationLevel isolationLevel;
    private final CleanupPolicy cleanupPolicy;
    private final Instant createdAt;
    private Instant startedAt;
    private Instant finishedAt;
    private TestSessionStatus status;
    private final List<TestStep> steps;
    private final List<TestAssertion> assertions;

    public TestSession(String name, IsolationLevel isolationLevel, CleanupPolicy cleanupPolicy) {
        this.id = UUID.randomUUID().toString();
        this.name = name;
        this.isolationLevel = isolationLevel;
        this.cleanupPolicy = cleanupPolicy;
        this.createdAt = Instant.now();
        this.status = TestSessionStatus.CREATED;
        this.steps = new ArrayList<>();
        this.assertions = new ArrayList<>();
    }

    public void start() {
        if (status != TestSessionStatus.CREATED) {
            throw new IllegalStateException("Session already started");
        }
        this.startedAt = Instant.now();
        this.status = TestSessionStatus.RUNNING;
    }

    public void finish(boolean success) {
        if (status != TestSessionStatus.RUNNING) {
            throw new IllegalStateException("Session not running");
        }
        this.finishedAt = Instant.now();
        this.status = success ? TestSessionStatus.PASSED : TestSessionStatus.FAILED;
    }

    public void addStep(TestStep step) {
        this.steps.add(step);
    }

    public void addAssertion(TestAssertion assertion) {
        this.assertions.add(assertion);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public IsolationLevel getIsolationLevel() {
        return isolationLevel;
    }

    public CleanupPolicy getCleanupPolicy() {
        return cleanupPolicy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public TestSessionStatus getStatus() {
        return status;
    }

    public List<TestStep> getSteps() {
        return new ArrayList<>(steps);
    }

    public List<TestAssertion> getAssertions() {
        return new ArrayList<>(assertions);
    }

    public long getDurationMs() {
        if (startedAt == null || finishedAt == null) {
            return 0;
        }
        return finishedAt.toEpochMilli() - startedAt.toEpochMilli();
    }

    public boolean shouldCleanup() {
        return switch (cleanupPolicy) {
            case ALWAYS -> true;
            case ON_SUCCESS -> status == TestSessionStatus.PASSED;
            case ON_FAILURE -> status == TestSessionStatus.FAILED;
            case NEVER -> false;
        };
    }
}

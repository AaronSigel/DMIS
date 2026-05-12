package com.dmis.backend.testing.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Один шаг в тестовом сценарии (API-вызов, UI-действие, проверка).
 */
public class TestStep {
    private final String name;
    private final TestStepType type;
    private final Instant startedAt;
    private Instant finishedAt;
    private TestStepStatus status;
    private final List<TestAssertion> assertions;
    private String errorMessage;
    private String screenshotPath;

    public TestStep(String name, TestStepType type) {
        this.name = name;
        this.type = type;
        this.startedAt = Instant.now();
        this.status = TestStepStatus.RUNNING;
        this.assertions = new ArrayList<>();
    }

    public void finish(TestStepStatus status, String errorMessage) {
        this.finishedAt = Instant.now();
        this.status = status;
        this.errorMessage = errorMessage;
    }

    public void addAssertion(TestAssertion assertion) {
        this.assertions.add(assertion);
    }

    public void setScreenshotPath(String path) {
        this.screenshotPath = path;
    }

    public String getName() {
        return name;
    }

    public TestStepType getType() {
        return type;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public TestStepStatus getStatus() {
        return status;
    }

    public List<TestAssertion> getAssertions() {
        return new ArrayList<>(assertions);
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public String getScreenshotPath() {
        return screenshotPath;
    }

    public long getDurationMs() {
        if (startedAt == null || finishedAt == null) {
            return 0;
        }
        return finishedAt.toEpochMilli() - startedAt.toEpochMilli();
    }
}

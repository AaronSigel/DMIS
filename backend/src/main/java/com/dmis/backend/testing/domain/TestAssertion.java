package com.dmis.backend.testing.domain;

/**
 * Структурированная проверка в тестовом сценарии.
 */
public class TestAssertion {
    private final AssertionType type;
    private final String path;
    private final Object expected;
    private final Object actual;
    private final boolean passed;
    private final String message;

    public TestAssertion(
        AssertionType type,
        String path,
        Object expected,
        Object actual,
        boolean passed,
        String message
    ) {
        this.type = type;
        this.path = path;
        this.expected = expected;
        this.actual = actual;
        this.passed = passed;
        this.message = message;
    }

    public static TestAssertion passed(AssertionType type, String path, Object value) {
        return new TestAssertion(type, path, value, value, true, null);
    }

    public static TestAssertion failed(
        AssertionType type,
        String path,
        Object expected,
        Object actual,
        String message
    ) {
        return new TestAssertion(type, path, expected, actual, false, message);
    }

    public AssertionType getType() {
        return type;
    }

    public String getPath() {
        return path;
    }

    public Object getExpected() {
        return expected;
    }

    public Object getActual() {
        return actual;
    }

    public boolean isPassed() {
        return passed;
    }

    public String getMessage() {
        return message;
    }
}

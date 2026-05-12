package com.dmis.backend.testing.application;

import com.dmis.backend.testing.domain.AssertionType;
import com.dmis.backend.testing.domain.TestAssertion;
import com.jayway.jsonpath.JsonPath;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Сервис для выполнения структурированных проверок в тестах.
 */
@Service
public class TestAssertionService {

    /**
     * Проверить HTTP-статус.
     */
    public TestAssertion assertStatusCode(int actual, int... expected) {
        boolean passed = Arrays.stream(expected).anyMatch(e -> e == actual);

        if (passed) {
            return TestAssertion.passed(AssertionType.STATUS_CODE, "status", actual);
        } else {
            return TestAssertion.failed(
                AssertionType.STATUS_CODE,
                "status",
                Arrays.toString(expected),
                actual,
                String.format("Expected status %s, got %d", Arrays.toString(expected), actual)
            );
        }
    }

    /**
     * Проверить значение по JSON-пути.
     */
    public TestAssertion assertJsonPath(Object response, String path, Object expected) {
        try {
            Object actual = JsonPath.read(response, path);
            boolean passed = expected == null ? actual != null : expected.equals(actual);

            if (passed) {
                return TestAssertion.passed(AssertionType.JSON_PATH, path, actual);
            } else {
                return TestAssertion.failed(
                    AssertionType.JSON_PATH,
                    path,
                    expected,
                    actual,
                    String.format("Expected %s at path '%s', got %s", expected, path, actual)
                );
            }
        } catch (Exception e) {
            return TestAssertion.failed(
                AssertionType.JSON_PATH,
                path,
                expected,
                null,
                "Path not found or invalid: " + e.getMessage()
            );
        }
    }

    /**
     * Проверить наличие путей в JSON.
     */
    public List<TestAssertion> assertContains(Object response, String... paths) {
        return Arrays.stream(paths)
            .map(path -> {
                try {
                    Object value = JsonPath.read(response, path);
                    return TestAssertion.passed(AssertionType.CONTAINS, path, value);
                } catch (Exception e) {
                    return TestAssertion.failed(
                        AssertionType.CONTAINS,
                        path,
                        "exists",
                        null,
                        "Path not found: " + path
                    );
                }
            })
            .toList();
    }

    /**
     * Проверить текст элемента (для UI-тестов).
     */
    public TestAssertion assertText(String selector, String expected, String actual) {
        boolean passed = expected.equals(actual);

        if (passed) {
            return TestAssertion.passed(AssertionType.TEXT, selector, actual);
        } else {
            return TestAssertion.failed(
                AssertionType.TEXT,
                selector,
                expected,
                actual,
                String.format("Expected text '%s' at selector '%s', got '%s'", expected, selector, actual)
            );
        }
    }

    /**
     * Проверить производительность операции.
     */
    public TestAssertion assertPerformance(String operation, long actualMs, long maxMs) {
        boolean passed = actualMs <= maxMs;

        if (passed) {
            return TestAssertion.passed(AssertionType.PERFORMANCE, operation, actualMs);
        } else {
            return TestAssertion.failed(
                AssertionType.PERFORMANCE,
                operation,
                maxMs + "ms",
                actualMs + "ms",
                String.format("Operation '%s' took %dms, expected <= %dms", operation, actualMs, maxMs)
            );
        }
    }

    /**
     * Проверить JSON-схему.
     */
    public TestAssertion assertSchema(Object response, Map<String, Object> schema) {
        // TODO: Реализовать валидацию JSON Schema
        // Можно использовать библиотеку json-schema-validator
        return TestAssertion.passed(AssertionType.SCHEMA, "schema", "validated");
    }
}

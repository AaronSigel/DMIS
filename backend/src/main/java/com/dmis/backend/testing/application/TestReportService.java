package com.dmis.backend.testing.application;

import com.dmis.backend.testing.domain.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Генерация отчётов о выполнении тестовых сессий.
 */
@Service
public class TestReportService {
    private final ObjectMapper objectMapper;

    public TestReportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Сгенерировать отчёт по сессии.
     */
    public Map<String, Object> generateReport(TestSession session) {
        Map<String, Object> report = new HashMap<>();

        report.put("sessionId", session.getId());
        report.put("name", session.getName());
        report.put("status", session.getStatus().name());
        report.put("isolationLevel", session.getIsolationLevel().name());
        report.put("createdAt", session.getCreatedAt().toString());
        report.put("startedAt", session.getStartedAt() != null ? session.getStartedAt().toString() : null);
        report.put("finishedAt", session.getFinishedAt() != null ? session.getFinishedAt().toString() : null);
        report.put("durationMs", session.getDurationMs());

        List<Map<String, Object>> steps = session.getSteps().stream()
            .map(this::stepToMap)
            .collect(Collectors.toList());
        report.put("steps", steps);

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", steps.size());
        summary.put("passed", steps.stream().filter(s -> "PASSED".equals(s.get("status"))).count());
        summary.put("failed", steps.stream().filter(s -> "FAILED".equals(s.get("status"))).count());
        summary.put("skipped", steps.stream().filter(s -> "SKIPPED".equals(s.get("status"))).count());
        report.put("summary", summary);

        return report;
    }

    /**
     * Экспортировать отчёт в JSON.
     */
    public String exportAsJson(TestSession session) {
        try {
            Map<String, Object> report = generateReport(session);
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(report);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export report as JSON", e);
        }
    }

    /**
     * Экспортировать отчёт в Markdown.
     */
    public String exportAsMarkdown(TestSession session) {
        StringBuilder md = new StringBuilder();

        md.append("# Test Report: ").append(session.getName()).append("\n\n");
        md.append("**Session ID**: `").append(session.getId()).append("`\n");
        md.append("**Status**: ").append(session.getStatus()).append("\n");
        md.append("**Duration**: ").append(session.getDurationMs()).append("ms\n\n");

        md.append("## Summary\n\n");
        long total = session.getSteps().size();
        long passed = session.getSteps().stream().filter(s -> s.getStatus() == TestStepStatus.PASSED).count();
        long failed = session.getSteps().stream().filter(s -> s.getStatus() == TestStepStatus.FAILED).count();

        md.append("- **Total**: ").append(total).append("\n");
        md.append("- **Passed**: ").append(passed).append("\n");
        md.append("- **Failed**: ").append(failed).append("\n\n");

        md.append("## Steps\n\n");
        for (TestStep step : session.getSteps()) {
            String icon = step.getStatus() == TestStepStatus.PASSED ? "✅" : "❌";
            md.append("### ").append(icon).append(" ").append(step.getName()).append("\n\n");
            md.append("- **Type**: ").append(step.getType()).append("\n");
            md.append("- **Status**: ").append(step.getStatus()).append("\n");
            md.append("- **Duration**: ").append(step.getDurationMs()).append("ms\n");

            if (step.getErrorMessage() != null) {
                md.append("- **Error**: ").append(step.getErrorMessage()).append("\n");
            }

            if (!step.getAssertions().isEmpty()) {
                md.append("\n**Assertions**:\n\n");
                for (TestAssertion assertion : step.getAssertions()) {
                    String assertIcon = assertion.isPassed() ? "✓" : "✗";
                    md.append("- ").append(assertIcon).append(" ")
                        .append(assertion.getType()).append(" at `").append(assertion.getPath()).append("`");
                    if (!assertion.isPassed()) {
                        md.append(" (expected: ").append(assertion.getExpected())
                            .append(", actual: ").append(assertion.getActual()).append(")");
                    }
                    md.append("\n");
                }
            }

            md.append("\n");
        }

        return md.toString();
    }

    /**
     * Экспортировать отчёт в JUnit XML.
     */
    public String exportAsJUnit(TestSession session) {
        StringBuilder xml = new StringBuilder();

        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<testsuite name=\"").append(escapeXml(session.getName())).append("\" ");
        xml.append("tests=\"").append(session.getSteps().size()).append("\" ");

        long failures = session.getSteps().stream()
            .filter(s -> s.getStatus() == TestStepStatus.FAILED)
            .count();
        xml.append("failures=\"").append(failures).append("\" ");
        xml.append("time=\"").append(session.getDurationMs() / 1000.0).append("\">\n");

        for (TestStep step : session.getSteps()) {
            xml.append("  <testcase name=\"").append(escapeXml(step.getName())).append("\" ");
            xml.append("classname=\"").append(escapeXml(session.getName())).append("\" ");
            xml.append("time=\"").append(step.getDurationMs() / 1000.0).append("\"");

            if (step.getStatus() == TestStepStatus.FAILED) {
                xml.append(">\n");
                xml.append("    <failure message=\"").append(escapeXml(step.getErrorMessage())).append("\"/>\n");
                xml.append("  </testcase>\n");
            } else {
                xml.append("/>\n");
            }
        }

        xml.append("</testsuite>\n");

        return xml.toString();
    }

    private Map<String, Object> stepToMap(TestStep step) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", step.getName());
        map.put("type", step.getType().name());
        map.put("status", step.getStatus().name());
        map.put("durationMs", step.getDurationMs());
        map.put("errorMessage", step.getErrorMessage());
        map.put("screenshotPath", step.getScreenshotPath());

        List<Map<String, Object>> assertions = step.getAssertions().stream()
            .map(this::assertionToMap)
            .collect(Collectors.toList());
        map.put("assertions", assertions);

        return map;
    }

    private Map<String, Object> assertionToMap(TestAssertion assertion) {
        Map<String, Object> map = new HashMap<>();
        map.put("type", assertion.getType().name());
        map.put("path", assertion.getPath());
        map.put("expected", assertion.getExpected());
        map.put("actual", assertion.getActual());
        map.put("passed", assertion.isPassed());
        map.put("message", assertion.getMessage());
        return map;
    }

    private String escapeXml(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;");
    }
}

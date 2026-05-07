package com.dmis.backend.platform.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.util.List;

@RestController
public class PrometheusActuatorFallbackController {
    private final List<Object> candidateBeans;

    public PrometheusActuatorFallbackController(ObjectProvider<List<Object>> candidateBeansProvider) {
        this.candidateBeans = candidateBeansProvider.getIfAvailable(List::of);
    }

    @GetMapping(value = "/actuator/prometheus", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> scrapePrometheus() {
        for (Object bean : candidateBeans) {
            try {
                Method scrapeMethod = bean.getClass().getMethod("scrape");
                Object result = scrapeMethod.invoke(bean);
                if (result instanceof String content) {
                    return ResponseEntity.ok(content);
                }
            } catch (ReflectiveOperationException ignored) {
                // Игнорируем бины без scrape API и продолжаем поиск.
            }
        }
        return ResponseEntity.ok("# Prometheus registry is not available");
    }
}

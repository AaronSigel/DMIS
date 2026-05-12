package com.dmis.backend.search.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SearchMetricsConfig {

    @Bean
    public Timer ragRetrievalTimer(MeterRegistry registry) {
        return Timer.builder("rag.retrieval")
                .description("RAG retrieval latency")
                .tag("component", "search")
                .register(registry);
    }

    @Bean
    public Timer ragRerankTimer(MeterRegistry registry) {
        return Timer.builder("rag.rerank")
                .description("RAG rerank latency")
                .tag("component", "search")
                .register(registry);
    }

    @Bean
    public Timer ragLlmTimer(MeterRegistry registry) {
        return Timer.builder("rag.llm")
                .description("RAG LLM generation latency")
                .tag("component", "search")
                .register(registry);
    }

    @Bean
    public Timer ragTotalTimer(MeterRegistry registry) {
        return Timer.builder("rag.total")
                .description("RAG total latency")
                .tag("component", "search")
                .register(registry);
    }
}

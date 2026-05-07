package com.dmis.backend.platform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Конфигурация асинхронной обработки задач индексации документов.
 *
 * <p>В production используется {@link ThreadPoolTaskExecutor}: upload возвращает
 * быстро, а {@code IndexingWorker.dispatch} выполняется на фоновом потоке.
 *
 * <p>В test-профиле бин {@code indexingExecutor} заменяется на no-op исполнитель:
 * вызов {@code dispatch} не запускает обработку, и интеграционные тесты явно
 * драйвят очередь через {@code IndexingWorker.flushPending()}. Это исключает
 * гонки между фоновым потоком и assert'ами теста.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncIndexingConfig {

    @Bean(name = "indexingExecutor")
    @Profile("!test")
    public TaskExecutor indexingExecutor(
            @Value("${indexing.executor.core-size:2}") int coreSize,
            @Value("${indexing.executor.max-size:4}") int maxSize,
            @Value("${indexing.executor.queue-capacity:100}") int queueCapacity
    ) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(coreSize);
        executor.setMaxPoolSize(maxSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("indexing-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    @Bean(name = "indexingExecutor")
    @Profile("test")
    public TaskExecutor indexingExecutorForTests() {
        return runnable -> {
            // no-op: tests drive the queue explicitly via IndexingWorker.flushPending()
        };
    }
}

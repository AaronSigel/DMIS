package com.dmis.backend.integrations.infra.http.retry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.RetryCallback;
import org.springframework.retry.RetryContext;
import org.springframework.retry.RetryPolicy;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.context.RetryContextSupport;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.function.Predicate;

@Component
public class HttpRetryHelper {
    private final int maxAttempts;
    private final long initialBackoffMs;
    private final long maxBackoffMs;
    private final double multiplier;

    @Autowired
    public HttpRetryHelper(
            @Value("${http.retry.max-attempts:3}") int maxAttempts,
            @Value("${http.retry.initial-backoff-ms:200}") long initialBackoffMs,
            @Value("${http.retry.max-backoff-ms:2000}") long maxBackoffMs,
            @Value("${http.retry.multiplier:2.0}") double multiplier
    ) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.initialBackoffMs = Math.max(1L, initialBackoffMs);
        this.maxBackoffMs = Math.max(this.initialBackoffMs, maxBackoffMs);
        this.multiplier = Math.max(1.0d, multiplier);
    }

    public static HttpRetryHelper forTests(
            int maxAttempts,
            long initialBackoffMs,
            long maxBackoffMs,
            double multiplier
    ) {
        return new HttpRetryHelper(maxAttempts, initialBackoffMs, maxBackoffMs, multiplier, true);
    }

    private HttpRetryHelper(
            int maxAttempts,
            long initialBackoffMs,
            long maxBackoffMs,
            double multiplier,
            boolean ignored
    ) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.initialBackoffMs = Math.max(1L, initialBackoffMs);
        this.maxBackoffMs = Math.max(this.initialBackoffMs, maxBackoffMs);
        this.multiplier = Math.max(1.0d, multiplier);
    }

    public <T> T execute(
            String operationName,
            RetryableCall<T> call,
            Predicate<Throwable> retryablePredicate
    ) {
        RetryTemplate template = buildTemplate(retryablePredicate);
        try {
            return template.execute(
                    (RetryCallback<T, Exception>) context -> call.call(),
                    context -> {
                        Throwable last = context.getLastThrowable();
                        if (context.getRetryCount() < maxAttempts) {
                            // Неретраябельная ошибка — прокидываем оригинальное исключение
                            if (last instanceof RuntimeException rte) {
                                throw rte;
                            }
                            throw new IllegalStateException(operationName + " failed", last);
                        }
                        throw new IllegalStateException(
                                operationName + " failed after " + maxAttempts + " attempts",
                                last
                        );
                    }
            );
        } catch (RuntimeException runtimeException) {
            throw runtimeException;
        } catch (Exception exception) {
            throw new IllegalStateException(operationName + " failed", exception);
        }
    }

    public static boolean retryOnServerErrorOrTransient(Throwable throwable) {
        Throwable cursor = throwable;
        while (cursor != null) {
            if (cursor instanceof HttpServerErrorException || cursor instanceof ResourceAccessException) {
                return true;
            }
            cursor = cursor.getCause();
        }
        return false;
    }

    private RetryTemplate buildTemplate(Predicate<Throwable> retryablePredicate) {
        RetryTemplate template = new RetryTemplate();
        template.setRetryPolicy(new RetryPolicy() {
            @Override
            public boolean canRetry(RetryContext context) {
                Throwable last = context.getLastThrowable();
                if (last != null && !retryablePredicate.test(last)) {
                    return false;
                }
                return context.getRetryCount() < maxAttempts;
            }

            @Override
            public RetryContext open(RetryContext parent) {
                return new RetryContextSupport(parent);
            }

            @Override
            public void close(RetryContext context) {
            }

            @Override
            public void registerThrowable(RetryContext context, Throwable throwable) {
                ((RetryContextSupport) context).registerThrowable(throwable);
            }
        });
        ExponentialBackOffPolicy backOff = new ExponentialBackOffPolicy();
        backOff.setInitialInterval(initialBackoffMs);
        backOff.setMaxInterval(maxBackoffMs);
        backOff.setMultiplier(multiplier);
        template.setBackOffPolicy(backOff);
        return template;
    }

    @FunctionalInterface
    public interface RetryableCall<T> {
        T call() throws Exception;
    }
}

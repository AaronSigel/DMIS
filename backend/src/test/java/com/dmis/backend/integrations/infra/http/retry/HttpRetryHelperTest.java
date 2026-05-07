package com.dmis.backend.integrations.infra.http.retry;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpServerErrorException;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HttpRetryHelperTest {
    @Test
    void retriesRetryableFailureAndReturnsSuccessfulValue() {
        HttpRetryHelper helper = HttpRetryHelper.forTests(3, 1, 2, 2.0d);
        AtomicInteger attempts = new AtomicInteger();

        String result = helper.execute(
                "test-op",
                () -> {
                    int current = attempts.incrementAndGet();
                    if (current < 3) {
                        throw new RuntimeException("temporary");
                    }
                    return "ok";
                },
                ex -> ex instanceof RuntimeException
        );

        assertEquals("ok", result);
        assertEquals(3, attempts.get());
    }

    @Test
    void doesNotRetryForNonRetryableFailure() {
        HttpRetryHelper helper = HttpRetryHelper.forTests(3, 1, 2, 2.0d);
        AtomicInteger attempts = new AtomicInteger();

        assertThrows(
                IllegalArgumentException.class,
                () -> helper.execute(
                        "test-op",
                        () -> {
                            attempts.incrementAndGet();
                            throw new IllegalArgumentException("bad request");
                        },
                        HttpRetryHelper::retryOnServerErrorOrTransient
                )
        );
        assertEquals(1, attempts.get());
    }

    @Test
    void failsAfterMaxAttemptsForRetryableFailure() {
        HttpRetryHelper helper = HttpRetryHelper.forTests(3, 1, 2, 2.0d);
        AtomicInteger attempts = new AtomicInteger();

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> helper.execute(
                        "test-op",
                        () -> {
                            attempts.incrementAndGet();
                            throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
                        },
                        HttpRetryHelper::retryOnServerErrorOrTransient
                )
        );
        assertEquals(3, attempts.get());
        assertTrue(ex.getMessage().contains("failed after 3 attempts"));
    }
}

package com.dmis.backend.auth.infra.ratelimit;

import com.dmis.backend.auth.application.port.RateLimiterPort;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

/**
 * In-memory реализация {@link RateLimiterPort} на bucket4j.
 * Один бакет на ключ (например, IP-адрес). Состояние не переживает рестарт —
 * это сознательный выбор для MVP без Redis.
 */
@Component
public class BucketRateLimiter implements RateLimiterPort {
    private final long capacity;
    private final long refillTokens;
    private final Duration refillPeriod;
    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public BucketRateLimiter(
            @Value("${security.rate-limit.login.capacity:5}") long capacity,
            @Value("${security.rate-limit.login.refill-tokens:5}") long refillTokens,
            @Value("${security.rate-limit.login.refill-period-seconds:60}") long refillPeriodSeconds
    ) {
        this.capacity = Math.max(1L, capacity);
        this.refillTokens = Math.max(1L, refillTokens);
        this.refillPeriod = Duration.ofSeconds(Math.max(1L, refillPeriodSeconds));
    }

    @Override
    public Verdict tryConsume(String key) {
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> newBucket());
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1L);
        if (probe.isConsumed()) {
            return new Verdict(true, 0L);
        }
        long waitNanos = probe.getNanosToWaitForRefill();
        long retryAfterSeconds = Math.max(1L, TimeUnit.NANOSECONDS.toSeconds(waitNanos)
                + (waitNanos % TimeUnit.SECONDS.toNanos(1L) == 0L ? 0L : 1L));
        return new Verdict(false, retryAfterSeconds);
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, refillPeriod)
                .build();
        return Bucket.builder().addLimit(limit).build();
    }
}

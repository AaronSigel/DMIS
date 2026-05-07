package com.dmis.backend.documents.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Доменная модель задачи индексации документа.
 * Иммутабельна: каждое изменение состояния возвращает новый экземпляр.
 */
public final class IndexingJob {
    private static final int MAX_LAST_ERROR_LENGTH = 4000;

    private final String jobId;
    private final String documentId;
    private final IndexingJobStatus status;
    private final int attempts;
    private final String lastError;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final Instant startedAt;
    private final Instant finishedAt;

    private IndexingJob(
            String jobId,
            String documentId,
            IndexingJobStatus status,
            int attempts,
            String lastError,
            Instant createdAt,
            Instant updatedAt,
            Instant startedAt,
            Instant finishedAt
    ) {
        if (jobId == null || jobId.isBlank()) {
            throw new IllegalArgumentException("Job id is required");
        }
        if (documentId == null || documentId.isBlank()) {
            throw new IllegalArgumentException("Document id is required");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }
        if (attempts < 0) {
            throw new IllegalArgumentException("Attempts must be non-negative");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("createdAt is required");
        }
        if (updatedAt == null) {
            throw new IllegalArgumentException("updatedAt is required");
        }
        this.jobId = jobId;
        this.documentId = documentId;
        this.status = status;
        this.attempts = attempts;
        this.lastError = lastError;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.startedAt = startedAt;
        this.finishedAt = finishedAt;
    }

    public static IndexingJob enqueue(String jobId, String documentId, Instant now) {
        return new IndexingJob(
                jobId,
                documentId,
                IndexingJobStatus.PENDING,
                0,
                null,
                now,
                now,
                null,
                null
        );
    }

    public static IndexingJob rehydrate(
            String jobId,
            String documentId,
            IndexingJobStatus status,
            int attempts,
            String lastError,
            Instant createdAt,
            Instant updatedAt,
            Instant startedAt,
            Instant finishedAt
    ) {
        return new IndexingJob(
                jobId,
                documentId,
                status,
                attempts,
                lastError,
                createdAt,
                updatedAt,
                startedAt,
                finishedAt
        );
    }

    /** Перевести джобу в RUNNING, увеличить attempts и зафиксировать startedAt. */
    public IndexingJob claim(Instant now) {
        return new IndexingJob(
                jobId,
                documentId,
                IndexingJobStatus.RUNNING,
                attempts + 1,
                lastError,
                createdAt,
                now,
                now,
                null
        );
    }

    /** Завершить успешно. */
    public IndexingJob complete(Instant now) {
        return new IndexingJob(
                jobId,
                documentId,
                IndexingJobStatus.DONE,
                attempts,
                null,
                createdAt,
                now,
                startedAt,
                now
        );
    }

    /** Перевести в FAILED с описанием ошибки. */
    public IndexingJob fail(Instant now, String message) {
        return new IndexingJob(
                jobId,
                documentId,
                IndexingJobStatus.FAILED,
                attempts,
                truncate(message),
                createdAt,
                now,
                startedAt,
                now
        );
    }

    /** Сбросить «зависшую» RUNNING обратно в PENDING (для повторной попытки воркером). */
    public IndexingJob resetToPending(Instant now, String message) {
        return new IndexingJob(
                jobId,
                documentId,
                IndexingJobStatus.PENDING,
                attempts,
                truncate(message),
                createdAt,
                now,
                null,
                null
        );
    }

    public boolean isRetryable(int maxAttempts) {
        return attempts < maxAttempts;
    }

    public String jobId() {
        return jobId;
    }

    public String documentId() {
        return documentId;
    }

    public IndexingJobStatus status() {
        return status;
    }

    public int attempts() {
        return attempts;
    }

    public String lastError() {
        return lastError;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant updatedAt() {
        return updatedAt;
    }

    public Instant startedAt() {
        return startedAt;
    }

    public Instant finishedAt() {
        return finishedAt;
    }

    private static String truncate(String message) {
        if (message == null) {
            return null;
        }
        if (message.length() <= MAX_LAST_ERROR_LENGTH) {
            return message;
        }
        return message.substring(0, MAX_LAST_ERROR_LENGTH);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof IndexingJob other)) {
            return false;
        }
        return jobId.equals(other.jobId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId);
    }
}

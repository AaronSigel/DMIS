package com.dmis.backend.documents.application.port;

import com.dmis.backend.documents.domain.model.IndexingJob;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Порт хранения задач индексации документов.
 */
public interface IndexingJobPort {
    /** Сохранить новую PENDING-задачу в очередь. */
    IndexingJob enqueue(String documentId, Instant now);

    /** Сохранить (upsert) состояние задачи. */
    IndexingJob save(IndexingJob job);

    Optional<IndexingJob> findById(String jobId);

    /** Список PENDING-задач, отсортированных по createdAt. */
    List<IndexingJob> findPending();

    /** Список «зависших» RUNNING задач (startedAt раньше threshold). */
    List<IndexingJob> findStuckRunning(Instant threshold);
}

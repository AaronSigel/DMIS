package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.IndexingJobPort;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexingJob;
import com.dmis.backend.documents.domain.model.IndexingJobStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Воркер индексации документов: обрабатывает очередь indexing_jobs вне HTTP-потока.
 *
 * <p>Стратегии запуска:
 * <ul>
 *     <li>{@link #dispatch(String)} — асинхронный запуск конкретного job (используется из upload).</li>
 *     <li>{@link #scanPending()} — периодический backfill: поднимает забытые/застрявшие задачи.</li>
 *     <li>{@link #flushPending()} — синхронный прогон очереди (используется из тестов).</li>
 * </ul>
 */
@Component
public class IndexingWorker {
    private static final Logger LOG = LoggerFactory.getLogger(IndexingWorker.class);

    private final IndexingJobPort indexingJobPort;
    private final DocumentPort documentPort;
    private final DocumentIndexingService documentIndexingService;
    private final AuditService auditService;
    private final long runningTimeoutMs;

    public IndexingWorker(
            IndexingJobPort indexingJobPort,
            DocumentPort documentPort,
            DocumentIndexingService documentIndexingService,
            AuditService auditService,
            @Value("${indexing.worker.running-timeout-ms:120000}") long runningTimeoutMs
    ) {
        this.indexingJobPort = indexingJobPort;
        this.documentPort = documentPort;
        this.documentIndexingService = documentIndexingService;
        this.auditService = auditService;
        this.runningTimeoutMs = runningTimeoutMs;
    }

    /** Асинхронно обработать конкретную задачу индексации. */
    @Async("indexingExecutor")
    public void dispatch(String jobId) {
        processJob(jobId);
    }

    /**
     * Периодически опрашивает очередь и запускает задачи, которые не были диспатчены
     * (например, после падения JVM или переполнения очереди executor'а).
     */
    @Scheduled(fixedDelayString = "${indexing.worker.poll-delay-ms:5000}")
    public void scanPending() {
        try {
            resetStuckRunning();
        } catch (RuntimeException e) {
            LOG.warn("Failed to reset stuck running jobs", e);
        }
        try {
            List<IndexingJob> pending = indexingJobPort.findPending();
            for (IndexingJob job : pending) {
                dispatch(job.jobId());
            }
        } catch (RuntimeException e) {
            LOG.warn("Failed to scan pending indexing jobs", e);
        }
    }

    /**
     * Синхронно прогнать все накопившиеся PENDING-задачи и поднять застрявшие RUNNING.
     * Предназначен для интеграционных тестов и операционных утилит.
     */
    public void flushPending() {
        resetStuckRunning();
        List<IndexingJob> pending = indexingJobPort.findPending();
        for (IndexingJob job : pending) {
            processJob(job.jobId());
        }
    }

    private void resetStuckRunning() {
        Instant threshold = Instant.now().minusMillis(runningTimeoutMs);
        List<IndexingJob> stuck = indexingJobPort.findStuckRunning(threshold);
        for (IndexingJob job : stuck) {
            indexingJobPort.save(job.resetToPending(Instant.now(), "reset stuck RUNNING job"));
            LOG.warn("Reset stuck indexing job {} (document {})", job.jobId(), job.documentId());
        }
    }

    private void processJob(String jobId) {
        Optional<IndexingJob> maybeJob = indexingJobPort.findById(jobId);
        if (maybeJob.isEmpty()) {
            LOG.warn("Indexing job {} not found", jobId);
            return;
        }
        IndexingJob job = maybeJob.get();
        if (job.status() != IndexingJobStatus.PENDING) {
            return;
        }
        IndexingJob claimed = indexingJobPort.save(job.claim(Instant.now()));

        Optional<Document> maybeDoc = documentPort.findById(DocumentId.from(claimed.documentId()));
        if (maybeDoc.isEmpty()) {
            indexingJobPort.save(claimed.fail(Instant.now(), "document not found"));
            LOG.warn("Indexing job {} aborted: document {} not found", claimed.jobId(), claimed.documentId());
            return;
        }
        Document document = maybeDoc.get();

        try {
            int chunks = documentIndexingService.index(document.id().value(), document.fullExtractedText());
            Instant now = Instant.now();
            documentPort.save(document.markIndexed(chunks, now));
            indexingJobPort.save(claimed.complete(now));
            auditService.append(
                    document.ownerId(),
                    "document.index",
                    "document",
                    document.id().value(),
                    "Indexed " + chunks + " chunks"
            );
        } catch (RuntimeException exception) {
            Instant now = Instant.now();
            documentPort.save(document.markFailed(now));
            String message = exception.getMessage() == null ? exception.getClass().getSimpleName() : exception.getMessage();
            indexingJobPort.save(claimed.fail(now, message));
            auditService.append(
                    document.ownerId(),
                    "document.index.failed",
                    "document",
                    document.id().value(),
                    "Indexing failed: " + message
            );
            LOG.warn("Indexing job {} failed for document {}", claimed.jobId(), document.id().value(), exception);
        }
    }
}

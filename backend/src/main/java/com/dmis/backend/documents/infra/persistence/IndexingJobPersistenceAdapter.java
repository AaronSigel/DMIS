package com.dmis.backend.documents.infra.persistence;

import com.dmis.backend.documents.application.port.IndexingJobPort;
import com.dmis.backend.documents.domain.model.IndexingJob;
import com.dmis.backend.documents.domain.model.IndexingJobStatus;
import com.dmis.backend.documents.infra.persistence.entity.IndexingJobEntity;
import com.dmis.backend.documents.infra.persistence.repository.IndexingJobJpaRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class IndexingJobPersistenceAdapter implements IndexingJobPort {
    private final IndexingJobJpaRepository repository;

    public IndexingJobPersistenceAdapter(IndexingJobJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public IndexingJob enqueue(String documentId, Instant now) {
        String jobId = "ijob-" + UUID.randomUUID();
        IndexingJob job = IndexingJob.enqueue(jobId, documentId, now);
        return save(job);
    }

    @Override
    public IndexingJob save(IndexingJob job) {
        IndexingJobEntity entity = new IndexingJobEntity(
                job.jobId(),
                job.documentId(),
                job.status().name(),
                job.attempts(),
                job.lastError(),
                job.createdAt(),
                job.updatedAt(),
                job.startedAt(),
                job.finishedAt()
        );
        repository.save(entity);
        return findById(job.jobId()).orElseThrow();
    }

    @Override
    public Optional<IndexingJob> findById(String jobId) {
        return repository.findById(jobId).map(this::toDomain);
    }

    @Override
    public List<IndexingJob> findPending() {
        return repository.findByStatusOrderByCreatedAtAsc(IndexingJobStatus.PENDING.name())
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<IndexingJob> findStuckRunning(Instant threshold) {
        return repository.findByStatusAndStartedAtBefore(IndexingJobStatus.RUNNING.name(), threshold)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private IndexingJob toDomain(IndexingJobEntity entity) {
        return IndexingJob.rehydrate(
                entity.getJobId(),
                entity.getDocumentId(),
                IndexingJobStatus.valueOf(entity.getStatus()),
                entity.getAttempts(),
                entity.getLastError(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getStartedAt(),
                entity.getFinishedAt()
        );
    }
}

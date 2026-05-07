package com.dmis.backend.documents.infra.persistence.repository;

import com.dmis.backend.documents.infra.persistence.entity.IndexingJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface IndexingJobJpaRepository extends JpaRepository<IndexingJobEntity, String> {
    List<IndexingJobEntity> findByStatusOrderByCreatedAtAsc(String status);

    List<IndexingJobEntity> findByStatusAndStartedAtBefore(String status, Instant threshold);
}

package com.dmis.backend.integrations.infra.persistence.repository;

import com.dmis.backend.integrations.infra.persistence.entity.CalendarEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CalendarEventJpaRepository extends JpaRepository<CalendarEventEntity, String> {

    List<CalendarEventEntity> findByCreatedByOrderByStartIsoAsc(String createdBy);

    List<CalendarEventEntity> findAllByOrderByStartIsoAsc();

    @Query("""
            SELECT e FROM CalendarEventEntity e
            WHERE e.createdBy = :createdBy
              AND e.endIso > :rangeStart
              AND e.startIso < :rangeEnd
            ORDER BY e.startIso ASC
            """)
    List<CalendarEventEntity> findByCreatedByOverlappingRange(
            @Param("createdBy") String createdBy,
            @Param("rangeStart") String rangeStart,
            @Param("rangeEnd") String rangeEnd
    );

    @Query("""
            SELECT e FROM CalendarEventEntity e
            WHERE e.endIso > :rangeStart
              AND e.startIso < :rangeEnd
            ORDER BY e.startIso ASC
            """)
    List<CalendarEventEntity> findAllOverlappingRange(
            @Param("rangeStart") String rangeStart,
            @Param("rangeEnd") String rangeEnd
    );
}

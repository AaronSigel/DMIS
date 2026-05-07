package com.dmis.backend.auth.infra.persistence.repository;

import com.dmis.backend.auth.infra.persistence.entity.AuthRefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface AuthRefreshTokenJpaRepository extends JpaRepository<AuthRefreshTokenEntity, String> {
    @Modifying
    @Query("""
            UPDATE AuthRefreshTokenEntity t
               SET t.replacedByTokenId = :replacedByTokenId
             WHERE t.tokenId = :tokenId
               AND t.replacedByTokenId IS NULL
               AND t.revokedAt IS NULL
            """)
    int markAsRotated(@Param("tokenId") String tokenId, @Param("replacedByTokenId") String replacedByTokenId);

    @Modifying
    @Query("""
            UPDATE AuthRefreshTokenEntity t
               SET t.revokedAt = :revokedAt,
                   t.revokedReason = :reason
             WHERE t.familyId = :familyId
               AND t.revokedAt IS NULL
            """)
    int revokeFamily(@Param("familyId") String familyId, @Param("revokedAt") Instant revokedAt, @Param("reason") String reason);
}

package com.dmis.backend.auth.application.port;

import com.dmis.backend.auth.application.RefreshTokenRevokeReason;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenStatePort {
    void create(RefreshTokenRecord record);

    Optional<RefreshTokenRecord> findByTokenId(String tokenId);

    boolean markAsRotated(String tokenId, String replacedByTokenId);

    void revokeFamily(String familyId, Instant revokedAt, RefreshTokenRevokeReason reason);

    record RefreshTokenRecord(
            String tokenId,
            String familyId,
            String userId,
            Instant issuedAt,
            Instant expiresAt,
            String replacedByTokenId,
            Instant revokedAt,
            String revokedReason
    ) {
    }
}

package com.dmis.backend.auth.infra.persistence;

import com.dmis.backend.auth.application.RefreshTokenRevokeReason;
import com.dmis.backend.auth.application.port.RefreshTokenStatePort;
import com.dmis.backend.auth.infra.persistence.entity.AuthRefreshTokenEntity;
import com.dmis.backend.auth.infra.persistence.repository.AuthRefreshTokenJpaRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
public class RefreshTokenStatePersistenceAdapter implements RefreshTokenStatePort {
    private final AuthRefreshTokenJpaRepository repository;

    public RefreshTokenStatePersistenceAdapter(AuthRefreshTokenJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public void create(RefreshTokenRecord record) {
        repository.save(toEntity(record));
    }

    @Override
    public Optional<RefreshTokenRecord> findByTokenId(String tokenId) {
        return repository.findById(tokenId).map(this::toRecord);
    }

    @Override
    public boolean markAsRotated(String tokenId, String replacedByTokenId) {
        return repository.markAsRotated(tokenId, replacedByTokenId) > 0;
    }

    @Override
    public void revokeFamily(String familyId, Instant revokedAt, RefreshTokenRevokeReason reason) {
        repository.revokeFamily(familyId, revokedAt, reason.name());
    }

    private AuthRefreshTokenEntity toEntity(RefreshTokenRecord record) {
        return new AuthRefreshTokenEntity(
                record.tokenId(),
                record.familyId(),
                record.userId(),
                record.issuedAt(),
                record.expiresAt(),
                record.replacedByTokenId(),
                record.revokedAt(),
                record.revokedReason()
        );
    }

    private RefreshTokenRecord toRecord(AuthRefreshTokenEntity entity) {
        return new RefreshTokenRecord(
                entity.getTokenId(),
                entity.getFamilyId(),
                entity.getUserId(),
                entity.getIssuedAt(),
                entity.getExpiresAt(),
                entity.getReplacedByTokenId(),
                entity.getRevokedAt(),
                entity.getRevokedReason()
        );
    }
}

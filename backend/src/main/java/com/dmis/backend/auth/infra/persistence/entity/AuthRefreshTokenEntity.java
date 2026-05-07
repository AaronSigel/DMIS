package com.dmis.backend.auth.infra.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "auth_refresh_tokens")
public class AuthRefreshTokenEntity {
    @Id
    @Column(name = "token_id", nullable = false)
    private String tokenId;

    @Column(name = "family_id", nullable = false)
    private String familyId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "replaced_by_token_id")
    private String replacedByTokenId;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revoked_reason")
    private String revokedReason;

    protected AuthRefreshTokenEntity() {
    }

    public AuthRefreshTokenEntity(
            String tokenId,
            String familyId,
            String userId,
            Instant issuedAt,
            Instant expiresAt,
            String replacedByTokenId,
            Instant revokedAt,
            String revokedReason
    ) {
        this.tokenId = tokenId;
        this.familyId = familyId;
        this.userId = userId;
        this.issuedAt = issuedAt;
        this.expiresAt = expiresAt;
        this.replacedByTokenId = replacedByTokenId;
        this.revokedAt = revokedAt;
        this.revokedReason = revokedReason;
    }

    public String getTokenId() {
        return tokenId;
    }

    public String getFamilyId() {
        return familyId;
    }

    public String getUserId() {
        return userId;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public String getReplacedByTokenId() {
        return replacedByTokenId;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getRevokedReason() {
        return revokedReason;
    }
}

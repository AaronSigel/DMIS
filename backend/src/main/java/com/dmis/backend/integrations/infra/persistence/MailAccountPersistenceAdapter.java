package com.dmis.backend.integrations.infra.persistence;

import com.dmis.backend.integrations.application.port.MailAccountPort;
import com.dmis.backend.integrations.infra.persistence.entity.MailAccountEntity;
import com.dmis.backend.integrations.infra.persistence.repository.MailAccountJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class MailAccountPersistenceAdapter implements MailAccountPort {
    private final MailAccountJpaRepository repository;

    public MailAccountPersistenceAdapter(MailAccountJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<MailAccountRecord> findByOwnerId(String ownerId) {
        return repository.findById(ownerId).map(this::toRecord);
    }

    @Override
    public void upsert(MailAccountRecord record) {
        repository.save(new MailAccountEntity(
                record.ownerId(),
                record.imapHost(),
                record.imapPort(),
                record.imapUsername(),
                record.encryptedPassword(),
                record.updatedAt()
        ));
    }

    @Override
    public void deleteByOwnerId(String ownerId) {
        repository.deleteById(ownerId);
    }

    private MailAccountRecord toRecord(MailAccountEntity entity) {
        return new MailAccountRecord(
                entity.getOwnerId(),
                entity.getImapHost(),
                entity.getImapPort(),
                entity.getImapUsername(),
                entity.getEncryptedPassword(),
                entity.getUpdatedAt()
        );
    }
}


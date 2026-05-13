package com.dmis.backend.documents.application.port;

import com.dmis.backend.documents.domain.DocumentAccessLevel;

import java.util.List;
import java.util.Optional;

/**
 * Порт доступа к явным document-grants (READ / WRITE / OWNER).
 *
 * Используется {@code AclService} для проверки прав и {@code DocumentUseCases.list}
 * для фильтрации видимых документов.
 */
public interface DocumentAccessPort {

    /**
     * Уровень доступа конкретного principal'а к документу (если grant существует).
     */
    Optional<DocumentAccessLevel> findLevel(String documentId, String principalId);

    /**
     * Список идентификаторов документов, на которые у principal'а есть любой grant.
     */
    List<String> findAccessibleDocumentIds(String principalId);
}

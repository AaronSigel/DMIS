package com.dmis.backend.documents.application;

import com.dmis.backend.audit.application.AuditService;
import com.dmis.backend.documents.application.dto.DocumentDtos;
import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.application.port.DocumentMalwareScanPort;
import com.dmis.backend.documents.application.port.DocumentPort;
import com.dmis.backend.documents.application.port.IndexingJobPort;
import com.dmis.backend.documents.application.port.TextExtractionPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.dmis.backend.documents.domain.model.Document;
import com.dmis.backend.documents.domain.model.DocumentId;
import com.dmis.backend.documents.domain.model.IndexStatus;
import com.dmis.backend.integrations.application.port.ObjectStoragePort;
import com.dmis.backend.platform.config.StorageProperties;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import com.dmis.backend.shared.security.AclService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

/**
 * Юнит-тест фильтрации документов по новой ACL-модели:
 * owner / ADMIN / явные grants / роль VIEWER (read-only по grant).
 */
class DocumentAccessFilterTest {

    private static final String DOC_ID = "doc-1";
    private static final String OWNER_ID = "u-alice";

    private InMemoryDocumentAccessPort accessPort;
    private InMemoryDocumentPort documentPort;
    private AclService aclService;
    private DocumentUseCases useCases;
    private Document document;

    private final UserView admin = user("u-admin", RoleName.ADMIN);
    private final UserView alice = user(OWNER_ID, RoleName.USER);
    private final UserView bob = user("u-bob", RoleName.USER);
    private final UserView viewer = user("u-viewer", RoleName.VIEWER);
    // Пользователь с обеими ролями: USER должен иметь приоритет над VIEWER —
    // добавление VIEWER к USER не должно молча понижать права.
    private final UserView aliceUserAndViewer = new UserView(
            OWNER_ID,
            OWNER_ID + "@example.com",
            OWNER_ID,
            Set.of(RoleName.USER, RoleName.VIEWER)
    );

    @BeforeEach
    void setUp() {
        Instant now = Instant.parse("2026-05-01T10:00:00Z");
        document = Document.rehydrate(
                DocumentId.from(DOC_ID),
                "alice-doc",
                OWNER_ID,
                "",
                List.of(),
                "upload",
                "general",
                now,
                now,
                "alice-doc.txt",
                "text/plain",
                123L,
                "demo://alice-doc",
                "body",
                IndexStatus.INDEXED,
                1,
                now
        );

        accessPort = new InMemoryDocumentAccessPort();
        documentPort = new InMemoryDocumentPort(document);
        aclService = new AclService(accessPort);
        useCases = new DocumentUseCases(
                documentPort,
                mock(ObjectStoragePort.class),
                mock(TextExtractionPort.class),
                mock(DocumentMalwareScanPort.class),
                mock(IndexingJobPort.class),
                mock(IndexingWorker.class),
                aclService,
                noopAuditService(),
                accessPort,
                new StorageProperties("http://localhost", "ak", "sk", "bucket", 60),
                2000,
                false
        );
    }

    @Test
    void ownerSeesOwnDocument() {
        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(alice);
        assertEquals(1, page.totalElements());
        assertEquals(DOC_ID, page.content().getFirst().id());
    }

    @Test
    void adminSeesAllDocuments() {
        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(admin);
        assertEquals(1, page.totalElements());
        assertEquals(DOC_ID, page.content().getFirst().id());
    }

    @Test
    void userWithReadGrantSeesDocument() {
        accessPort.grant(DOC_ID, bob.id(), DocumentAccessLevel.READ);

        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(bob);

        assertEquals(1, page.totalElements());
        assertEquals(DOC_ID, page.content().getFirst().id());
    }

    @Test
    void viewerWithoutGrantSeesNothing() {
        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(viewer);

        assertEquals(0, page.totalElements());
        assertTrue(page.content().isEmpty());
    }

    @Test
    void viewerWithReadGrantSeesDocumentButCannotWrite() {
        accessPort.grant(DOC_ID, viewer.id(), DocumentAccessLevel.READ);

        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(viewer);
        assertEquals(1, page.totalElements());

        assertTrue(aclService.canReadDocument(viewer, DOC_ID, OWNER_ID));
        assertFalse(aclService.canWriteDocument(viewer, DOC_ID, OWNER_ID));
    }

    @Test
    void viewerWriteIsAlwaysForbiddenEvenWithWriteGrant() {
        accessPort.grant(DOC_ID, viewer.id(), DocumentAccessLevel.WRITE);

        assertFalse(aclService.canWriteDocument(viewer, DOC_ID, OWNER_ID));
        assertThrows(
                ResponseStatusException.class,
                () -> aclService.requireDocumentWrite(viewer, DOC_ID, OWNER_ID)
        );
    }

    @Test
    void getByIdThrowsForbiddenForUserWithoutAccess() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> useCases.get(bob, DOC_ID)
        );
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void userWithWriteGrantCanWrite() {
        accessPort.grant(DOC_ID, bob.id(), DocumentAccessLevel.WRITE);

        assertTrue(aclService.canWriteDocument(bob, DOC_ID, OWNER_ID));
    }

    @Test
    void userWithReadGrantCannotWrite() {
        accessPort.grant(DOC_ID, bob.id(), DocumentAccessLevel.READ);

        assertTrue(aclService.canReadDocument(bob, DOC_ID, OWNER_ID));
        assertFalse(aclService.canWriteDocument(bob, DOC_ID, OWNER_ID));
    }

    /**
     * Регрессия: пользователь с обеими ролями {USER, VIEWER} должен оставаться
     * полноценным USER. Раньше {@code isViewer} возвращал {@code true} для
     * любого не-админа с ролью {@code VIEWER}, что:
     *  1) лишало owner-доступа на чтение собственного документа;
     *  2) полностью блокировало запись (ранний {@code return false}
     *     в {@code canWriteDocument}).
     */
    @Test
    void userWithBothUserAndViewerRolesKeepsOwnerPermissions() {
        assertFalse(aclService.isViewer(aliceUserAndViewer));
        assertTrue(aclService.canReadDocument(aliceUserAndViewer, DOC_ID, OWNER_ID));
        assertTrue(aclService.canWriteDocument(aliceUserAndViewer, DOC_ID, OWNER_ID));

        DocumentDtos.PageResponse<DocumentDtos.DocumentView> page = list(aliceUserAndViewer);
        assertEquals(1, page.totalElements());
        assertEquals(DOC_ID, page.content().getFirst().id());
    }

    private DocumentDtos.PageResponse<DocumentDtos.DocumentView> list(UserView actor) {
        return useCases.list(actor, new DocumentDtos.DocumentListQuery(
                null, null, null, null, "updatedAt", "desc", null, null, 0, 20
        ));
    }

    private static UserView user(String id, RoleName role) {
        return new UserView(id, id + "@example.com", id, Set.of(role));
    }

    private static AuditService noopAuditService() {
        AuditService auditService = mock(AuditService.class);
        // void-методы по умолчанию делают nothing
        return auditService;
    }

    /** In-memory документный порт: возвращает один документ и применяет правила видимости. */
    private static final class InMemoryDocumentPort implements DocumentPort {
        private final Document doc;

        InMemoryDocumentPort(Document doc) {
            this.doc = doc;
        }

        @Override
        public Document save(Document document) {
            return document;
        }

        @Override
        public Optional<Document> findById(DocumentId id) {
            return id.value().equals(doc.id().value()) ? Optional.of(doc) : Optional.empty();
        }

        @Override
        public List<Document> findAllByIds(java.util.Collection<DocumentId> ids) {
            return ids.stream()
                    .filter(id -> id.value().equals(doc.id().value()))
                    .map(id -> doc)
                    .toList();
        }

        @Override
        public List<Document> findAll() {
            return List.of(doc);
        }

        @Override
        public Page<Document> findPage(ListQuery query, Pageable pageable) {
            boolean visible;
            if (query.admin()) {
                visible = true;
            } else if (query.viewerOnly()) {
                visible = query.grantedDocumentIds().contains(doc.id().value());
            } else {
                visible = doc.ownerId().equals(query.actorId())
                        || query.grantedDocumentIds().contains(doc.id().value());
            }
            List<Document> content = visible ? List.of(doc) : List.of();
            return new PageImpl<>(content, pageable, content.size());
        }

        @Override
        public void deleteById(DocumentId id) {
            // not needed
        }
    }

    /** In-memory grants storage: позволяет «выдавать» доступ в рамках теста. */
    private static final class InMemoryDocumentAccessPort implements DocumentAccessPort {
        private final Map<String, DocumentAccessLevel> grants = new HashMap<>();

        void grant(String documentId, String principalId, DocumentAccessLevel level) {
            grants.put(key(documentId, principalId), level);
        }

        @Override
        public Optional<DocumentAccessLevel> findLevel(String documentId, String principalId) {
            return Optional.ofNullable(grants.get(key(documentId, principalId)));
        }

        @Override
        public List<String> findAccessibleDocumentIds(String principalId) {
            return grants.entrySet().stream()
                    .filter(e -> e.getKey().endsWith("|" + principalId))
                    .map(e -> e.getKey().substring(0, e.getKey().indexOf('|')))
                    .toList();
        }

        private static String key(String documentId, String principalId) {
            return documentId + "|" + principalId;
        }
    }
}

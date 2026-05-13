package com.dmis.backend.shared.security;

import com.dmis.backend.documents.application.port.DocumentAccessPort;
import com.dmis.backend.documents.domain.DocumentAccessLevel;
import com.dmis.backend.shared.model.RoleName;
import com.dmis.backend.shared.model.UserView;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.springframework.http.HttpStatus.FORBIDDEN;

/**
 * ACL-проверки уровня документа.
 *
 * Правила:
 * <ul>
 *   <li>ADMIN видит и пишет всё.</li>
 *   <li>VIEWER — только чтение и только при наличии явного grant.</li>
 *   <li>USER: read — owner или любой grant; write — owner или grant WRITE/OWNER.</li>
 * </ul>
 *
 * <p>Иерархия ролей: {@code ADMIN > USER > VIEWER}. Если у пользователя
 * одновременно есть {@code USER} и {@code VIEWER}, более широкая роль
 * {@code USER} побеждает — добавление {@code VIEWER} к существующему
 * {@code USER} не должно молча понижать его права.</p>
 */
@Service
public class AclService {

    private final DocumentAccessPort documentAccessPort;

    public AclService(DocumentAccessPort documentAccessPort) {
        this.documentAccessPort = documentAccessPort;
    }

    public boolean isAdmin(UserView user) {
        return user.roles().contains(RoleName.ADMIN);
    }

    /**
     * Пользователь считается «только просмотрщиком», если у него есть роль
     * {@link RoleName#VIEWER} и при этом нет ни {@link RoleName#ADMIN}, ни
     * {@link RoleName#USER}. Это защищает от ситуации, когда добавление
     * роли {@code VIEWER} к существующему {@code USER} (роли — {@code @ManyToMany})
     * молча понизило бы права пользователя.
     */
    public boolean isViewer(UserView user) {
        return user.roles().contains(RoleName.VIEWER)
                && !isAdmin(user)
                && !user.roles().contains(RoleName.USER);
    }

    public void requireDocumentRead(UserView actor, String documentId, String ownerId) {
        if (canReadDocument(actor, documentId, ownerId)) {
            return;
        }
        throw new ResponseStatusException(FORBIDDEN, "No read access");
    }

    public void requireDocumentWrite(UserView actor, String documentId, String ownerId) {
        if (canWriteDocument(actor, documentId, ownerId)) {
            return;
        }
        throw new ResponseStatusException(FORBIDDEN, "No write access");
    }

    public boolean canReadDocument(UserView actor, String documentId, String ownerId) {
        if (isAdmin(actor)) {
            return true;
        }
        // VIEWER не может быть «owner» по бизнес-смыслу, но защищаемся явно:
        // VIEWER получает чтение только через grant.
        if (!isViewer(actor) && ownerId != null && ownerId.equals(actor.id())) {
            return true;
        }
        return documentAccessPort.findLevel(documentId, actor.id()).isPresent();
    }

    public boolean canWriteDocument(UserView actor, String documentId, String ownerId) {
        if (isAdmin(actor)) {
            return true;
        }
        if (isViewer(actor)) {
            return false;
        }
        if (ownerId != null && ownerId.equals(actor.id())) {
            return true;
        }
        Optional<DocumentAccessLevel> level = documentAccessPort.findLevel(documentId, actor.id());
        return level.filter(l -> l == DocumentAccessLevel.WRITE || l == DocumentAccessLevel.OWNER).isPresent();
    }

    public void requireAuditRead(UserView actor) {
        if (!isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "Only admin can read full audit");
        }
    }

    public void requireAdmin(UserView actor) {
        if (!isAdmin(actor)) {
            throw new ResponseStatusException(FORBIDDEN, "Admin only");
        }
    }
}
